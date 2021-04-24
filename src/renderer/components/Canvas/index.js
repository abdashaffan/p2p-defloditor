import React, {useEffect, useState} from 'react';
import ReactFlow from "react-flow-renderer";
import {isANode} from "../../utils";
import {Col, Row} from "react-bootstrap";
import {CompactPicker} from "react-color";
import ActionButton from "../ActionButton";


// eslint-disable-next-line react/prop-types
function Canvas({elements, handleRemove, handleAddEdge, handleNodeUpdate, handleEdgeUpdate, handleAddNode}) {

  // Differentiate between active and copy shape so the copied shape doesn't
  // change every time user clicks a different shape.
  const [activeEntity, setActiveEntity] = useState(null);
  const [copiedEntityRef, setCopiedEntityRef] = useState(null);
  const [colorFill, setColorFill] = useState("#fff");
  const [borderColor, setBorderColor] = useState("#000");


  const handleOnLoad = (reactFlowInstance) => {
    reactFlowInstance.fitView();
  }
  const handleColorFillChange = (color, event) => {
    setColorFill(color.hex);
  }
  const handleColorBorderChange = (color, event) => {
    setBorderColor(color.hex);
  }
  const handleSelectionChange = (listOfClickedElement) => {
    if (listOfClickedElement && listOfClickedElement.length > 0) {
      // Original react-flow API supports multiple selection,
      // but this app only supports one selection.
      const firstActiveEntity = listOfClickedElement[0];
      // eslint-disable-next-line react/prop-types
      const isStillExist = elements.find(el => el.id === firstActiveEntity.id);
      if (isStillExist) {
        setActiveEntity(firstActiveEntity);
        return;
      }
    }
    setActiveEntity(null);
  }

  const handleCopy = () => {
    if (isANode(activeEntity)) {
      setCopiedEntityRef(activeEntity);
    }
  }

  const handleCut = () => {
    if (isANode(activeEntity)) {
      setCopiedEntityRef(activeEntity);
      handleRemove([activeEntity]);
    }
  }

  const handlePaste = () => {
    if (isANode(copiedEntityRef)) {
      handleAddNode(copiedEntityRef);
    }
  }

  useEffect(() => {

    const keyboard = {
      'C': 'c',
      'X': 'x',
      'V': 'v'
    }

    const handleClick = (event) => {
      if (event.ctrlKey) {
        switch (event.key) {
          case keyboard.C:
            handleCopy();
            break;
          case keyboard.X:
            handleCut();
            break;
          case keyboard.V:
            handlePaste();
            break;
          default:
            break;
        }
      }
    }

    window.addEventListener('keydown', handleClick);

    return () => {
      window.removeEventListener('keydown', handleClick);
    };
  });

  return (
    <>
      <Row style={{alignItems:'center'}} className="mb-4">
        <Col>
          <ActionButton
            variant="primary"
            handleClick={handleAddNode}
            label="Add New Shape"
          />
        </Col>
        <Col className="toolkit">
          <CompactPicker onChangeComplete={handleColorFillChange} color={colorFill}/>
          <h5 className="m-2">Set Color Fill</h5>
        </Col>
        <Col className="toolkit">
          <CompactPicker onChangeComplete={handleColorBorderChange} color={borderColor}/>
          <h5 className="m-2">Set Border Color</h5>
        </Col>
      </Row>
      <Row className="canvas-wrapper">
        <ReactFlow
          elements={elements}
          onConnect={handleAddEdge}
          onElementsRemove={handleRemove}
          onNodeDragStop={handleNodeUpdate}
          onNodeMouseLeave={(event,node) => handleSelectionChange([node])}
          onEdgeUpdate={handleEdgeUpdate}
          onLoad={handleOnLoad}
          onSelectionChange={handleSelectionChange}
        />
      </Row>
    </>
  );
}

export default Canvas;