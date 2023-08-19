import { useEffect, useRef } from "react";
import ParticleWrapper from "./ParticleWrapper/components/ParticleWrapper";
import {
  ParticleController,
  ParticleImageInput,
  ParticleTextInput,
  WrapperOptions,
  initialParticleController,
} from "./ParticleWrapper/types/types";
import useWordInterval from "./ParticleWrapper/hooks/useWordInterval";
import useImageLoader, {
  MyImage,
} from "./ParticleWrapper/hooks/useImageLoader";

const particleWrapperOptions = {
  useOptimizedSmallParticles: true,
  mapParticlesToClosestPoint: false,
  prtcleCnt: 5000,
  edgeInteractionType: "bounce",
} as WrapperOptions;

const images: MyImage[] = [
  { src: "/person.png" },
  { src: "/person2.png" },
  { src: "/person3.jpeg" },
  { src: "/person3.png" },
  { src: "/person4.png" },
];

const words = ["Hi", "My Name Is", "Timothy Luebke", "Developer", "4"];
const time = [2000, 2000, 2500, 4000, 4000];

const Page: React.FC = () => {
  const controllerRef = useRef<ParticleController>(initialParticleController);
  /**TODO
   * finish up the ability to change colors on a text even maybe gradients
   * finish up other attributes to add to a image before it scans it
   * option to restrain particles to the destination, so when I'm doing quick things like an explosion I can make the particles not stick to the destination. Just basically stun them temporarily
   */
  const { currentWord, startWordTimer } = useWordInterval({
    words,
    time,
    startOnMount: false,
  });
  const { loadedImages } = useImageLoader({ images });

  useEffect(() => {
    console.log(currentWord);
    if (controllerRef.current.ready) {
      const indx = parseInt(currentWord);
      if (indx < loadedImages.length && !isNaN(indx)) {
        controllerRef.current.addInputGroup(
          [
            {
              image: loadedImages[indx].image,
              scaleX: 3,
              scaleY: 3,
              xPos: -500,
            } as ParticleImageInput,
          ],
          "start",
          2000
        );
      } else {
        controllerRef.current.addInputGroup(
          [
            {
              text: currentWord,
              // scaleX: 3,
              // scaleY: 3,
              font: "Inter",
              xPos: -500,
            } as ParticleTextInput,
          ],
          "start",
          2000
        );
      }
    }
  }, [currentWord]);

  const onInitalized = () => {
    startWordTimer();
    controllerRef.current.addInputGroup(
      [{ text: currentWord, xPos: -500 } as ParticleTextInput],
      "start",
      2000,
      { teleportParticlesToDest: true }
    );
  };
  return (
    <>
      <ParticleWrapper
        controllerRef={controllerRef}
        options={particleWrapperOptions}
        onInitalized={onInitalized}
      />
    </>
  );
};

export default Page;
