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
  "1",
  "My Name Is",
  "Timothy Luebke",
  "1,",
  "Computer Engineer,",
  "Husband,",
];
const time = [1300, 2000, 2500, 2000, 2000];

const Page: React.FC = () => {
  const controllerRef = useRef<ParticleController>(initialParticleController);
  /**TODO
   * figure out something better for reszing
   * option to restrain particles to the destination, so when I'm doing quick things like an explosion I can make the particles not stick to the destination. Just basically stun them temporarily
   * create particle actions, like how I can now add a image through the controller. Make it so I can move a group up 50, or rotate a group 30 deg, or create an action to blow particles away breifly
   * create interaction creator in the particle controller. a way to add forces throughout like wind or orbits
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
              align: "left",
              xPos: "100",
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
              fontSize: "3vw",
              align: "left",
              xPos: "10%",
              yPos: "50%",
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
      [{ text: currentWord, xPos: "10%" } as ParticleTextInput],
      "start",
      2000,
      { teleportParticlesToDest: true }
    );
    controllerRef.current.addInputGroup(
      [{ text: currentWord, xPos: "80%" } as ParticleTextInput],
      "test",
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
