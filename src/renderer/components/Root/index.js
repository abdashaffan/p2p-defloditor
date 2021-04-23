/// <reference types="hypermerge/src/types/hyperswarm" />

import {hot} from 'react-hot-loader/root'

import React from 'react'
import './index.css'
import Canvas from "../Canvas";
import '@/env';
import UrlInput from "../Input";
import {useEntityManager} from '../../Hooks';
import {ReactFlowProvider} from "react-flow-renderer";
import ActionButton from "../ActionButton";


function Root() {
  const {elements, addNewShape} = useEntityManager();
  return (
    <div className="App">
      <ReactFlowProvider>
        <Canvas
          elements={elements}
        />
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
