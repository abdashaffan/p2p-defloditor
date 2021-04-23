/// <reference types="hypermerge/src/types/hyperswarm" />

import {hot} from 'react-hot-loader/root'

import React, {useState} from 'react'
import './index.css'
import Canvas from "../Canvas";
import '@/env';
import UrlInput from "../Input";
import {HypermergeContext, useEntityManager} from '../../Hooks';
import {ReactFlowProvider} from "react-flow-renderer";
import ActionButton from "../ActionButton";
import {initHypermerge, starterElements} from "../../starter";


const {swarm, repo} = initHypermerge();
function Root() {

  const {elements, addNewShape} = useEntityManager();

  return (
    <div className="App">
      <HypermergeContext.Provider value={{swarm, repo}}>
        <ReactFlowProvider>
            <Canvas elements={elements}/>
            <UrlInput/>
            <ActionButton
              variant="primary"
              handleClick={addNewShape}
              label="Add New Shape"
            />
        </ReactFlowProvider>
      </HypermergeContext.Provider>
    </div>
  )
}


export default hot(Root)
