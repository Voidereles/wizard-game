import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { SpotLightHelper } from "three";
import { useHelper } from "@react-three/drei";

export default function Lights() {
  const light = useRef();
  useHelper(light, SpotLightHelper, "cyan");
  const warmLightColor = "#FFD2AD";

  useFrame((state) => {
    light.current.position.z = state.camera.position.z;
    light.current.target.position.z = state.camera.position.z - 5;
    light.current.target.updateMatrixWorld(); // without it, target of the light source will still be on same point, not being updated
  });

  // const { position } = useControls({
  //   position: {
  //     value: { x: 0, y: 5, z: 1 },
  //     step: 0.5,
  //   },
  // });
  // const positionP = useControls({
  //   position: {
  //     value: { x: 0, y: 2.66, z: 0 },
  //     step: 0.05,
  //   },
  //   scale: {
  //     value: { x: 0.5, y: 0.35, z: 0.6 },
  //     step: 0.05,
  //   },
  // });

  return (
    <>
      <spotLight
        ref={light}
        castShadow
        // position={[position.x, position.y, position.z]}
        // for
        // useControls
        // helper
        position={[0, 3, 4.5]}
        intensity={200.5}
        color={warmLightColor}
        decay={1.6}
        angle={Math.PI / 3.7}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-camera-top={40}
        shadow-camera-right={40}
        shadow-camera-bottom={-40}
        shadow-camera-left={-40}
      />
      <ambientLight intensity={1} />
    </>
  );
}
