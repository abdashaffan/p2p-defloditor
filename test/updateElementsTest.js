const AutomergeSync = require("./AutomergeSync");
const YjsSync = require("./YjsSync");
const {getMemUsedInMb} = require("./utils");
const {generateNewElements} = require('./utils');
const {performance} = require('perf_hooks');


function runTest(syncModule, elements) {

  let data = {
    docSizeInBytes: 0,
    memUsedInMb: 0,
    execTimeInMs: 0
  }

  const initialMemUsed = getMemUsedInMb(true);
  const initialTime = performance.now();
  syncModule.updateElement(elements, () => {
    data.execTimeInMs = performance.now() - initialTime;
    data.memUsedInMb = getMemUsedInMb(false) - initialMemUsed;
    data.docSizeInBytes = syncModule.getDocSizeInBytes();
  });

  return data;
}

const updateElementPerformanceTest = ({testCases, numTrial}) => {

  testCases.forEach(num => {

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

    console.log('\x1b[33m%s\x1b[0m', `-- TESTING ${num} ELEMENT UPDATE PERFORMANCE --\n`);
    for (let i = 1; i <= numTrial; i++) {

      const starters = generateNewElements(num);
      const a = new AutomergeSync("user-1");
      a.addElement(starters);
      const y = new YjsSync();
      y.addElement(starters);

      // changing the pos ${num} times.
      for (let i = 0; i < num; i++) {
        starters[i].position = {x: 0, y: 0};
      }

      const aData = runTest(a, starters);
      const yjsData = runTest(y, starters);

      Object.keys(automergeAvgData).forEach(metric => {
        automergeAvgData[metric] += aData[metric];
      });

      Object.keys(yjsAvgData).forEach(metric => {
        yjsAvgData[metric] += yjsData[metric];
      });

    }

    Object.keys(automergeAvgData).forEach(metric => {
      automergeAvgData[metric] /= numTrial;
    });

    Object.keys(yjsAvgData).forEach(metric => {
      yjsAvgData[metric] /= numTrial;
    });

    console.log(`AUTOMERGE AVG FOR ${numTrial} TRIALS UPDATING ${num} ELEMENT:`);
    console.table(automergeAvgData);

    console.log(`YJS AVG FOR ${numTrial} TRIALS UPDATING ${num} ELEMENT:`);
    console.table(yjsAvgData);

  });
}

module.exports = updateElementPerformanceTest;