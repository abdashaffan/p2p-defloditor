import React, {useState} from "react";
import {starterElements} from "./starter";
import { v4 as uuidv4 } from 'uuid';


export const useEntityManager = () => {
  const [elements,setElements] = useState(starterElements);
  const addNewShape = () => {
    const newNode = {
      id: `node:${uuidv4()}`,
      position: {x: 250, y: 250},
      data: {label: 'New Node'}
    }
    setElements((elements) => elements.concat(newNode));
  }
  return {elements,addNewShape};
}
