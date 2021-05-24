const {uniqueNamesGenerator, names} = require('unique-names-generator');


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

module.exports = {
  ITEM,
  getAnonymousIdentifier,
  initialElements,
  getAnnotatedPeers,
  isANode,
  isAnEdge,
  getRandomColor
}