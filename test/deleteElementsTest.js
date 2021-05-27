const AutomergeSync = require('./AutomergeSync');
const YjsSync = require('./YjsSync');
const { getMemUsedInMb, writeRecordsToCsvFile } = require('./utils');
const { generateNewElements } = require('./utils');
const { performance } = require('perf_hooks');

function runTest(syncModule, elements) {
  const ids = elements.map((el) => el.id);

  let data = {
    docSizeInBytes: 0,
    memUsedInMb: 0,
    execTimeInMs: 0,
  };

  const initialMemUsed = getMemUsedInMb(true);
  const initialTime = performance.now();
  syncModule.deleteElement(ids, () => {
    data.execTimeInMs = performance.now() - initialTime;
    data.memUsedInMb = getMemUsedInMb(false) - initialMemUsed;
    data.docSizeInBytes = syncModule.getDocSizeInBytes();
  });

  return data;
}

const deleteElementPerformanceTest = ({ testCases, numTrial }) => {
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
      `-- TESTING ${num} ELEMENT DELETION PERFORMANCE --\n`
    );
    for (let i = 1; i <= numTrial; i++) {
      const starters = generateNewElements(num);

      const a = new AutomergeSync('user-1');
      a.addElement(starters);
      const y = new YjsSync();
      y.addElement(starters);

      const aData = runTest(a, starters);
      const yjsData = runTest(y, starters);

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
      type: 'Deletion',
      trial: numTrial,
      case: num,
      ...automergeAvgData,
    });

    records.push({
      syncModule: 'Yjs',
      type: 'Deletion',
      trial: numTrial,
      case: num,
      ...yjsAvgData,
    });

    console.log(
      `AUTOMERGE AVG FOR ${numTrial} TRIALS -> DELETING ${num} ELEMENT:`
    );
    console.table(automergeAvgData);

    console.log(`YJS AVG FOR ${numTrial} TRIALS -> DELETING ${num} ELEMENT:`);
    console.table(yjsAvgData);
  });

  writeRecordsToCsvFile(records, true);
};

module.exports = deleteElementPerformanceTest;
