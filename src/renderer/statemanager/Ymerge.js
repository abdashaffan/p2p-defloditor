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


  update(handle) {
    this.ydoc.transact(() => {
      const elements = this.state.get(ELEMENTS_KEY);
      const peers = this.state.get(PEERS_KEY);
      const data = {elements,peers};
      handle(data);
      this.state.set(ELEMENTS_KEY, data.elements);
      this.state.set(PEERS_KEY, data.peers);
    });
  }

  validateWorkspace(url) {
    // TODO: TBD
    return false;
  }

  updateWorkspace() {
    // TODO: TBD
  }

  getUrl() {
    // TODO: TBD
    return null;
  }

  getMyInfo() {
    // TODO: TBD
    return {};
  }



  _mapped(obj) {
    return Object.keys(obj).map(key => obj[key]);
  }
}