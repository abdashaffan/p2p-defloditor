import {useState} from "react";
import {v4 as uuidv4} from 'uuid';
import Hypermerge from "../statemanager/Hypermerge";

// Only use on the root component
export const useHypermerge = () => {
  const [localState, setLocalState] = useState({
    elements: [],
    peers: []
  });

  const [syncModule] = useState(() => new Hypermerge(setLocalState));


  const addNewShape = (el) => {
    let newNode;
    if (el) {
      newNode = {
        ...el,
        id: `node:${uuidv4()}`,
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
    syncModule.addElement([newNode]);
  }

  const addNewEdge = (params) => {
    const srcId = params.source;
    const targetId = params.target;
    const newEdge = {
      id: `edge:${uuidv4()}`,
      source: srcId,
      target: targetId
    }
    return syncModule.addElement([newEdge]);
  }

  const updateNode = (element) => {
    return syncModule.updateElement([element]);
  }

  const updateEdgeConnection = (oldEdge, newConnection) => {
    const newEdge = {
      id: oldEdge.id,
      source: newConnection.source,
      target: newConnection.target
    }
    return syncModule.updateElement([newEdge]);
  }

  const deleteShape = (elementsToRemove) => {
    // Original react-flow API supports deleting multiple apps at once,
    // but this app only supports one shape per deletion.
    const idToBeRemoved = elementsToRemove[0].id;
    const processUpdate = () => {
      const lastUpdateElements = localState.elements;
      const connectedElements = [];
      lastUpdateElements.forEach(el => {
        if (el.id === idToBeRemoved || el.source === idToBeRemoved || el.target === idToBeRemoved) {
          connectedElements.push(el.id);
        }
      });
      syncModule.deleteElement([...connectedElements, idToBeRemoved]);
    }
    return processUpdate();
  }

  const validateUrl = (url) => {
    return syncModule.validateWorkspace(url);
  }

  const updateUrl = (url) => {
    // Precondition: valid workspace url
    return syncModule.updateWorkspace(url, setLocalState);
  }

  const getUrl = () => syncModule.getUrl();

  const getUser = () => syncModule.getMyInfo();

  return {
    addNewShape,
    addNewEdge,
    deleteShape,
    updateNode,
    updateEdgeConnection,
    updateUrl,
    validateUrl,
    getUrl,
    getUser,
    elements: localState.elements,
    peers: localState.peers
  };
}