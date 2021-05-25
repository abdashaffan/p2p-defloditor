const AutomergeSync = require("./AutomergeSync");
const YjsSync = require("./YjsSync");
const {generateNewElements} = require('./utils');

const updateElementTest = () => {
  const starters = generateNewElements(1);
  console.log('\x1b[33m%s\x1b[0m', `-- TESTING ELEMENT UPDATE PERFORMANCE --`);

  // Automerge
  const a = new AutomergeSync("user-1");
  a.addElement(starters);
  // Yjs
  const y = new YjsSync();
  y.addElement(starters);

  // changing the pos.
  starters[0].position = {x: 0, y: 0};

  console.time(`automerge`);
  a.updateElement(starters, () => {
    console.timeEnd(`automerge`);
    console.log(`automerge document's size : ${a.getDocSizeInBytes()} bytes\n`);
  });

  console.time(`yjs`);
  y.deleteElement(starters, () => {
    console.timeEnd(`yjs`);
    console.log(`yjs document's size: ${y.getDocSizeInBytes()} bytes`);
  });

}

module.exports = updateElementTest;