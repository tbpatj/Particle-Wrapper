import { useEffect, useMemo, useState } from "react";
import "./App.css";
import {
  ParticleInput,
  ParticleTextInput,
  WrapperOptions,
} from "./ParticleWrapper/types/types";
import useImageLoader, {
  MyImage,
} from "./ParticleWrapper/hooks/useImageLoader";
import useWordInterval from "./ParticleWrapper/hooks/useWordInterval";
import ParticleWrapper from "./ParticleWrapper/components/ParticleWrapper";

const particleWrapperOptions = {
  useOptimizedSmallParticles: true,
  mapParticlesToClosestPoint: false,
  prtcleCnt: 5000,
  edgeInteractionType: "bounce",
} as WrapperOptions;
/**TODO
 * finish up the ability to change colors on a text even maybe gradients
 * finish up other attributes to add to a image before it scans it
 * option to restrain particles to the destination, so when I'm doing quick things like an explosion I can make the particles not stick to the destination. Just basically stun them temporarily
 */
function App() {
  return (
    <div className="App">
      <ParticleWrapper options={particleWrapperOptions} />
      {/* <input onChange={(e) => handleChange(e.target.value)} value={input} /> */}
    </div>
  );
}

export default App;
