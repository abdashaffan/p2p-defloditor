/// <reference types="hypermerge/src/types/hyperswarm" />

import {hot} from 'react-hot-loader/root'

import React, {useState} from 'react'
import './index.css'
import Canvas from "../Canvas";
import '@/env';
import UrlInput from "../Input";
import {useEntityManager, useStateManager} from '../../Hooks';
import {ReactFlowProvider} from "react-flow-renderer";
import ActionButton from "../ActionButton";


function Root() {

  const {elements, addNewShape} = useEntityManager();
  const {docUrl} = useStateManager(null);

  console.log("Workspace: ", docUrl);

  return (
    <div className="App">
        <ReactFlowProvider>
            <Canvas elements={elements}/>
            <UrlInput/>
            <ActionButton
              variant="primary"
              handleClick={addNewShape}
              label="Add New Shape"
            />
        </ReactFlowProvider>
    </div>
  )
}


export default hot(Root)
