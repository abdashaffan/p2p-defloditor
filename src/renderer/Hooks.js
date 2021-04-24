import React, {useCallback, useState} from "react";
import {v4 as uuidv4} from 'uuid';
import {Repo} from 'hypermerge';
import Hyperswarm from 'hyperswarm';
import {validateDocURL} from "hypermerge/dist/Metadata";
import {initialElements} from "./starter";

// Only use on the root component

class Hypermerge {

  constructor(callback) {
    this.swarm = Hyperswarm({queue: {multiplex: true}});
    this.repo = new Repo({memory: true});
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
    this.watch(callback);
    console.log("workspace url: ", this.url);
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

  updateWorkspace(url) {
    console.log("[updateWorkspace] TODO, TBD");
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
    console.log("updated local state: ",{elements,peers});
    return {elements, peers};
  }
}

export const useEntityManager = () => {

  const [localState, setLocalState] = useState({
    elements: [],
    peers: []
  });
  const [hypermerge] = useState(() => new Hypermerge(setLocalState));


  const addNewShape = (el) => {
    let newNode;
    if (el) {
      newNode = {
        ...el,
        id: `node:${uuidv4()}`,
        position: {x: el.position.x, y: el.position.y + 50}
      }
    } else {
      newNode = {
        id: `node:${uuidv4()}`,
        type: 'default',
        position: {x: 250, y: 250},
        data: {label: 'New Node'},
        style: {}
      }
    }
    hypermerge.update(state => {
      state.elements[newNode.id] = newNode;
    });
  }

  const addNewEdge = (params) => {
    const srcId = params.source;
    const targetId = params.target;

    return hypermerge.update(state => {
      // Only add edge if the source and the target node are still exist.
      if (state.elements[srcId] && state.elements[targetId]) {
        const newEdge = {
          id: `edge:${uuidv4()}`,
          source: srcId,
          target: targetId
        }
        state.elements[newEdge.id] = newEdge;
      }
    });
  }

  const updateNode = (event, element) => {
    return hypermerge.update(state => {
      state.elements[element.id] = element;
    })
  }

  const updateEdgeConnection = (oldEdge, newConnection) => {
    return hypermerge.update(state => {
      if (state.elements[newConnection.source] && state.elements[newConnection.target]) {
        state.elements[oldEdge.id].source = newConnection.source;
        state.elements[oldEdge.id].target = newConnection.target;
      }
    });
  }

  const deleteShape = (elementsToRemove) => {
    // Original react-flow API supports deleting multiple apps at once,
    // but this app only supports one shape per deletion.
    const idToBeRemoved = elementsToRemove[0].id;
    return hypermerge.update(state => {
      Object.keys(state.elements).forEach(id => {
        const el = state.elements[id];
        // Remove the node and all connected edges to said node.
        if (el.id === idToBeRemoved || el.source === idToBeRemoved || el.target === idToBeRemoved) {
          delete state.elements[id];
        }
      })
    });
  }

  const validateUrl = (url) => {
    return hypermerge.validateWorkspace(url);
  }

  const updateUrl = (url) => {
    // Precondition: valid workspace url
    return hypermerge.updateWorkspace(url);
  }


  return {
    addNewShape,
    addNewEdge,
    deleteShape,
    updateNode,
    updateEdgeConnection,
    updateUrl,
    validateUrl,
    elements: localState.elements
  };
}
