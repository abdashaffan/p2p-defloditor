/// <reference types="hypermerge/src/types/hyperswarm" />

import {hot} from 'react-hot-loader/root'

import React from 'react'
import './index.css'
import Canvas from "../Canvas";
import '@/env';
import {Repo} from 'hypermerge';
import Hyperswarm from 'hyperswarm';
import env from "../../../common/env";
import UrlInput from "../Input";
import {HypermergeContext} from '../../Hooks';
import {ReactFlowProvider} from "react-flow-renderer";

// Init hypermerge
const swarm = Hyperswarm({queue: {multiplex: true}});
let repo;
if (env.isDevelopment) {
  // Use persistence in production
  repo = new Repo({path: env.HYPERMERGE_PATH});
} else {
  // Do not save the document in local
  repo = new Repo({memory: true});
}
repo.addSwarm(swarm, {announce: true});

function Root() {
  return (
    <div className="App">
      <HypermergeContext.Provider value={{swarm, repo}}>
        <ReactFlowProvider>
            <Canvas/>
            <UrlInput/>
        </ReactFlowProvider>
      </HypermergeContext.Provider>
    </div>
  )
}


export default hot(Root)
