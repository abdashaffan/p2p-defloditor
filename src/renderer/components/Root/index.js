import {hot} from 'react-hot-loader/root'

import React from 'react'
import './index.css'
import Canvas from "../Canvas";
import UrlInput from "../Input";
import {useEntityManager} from '../../Hooks';
import {ReactFlowProvider} from "react-flow-renderer";
import {Col, Container, Row} from "react-bootstrap";
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
        <Container fluid>
          <Row className="app-top px-4 py-4">
            <Col md={7}>
              <Row><b>Current workspace:</b></Row>
              <Row>{getUrl()}</Row>
            </Col>
            <Col className="d-sm-none d-md-block">
              <Row>
                <Col className="d-flex align-items-center justify-content-end">
                  <CustomAvatarGroup peers={getAnnotatedPeers(peers)}/>
                </Col>
                <Col xs={8}>
                  <UrlInput handleUrlUpdate={updateUrl} validateUrl={validateUrl}/>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className="app-bottom">
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
  return <LinearProgress/>;
}


export default hot(Root)
