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

const updateElementPerformanceTest = () => {

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

  console.log('\x1b[33m%s\x1b[0m',`-- TESTING ELEMENT UPDATE --\n`);
  for (let i = 1; i <= NUM_TRIAL; i++) {

    const starters = generateNewElements(1);
    const a = new AutomergeSync("user-1");
    a.addElement(starters);
    const y = new YjsSync();
    y.addElement(starters);

    // changing the pos.
    starters[0].position = {x: 0, y: 0};

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
    automergeAvgData[metric] /= NUM_TRIAL;
  });

  Object.keys(yjsAvgData).forEach(metric => {
    yjsAvgData[metric] /= NUM_TRIAL;
  });

  console.log(`AUTOMERGE AVG FOR ${NUM_TRIAL} TRIALS UPDATING AN ELEMENT:`);
  console.table(automergeAvgData);

  console.log(`YJS AVG FOR ${NUM_TRIAL} TRIALS UPDATING AN ELEMENT:`);
  console.table(yjsAvgData);

}

module.exports = updateElementPerformanceTest;