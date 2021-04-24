import React from 'react';
import ReactFlow from "react-flow-renderer";



// eslint-disable-next-line react/prop-types
function Canvas({elements, handleRemove, handleAddEdge, handleNodeUpdate, handleEdgeUpdate}) {

  const handleOnLoad = (reactFlowInstance) => {
    reactFlowInstance.fitView();
  }

  return (
      <ReactFlow
        elements={elements}
        onConnect={handleAddEdge}
        onElementsRemove={handleRemove}
        onNodeDragStop={handleNodeUpdate}
        onEdgeUpdate={handleEdgeUpdate}
        onLoad={handleOnLoad}
        snapToGrid={true}
        snapGrid={[15, 15]}
      />
  );
}

export default Canvas;