const AutomergeSync = require('./AutomergeSync');
const YjsSync = require('./YjsSync');
const { getMemUsedInMb, getRandomColor } = require('./utils');
const { writeRecordsToCsvFile } = require('./utils');
const { generateNewElements } = require('./utils');
const { performance } = require('perf_hooks');

const syncChanges = (user1, user2, callback) => {
  const user1State = user1.getCrdtState();
  const user2State = user2.getCrdtState();
  user1.sync(user2State);
  user2.sync(user1State);
  if (callback) callback();
};

function runTest(user1, user2, starterElements) {

  let data = {
    docSizeInBytes: 0,
    memUsedInMb: 0,
    execTimeInMs: 0,
  };

  user1.addElement(starterElements);
  user2.addElement(starterElements);
  syncChanges(user1,user2);

  const user1StateAfterChanges = starterElements.map(el => {
    el.style.backgroundColor = getRandomColor();
    return el;
  });
  user1.updateElement(user1StateAfterChanges);

  const user2StateAfterChanges = starterElements.map(el => {
    el.style.backgroundColor = getRandomColor();
    return el;
  });
  user2.updateElement(user2StateAfterChanges);


  const initialMemUsed = getMemUsedInMb(true);
  const initialTime = performance.now();
  syncChanges(user1, user2, () => {
    data.execTimeInMs = performance.now() - initialTime;
    data.memUsedInMb = getMemUsedInMb(false) - initialMemUsed;
    data.docSizeInBytes = Math.max(
      data.docSizeInBytes,
      user1.getDocSizeInBytes(),
      user2.getDocSizeInBytes()
    );
  });
  return data;
}

const concurrentEditPerformanceTest = ({ testCases, numTrial }) => {
  const records = [];

  testCases.forEach((totalElements) => {
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

    for (let i = 1; i <= numTrial; i++) {
      
      const starterElements = generateNewElements(totalElements);

      const aData = runTest(new AutomergeSync("user-1"), new AutomergeSync("user-2"), starterElements);
      const yjsData = runTest(new YjsSync(), new YjsSync(), starterElements);

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
      type: 'Concurrent Edit',
      trial: numTrial,
      case: totalElements,
      ...automergeAvgData,
    });

    records.push({
      syncModule: 'Yjs',
      type: 'Concurrent Edit',
      trial: numTrial,
      case: totalElements,
      ...yjsAvgData,
    });

    console.log(
      `AUTOMERGE AVG FOR ${numTrial} TRIALS WITH 2 USERS DOING ${totalElements} CONCURRENT CHANGES:`
    );
    console.table(automergeAvgData);

    console.log(`YJS AVG FOR ${numTrial} TRIALS WITH 2 USERS DOING ${totalElements} CONCURRENT CHANGES`);
    console.table(yjsAvgData);
  });

  writeRecordsToCsvFile(records, true);
};

module.exports = concurrentEditPerformanceTest;
