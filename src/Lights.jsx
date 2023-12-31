import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function Lights() {
  const light = useRef();

  useFrame((state) => {
    light.current.position.z = state.camera.position.z + 1;
    light.current.target.position.z = state.camera.position.z;
    light.current.target.updateMatrixWorld(); // without it, target of the light source will still be on same point, not being updated
  });

  return (
    <>
      <directionalLight
        ref={light}
        castShadow
        position={[4, 4, 1]}
        intensity={4.5}
        color={0xff7700}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-camera-top={40}
        shadow-camera-right={40}
        shadow-camera-bottom={-40}
        shadow-camera-left={-40}
      />
      <ambientLight intensity={1.5} />
    </>
  );
}
