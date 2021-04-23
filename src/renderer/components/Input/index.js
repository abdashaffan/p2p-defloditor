import {Button, FormControl, InputGroup} from "react-bootstrap";
import React, {useState} from "react";
import {useDebugger} from "../../Hooks";


const UrlInput = () => {

  const [input, setInput] = useState("");
  const stateDebug = useDebugger();
  console.log(stateDebug);

  return (
    <InputGroup className="mb-3">
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