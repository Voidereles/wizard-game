import "./style.css";
import ReactDOM from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import Experience from "./Experience.jsx";
import { KeyboardControls } from "@react-three/drei";
import { StrictMode } from "react";
import { PCFSoftShadowMap, VSMShadowMap } from "three";
import { EcctrlJoystick } from "ecctrl";

const root = ReactDOM.createRoot(document.querySelector("#root"));

root.render(
  // <StrictMode>
  
  <>
    {/* // <StrictMode> */}
    <EcctrlJoystick buttonNumber={5} />
    <Canvas
      shadows
    >
      <Experience />
    </Canvas>
  </>
  // </StrictMode>
);
