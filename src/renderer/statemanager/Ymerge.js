import * as Y from 'yjs';
import {v4 as uuidv4} from 'uuid';
import {WebrtcProvider} from 'y-webrtc';
import {IndexeddbPersistence} from 'y-indexeddb';
import {getAnonymousIdentifier, getRandomColor, isANode} from "../utils";
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

  addData(key, elArr) {
    this.ydoc.transact(() => {
      elArr.forEach(el => {
        if (isANode(el)) {
          const node = new Y.Map();
          node.set('id', el.id);
          node.set('label', el.data.label);
          node.set('type', el.type);
          node.set('x', el.position.x);
          node.set('y', el.position.y);
          node.set('backgroundColor', el.style.backgroundColor);
          node.set('borderColor', el.style.borderColor);
          this.ydoc.getMap(key).set(el.id, node);
        } else {
          const edge = new Y.Map();
          edge.set('id', el.id);
          edge.set('source', el.source);
          edge.set('target', el.target);
          this.ydoc.getMap(key).set(el.id, edge);
        }
      })
    });
  }

  updateData(key, elArr) {
    this.ydoc.transact(() => {
      elArr.forEach(el => {
        this.ydoc.getMap(key).get(el.id).set('id', el.id);
        if (isANode(el)) {
          this.ydoc.getMap(key).get(el.id).set('label', el.data.label);
          this.ydoc.getMap(key).get(el.id).set('type', el.type);
          this.ydoc.getMap(key).get(el.id).set('x', el.position.x);
          this.ydoc.getMap(key).get(el.id).set('y', el.position.y);
          this.ydoc.getMap(key).get(el.id).set('backgroundColor', el.style.backgroundColor);
          this.ydoc.getMap(key).get(el.id).set('borderColor', el.style.borderColor);
        } else {
          this.ydoc.getMap(key).get(el.id).set('source', el.source);
          this.ydoc.getMap(key).get(el.id).set('target', el.target);
        }
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
      this.addData(ELEMENTS_KEY, [initialElements['node:1']]);
      this.addData(ELEMENTS_KEY, [initialElements['node:2']]);
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
    console.log('[getElements]');
    const elementArrCopy = [];
    const elementsYmap = this.ydoc.getMap(ELEMENTS_KEY);
    elementsYmap.forEach((el,key) => {
      const id = el.get('id');
      let newElement;
      if (id.startsWith('node')) {
        const label = el.get('label');
        const x = el.get('x');
        const y = el.get('y');
        const backgroundColor = el.get('backgroundColor');
        const borderColor = el.get('borderColor');
        newElement = {
          id,
          type: 'default',
          data: {label},
          position: {x,y},
          style: {backgroundColor,borderColor}
        }
      } else {
        const source = el.get('source');
        const target = el.get('target');
        newElement = {
          id, source,target
        }
      }

      elementArrCopy.push(newElement);
    });
    console.log('after mapped: ', elementArrCopy);
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

}