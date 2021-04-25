import {useState} from "react";
import {v4 as uuidv4} from 'uuid';
import Hypermerge from "./statemanager/Hypermerge";

// Only use on the root component
export const useEntityManager = (withPersistence) => {

  const [localState, setLocalState] = useState({
    elements: [],
    peers: []
  });
  const [hypermerge] = useState(() => new Hypermerge(setLocalState, withPersistence));


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

  const updateNode = (element) => {
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
    return hypermerge.updateWorkspace(url,setLocalState);
  }

  const getUrl = () => hypermerge.getUrl();

  const getUser = () => hypermerge.getMyInfo();

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
