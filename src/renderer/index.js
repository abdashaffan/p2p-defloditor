/// <reference types="hypermerge/src/types/hyperswarm" />

import '@/env'

import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import {Doc} from 'automerge';
import {DocUrl, Repo} from 'hypermerge';
import Hyperswarm from 'hyperswarm';

const swarm = Hyperswarm({queue: {multiplex: true}});
const repo = new Repo({memory: true});
repo.addSwarm(swarm, {announce: true});

const url = repo.create({
    objects: {},
    peers: {}
});
console.log(url);

ReactDOM.render(<App />, document.getElementById('app'))
