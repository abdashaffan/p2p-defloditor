const AutomergeSync = require("./AutomergeSync");
const YjsSync = require("./YjsSync");
const {generateNewElements} = require('./utils');

const deleteElementTest = () => {
  const starters = generateNewElements(1);
  const id = starters[0].id;
  console.log('\x1b[33m%s\x1b[0m',`-- TESTING ELEMENT DELETION PERFORMANCE --`);
  // Automerge
  const a = new AutomergeSync("user-1");
  a.addElement(starters);
  console.time(`automerge`);
  a.deleteElement([id], () => {
    console.timeEnd(`automerge`);
    console.log(`automerge document's size : ${a.getDocSizeInBytes()} bytes\n\n`);
  });
  // Yjs
  const y = new YjsSync();
  y.addElement(starters);
  console.time(`yjs`);
  y.deleteElement([id], () => {
    console.timeEnd(`yjs`);
    console.log(`yjs document's size: ${y.getDocSizeInBytes()} bytes`);
  });

}

deleteElementTest();