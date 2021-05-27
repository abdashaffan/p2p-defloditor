const AutomergeSync = require('./AutomergeSync');
const YjsSync = require('./YjsSync');
const {
  generateNewElements,
  getMemUsedInMb,
  writeRecordsToCsvFile,
} = require('./utils');
const { performance } = require('perf_hooks');

function runTest(syncModule, elements) {
  let data = {
    docSizeInBytes: 0,
    memUsedInMb: 0,
    execTimeInMs: 0,
  };

  const initialMemUsed = getMemUsedInMb(true);
  const initialTime = performance.now();
  syncModule.addElement(elements, () => {
    data.execTimeInMs = performance.now() - initialTime;
    data.memUsedInMb = getMemUsedInMb(false) - initialMemUsed;
    data.docSizeInBytes = syncModule.getDocSizeInBytes();
  });

  return data;
}

const addElementPerformanceTest = ({ testCases, numTrial }) => {
  const records = [];

  testCases.forEach((num) => {
    const automergeAvgData = {
      docSizeInBytes: 0,
      memUsedInMb: 0,
      execTimeInMs: 0,
    };

    const yjsAvgData = {
      docSizeInBytes: 0,
      memUsedInMb: 0,
      execTimeInMs: 0,
    };

    console.log(
      '\x1b[33m%s\x1b[0m',
      `-- TESTING ${num} ELEMENTS ADDITION --\n`
    );
    for (let i = 1; i <= numTrial; i++) {
      const elements = generateNewElements(num);
      const aData = runTest(new AutomergeSync('new-user'), elements);
      const yjsData = runTest(new YjsSync(), elements);

      Object.keys(automergeAvgData).forEach((metric) => {
        automergeAvgData[metric] += aData[metric];
      });

      Object.keys(yjsAvgData).forEach((metric) => {
        yjsAvgData[metric] += yjsData[metric];
      });
    }

    Object.keys(automergeAvgData).forEach((metric) => {
      automergeAvgData[metric] /= numTrial;
    });

    Object.keys(yjsAvgData).forEach((metric) => {
      yjsAvgData[metric] /= numTrial;
    });

    records.push({
      syncModule: 'Automerge',
      type: 'Addition',
      trial: numTrial,
      case: num,
      ...automergeAvgData,
    });

    records.push({
      syncModule: 'Yjs',
      type: 'Addition',
      trial: numTrial,
      case: num,
      ...yjsAvgData,
    });

    console.log(`AUTOMERGE AVG FOR ${numTrial} TRIALS ADDING ${num} ELEMENTS:`);
    console.table(automergeAvgData);

    console.log(`YJS AVG FOR ${numTrial} TRIALS ADDING ${num} ELEMENTS:`);
    console.table(yjsAvgData);
  });

  writeRecordsToCsvFile(records);
};

module.exports = addElementPerformanceTest;
