import * as Y from 'yjs';
import {v4 as uuidv4} from 'uuid';
import {WebrtcProvider} from 'y-webrtc';
import {getAnonymousIdentifier, getRandomColor} from "../utils";


export const ELEMENTS_KEY = 'elements';
export const PEERS_KEY = 'peers';
const ROOT_KEY = 'root';
// Run 'npm run y-webrtc-signal' (check package.json for the exact command)
// to start a custom local signaling server if you run this project on your local,
// In production, don't provide signaling opts since the yjs maintainer
// already provided real signaling server to connect your peers by default.
// Source: https://github.com/yjs/y-webrtc#signaling
const customOpts = { signaling: ['ws://localhost:4444'] };


export default class Ymerge {

  constructor(callback, withPersistence) {
    this.ydoc = new Y.Doc();
    this.state = this.ydoc.getMap(ROOT_KEY);
    this.state.set(ELEMENTS_KEY, {});
    this.state.set(PEERS_KEY, {});
    this.url = `yjs:${uuidv4()}`;
    // this.url = `yjs:DEV_MODE`;
    this._initPeerConnection(callback);
  }

  _initPeerConnection(callback) {
    this.provider = new WebrtcProvider(
      this.url,
      this.ydoc,
      customOpts
    );
    this.user = this._createUser();
    this._addSelfIntoPeerList();
    this.watch(callback);
    this._watchPeerConnection(callback);
  }

  watch(callback) {
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

  updateWorkspace(url,callback) {
    this.url = url;
    // Destroy previous awareness so that when you joined new workspace,
    // you will copy state from said workspace, not reset that workspace to use your state.
    this.provider.awareness.destroy();
    this._initPeerConnection(callback);
  }

  getUrl() {
    return this.url;
  }

  getMyInfo() {
    return this.user;
  }


  _mapped(obj) {
    if (!obj) return [];
    return Object.keys(obj).map(key => obj[key]);
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
}