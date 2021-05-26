import {hot} from 'react-hot-loader/root'

import React from 'react'
import './index.css'
import env from "../../../common/env";
import {ReactFlowProvider} from "react-flow-renderer";
import {Col, Container, Row} from "react-bootstrap";
import CustomAvatarGroup from "../AvatarGroup";
import {getAnnotatedPeers} from "../../utils";
import UrlInput from "../Input";
import Canvas from "../Canvas";
import {useEntityManager} from "../../hooks/UseEntityManager";
import {UseReload} from "../../hooks/UseReload";
import ReloadBackdrop from "../ReloadBackdrop";


const module = env.module;
const saveToPersistentStorage = env.withPersistence;

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
  } = useEntityManager(module, saveToPersistentStorage);

  const isContentReady = () => peers && peers.length >= 1;

  const {showReloadBtn, reload} = UseReload();

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
                {
                  isContentReady() ?
                    <CustomAvatarGroup peers={getAnnotatedPeers(peers, getUser())}/> :
                    <div className="offline-info">You are offline</div>
                }
              </Col>
              <Col xs={8}>
                <UrlInput handleUrlUpdate={updateUrl} validateUrl={validateUrl}/>
              </Col>
            </Row>
          </Col>
        </Row>

        <Row className="app-bottom">
          <Canvas
            show={isContentReady()}
            elements={elements}
            handleRemove={deleteShape}
            handleAddEdge={addNewEdge}
            handleNodeUpdate={updateNode}
            handleEdgeUpdate={updateEdgeConnection}
            handleAddNode={addNewShape}
          />
        </Row>
      </Container>
      <ReloadBackdrop show={showReloadBtn} handleClick={reload}/>
    </ReactFlowProvider>
  )
}


export default hot(Root)
