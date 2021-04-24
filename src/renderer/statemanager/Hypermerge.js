import Hyperswarm from "hyperswarm";
import {Repo} from "hypermerge";
import {initialElements} from "../starter";
import {validateDocURL} from "hypermerge/dist/Metadata";
import env from "../../common/env";
import * as fs from "fs";

export default class Hypermerge {

  constructor(callback, withPersistence) {
    this.withPersistence = withPersistence;
    this.swarm = Hyperswarm({queue: {multiplex: true}});
    this.repo = withPersistence ? new Repo({path: env.HYPERMERGE_PATH}) : new Repo({memory: true});
    this.repo.addSwarm(this.swarm, {announce: true});
    // TODO: Implement peer mechanism
    this.url = this.repo.create({
      elements: initialElements,
      peers: {
        'peer:1': {
          id: 'peer:1',
          name: 'wild-racoon',
          color: "#12345"
        }
      }
    });
    this.doc = null;
    const lastWorkspaceUrl = this._loadUrl();
    if (lastWorkspaceUrl) {
      this.updateWorkspace(lastWorkspaceUrl,callback);
    } else {
      this.watch(callback);
    }
    console.log("workspace url: ", this.url);
    this._saveUrl();
  }

  watch(callback) {
    this.repo.watch(this.url, (state) => {
      console.log('[hypermerge watch triggered]');
      this.doc = state;
      if (callback) {
        callback(this._mapped(state));
      }
    });
  }

  update(handle) {
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
    this.watch(callback);
  }

  getUrl() {
    return this.url;
  }

  _saveUrl() {
    if (this.withPersistence) {
      const data = {url: this.url};
      fs.writeFileSync(env.LAST_WORKSPACE_URL_PATH, JSON.stringify(data));
    }
  }

  _loadUrl() {
    if (this.withPersistence) {
      if (fs.existsSync(env.LAST_WORKSPACE_URL_PATH)) {
        const json = JSON.parse(fs.readFileSync(env.LAST_WORKSPACE_URL_PATH, {encoding: 'utf-8'}));
        return json.url;
      }
    }
    return null;
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
    console.log("updated local state: ", {elements, peers});
    return {elements, peers};
  }
}
