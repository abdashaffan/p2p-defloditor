import React, {useEffect, useState} from 'react';
import ReactFlow from "react-flow-renderer";



// eslint-disable-next-line react/prop-types
function Canvas({elements, handleRemove, handleAddEdge, handleNodeUpdate, handleEdgeUpdate}) {

  const [activeEntity, setActiveEntity] = useState(null);

  const handleOnLoad = (reactFlowInstance) => {
    reactFlowInstance.fitView();
  }

  const handleSelectionChange = (listOfClickedElement) => {
    if (listOfClickedElement && listOfClickedElement.length > 0) {
      // Original react-flow API supports multiple selection,
      // but this app only supports one selection.
      const activeEntity = listOfClickedElement[0];
      // eslint-disable-next-line react/prop-types
      const isStillExist = elements.find(el => el.id === activeEntity.id);
      if (isStillExist) {
        setActiveEntity(activeEntity);
      } else {
        setActiveEntity(null);
      }
      return;
    }
    // Set active entity to null.
    setActiveEntity(null);
  }

  const handleCopy = () => {
    console.log('[copy]');
  }

  const handleCut = () => {
    console.log('[cut]');
  }

  const handlePaste = () => {
    console.log('[paste]');
  }

  useEffect(() => {
    console.log(`active entity: ${activeEntity && activeEntity.id}`);
  });

  useEffect(() => {

    const keyboard = {
      'C': 'c',
      'X': 'x',
      'V': 'v'
    }

    const  handleClick = (event) => {
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
  }, []);

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