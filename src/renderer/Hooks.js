import React, {useState} from "react";
import {v4 as uuidv4} from 'uuid';
import {Repo} from 'hypermerge';
import Hyperswarm from 'hyperswarm';
import {starterElements} from "./starter";

// Idea: Simpen class Hypermerge di dalem context, panggil disini
// Only use on the root component

class Hypermerge {

  constructor(callback) {
    this.swarm = Hyperswarm({queue: {multiplex: true}});
    this.repo = new Repo({memory: true});
    this.repo.addSwarm(this.swarm, {announce: true});
    // TODO: Implement peer mechanism
    this.url = this.repo.create({
      elements: starterElements,
      peers: []
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
        console.log('new state:');
        console.log(state);
        callback(state);
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
      state.elements.push(newNode);
    });
  }

  const addNewEdge = (params) => {
    const srcId = params.source;
    const targetId = params.target;

    return hypermerge.update(state => {
      const srcNode = state.elements.find(el => el.id === srcId);
      const targetNode = state.elements.find(el => el.id === targetId);
      // Only add edge if the source and the target node are still exist.
      if (srcNode && targetNode) {
        const newEdge = {
          id: `edge:${uuidv4()}`,
          source: srcId,
          target: targetId
        }
        state.elements.push(newEdge);
      }
    });

  }

  const deleteShape = (elementsToRemove) => {
    // Original react-flow API supports deleting multiple apps at once,
    // but this app only supports one shape per deletion.
    const idToBeRemoved = elementsToRemove[0].id;
    // Need to do it like this, using built-in array.filter() API will cause error on the automerge side.
    return hypermerge.update(state => {
      let deleteNodeIdx = -1;
      let deleteEdgeIdxList = [];
      for (let i = 0; i < state.elements.length; i++) {
        // Search elements to be deleted.
        if (state.elements[i].id === idToBeRemoved) {
          deleteNodeIdx = i;
          break;
        }
      }
      delete state.elements[deleteNodeIdx];

      for (let i = 0; i < state.elements.length; i++) {
        // And also search all edges that directly connected to also be deleted.
        if (state.elements[i].source == idToBeRemoved || state.elements[i].target == idToBeRemoved) {
          deleteEdgeIdxList.push(i);
        }
      }
      deleteEdgeIdxList.forEach(idx => {
        delete state.elements[idx];
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
