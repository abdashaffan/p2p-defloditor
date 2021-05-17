/* eslint-disable react/prop-types */
import React from 'react';
import {Button, Modal} from "react-bootstrap";


const ReloadBackdrop = (props) => {
  return (
    <Modal
      show={props.show}
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton={false}>
        <Modal.Title>Reload</Modal.Title>
      </Modal.Header>
      <Modal.Body>
       New connection has been detected. Please reload the app to sync your changes.
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={props.handleClick}>
          Reload App
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ReloadBackdrop;