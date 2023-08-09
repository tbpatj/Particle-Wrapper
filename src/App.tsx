import React, { createRef, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import ParticleWrapper from "./components/ParticleWrapper";
import useImageLoader, { MyImage } from "./hooks/useImageLoader";
import useWordInterval from "./hooks/useWordInterval";
import { ParticleInputObject } from "./types/ParticleWrapper/types";
const words = ["These apples", "come from", "down south", "you big", "bozo"];
const images: MyImage[] = [
  { src: "/color.webp", name: "color" },
  { src: "/person.png", name: "person" },
  { src: "/instagram.png", name: "instagram" },
  { src: "/globe.png", name: "globe" },
  { src: "/horse.webp", name: "horse" },
  { src: "/troll.png", name: "troll" },
  { src: "/splash.webp", name: "splash" },
  { src: "/arrow.png", name: "arrow" },
  { src: "/person2.png", name: "arrow" },
  { src: "/person3.png", name: "arrow" },
];
//TODO Create particle wrapper objects that get passed in, each object has the info you want to display
//the rotation, how many particles are dedicated to that image, the size, the position, and any color changing properties
function App() {
  const [input, setInput] = useState("asdf");
  const [xOffset, setXOffset] = useState("0");
  const { loadedImages } = useImageLoader({ images });
  const { currentWord, destroyTimeout } = useWordInterval({
    words: words,
    time: 2000,
    startOnMount: true,
  });

  const handleChange = (val: string) => {
    setInput(val);
    destroyTimeout();
  };

  const getCurInput = useMemo(() => {
    const parsedIndex = parseInt(input);
    if (
      !isNaN(parsedIndex) &&
      loadedImages.length > 0 &&
      parsedIndex < loadedImages.length
    ) {
      return {
        input: {
          image: loadedImages?.[parsedIndex].image,
          scaleX: 0.5,
          scaleY: 0.5,
        },
      } as ParticleInputObject;
    } else {
      return {
        input: { text: input, fontSize: 100 },
        options: { xOffset: parseFloat(xOffset) },
      } as ParticleInputObject;
    }
  }, [input]);

  useEffect(() => {
    console.log(currentWord);
    setInput(currentWord);
  }, [currentWord]);

  return (
    <div className="App">
      <ParticleWrapper input={getCurInput} />
      <input onChange={(e) => handleChange(e.target.value)} value={input} />
      <input
        type="number"
        onChange={(e) => setXOffset(e.target.value)}
        value={xOffset}
      />
    </div>
  );
}

export default App;
