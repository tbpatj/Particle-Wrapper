import { useEffect, useRef, useState } from "react";

export interface UseWordIntervalProps {
  words: string[];
  time: number[] | number;
  startOnMount?: boolean;
}

export interface UseWordInterval {
  currentWord: string;
  destroyTimeout: () => void;
  startWordTimer: () => void;
}

const useWordInterval: (props: UseWordIntervalProps) => UseWordInterval = ({
  words,
  time,
  startOnMount,
}) => {
  const timerRef = useRef<NodeJS.Timeout>();
  const [index, setIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState(words[0]);

  //create a timeout function based on the time/s provided
  const createTimeout = () => {
    const timeoutTime = typeof time === "number" ? time : time[index];
    timerRef.current = setTimeout(() => {
      setIndex((indx) => {
        if (indx >= words.length - 1) return 0;
        return indx + 1;
      });
    }, timeoutTime);
  };

  const startWordTimer = () => {
    setCurrentWord(words[index]);
    createTimeout();
  };

  const destroyTimeout = () => {
    clearTimeout(timerRef.current);
    timerRef.current = undefined;
  };

  //when ever the index changes create a new timer and set the new current word to the index
  useEffect(() => {
    setCurrentWord(words[index]);
    createTimeout();
  }, [index]);

  //when words or time is changed, just destroy the current timeout and set the index back to 0 so we start again from the beginning
  useEffect(() => {
    destroyTimeout();
  }, [words, time]);

  //clean up the timeout function so there aren't multiple
  useEffect(() => {
    if (startOnMount) startWordTimer();
    return () => destroyTimeout();
  }, []);

  return { currentWord, destroyTimeout, startWordTimer };
};

export default useWordInterval;
