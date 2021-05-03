import {v4 as uuidv4} from 'uuid';
const {uniqueNamesGenerator, adjectives, names} = require('unique-names-generator');

export const entityEnum = Object.freeze({
  user: 1,
  node: 2,
  edge: 3
})

export const generateId = (entity) => {
  switch (entity) {
    case entityEnum.user:
      return `user:${uuidv4()}`;
    case entityEnum.node:
      return `node:${uuidv4()}`;
    case entityEnum.edge:
      return `edge:${uuidv4()}`;
    default:
      throw new Error("Invalid entity type input for this Id generator");
  }
}

export const getAnonymousIdentifier = () =>
  uniqueNamesGenerator({
      dictionaries: [names,names],
    separator: '-',
    length: 2
  });

export const getRandomColor = () => `#${Math.floor(Math.random() * 16777215).toString(16)}`;


export const isAnEdge = (el) => {
  if (!el) return false;
  return el.id.startsWith('edge');
}

export const isANode = (el) => {
  if (!el) return false;
  return el.id.startsWith('node');
}

export const getAnnotatedPeers = (peers, me) => {
  if (peers.length < 1) return peers;
  return peers.map(peer => {
    if (peer.selfId !== me.selfId) return peer;
    return {...peer, isMe: true}
  })
}