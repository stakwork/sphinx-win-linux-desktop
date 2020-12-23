import {useRef, useEffect} from 'react'

export const useInterval = (callback, delay) => {
    const savedCallback = useRef<Function>();
  
    useEffect(
      () => {
        savedCallback.current = callback;
      },
      [callback]
    );
  
    useEffect(
      () => {
        const handler = (...args) => savedCallback.current(...args);
  
        if (delay !== null) {
          const id = setInterval(handler, delay);
          return () => clearInterval(id);
        }
      },
      [delay]
    );
  };