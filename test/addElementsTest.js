const AutomergeSync = require("./AutomergeSync");
const YjsSync = require("./YjsSync");
const {generateNewElements, getMemUsedInMb} = require('./utils');


const testElementAddition = () => {
  const numOfElementsToBeTested = [1,10,200,1000];
  numOfElementsToBeTested.forEach(num => {
    console.log('\x1b[33m%s\x1b[0m',`-- TESTING ${num} ELEMENT ADDITION --`);
    const elements = generateNewElements(num);
    // Automerge
    const a = new AutomergeSync("user-1");
    console.time(`counting automerge's execution time to add ${num} elements`);
    const aInitialMem = getMemUsedInMb();
    a.addElement(elements, () => {
      const aTotalMemUsed = getMemUsedInMb() - aInitialMem;
      console.log(`automerge total mem used for ${num} addition: ${aTotalMemUsed} MB`);
      console.timeEnd(`counting automerge's execution time to add ${num} elements`);
      console.log(`automerge document's size after ${num} addition: ${a.getDocSizeInBytes()} bytes`);
    });
    console.log('\n');
    // Yjs
    const y = new YjsSync();
    console.time(`counting yjs's execution time to add ${num} elements`);
    const yInitialMem = getMemUsedInMb();
    y.addElement(elements, () => {
      const yTotalMemUsed = getMemUsedInMb() - yInitialMem;
      console.log(`yjs total mem used for ${num} addition: ${yTotalMemUsed} MB`);
      console.timeEnd(`counting yjs's execution time to add ${num} elements`);
      console.log(`yjs document's size after ${num} addition: ${y.getDocSizeInBytes()} bytes`);
    });
    console.log('\n\n');
  });
}

module.exports = testElementAddition;

