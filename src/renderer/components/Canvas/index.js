import React, {useEffect, useState} from 'react';
import ReactFlow, {MiniMap, Background, Controls} from "react-flow-renderer";
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
  const getCompleteEntity = (id) => id && elements.find(el => el.id === id);

  const handleOnLoad = (reactFlowInstance) => {
    reactFlowInstance.fitView();
  }

  const handleColorFillChange = (color, _) => {
    if (isANode(activeEntity)) {
      handleNodeUpdate({
        ...activeEntity,
        style: {
          ...activeEntity.style,
          backgroundColor: color.hex,
        }
      });
    }
    setColorFill(color.hex);
  }

  const handleColorBorderChange = (color, _) => {
    if (isANode(activeEntity)) {
      handleNodeUpdate({
        ...activeEntity,
        style: {
          ...activeEntity.style,
          borderColor: color.hex,
        }
      });
    }
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

  const handleUpdatePreparation = (event, element) => {
    // Need to handle it like this because default element returned from ReactFlow
    // element only returns required metadata, causing style metadata to missing from the crdt state.
    const shapeWithStyleButObsoletePos = getCompleteEntity(element.id);
    const updatedActiveEntity = {...element, style: shapeWithStyleButObsoletePos.style};
    setActiveEntity(updatedActiveEntity);
    return handleNodeUpdate(updatedActiveEntity);
  }

  const handleCopy = () => {
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

  const handleNewShapeAddition = () => {
    return handleAddNode({
      data: {label: 'New Node'},
      position: {x: 250, y: 250},
      style: {
        backgroundColor: colorFill,
        borderColor: borderColor
      }
    })
  }

  useEffect(() => {
    // Solve color stale when copying a style node.
    setActiveEntity(getCompleteEntity(activeEntity && activeEntity.id));
  }, [colorFill, borderColor]);

  useEffect(() => {

    const keyboard = {
      'COPY': 'C',
      'CUT': 'X',
      'PASTE': 'V'
    }

    const handleClick = (event) => {
      if (event.shiftKey) {
        switch (event.key) {
          case keyboard.COPY:
            handleCopy();
            break;
          case keyboard.CUT:
            handleCut();
            break;
          case keyboard.PASTE:
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
      <Col className="left-sidebar px-4 py-4 d-sm-none d-lg-block" xs={0} lg={4} xl={3}>
        <Row className="my-3">
          <Col xs={12}>
            <ActionButton
              variant="primary"
              handleClick={handleNewShapeAddition}
              label="Add New Node"
            />
          </Col>
        </Row>
        <Row className="my-3">
          <Col xs={12}>
            <p className="m-2">Color Fill</p>
          </Col>
          <Col xs={12}>
            <CompactPicker
              onChangeComplete={handleColorFillChange}
              color={colorFill}
            />
          </Col>
        </Row>
        <Row className="my-3">
          <Col xs={12}>
            <p className="m-2">Border Color</p>
          </Col>
          <Col xs={12}>
            <CompactPicker
              onChangeComplete={handleColorBorderChange}
              color={borderColor}
            />
          </Col>
        </Row>
      </Col>
      <Col className="pb-5">
        <ReactFlow
          elements={elements}
          onConnect={handleAddEdge}
          onElementsRemove={handleRemove}
          onNodeDragStop={handleUpdatePreparation}
          onEdgeUpdate={handleEdgeUpdate}
          onLoad={handleOnLoad}
          onSelectionChange={handleSelectionChange}
        >
          <Controls/>
          <Background color="#aaa" gap={16}/>
          <MiniMap nodeColor="#333" nodeStrokeWidth={3} nodeBorderRadius={2}/>
        </ReactFlow>
      </Col>
    </>
  );
}

export default Canvas;