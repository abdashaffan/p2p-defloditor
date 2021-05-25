const AutomergeSync = require("./AutomergeSync");
const YjsSync = require("./YjsSync");
const {generateNewElements, getMemUsedInMb} = require('./utils');
const {performance} = require('perf_hooks');


function runTest(num, syncModule, elements) {

  let data = {
    docSizeInBytes: 0,
    memUsedInMb: 0,
    execTimeInMs: 0
  }

  const initialMemUsed = getMemUsedInMb(true);
  const initialTime = performance.now();
  syncModule.addElement(elements, () => {
    data.execTimeInMs = performance.now() - initialTime;
    data.memUsedInMb = getMemUsedInMb(false) - initialMemUsed;
    data.docSizeInBytes = syncModule.getDocSizeInBytes();
  });

  return data;
}

const addElementTest = () => {

  const numOfElementsToBeTested = [1,10,200,1000];

  numOfElementsToBeTested.forEach(num => {

    const NUM_TRIAL = 100;

    const automergeAvgData = {
      docSizeInBytes: 0,
      memUsedInMb: 0,
      execTimeInMs: 0
    }

    const yjsAvgData = {
      docSizeInBytes: 0,
      memUsedInMb: 0,
      execTimeInMs: 0
    }

    console.log('\x1b[33m%s\x1b[0m',`-- TESTING ${num} ELEMENTS ADDITION --\n`);
    for (let i = 1; i <= NUM_TRIAL; i++) {

      const elements = generateNewElements(num);
      const aData = runTest(num, new AutomergeSync("new-user"), elements);
      const yjsData = runTest(num, new YjsSync(), elements);

      Object.keys(automergeAvgData).forEach(metric => {
        automergeAvgData[metric] += aData[metric];
      });

      Object.keys(yjsAvgData).forEach(metric => {
        yjsAvgData[metric] += yjsData[metric];
      });

    }

    Object.keys(automergeAvgData).forEach(metric => {
      automergeAvgData[metric] /= NUM_TRIAL;
    });

    Object.keys(yjsAvgData).forEach(metric => {
      yjsAvgData[metric] /= NUM_TRIAL;
    });

    console.log(`AUTOMERGE AVG FOR ${NUM_TRIAL} TRIALS ADDING ${num} ELEMENTS:`);
    console.table(automergeAvgData);

    console.log(`YJS AVG FOR ${NUM_TRIAL} TRIALS ADDING ${num} ELEMENTS:`);
    console.table(yjsAvgData);

  });
}

module.exports = addElementTest;

