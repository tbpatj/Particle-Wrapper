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
  prtcleCnt: 8000,
  edgeInteractionType: "bounce",
  mouseClickInteractionType: "push",
} as WrapperOptions;

const images: MyImage[] = [
  { src: "/person.png" },
  { src: "/person2.png" },
  { src: "/person3.jpeg" },
  { src: "/person3.png" },
  { src: "/person4.png" },
];

const words = [
  "Hi",
  "My Name Is",
  "Timothy Luebke",
  "Software Developer,",
  "Web Developer,",
  "Web Designer",
];
const time = [1300, 1300, 2500, 2000, 2000];

const Page: React.FC = () => {
  const controllerRef = useRef<ParticleController>(initialParticleController);
  /**TODO
   * figure out something better for reszing
   * option to restrain particles to the destination, so when I'm doing quick things like an explosion I can make the particles not stick to the destination. Just basically stun them temporarily
   * create particle actions, like how I can now add a image through the controller. Make it so I can move a group up 50, or rotate a group 30 deg, or create an action to blow particles away breifly
   * create interaction creator in the particle controller. a way to add forces throughout like wind or orbits
   */
  const {
    currentWord,
    index: currentIndex,
    startWordTimer,
  } = useWordInterval({
    words,
    time,
    startOnMount: false,
  });
  const { loadedImages } = useImageLoader({ images });

  useEffect(() => {
    console.log(currentWord);
    if (controllerRef.current.ready) {
      controllerRef.current.addInputGroup(
        [
          {
            text: currentWord,
            // scaleX: 3,
            // scaleY: 3,
            align: "left",
            xPos: "5%",
            yPos: "50%",
          } as ParticleTextInput,
        ],
        currentWord,
        1000
      );
      for (let i = 0; i < words.length; i++) {
        controllerRef.current.createGroupAction(words[i], {
          yShift: -100,
        });
      }
    }
  }, [currentWord]);

  const onInitalized = () => {
    startWordTimer();
    controllerRef.current.addInputGroup(
      [{ text: currentWord, xPos: "5%", align: "left" } as ParticleTextInput],
      "Hi",
      1000
      // { teleportParticlesToDest: true }
    );
  };
  return (
    <>
      <ParticleWrapper
        controllerRef={controllerRef}
        options={particleWrapperOptions}
        onInitalized={onInitalized}
      />
      <div
        style={{ backgroundColor: "#000000", width: "50%", height: "50px" }}
      ></div>
    </>
  );
};

export default Page;
