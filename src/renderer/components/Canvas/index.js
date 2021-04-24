import React, {useEffect, useState} from 'react';
import ReactFlow from "react-flow-renderer";
import {isANode} from "../../utils";


// eslint-disable-next-line react/prop-types
function Canvas({elements, handleRemove, handleAddEdge, handleNodeUpdate, handleEdgeUpdate, handleAddNode}) {

  // Differentiate between active and copy shape so the copied shape doesn't
  // change every time user clicks a different shape.
  const [activeEntity, setActiveEntity] = useState(null);
  const [copiedEntityRef, setCopiedEntityRef] = useState(null);


  const handleOnLoad = (reactFlowInstance) => {
    reactFlowInstance.fitView();
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
    <ReactFlow
      elements={elements}
      onConnect={handleAddEdge}
      onElementsRemove={handleRemove}
      onNodeDragStop={handleNodeUpdate}
      onEdgeUpdate={handleEdgeUpdate}
      onLoad={handleOnLoad}
      onSelectionChange={handleSelectionChange}
      // snapToGrid={true}
      // snapGrid={[15, 15]}
    />
  );
}

export default Canvas;