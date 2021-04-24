import {Button, FormControl, InputGroup} from "react-bootstrap";
import React, {useState} from "react";

const UrlInput = () => {

  const [input, setInput] = useState("");

  return (
    <InputGroup className="mt-3 mb-3">
      <FormControl
        placeholder="Join Workspace"
        aria-label="Join Workspace url input"
        aria-describedby="join-workspace-url-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <InputGroup.Append>
        <Button variant="outline-secondary" onClick={() => console.log(input)}>Join Room</Button>
      </InputGroup.Append>
    </InputGroup>
  )
}

export default UrlInput;