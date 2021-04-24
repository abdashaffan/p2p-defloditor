import React, {useEffect, useState} from 'react';
import ReactFlow from "react-flow-renderer";



// eslint-disable-next-line react/prop-types
function Canvas({elements, handleRemove, handleAddEdge, handleNodeUpdate, handleEdgeUpdate}) {

  const [activeEntityId, setActiveEntityId] = useState(null);

  const handleOnLoad = (reactFlowInstance) => {
    reactFlowInstance.fitView();
  }

  const handleSelectionChange = (listOfClickedElement) => {
    if (listOfClickedElement && listOfClickedElement.length > 0) {
      // Original react-flow API supports multiple selection,
      // but this app only supports one selection.
      const activeId = listOfClickedElement[0].id;
      // eslint-disable-next-line react/prop-types
      const isStillExistInsideCrdt = elements.find(el => el.id === activeId);
      if (isStillExistInsideCrdt) {
        setActiveEntityId(activeId);
      } else {
        setActiveEntityId(null);
      }
      return;
    }
    // Set active entity to null.
    setActiveEntityId(null);
  }

  useEffect(() => {
    console.log(`active entity: ${activeEntityId}`);
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