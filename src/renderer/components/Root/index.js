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

  const {elements, addNewShape, deleteShape, addNewEdge, updateNode, updateEdgeConnection} = useEntityManager();

  return (
    <div className="App">
      <ReactFlowProvider>
        <Canvas
          elements={elements}
          handleRemove={deleteShape}
          handleAddEdge={addNewEdge}
          handleNodeUpdate={updateNode}
          handleEdgeUpdate={updateEdgeConnection}
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
