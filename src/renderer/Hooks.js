import React, {createContext, useContext, useState} from "react";
import {useStoreState} from "react-flow-renderer";
import {starterElements} from "./starter";
import { v4 as uuidv4 } from 'uuid';



export const HypermergeContext = createContext({swarm: null, repo: null, url: null});


export const useEntityManager = () => {
  const [elements,setElements] = useState(starterElements);
  const addNewShape = () => {
    const newNode = {
      id: `node:${uuidv4()}`,
      position: {x: 250, y: 250},
      data: {label: 'New Node'}
    }
    setElements((elements) => elements.concat(newNode));
    console.log('new elements:', elements);
  }
  return {elements,addNewShape};
}

export const useDebugger = () => {
  // Can only be called inside ReactflowProvider, (excluding the ReactFlow component, causing unknown infinite render loop)
  const state = useStoreState(state => state);
  return state;
}