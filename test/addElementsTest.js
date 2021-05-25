const AutomergeSync = require("./AutomergeSync");
const YjsSync = require("./YjsSync");
const {generateNewElements, getMemUsedInMb} = require('./utils');


function runTest(num, syncModule, elements, label) {
  console.log(label);
  console.time(`execution time`);
  const aInitialMem = getMemUsedInMb();
  syncModule.addElement(elements, () => {
    const aTotalMemUsed = getMemUsedInMb() - aInitialMem;
    console.log(`mem used: ${aTotalMemUsed} MB`);
    console.timeEnd(`execution time`);
    console.log(`document size: ${syncModule.getDocSizeInBytes()} bytes`);
  });
  console.log('\n');
}

const testElementAddition = () => {
  const numOfElementsToBeTested = [1,10,200,1000];
  numOfElementsToBeTested.forEach(num => {
    console.log('\x1b[33m%s\x1b[0m',`-- TESTING ${num} ELEMENTS ADDITION --\n`);
    const elements = generateNewElements(num);
    runTest(num, new AutomergeSync("new-user"), elements, "Automerge");
    runTest(num, new YjsSync(), elements, "Yjs");
  });
}

// testElementAddition();

module.exports = testElementAddition;

