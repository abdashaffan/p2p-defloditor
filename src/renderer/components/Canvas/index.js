import React, {useState} from 'react';
import ReactFlow from "react-flow-renderer";



// eslint-disable-next-line react/prop-types
function Canvas({elements}) {

  return (
      <ReactFlow elements={elements}/>
  );
}

export default Canvas;