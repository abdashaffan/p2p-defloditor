import Hyperswarm from "hyperswarm";
import env from "../common/env";
import {Repo} from "hypermerge";

export const starterElements = [
  {
    id: '1',
    type: 'input', // input node
    data: {label: 'Welcome to defloditor'},
    position: {x: 250, y: 25},
    style: {borderColor: 'green'}
  },
  // default node
  {
    id: '2',
    data: {label: 'A P2P flowchart editor'},
    position: {x: 100, y: 125},
  }
];

export const initHypermerge = () => {
  const swarm = Hyperswarm({queue: {multiplex: true}});
  let repo;
  if (env.isDevelopment) {
    // Use persistence in production
    repo = new Repo({path: env.HYPERMERGE_PATH});
  } else {
    // Do not save the document in local
    repo = new Repo({memory: true});
  }
  repo.addSwarm(swarm, {announce: true});
  return {swarm,repo};
}