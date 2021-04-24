import React, {useState} from "react";
import {v4 as uuidv4} from 'uuid';
import {Repo} from 'hypermerge';
import Hyperswarm from 'hyperswarm';
import {initialElements} from "./starter";

// Idea: Simpen class Hypermerge di dalem context, panggil disini
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
        1: {
          id: 1,
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
        const newlocalState = {
          elements: [],
          peers: []
        }
        Object.keys(state.elements).forEach(key => {
          newlocalState.elements.push(state.elements[key]);
        });
        Object.keys(state.peers).forEach(key => {
          newlocalState.peers.push(state.peers[key]);
        });
        console.log(newlocalState);
        callback(newlocalState);
      }
    });
  }

  update(handle) {
    this.repo.change(this.url, (state) => {
      handle(state);
    });
  }

}

export const useEntityManager = () => {

  const [localState, setLocalState] = useState({
    elements: [],
    peers: []
  });
  const [hypermerge] = useState(() => new Hypermerge(setLocalState));


  const addNewShape = () => {
    const newNode = {
      id: `node:${uuidv4()}`,
      position: {x: 250, y: 250},
      data: {label: 'New Node'}
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


  return {
    addNewShape,
    addNewEdge,
    deleteShape,
    elements: localState.elements
  };
}
