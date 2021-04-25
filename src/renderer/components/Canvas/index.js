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


  // ReactFlow component's event handler only includes required metadata.
  // So we need to do this to enable style handling (and any other custom metadata, for that matter).
  // eslint-disable-next-line react/prop-types
  const getCompleteEntity = (id) => elements.find(el => el.id === id);

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
      const entityId = listOfClickedElement[0].id;
      setActiveEntity(getCompleteEntity(entityId));
      return;
    }
    setActiveEntity(null);
  }

  const handleUpdatePreparation = (event,element) => {
    // Need to handle it like this because default element returned from ReactFlow
    // element only returns required metadata, causing style metadata to missing from the crdt state.
    return handleNodeUpdate(getCompleteEntity(element.id));
  }

  const handleCopy = () => {
    if (isANode(activeEntity)) {
      // Move the copied shape down a bit to make it visible after paste.
      const copied = {
        ...activeEntity,
        position: {
          x: activeEntity.position.x +25,
          y: activeEntity.position.y + 30,
        }
      }
      setCopiedEntityRef(copied);
    }
  }

  const handleCut = () => {
    if (isANode(activeEntity)) {
      // Move the copied shape down a bit to make it visible after paste.
      const copied = {
        ...activeEntity,
        position: {
          x: activeEntity.position.x + 25,
          y: activeEntity.position.y + 30,
        }
      }
      setCopiedEntityRef(copied);
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
          onNodeDragStop={handleUpdatePreparation}
          onEdgeUpdate={handleEdgeUpdate}
          onLoad={handleOnLoad}
          onSelectionChange={handleSelectionChange}
        />
      </Row>
    </>
  );
}

export default Canvas;