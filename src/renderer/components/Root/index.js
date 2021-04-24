import {hot} from 'react-hot-loader/root'

import React from 'react'
import './index.css'
import Canvas from "../Canvas";
import '@/env';
import UrlInput from "../Input";
import {useEntityManager} from '../../Hooks';
import {ReactFlowProvider} from "react-flow-renderer";
import ActionButton from "../ActionButton";
import {Col, Container, Row} from "react-bootstrap";


function Root() {

  const {
    elements,
    addNewShape,
    deleteShape,
    addNewEdge,
    updateNode,
    updateEdgeConnection,
    updateUrl,
    validateUrl,
    getUrl
  } = useEntityManager();

  return (
    <ReactFlowProvider>
      <Container>
        <Row className="mt-3 mb-3">
          <UrlInput handleUrlUpdate={updateUrl} validateUrl={validateUrl}/>
        </Row>
        <Row className="mt-3 mb-3">
          Current url: <p><b>{getUrl()}</b></p>
        </Row>
        <Row className="canvas-container">
          <Canvas
            elements={elements}
            handleRemove={deleteShape}
            handleAddEdge={addNewEdge}
            handleNodeUpdate={updateNode}
            handleEdgeUpdate={updateEdgeConnection}
            handleAddNode={addNewShape}
          />
        </Row>
      </Container>
    </ReactFlowProvider>

  )
}


export default hot(Root)
