import React, {createContext, useContext} from "react";


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

export const useShape = () => {
  const canvasEntities = useContext(ShapeContext);
  const getEntities = () => canvasEntities;
  return {getEntities};
}