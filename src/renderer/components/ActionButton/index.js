import {Button} from "react-bootstrap";
import React from 'react';


const ActionButton = (props) => {
  // eslint-disable-next-line react/prop-types
  return ( <Button size={"sm"} variant={props.variant} onClick={() => props.handleClick()}>{props.label}</Button>);
}

export default ActionButton;