import {hot} from 'react-hot-loader/root'

import React from 'react'
import './index.css'
import env from "../../../common/env";
import HypermergeEditor from "./HypermergeEditor";
import YmergeEditor from "./YmergeEditor";


const module = env.module;

function Root() {

  const isHypermerge = () => module === "HYPERMERGE";

  return (
    isHypermerge() ? <HypermergeEditor /> : <YmergeEditor />
  )

}


export default hot(Root)
