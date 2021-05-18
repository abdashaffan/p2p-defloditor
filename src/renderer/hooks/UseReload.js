import { useState, useEffect, useRef } from 'react';
import isOnline from 'is-online';
const {getCurrentWindow} = require('electron').remote;

const CONN_CHECK_INTERVAL = 2000;

export const UseReload = () => {
    
    const [online, setOnline] = useState(true);
    const [showReloadBtn, setShowReloadBtn] = useState(false);

    const reload = () => {
      getCurrentWindow().reload();
    }

    useInterval(() => {

      (async () => {
        let isNowOnline = await isOnline();
        const isReconnected = !online && isNowOnline;
        if (isReconnected) {
            setShowReloadBtn(true);
        } else {
          setOnline(isNowOnline);
        }
        console.log('online:', isNowOnline);  
      })();

    }, CONN_CHECK_INTERVAL);

    return {showReloadBtn, reload};
}

// source: https://overreacted.io/making-setinterval-declarative-with-react-hooks/
function useInterval(callback, delay) {
    const savedCallback = useRef();
  
    // Remember the latest callback.
    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);
  
    // Set up the interval.
    useEffect(() => {
      function tick() {
        savedCallback.current();
      }
      if (delay !== null) {
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }, [delay]);
}