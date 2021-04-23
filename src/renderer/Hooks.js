import React, {createContext, useContext} from "react";
import {useStoreState} from "react-flow-renderer";


export const HypermergeContext = createContext({swarm: null, repo: null, url: null});


export const ShapeContext = createContext(null);

export const useHypermergeHandler = () => {
  let {url} = useContext(HypermergeContext);
  const setUrl = (urlInput) => {
    // TODO: input validation to prevent invalid string input
    url = urlInput;
  }
  const getUrl = () => url;
  return {setUrl, getUrl};
}

export const useDebugger = () => {
  const state = useStoreState(state => state);
  return state;
}