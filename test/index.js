const {initialElements} = require('./utils');
const AutomergeSync = require("./AutomergeSync");
const YjsSync = require("./YjsSync");

const starters = Object.values(initialElements);
console.table(starters);

// const userA = new AutomergeSync("user-1");
// userA.show("initial data");
// userA.addElement(starters);
// userA.show("after adding elements");
// userA.deleteElement(['node:1']);
// userA.show("after del node:1");
// starters[1].position = {x: 0, y:0};
// userA.updateElement([starters[1]]);
// userA.show("after changing pos");

const userA = new YjsSync();
userA.show("initial data");
userA.addElement(starters);
userA.show("after adding elements");
userA.deleteElement(['node:1']);
userA.show("after del node:1");
starters[1].position = {x: 0, y:0};
userA.updateElement([starters[1]]);
userA.show("after changing pos");
