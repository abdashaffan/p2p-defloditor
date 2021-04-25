import * as Y from 'yjs';
import {v4 as uuidv4} from 'uuid';
import {WebrtcProvider} from 'y-webrtc';
import {IndexeddbPersistence} from 'y-indexeddb';
import {getAnonymousIdentifier, getRandomColor} from "../utils";
import fs from "fs";
import env from "../../common/env";
import {initialElements} from "../starter";


export const ELEMENTS_KEY = 'elements';
export const PEERS_KEY = 'peers';
const ROOT_KEY = 'root';
// Run 'npm run y-webrtc-signal' (check package.json for the exact command)
// to start a custom local signaling server if you run this project on your local,
// In production, don't provide signaling opts since the yjs maintainer
// already provided real signaling server to connect your peers by default.
// Source: https://github.com/yjs/y-webrtc#signaling
const customOpts = {signaling: ['ws://localhost:4444']};


export default class Ymerge {

  constructor(callback, withPersistence) {
    this.withPersistence = withPersistence;
    this.ydoc = new Y.Doc();
    this.state = this.ydoc.getMap(ROOT_KEY);
    this.state.set(ELEMENTS_KEY, initialElements);
    this.state.set(PEERS_KEY, {});
    let url = this._loadUrl();
    if (!url) {
      // Generate new empty workspace.
      url = `yjs:${uuidv4()}`;
    }
    this._setup(url, callback);
  }

  update(handle) {
    this.ydoc.transact(() => {
      const elements = this.state.get(ELEMENTS_KEY);
      const peers = this.state.get(PEERS_KEY);
      const data = {elements, peers};
      handle(data);
      this.state.set(ELEMENTS_KEY, data.elements);
      this.state.set(PEERS_KEY, data.peers);
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
    this._initPeerConnection(callback);
    if (this.withPersistence) {
      this._initDatabase();
    }
    this._watch(callback);
    this._saveUrl();
  }

  _initPeerConnection(callback) {
    if (this.provider && this.provider.awareness) {
      // Destroy previous awareness so that when you joined new workspace,
      // you will copy state from said workspace, not reset that workspace to use your state.
      this.provider.awareness.destroy();
    }
    this.provider = new WebrtcProvider(
      this.url,
      this.ydoc,
      customOpts
    );
    this.user = this._createUser();
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
    this.provider.awareness.on('update', () => {
      console.log('[awareness watcher triggered]:');

      // Change the map key from increment number into clientID.
      const data = Array.from(this.provider.awareness.getStates().values());
      const peers = {};
      data.forEach(d => {
        const key = Object.keys(d)[0];
        const value = d[key];
        peers[key] = value;
      })
      console.log(`peers from awareness : `, peers);
      this.state.set(PEERS_KEY, peers);
      if (callback) {
        callback({
          elements: this._mapped(this.state.get(ELEMENTS_KEY)),
          peers: this._mapped(this.state.get(PEERS_KEY)),
        })
      }
    })
  }

  _watch(callback) {
    this.ydoc.on('update', (update) => {
      console.log('[Ymerge watch triggered]:');
      if (callback) {
        const elements = this._mapped(this.state.get(ELEMENTS_KEY));
        const peers = this._mapped(this.state.get(PEERS_KEY));
        console.log('to local state: ');
        console.log({elements, peers});
        callback({elements, peers});
      }
    });
  }

  _addSelfIntoPeerList() {
    this.provider.awareness.setLocalStateField(this.user.selfId, this.user);
  }

  _getSelfId() {
    return this.provider.awareness.clientID
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

  _mapped(obj) {
    if (!obj) return [];
    return Object.keys(obj).map(key => obj[key]);
  }

}