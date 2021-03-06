import Hyperswarm from "hyperswarm";
import os from 'os';
import env from "../../common/env";
import * as fs from "fs";
import {Repo} from "hypermerge";
import {initialElements} from "../starter";
import {validateDocURL} from "hypermerge/dist/Metadata";
import {getAnonymousIdentifier, getRandomColor, isANode, ITEM} from "../utils";

export default class Hypermerge {

  constructor(callback, withPersistence) {
    this.withPersistence = withPersistence;
    this.swarm = Hyperswarm({queue: {multiplex: true}});
    this.repo = this.withPersistence ? new Repo({path: env.HYPERMERGE_PATH}) : new Repo({ memory: true });
    this.repo.addSwarm(this.swarm, {announce: true});
    this.url = this.repo.create({
      elements: {},
      peers: {}
    });
    this.user = this._createUser();
    this.doc = null;
    const lastWorkspaceUrl = this._loadUrl();
    //console.log(lastWorkspaceUrl);
    if (lastWorkspaceUrl) this.updateWorkspace(lastWorkspaceUrl, callback);
    //console.log("workspace url: ", this.url);
    this._saveUrl();
    this._watch(callback);
    this._watchPeerConnection();
    this._addSelfIntoPeerList();
    if (!lastWorkspaceUrl) this.addElement(Object.values(initialElements));
  }

  addElement(elArr) {
    this.repo.change(this.url, (state) => {
      elArr.forEach(el => {
        state.elements[el.id] = {};
        if (isANode(el)) {
          state.elements[el.id][ITEM.ID] = el.id;
          state.elements[el.id][ITEM.LABEL] = el.data.label;
          state.elements[el.id][ITEM.TYPE] = "default";
          state.elements[el.id][ITEM.POSITION] = el.position;
          state.elements[el.id][ITEM.BACKGROUND] = el.style.backgroundColor;
          state.elements[el.id][ITEM.BORDER] = el.style.borderColor;
        } else {
          state.elements[el.id][ITEM.ID] = el.id;
          state.elements[el.id][ITEM.SOURCE] = el.source;
          state.elements[el.id][ITEM.TARGET] = el.target;
        }
      });
    });
  }

  updateElement(elArr) {
    this.repo.change(this.url, (state) => {
      elArr.forEach(el => {
        let updatable;
        let updatableKey;
        if (isANode(el)) {
          updatable = [el.position, el.style.borderColor, el.style.backgroundColor];
          updatableKey = [ITEM.POSITION, ITEM.BORDER, ITEM.BACKGROUND];
        } else {
          updatable = [el.source, el.target];
          updatableKey = [ITEM.SOURCE, ITEM.TARGET];
        }
        let curr;
        this.repo.doc(this.url, doc => {
          curr = doc.elements[el.id];
        });
        for (let i = 0; i < updatable.length; i++) {
          const propertyName = updatableKey[i];
          const lastVal = curr[propertyName];
          const newVal = updatable[i];
          let changed = false;
          if (propertyName === ITEM.POSITION) {
            changed = (lastVal.x !== newVal.x || lastVal.y !== newVal.y);
          } else {
            changed = (newVal !== lastVal);
          }
          if (changed) {
            //console.log(`${propertyName} updated`);
            state.elements[el.id][propertyName] = newVal;
          }
        }
      });
    });
  }

  deleteElement(idArr) {
    this.repo.change(this.url, (state) => {
      idArr.forEach(id => {
        delete state.elements[id];
      })
      this._removeOrphanedEdge(state);
    })
  }

  updatePeer(handle) {
    this.repo.change(this.url, (state) => {
      handle(state);
    });
  }

  validateWorkspace(url) {
    try {
      validateDocURL(url);
      return true;
    } catch (e) {
      return false;
    }
  }

  updateWorkspace(url, callback) {
    this.url = url;
    // might be changed for every workspace reload, so reassign the id just in case.
    this.user.selfId = this._getSelfId();
    this._saveUrl();
    this._watch(callback);
    this._addSelfIntoPeerList();
  }

