import Hyperswarm from "hyperswarm";
import {Repo} from "hypermerge";
import {initialElements} from "../starter";
import {validateDocURL} from "hypermerge/dist/Metadata";
import {getAnonymousIdentifier, getRandomColor, isANode, ITEM} from "../utils";

export default class Hypermerge {

  constructor(callback) {
    this.swarm = Hyperswarm({queue: {multiplex: true}});
    this.repo = new Repo({memory: true});
    this.repo.addSwarm(this.swarm, {announce: true});
    this.url = this.repo.create({
      elements: initialElements,
      peers: {}
    });
    this.user = this._createUser();
    this._addSelfIntoPeerList();
    this.doc = null;
    this._watch(callback);
    console.log("workspace url: ", this.url);
    this._watchPeerConnection();
  }

  isOnline() {
    return true;
  }

  goOnline() {
    console.log('Online simulation is not supported for Hypermerge sync module');
  }

  goOffline() {
    console.log('Offline simulation is not supported for Hypermerge sync module');
  }

  addElement(elArr) {
    this.repo.change(this.url, (state) => {
      elArr.forEach(newEl => {
        state.elements[newEl.id] = newEl;
      });
      this._removeOrphanedEdge(state);
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
          let lastVal;
          if (propertyName === ITEM.BORDER || propertyName === ITEM.BACKGROUND) {
            lastVal = curr['style'][propertyName];
          } else {
            lastVal = curr[propertyName];
          }
          const newVal = updatable[i];
          let changed = false;
          if (propertyName === ITEM.POSITION) {
            changed = (lastVal.x !== newVal.x || lastVal.y !== newVal.y);
          } else {
            changed = (newVal !== lastVal);
          }
          if (changed) {
            console.log(`${propertyName} updated`);
            if (propertyName === ITEM.BORDER || propertyName === ITEM.BACKGROUND) {
              state.elements[el.id]['style'][propertyName] = newVal;
            } else {
              state.elements[el.id][propertyName] = newVal;
            }
          }
        }
      })
      this._removeOrphanedEdge(state);
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
    this.user.selfId = this._getSelfId();
    this.updatePeer(state => {
      state.peers[this.user.selfId] = this.user;
    });
  }

  _createUser() {
    return {
      name: getAnonymousIdentifier(),
      color: getRandomColor(),
      selfId: this._getSelfId()
    };
  }

  _getSelfId() {
    return this.repo.back.network.selfId;
  }

  _watchPeerConnection() {

    this.swarm.on('connection', (socket, info) => {
        console.log('CONNECTION triggered');
        this._addSelfIntoPeerList();
    });

    this.swarm.on('disconnection', (socket, info) => {
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
    })
  }

  _getPeers() {
    return this.repo.back.network.peers;
  }


  _mapped(state) {
    /* _mapped: Map hash-based state from crdt into array-based state (for react-flow API) */
    const _mapToLocalRecursive = (obj) => {
      /*
      * _mapToLocalRecursive:
      * Object in automerge's crdt state is not really a normal javascript object, it saves data related
      * to it's internal conflict res. mechanism (_conflicts and _objectId), and this internal data will exist for
      * every object inside the data (no matter how deeply nested the object is). So, we need to map
      * every object in the crdt state (for every level) into new object that doesn't include this internal data.
      * Without this recursive method, automerge will throw "multiple parents" error for every update activity.
      */
      const res = {};
      Object.keys(obj).forEach(key => {
        if (!(obj[key] instanceof Object)) {
          //Primitive type (string,number,etc) map directly into new object.
          res[key] = obj[key];
          return;
        }
        // nested object, need to delete crdt's internal state first.
        const nested = _mapToLocalRecursive(obj[key]);
        res[key] = nested;
      })
      return res;
    }

    const elements = [];
    const peers = [];
    Object.keys(state.elements).forEach(key => {
      elements.push(_mapToLocalRecursive(state.elements[key]));
    });
    Object.keys(state.peers).forEach(key => {
      peers.push(_mapToLocalRecursive(state.peers[key]));
    });
    console.log('elements:');
    console.log(elements);
    return {elements, peers};
  }
}
