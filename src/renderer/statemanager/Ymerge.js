import * as Y from 'yjs';
import {v4 as uuidv4} from 'uuid';
import {WebrtcProvider} from 'y-webrtc';
import {IndexeddbPersistence} from 'y-indexeddb';
import {getAnonymousIdentifier, getRandomColor, isANode, ITEM} from "../utils";
import fs from "fs";
import env from "../../common/env";
import {initialElements} from "../starter";


export const ELEMENTS_KEY = 'elements';
// Run 'npm run y-webrtc-signal' (check package.json for the exact command)
// to start a custom local signaling server if you run this project on your local,
// In production, don't provide signaling opts since the yjs maintainer
// already provided real signaling server to connect your peers by default.
// Source: https://github.com/yjs/y-webrtc#signaling
const customOpts = {signaling: ['ws://localhost:4444']};


export default class Ymerge {

  constructor(callback, withPersistence) {
    this.withPersistence = withPersistence;
    let url = this._loadUrl();
    if (!url) {
      // Generate new empty workspace.
      url = `yjs:${uuidv4()}`;
    }
    this._setup(url, callback, true);
  }

  addElement(elArr) {
    this.ydoc.transact(() => {
      elArr.forEach(el => {
        let newEl = new Y.Map();
        if (isANode(el)) {
          newEl.set(ITEM.ID, el.id);
          newEl.set(ITEM.LABEL, el.data.label);
          newEl.set(ITEM.TYPE, el.type);
          newEl.set(ITEM.POSITION, el.position);
          newEl.set(ITEM.BACKGROUND, el.style.backgroundColor);
          newEl.set(ITEM.BORDER, el.style.borderColor);
        } else {
          newEl.set(ITEM.ID, el.id);
          newEl.set(ITEM.SOURCE, el.source);
          newEl.set(ITEM.TARGET, el.target);
        }
        this.ydoc.getMap(ELEMENTS_KEY).set(el.id, newEl);
      })
    });
  }

