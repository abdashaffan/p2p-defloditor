import {hot} from 'react-hot-loader/root'

import React from 'react'
import './index.css'
import Canvas from "../Canvas";
import UrlInput from "../Input";
import {useEntityManager} from '../../Hooks';
import {ReactFlowProvider} from "react-flow-renderer";
import {Container, Row} from "react-bootstrap";
import env from "../../../common/env";
import CustomAvatarGroup from "../AvatarGroup";
import {LinearProgress} from "@material-ui/core";

// Save document in user's local in production.
// const withPersistence = env.isProduction;
const withPersistence = false;
const module = env.module;

function Root() {

  const {
    elements,
    peers,
    addNewShape,
    deleteShape,
    addNewEdge,
    updateNode,
    updateEdgeConnection,
    updateUrl,
    validateUrl,
    getUrl,
    getUser
  } = useEntityManager(withPersistence, module);

  const getAnnotatedPeers = (peers) => {
    if (peers.length < 1) return peers;
    return peers.map(peer => {
      const me = getUser();
      if (peer.selfId !== me.selfId) return peer;
      return {...peer, isMe: true}
    })
  }

  if (peers && peers.length > 0) {
    return (
      <ReactFlowProvider>
        <Container className="root">
          <Row className="mt-5"><h2>Basic Flowchart Editor</h2></Row>
          <Row className="mt-3">
            <UrlInput handleUrlUpdate={updateUrl} validateUrl={validateUrl}/>
          </Row>
          <Row className="mt-3">
            <h5>Current Workspace Url:</h5>
          </Row>
          <Row><p><b>{getUrl()}</b></p></Row>
          <Row className="mt-3"><h5>Users in this document: {peers.length}</h5></Row>
          <Row>
            <CustomAvatarGroup peers={getAnnotatedPeers(peers)}/>
          </Row>
          <Row className="canvas-container mt-5 mb-5">
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
  return <LinearProgress />;
}


export default hot(Root)
