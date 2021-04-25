import * as Y from 'yjs';

export const ELEMENTS_KEY = 'elements';
export const PEERS_KEY = 'peers';
const ROOT_KEY = 'root';

export default class Ymerge {

  constructor(callback, withPersistence) {
    this.ydoc = new Y.Doc();
    this.state = this.ydoc.getMap(ROOT_KEY);
    this.state.set(ELEMENTS_KEY, {});
    this.state.set(PEERS_KEY, {});
    this.watch(callback);
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

  updateElement(handle) {
    this._update(ELEMENTS_KEY, handle);
  }

  _updatePeer(handle) {
    this._update(PEERS_KEY, handle);
  }

  _update(documentKey, handle) {
    this.ydoc.transact(() => {
      const data = this.state.get(documentKey);
      handle(data);
      this.state.set(documentKey, data);
    });
  }

  _mapped(obj) {
    return Object.keys(obj).map(key => obj[key]);
  }
}