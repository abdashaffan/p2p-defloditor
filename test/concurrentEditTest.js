const AutomergeSync = require("./AutomergeSync");
const YjsSync = require("./YjsSync");
const {getMemUsedInMb} = require("./utils");
const {ITEM} = require("./utils");
const {generateNewElements} = require("./utils");

const syncChanges = (user1, user2, callback) => {
  const user1State = user1.getCrdtState();
  const user2State = user2.getCrdtState();
  user1.sync(user2State);
  user2.sync(user1State);
  if (callback) callback();
}

function runTest(user1, user2, label) {

  console.log('\x1b[33m%s\x1b[0m',label);

  const starterElements = generateNewElements(1);

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

  let timePerfLabel = 'time to finish merging the concurrent change';
  const initialMemUsed = getMemUsedInMb();
  console.time(timePerfLabel);
  syncChanges(user1, user2, () => {
    console.timeEnd(timePerfLabel);
    const memUsed = getMemUsedInMb(false) - initialMemUsed;
    console.log(`mem used: ${memUsed} MB`);
    console.log(`user1 doc size: ${user1.getDocSizeInBytes()} bytes`);
    console.log(`user2 doc size: ${user2.getDocSizeInBytes()} bytes`);
  });
}

const testConcurrentEditPerf = () => {

  const user1Automerge = new AutomergeSync("user-1");
  const user2Automerge = new AutomergeSync("user-2");
  const user1Yjs = new YjsSync();
  const user2Yjs = new YjsSync();

  runTest(user1Automerge, user2Automerge, "AUTOMERGE TEST");
  runTest(user1Yjs, user2Yjs, "YJS TEST");

}


testConcurrentEditPerf();

