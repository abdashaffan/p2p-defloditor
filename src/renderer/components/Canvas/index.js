import React from 'react';
import ReactFlow from "react-flow-renderer";

const elements = [
  {
    id: '1',
    type: 'input', // input node
    data: {label: 'Welcome to defloditor'},
    position: {x: 250, y: 25},
    style: {borderColor: 'green'}
  },
  // default node
  {
    id: '2',
    // you can also pass a React component as a label
    data: {label: 'A P2P flowchart editor'},
    position: {x: 100, y: 125},
  }
];

function Canvas() {
  return (
      <ReactFlow elements={elements}/>
  );
}

export default Canvas;