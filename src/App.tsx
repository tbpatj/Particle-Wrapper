import React, { createRef, useEffect, useRef, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import ParticleWrapper from "./components/ParticleWrapper";
const words = ["These apples", "come from", "down south", "you big", "bozo"];
//TODO Create particle wrapper objects that get passed in, each object has the info you want to display
//the rotation, how many particles are dedicated to that image, the size, the position, and any color changing properties
function App() {
  const [input, setInput] = useState("");
  const [image, setImage] = useState<HTMLImageElement | undefined>();
  const [item, setItem] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();
  const test = () => {
    timerRef.current = setTimeout(() => {
      setItem((item) => {
        if (item > words.length) return 0;
        return item + 1;
      });
    }, 2000);
  };
  useEffect(() => {
    setInput(words[item]);
    test();
  }, [item]);

  async function loadImage(url: string, elem: HTMLImageElement) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      elem.crossOrigin = "Anonymous";
      elem.onload = () => resolve(elem);
      elem.onerror = reject;
      elem.src = url;
    });
  }

  const getTroll = async () => {
    let trollimg = new Image();
    trollimg = await loadImage("/color.webp", trollimg); //set the link
    console.log(trollimg.width);
    console.log(typeof trollimg);
    setImage(trollimg);
    // setInput(trollimg);
  };

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    getTroll();
  }, []);

  const handleChange = (val: string) => {
    setInput(val);
    clearTimeout(timerRef.current);
  };

  return (
    <div className="App">
      <ParticleWrapper input={input === "" ? (image ? image : undefined) : input} />
      <input onChange={(e) => handleChange(e.target.value)} value={input} />
    </div>
  );
}

export default App;