  updateElement(elArr) {
    this.ydoc.transact(() => {
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
        for (let i = 0; i < updatable.length; i++) {
          const lastVal = this.ydoc.getMap(ELEMENTS_KEY).get(el.id).get(updatableKey[i]);
          const newVal = updatable[i];
          if (newVal !== lastVal) {
            this.ydoc.getMap(ELEMENTS_KEY).get(el.id).set(updatableKey[i], newVal);
          }
        }
      })
    });
  }

  deleteElement(idArr) {
    this.ydoc.transact(() => {
      idArr.forEach(id => {
        this.ydoc.getMap(ELEMENTS_KEY).delete(id);
      })
    });
  }

  validateWorkspace() {
    return true;
  }

  updateWorkspace(url, callback) {
    this._setup(url, callback);
  }

  getUrl() {
    return this.url;
  }

  getMyInfo() {
    return this.user;
  }

  isOnline() {
    return this.provider.shouldConnect;
  }

  goOnline() {
    this.provider.connect();
  }

  goOffline() {
    if (this.provider.shouldConnect) {
      this.provider.disconnect();
    }
  }

  _setup(url, callback, usingStarter) {
    this.url = url;
    this._initMainDocument(usingStarter);
    this._initPeerConnection(callback);
    if (this.withPersistence) {
      this._initDatabase();
    }
    this._watch(callback);
    this._saveUrl();
  }

  _initMainDocument(usingStarter) {
    if (this.ydoc) {
      this.ydoc.destroy();
    }
    this.ydoc = new Y.Doc();
    if (usingStarter) {
      this.addElement([initialElements['node:1']]);
      this.addElement([initialElements['node:2']]);
    }
  }

  _initPeerConnection(callback) {
    this.provider = new WebrtcProvider(
      this.url,
      this.ydoc
    );
    // this.provider = new WebrtcProvider(
    //   this.url,
    //   this.ydoc,
    //   customOpts
    // );
    if (!this.user) {
      this.user = this._createUser();
    } else {
      this.user.selfId = this._getSelfId();
    }
    this._addSelfIntoPeerList();
    this._watchPeerConnection(callback);
  }

  _initDatabase() {
    if (this.persistence) {
      this.persistence.destroy();
    }
    this.persistence = new IndexeddbPersistence(this.url, this.ydoc);
    this._watchPersistenceSync();
  }

  _watchPersistenceSync() {
    this.persistence.on('synced', (data) => {
      console.log('content from the database is loaded', data);
    });
  }

  _watchPeerConnection(callback) {
    this.provider.awareness.on('update', ({added, updated, removed}) => {
      console.log('[AWARENESS UPDATE]');
      console.log('added', added);
      console.log('updated', updated);
      console.log('removed', removed);
      // Change the map key from increment number into clientID.
      const data = Array.from(this.provider.awareness.getStates().values());
      const peers = [];
      data.forEach(d => {
        const key = Object.keys(d)[0];
        const value = d[key];
        peers.push(value);
      })
      callback({
        elements: this.getElements(),
        peers
      })
    })
    this.provider.on('synced', () => {
      const myData = Array.from(Object.values(this.provider.awareness.getLocalState()));
      callback({
        elements: this.getElements(),
        peers: myData
      })
    })
  }

  getElements() {
    const elementArrCopy = [];
    const elementsYmap = this.ydoc.getMap(ELEMENTS_KEY);
    elementsYmap.forEach((el, key) => {
      const deepCopy = JSON.parse(JSON.stringify(el));
      let newElement;
      if (deepCopy[ITEM.ID].startsWith('node')) {
        newElement = {
          id: deepCopy[ITEM.ID],
          type: deepCopy[ITEM.TYPE],
          data: {label: deepCopy[ITEM.LABEL]},
          position: deepCopy[ITEM.POSITION],
          style: {
            backgroundColor: deepCopy[ITEM.BACKGROUND],
            borderColor: deepCopy[ITEM.BORDER]
          }
        }
      } else {
        newElement = {
          id: deepCopy[ITEM.ID],
          source: deepCopy[ITEM.SOURCE],
          target: deepCopy[ITEM.TARGET]
        }
      }
      elementArrCopy.push(newElement);
    });
    return elementArrCopy;
  }

  _watch(callback) {
    this.ydoc.on('update', () => {
      console.log('[Ymerge UPDATE]');
      callback(state => ({
        elements: this.getElements(),
        peers: state.peers
      }));
    });

    this.ydoc.getMap(ELEMENTS_KEY).observeDeep(event => {
      console.log('[Ymerge] Element observe');
      console.log(event);
    });

    this.ydoc.on('destroy', () => {
      console.log('[YDOC DESTROY]');
      this.provider.destroy();
      this.ydoc = null;
      this.provider = null;
    });

  }

  _addSelfIntoPeerList() {
    this.provider.awareness.setLocalStateField(this.user.selfId, this.user);
  }

  _getSelfId() {
    return this.provider.awareness.clientID;
  }

  _createUser() {
    return {
      name: getAnonymousIdentifier(),
      color: getRandomColor(),
      selfId: this._getSelfId()
    };
  }

  _saveUrl() {
    if (this.withPersistence) {
      try {
        fs.mkdirSync(env.YMERGE_PATH, {recursive: true})
      } catch (e) {
        console.log(e);
      } finally {
        const data = {url: this.url};
        fs.writeFileSync(env.LAST_WORKSPACE_URL_PATH_YMERGE, JSON.stringify(data));
      }
    }
  }

  _loadUrl() {
    if (this.withPersistence) {
      if (fs.existsSync(env.LAST_WORKSPACE_URL_PATH_YMERGE)) {
        const json = JSON.parse(fs.readFileSync(env.LAST_WORKSPACE_URL_PATH_YMERGE, {encoding: 'utf-8'}));
        return json.url;
      }
    }
    return null;
  }

}