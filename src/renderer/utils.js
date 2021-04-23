import { v4 as uuidv4 } from 'uuid';

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