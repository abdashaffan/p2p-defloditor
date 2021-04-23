import React, {useState} from 'react';
import ReactFlow from "react-flow-renderer";



// eslint-disable-next-line react/prop-types
function Canvas({elements, handleRemove}) {

  return (
      <ReactFlow
        elements={elements}
        onElementsRemove={handleRemove}
        snapToGrid={true}
        snapGrid={[15, 15]}
      />
  );
}

export default Canvas;