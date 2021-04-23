import React, {useState} from "react";
import {v4 as uuidv4} from 'uuid';
import {Repo} from 'hypermerge';
import Hyperswarm from 'hyperswarm';

// Idea: Simpen class Hypermerge di dalem context, panggil disini
// Only use on the root component

class Hypermerge {

  constructor(callback) {
    this.swarm = Hyperswarm({queue: {multiplex: true}});
    this.repo = new Repo({memory: true});
    this.repo.addSwarm(this.swarm, {announce: true});
    this.url = this.repo.create({
      elements: [],
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
        console.log('[before last callback from watch]');
        console.log(state);
        callback(state);
      }
    });
  }

  update(handle) {
    console.log('[hypermerge update]');
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
      console.log('[inside addshape handler]');
      state.elements.push(newNode);
    });
  }

  const deleteShape = (elementsToRemove) => {
    // Original react-flow API supports deleting multiple apps at once,
    // but this app only supports one shape per deletion.
    const idToBeRemoved = elementsToRemove[0].id;
    // Need to do it like this, using built-in array.filter() API will cause error on the automerge side.
    return hypermerge.update(state => {
      let deleteIdx = -1;
      for (let i = 0; i < state.elements.length; i++) {
        if (state.elements[i].id === idToBeRemoved) {
          deleteIdx = i;
          break;
        }
      }
      delete state.elements[deleteIdx];
    });
  }


  return {
    addNewShape,
    deleteShape,
    elements: localState.elements
  };
}
