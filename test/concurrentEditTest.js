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

function runTest(userList, starterElements) {

  const broadcastChangesToEachOther = (userList, callback) => {
    for (let i = 0; i < userList.length; i++) {
      for (let j = 0; j < userList.length; j++) {
        if (i != j) syncChanges(userList[i], userList[j]);
      }
    }
    if (callback) callback();
  }

  let data = {
    docSizeInBytes: 0,
    memUsedInMb: 0,
    execTimeInMs: 0
  }

  userList.forEach(user => {
    user.addElement(starterElements);
  });
  broadcastChangesToEachOther(userList);


  userList.forEach(user => {
    const temp = starterElements[0];
    temp[ITEM.BACKGROUND] = Math.floor(Math.random() * 16777215).toString(16);
    user.updateElement([temp]);
  });

  const initialMemUsed = getMemUsedInMb(true);
  const initialTime = performance.now();
  broadcastChangesToEachOther(userList, () => {
    data.execTimeInMs = performance.now() - initialTime;
    data.memUsedInMb = getMemUsedInMb(false) - initialMemUsed;
    userList.forEach(user => {
      data.docSizeInBytes = Math.max(data.docSizeInBytes, user.getDocSizeInBytes());
    });
  });
  return data;
}

const concurrentEditPerformanceTest = ({testCases, numTrial}) => {

  testCases.forEach(totalUser => {

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

    for (let i = 1; i <= numTrial; i++) {
      let automergeUsers = [];
      let yjsUsers = [];
      for (let j = 0; j < totalUser; j++) {
        automergeUsers.push(new AutomergeSync(`user-${j + 1}`));
        yjsUsers.push(new YjsSync());
      }

      const starterElements = generateNewElements(1);


      const aData = runTest(automergeUsers, starterElements);
      const yjsData = runTest(yjsUsers, starterElements);

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

    console.log(`AUTOMERGE AVG FOR ${numTrial} TRIALS WITH ${totalUser} USERS:`);
    console.table(automergeAvgData);

    console.log(`YJS AVG FOR ${numTrial} TRIALS WITH ${totalUser} USERS:`);
    console.table(yjsAvgData);
  });
}

module.exports = concurrentEditPerformanceTest;
