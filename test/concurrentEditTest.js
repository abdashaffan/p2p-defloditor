const AutomergeSync = require("./AutomergeSync");
const YjsSync = require("./YjsSync");
const {getMemUsedInMb} = require("./utils");
const {ITEM} = require("./utils");
const {generateNewElements} = require("./utils");
const {performance} = require('perf_hooks');


const syncChanges = (user1, user2, callback) => {
  const user1State = user1.getCrdtState();
  const user2State = user2.getCrdtState();
  user1.sync(user2State);
  user2.sync(user1State);
  if (callback) callback();
}

function runTest(user1, user2, starterElements, label) {

  let data = {
    docSizeInBytes: 0,
    memUsedInMb: 0,
    execTimeInMs: 0
  }
  console.log('\x1b[33m%s\x1b[0m', label);

  syncChanges(user1, user2);

  user1.addElement(starterElements);
  user2.addElement(starterElements);
  syncChanges(user1, user2);

  const changeForUser1 = starterElements[0];
  const changeForUser2 = starterElements[0];

  changeForUser1[ITEM.BACKGROUND] = "green";
  changeForUser2[ITEM.BACKGROUND] = "yellow";

  user1.updateElement([changeForUser1]);
  user2.updateElement([changeForUser2]);

  const initialMemUsed = getMemUsedInMb(true);
  const initialTime = performance.now();
  syncChanges(user1, user2, () => {
    data.execTimeInMs = performance.now() - initialTime;
    data.memUsedInMb = getMemUsedInMb(false) - initialMemUsed;
    data.docSizeInBytes = Math.max(user1.getDocSizeInBytes(), user2.getDocSizeInBytes());
  });
  return data;
}

const testConcurrentEditPerf = () => {

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

  for (let i = 0; i < NUM_TRIAL; i++) {

    const user1Automerge = new AutomergeSync("user-1");
    const user2Automerge = new AutomergeSync("user-2");
    const user1Yjs = new YjsSync();
    const user2Yjs = new YjsSync();
    const starterElements = generateNewElements(1);


    const aData = runTest(user1Automerge, user2Automerge, starterElements, `AUTOMERGE TEST ${i + 1}`);
    const yjsData = runTest(user1Yjs, user2Yjs, starterElements, `YJS TEST ${i + 1}`);

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

  console.log(`AUTOMERGE AVG FOR ${NUM_TRIAL} TRIALS:`);
  console.table(automergeAvgData);

  console.log(`YJS AVG FOR ${NUM_TRIAL} TRIALS:`);
  console.table(yjsAvgData);

}


testConcurrentEditPerf();

