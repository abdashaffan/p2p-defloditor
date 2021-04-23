import React, {useEffect, useState} from "react";
import {starterElements} from "./starter";
import { v4 as uuidv4 } from 'uuid';
import {removeElements} from "react-flow-renderer";

// Idea: Simpen class Hypermerge di dalem context, panggil disini
// Only use on the root component
export const useEntityManager = () => {

  const [elements,setElements] = useState(starterElements);

  useEffect(() => {
    broadcastState(elements);
  },[elements]);

  const broadcastState = (elements) => {
    // TODO: Implementation
    console.log('current elements: ', elements);
    console.log('broadcasting changes to all peers...');
  }

  const addNewShape = () => {
    const newNode = {
      id: `node:${uuidv4()}`,
      position: {x: 250, y: 250},
      data: {label: 'New Node'}
    }
    setElements((elements) => elements.concat(newNode));
  }

  const deleteShape = (elementsToRemove) => {
    console.log('deleting shape: ', elementsToRemove);
    return setElements((els) => removeElements(elementsToRemove, els));
  }


  return {elements,addNewShape,deleteShape};
}
