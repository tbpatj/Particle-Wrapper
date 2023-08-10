import { useEffect, useMemo, useState } from "react";
import "./App.css";
import {
  ParticleInput,
  ParticleInputObject,
  ParticleTextInput,
  WrapperOptions,
} from "./ParticleWrapper/types/types";
import useImageLoader, {
  MyImage,
} from "./ParticleWrapper/hooks/useImageLoader";
import useWordInterval from "./ParticleWrapper/hooks/useWordInterval";
import ParticleWrapper from "./ParticleWrapper/components/ParticleWrapper";
const words = ["Timothy Luebke", "Dev", "follow me", "on my", "8", "@luebketj"];
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

const particleWrapperOptions = {
  useOptimizedSmallParticles: false,
  mapParticlesToClosestPoint: false,
  prtcleCnt: 1000,
} as WrapperOptions;
/**TODO
 * add in mouse pointer interaction (maybe make it so when the particles are touched they have a stunned state where they don't return back home until a certain time)
 * finish up the ability to change colors on a text even maybe gradients
 * finish up other attributes to add to a image before it scans it
 * option to restrain particles to the destination, so when I'm doing quick things like an explosion I can make the particles not stick to the destination. Just basically stun them temporarily
 */
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
        inputs: [
          {
            image: loadedImages?.[parsedIndex].image,
            scaleX: 0.5,
            scaleY: 0.5,
          },
        ],
        options: particleWrapperOptions,
      } as ParticleInputObject;
    } else {
      return {
        inputs: [{ text: input, fontSize: "100" }],
        options: particleWrapperOptions,
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
