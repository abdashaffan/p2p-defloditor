import React, {createContext, useContext, useState} from "react";
import {useStoreState} from "react-flow-renderer";
import {starterElements} from "./starter";
import { v4 as uuidv4 } from 'uuid';
import Hyperswarm from "hyperswarm";
import env from "../common/env";
import {Repo} from "hypermerge";


export const useStateManager = (url) => {

  const [docUrl,setDocUrl] = useState(url);

  const swarm = Hyperswarm({queue: {multiplex: true}});
  let repo;
  if (env.isProduction) {
    // Use persistence in production
    repo = new Repo({path: env.HYPERMERGE_PATH});
  } else {
    // Do not save the document in local
    repo = new Repo({memory: true});
  }
  repo.addSwarm(swarm, {announce: true});

  if (!docUrl) {
    const newUrl = repo.create({});
    setDocUrl(newUrl);
  }
  return {swarm,repo,docUrl,setDocUrl};
}

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