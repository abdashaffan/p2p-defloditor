import {hot} from 'react-hot-loader/root'

import React from 'react'
import './index.css'
import Canvas from "../Canvas";
import UrlInput from "../Input";
import {useEntityManager} from '../../Hooks';
import {ReactFlowProvider} from "react-flow-renderer";
import {Container, Row} from "react-bootstrap";
import env from "../../../common/env";

// Save document in user's local in production.
// const withPersistence = env.isProduction;
const withPersistence = false;

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
  } = useEntityManager(withPersistence);

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
