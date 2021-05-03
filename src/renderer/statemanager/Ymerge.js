import * as Y from 'yjs';
import {v4 as uuidv4} from 'uuid';
import {WebrtcProvider} from 'y-webrtc';
import {IndexeddbPersistence} from 'y-indexeddb';
import {getAnonymousIdentifier, getRandomColor} from "../utils";
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
    this._setup(url, callback);
  }

  addData(key, dataArr) {
    this.ydoc.transact(() => {
      dataArr.forEach(data => {
        this.ydoc.getMap(key).set(data.id, data);
      })
    });
  }

  updateData(key, dataArr) {
    this.ydoc.transact(() => {
      dataArr.forEach(data => {
        const idf = data.id || data.selfId;
        this.ydoc.getMap(key).set(idf, data);
      })
    });
  }

  deleteData(key, idArr) {
    this.ydoc.transact(() => {
      idArr.forEach(id => {
        this.ydoc.getMap(key).delete(id);
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

  _setup(url, callback) {
    this.url = url;
    this._initMainDocument();
    this._initPeerConnection(callback);
    if (this.withPersistence) {
      this._initDatabase();
    }
    this._watch(callback);
    this._saveUrl();
  }

  _initMainDocument() {
    if (this.ydoc) {
      this.ydoc.destroy();
    }
    this.ydoc = new Y.Doc();
    this.addData(ELEMENTS_KEY, [initialElements['node:1']]);
    this.addData(ELEMENTS_KEY, [initialElements['node:2']]);
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
      // Change the map key from increment number into clientID.
      const data = Array.from(this.provider.awareness.getStates().values());
      const peers = [];
      data.forEach(d => {
        const key = Object.keys(d)[0];
        const value = d[key];
        peers.push(value);
      })
      callback({
        elements: this._mapped(this.ydoc.getMap(ELEMENTS_KEY)),
        peers
      })
    })
    this.provider.on('synced', () => {
      const myData = Array.from(Object.values(this.provider.awareness.getLocalState()));
      callback({
        elements: this._mapped(this.ydoc.getMap(ELEMENTS_KEY)),
        peers: myData
      })
    })
  }

  _watch(callback) {
    this.ydoc.on('update', () => {
      console.log('[Ymerge UPDATE]');
      callback(state => ({
        elements: this._mapped(this.ydoc.getMap(ELEMENTS_KEY)),
        peers: state.peers
      }));
    });

    this.ydoc.getMap(ELEMENTS_KEY).observe(event => {
      console.log('[Ymerge] Element observe');
      console.log(event.changes);
    });

    this.ydoc.on('destroy', () => {
      console.log('[YDOC DESTROY]');
      this.provider.awareness.destroy();
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

  _mapped(ymapInstance) {
    if (!ymapInstance) return [];
    const valArr = [];
    ymapInstance.forEach((value, key, map) => {
      valArr.push(value);
    });
    return valArr;
  }

}