import {ReactFlowProvider} from "react-flow-renderer";
import {Col, Container, Row} from "react-bootstrap";
import CustomAvatarGroup from "../AvatarGroup";
import UrlInput from "../Input";
import Canvas from "../Canvas";
import {LinearProgress} from "@material-ui/core";
import React from "react";
import {useYmerge} from "../../hooks/UseYmerge";
import {getAnnotatedPeers} from "../../utils";

function YmergeEditor() {

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
  } = useYmerge();

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
                  <CustomAvatarGroup peers={getAnnotatedPeers(peers,getUser())}/>
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


export default YmergeEditor