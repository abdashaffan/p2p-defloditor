const {uniqueNamesGenerator, names} = require('unique-names-generator');
const { v4: uuidv4 } = require('uuid');


const ITEM = Object.freeze({
  ID: 'id',
  TYPE: 'type',
  LABEL: 'label',
  SHAPE: 'shape',
  POSITION: 'position',
  BACKGROUND: 'backgroundColor',
  BORDER: 'borderColor',
  SOURCE: 'source',
  TARGET: 'target'
});


const getAnonymousIdentifier = () =>
  uniqueNamesGenerator({
      dictionaries: [names,names],
    separator: '-',
    length: 2
  });

const getRandomColor = () => `#${Math.floor(Math.random() * 16777215).toString(16)}`;


const isAnEdge = (el) => {
  if (!el) return false;
  return el.id.startsWith('edge');
}

const isANode = (el) => {
  if (!el) return false;
  return el.id.startsWith('node');
}

const getAnnotatedPeers = (peers, me) => {
  if (peers.length < 1) return peers;
  return peers.map(peer => {
    if (peer.selfId !== me.selfId) return peer;
    return {...peer, isMe: true}
  })
}

const initialElements = {
  'node:1': {
    id: 'node:1',
    type: 'default',
    data: {label: 'Welcome to defloditor'},
    position: {x: 250, y: 25},
    style: {backgroundColor: 'white',borderColor: 'green'}
  },
  'node:2': {
    id: 'node:2',
    type: 'default',
    data: {label: 'A P2P flowchart editor'},
    position: {x: 100, y: 125},
    style: {backgroundColor: 'white', borderColor: 'black'}
  }
}

const generateNewElements = (numOfEl) => {
  const elements = [];
  for (let i = 0; i < numOfEl; i++) {
    const newEl = {};
    newEl[ITEM.ID] = `node:${uuidv4()}`;
    newEl[ITEM.TYPE] = "default";
    newEl["data"] = {label: newEl[ITEM.ID]};
    newEl[ITEM.POSITION] = {x: 250, y: 25},
    newEl["style"] = {backgroundColor: 'white',borderColor: 'green'};
    elements.push(newEl);
  }
  return elements;
}

const getMemUsedInMb = (useGc) => {
  // Source: https://github.com/dmonad/crdt-benchmarks/blob/main/benchmarks/utils.js with some changes.
  if (typeof global !== 'undefined' && typeof process !== 'undefined') {
    if (global.gc && useGc) {
      console.log('gc is global');
      global.gc();
    }
    const res = process.memoryUsage().heapUsed / 1024 / 1024;
    return res;
  }
  return 0;
}

module.exports = {
  ITEM,
  getAnonymousIdentifier,
  initialElements,
  getAnnotatedPeers,
  isANode,
  isAnEdge,
  getRandomColor,
  generateNewElements,
  getMemUsedInMb
}