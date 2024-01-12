import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
// import { useControls } from "leva";
import { SpotLightHelper } from "three";
import { useHelper } from "@react-three/drei";

export default function Lights() {
  const light = useRef();
  useHelper(light, SpotLightHelper, "cyan");
  const warmLightColor = "#FFCCAA";

  useFrame((state) => {
    light.current.position.z = state.camera.position.z + 1;
    light.current.target.position.z = state.camera.position.z - 10;
    light.current.target.updateMatrixWorld(); // without it, target of the light source will still be on same point, not being updated
  });

  return (
    <>
      <spotLight
        ref={light}
        castShadow
        position={[0, 4.5, 5.5]}
        intensity={385.5}
        color={warmLightColor}
        penumbra={0.1}
        decay={1.8}
        angle={Math.PI / 3.5}
        shadow-mapSize={[1024, 1024]}
        shadow-focus={0.5}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-camera-top={40}
        shadow-camera-right={40}
        shadow-camera-bottom={-40}
        shadow-camera-left={-40}
      />
      <ambientLight color={0xffd2ad} intensity={1} />
    </>
  );
}

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