  getUrl() {
    return this.url;
  }

  getMyInfo() {
    return this.user;
  }

  _watch(callback) {
    this.repo.watch(this.url, (state) => {
      //console.log('WATCH TRIGGERED');
      this.doc = state;
      if (callback) {
        callback(this._mapped(state));
      }
    });
  }

  _removeOrphanedEdge(state) {
    // Find and remove edge with node with deleted source or target.
    const nodeCount = {};
    const edgeList = [];
    this.repo.doc(this.url, doc => {
      Object.keys(doc.elements).forEach(key => {
        if (doc.elements[key].source) {
          edgeList.push(key);
          return;
        }
        if (!nodeCount[key]) {
          nodeCount[key] = 1;
        } else {
          nodeCount[key]++;
        }
      });
    });
    edgeList.forEach(edge => {
      if (!nodeCount[edge.source] || !nodeCount[edge.target]) {
        delete state.elements[edge.id];
      }
    });
  }

  _addSelfIntoPeerList() {
    //console.log(`adding ${this.user.name} into peer list`);
    this.user.selfId = this._getSelfId();
    this.updatePeer(state => {
      state.peers[this.user.selfId] = this.user;
    });
  }

  _createUser() {
    return {
      name: os.hostname() || getAnonymousIdentifier(),
      color: getRandomColor(),
      selfId: this._getSelfId()
    };
  }

  _getSelfId() {
    return this.repo.back.network.selfId;
  }

  _watchPeerConnection() {

    this.updatePeer(state => {
      state.peers = {};
    });

    this.swarm.on('connection', (socket, info) => {
      console.log('[CONNECTION TRIGGERED]');
      this._addSelfIntoPeerList();
    });

    this.swarm.on('peer', (socket, info) => {
      console.log('[PEER TRIGGERED]');
      this._addSelfIntoPeerList();
    });

    this.swarm.on('disconnection', (socket, info) => {
      //console.log('[DISCONNECTION TRIGGERED]');
      const connectedPeers = this._getPeers();
      const deletePeersId = [];
      connectedPeers.forEach((value, key, map) => {
        if (!value.isConnected) {
          deletePeersId.push(key);
        }
      });
      this.updatePeer(state => {
        deletePeersId.forEach(key => {
          delete state.peers[key];
        })
      });
    });
  }

  _getPeers() {
    return this.repo.back.network.peers;
  }

  _saveUrl() {
    if (this.withPersistence) {
      const data = {url: this.url};
      fs.writeFileSync(env.LAST_WORKSPACE_URL_PATH_HYPERMERGE, JSON.stringify(data));
    }
  }

  _loadUrl() {
    if (this.withPersistence) {
      if (fs.existsSync(env.LAST_WORKSPACE_URL_PATH_HYPERMERGE)) {
        //console.log(`loading last url: ${env.LAST_WORKSPACE_URL_PATH_HYPERMERGE}`);
        const json = JSON.parse(fs.readFileSync(env.LAST_WORKSPACE_URL_PATH_HYPERMERGE, {encoding: 'utf-8'}));
        return json.url;
      }
    }
    return null;
  }


  _mapped(state) {
    const deepCopy = JSON.parse(JSON.stringify(state));
    let elements = Object.values(deepCopy.elements);
    let peers = Object.values(deepCopy.peers);

    elements = elements.map(el => {
      if (el[ITEM.ID].startsWith('node')) {
        return ({
          id: el[ITEM.ID],
          type: el[ITEM.TYPE],
          data: {label: el[ITEM.LABEL]},
          position: el[ITEM.POSITION],
          style: {
            backgroundColor: el[ITEM.BACKGROUND],
            borderColor: el[ITEM.BORDER]
          }
        });
      } else {
        return ({
          id: el[ITEM.ID],
          source: el[ITEM.SOURCE],
          target: el[ITEM.TARGET]
        })
      }
    });
    return {elements, peers};
    
  }
}
