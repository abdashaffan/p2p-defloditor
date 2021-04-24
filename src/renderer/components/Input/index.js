import {Button, FormControl, InputGroup} from "react-bootstrap";
import React, {useEffect, useState} from "react";

// eslint-disable-next-line react/prop-types
const UrlInput = ({handleUrlUpdate, validateUrl}) => {

  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  const onUrlSubmit = () => {
    console.log(`validate: ${validateUrl(input)}`);
    if (validateUrl(input)) {
      setError(false);
      handleUrlUpdate(input);
      return;
    }
    setError(true);
  }

  const onInputChange = (e) => {
      setInput(e.target.value);
  }

  useEffect(() => {
    console.log(`input: ${input}`);
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
        <Button variant={error? 'danger' : 'success'} onClick={onUrlSubmit}>Join Room</Button>
      </InputGroup.Append>
    </InputGroup>
  )
}

export default UrlInput;