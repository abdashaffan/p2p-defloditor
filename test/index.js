const {initialElements} = require('./utils');
const AutomergeSync = require("./AutomergeSync");



const starters = Object.values(initialElements);
console.table(starters);
const userA = new AutomergeSync();
userA.show("initial data");
userA.addElement(starters);
userA.show("after adding elements");
userA.deleteElement(['node:1']);
userA.show("after del node:1");
starters[1].position = {x: 0, y:0};
userA.updateElement([starters[1]]);
userA.show("after changing pos");
