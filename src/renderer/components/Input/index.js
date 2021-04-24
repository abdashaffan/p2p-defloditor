import {Button, FormControl, InputGroup} from "react-bootstrap";
import React, {useEffect, useState} from "react";

// eslint-disable-next-line react/prop-types
const UrlInput = ({handleUrlUpdate, validateUrl}) => {

  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  const onUrlSubmit = () => {
    console.log(`validate: ${validateUrl(input)}`);
    if (!error) {
      handleUrlUpdate(input);
      setInput("");
      return;
    }
    setError(true);
  }

  const onInputChange = (e) => {
      setInput(e.target.value);
  }

  useEffect(() => {
    setError(!validateUrl(input));
  });

  return (
    <InputGroup className="mt-3 mb-3" >
      <FormControl
        placeholder="Join Workspace"
        aria-label="Join Workspace url input"
        aria-describedby="join-workspace-url-input"
        value={input}
        onChange={onInputChange}
        isValid={!error}
      />
      <InputGroup.Append>
        <Button
          variant={error? 'outline-secondary' : 'success'}
          onClick={onUrlSubmit}
          disabled={error}>
          Join Room
        </Button>
      </InputGroup.Append>
    </InputGroup>
  )
}

export default UrlInput;