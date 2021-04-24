import React from 'react';
import ReactFlow from "react-flow-renderer";



// eslint-disable-next-line react/prop-types
function Canvas({elements, handleRemove, handleAddEdge}) {

  return (
      <ReactFlow
        elements={elements}
        onConnect={handleAddEdge}
        onElementsRemove={handleRemove}
        snapToGrid={true}
        snapGrid={[15, 15]}
      />
  );
}

export default Canvas;