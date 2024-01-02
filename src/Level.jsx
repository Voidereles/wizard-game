import * as THREE from "three";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useMemo, useState, useRef, Suspense } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import { useControls } from "leva";

THREE.ColorManagement.legacyMode = false;

const boxGeometry = new THREE.BoxGeometry(1, 1, 1);

const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
const tilesMaterial = new THREE.MeshStandardMaterial({ color: 0x151515 });
const obstacleMaterial = new THREE.MeshStandardMaterial({ color: "orangered" });
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });

export function Bounds({ length = 1 }) {
  const [wallTexture, displacementMap, normalMap, ambientOcclusionMap] = useTexture([
    "./materials/walls.jpg",
    "./materials/walls-displacement.png",
    "./materials/walls-normal.png",
    "./materials/walls-ambientOcclusion.png",
  ]);

  // Adjust texture wrapping for all maps
  wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
  displacementMap.wrapS = displacementMap.wrapT = THREE.RepeatWrapping;
  normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
  ambientOcclusionMap.wrapS = ambientOcclusionMap.wrapT = THREE.RepeatWrapping;

  // Set texture repeat for all maps
  const repeatX = 170;
  const repeatY = 2.5;
  wallTexture.repeat.set(repeatX, repeatY);
  displacementMap.repeat.set(repeatX, repeatY);
  normalMap.repeat.set(repeatX, repeatY);
  ambientOcclusionMap.repeat.set(repeatX, repeatY);

  const wallsMaterial = new THREE.MeshStandardMaterial({
    map: wallTexture,
    aoMap: ambientOcclusionMap,
    displacementMap: displacementMap,
    displacementScale: 0,
    color: "rgb(100, 100, 100)",
    // normalMap: normalMap,
  });

  for (let i = 0; i < length; i++) {
    <group>
      <RigidBody position={[0, 0, i * 4]} restitution={0.2} friction={0}>
        <mesh geometry={boxGeometry} material={wallMaterial} scale={[1.3, 4, 4]} receiveShadow></mesh>
      </RigidBody>
    </group>;
  }
  return (
    <>
      {
        <RigidBody type="fixed" restitution={0.2} friction={0}>
          <mesh
            position={[2.15, 0.55, -(length * 2) + 2]}
            geometry={boxGeometry}
            material={wallsMaterial}
            scale={[0.3, 4, 4 * length]}
            castShadow
          ></mesh>

          <mesh
            position={[-2.15, 0.55, -(length * 2) + 2]}
            geometry={boxGeometry}
            material={wallsMaterial}
            scale={[0.3, 4, 4 * length]}
            receiveShadow
          ></mesh>

          <mesh
            position={[0, 0.55, -(length * 3.45) - 2]}
            geometry={boxGeometry}
            material={wallsMaterial}
            scale={[4.6, 1.5, 0.3]}
            receiveShadow
          ></mesh>
          <CuboidCollider args={[2, 0.1, 2 * length]} position={[0, -0.1, -(length * 2) + 2]} />
        </RigidBody>
      }
    </>
  );
}

export function BlockStart({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      <mesh
        geometry={boxGeometry}
        material={obstacleMaterial}
        position={[0, -0.1, 0]}
        scale={[4, 0.2, 4]}
        receiveShadow
      />
    </group>
  );
}

export function TileGroup({ position = [0, 0, 0] }) {
  const amountOfTiles = useMemo(() => Math.floor(Math.random() * (8 - 4 + 1)) + 4, []);

  const tileSize = 0.5;
  const yBase = 0.12;
  const yOffset = 0.001;
  const grid = new Set();

  function getRandomNonOverlappingPosition(_, index) {
    let x, z;
    do {
      x = Math.floor((Math.random() * amountOfTiles - amountOfTiles / 2) * tileSize);
      z = Math.floor((Math.random() * amountOfTiles - amountOfTiles / 2) * tileSize);
    } while (grid.has(`${x},${z}`));

    grid.add(`${x},${z}`);
    const y = yOffset * index - yBase;

    return [x, y, z];
  }

  return (
    <group position={position}>
      {Array(amountOfTiles)
        .fill()
        .map(getRandomNonOverlappingPosition)
        .map((position, index) => (
          <mesh
            key={index}
            position={position}
            rotation={[(Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1]}
            receiveShadow
            geometry={boxGeometry}
            material={wallMaterial}
            scale={[0.9, 0.3, 0.9]}
          />
        ))}
    </group>
  );
}

export function BlockSpinner({ position = [0, 0, 0] }) {
  const obstacle = useRef();
  const [speed] = useState(() => (Math.random() + 0.3) * (Math.random() < 0.5 ? -1 : 1)); // if the component will get rerendered, the speed will stay the same

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    const rotation = new THREE.Quaternion();
    rotation.setFromEuler(new THREE.Euler(0, time * speed, 0));
    obstacle.current.setNextKinematicRotation(rotation);
  });
  return (
    <group position={position}>
      <mesh geometry={boxGeometry} material={floorMaterial} position={[0, -0.1, 0]} scale={[4, 0.2, 4]} receiveShadow />
      <RigidBody ref={obstacle} type="kinematicPosition" position={[0, 0.3, 0]} restitution={0.2} friction={0}>
        <mesh geometry={boxGeometry} material={obstacleMaterial} scale={[3.5, 0.3, 0.3]} castShadow receiveShadow />
      </RigidBody>
    </group>
  );
}

export function BlockLimbo({ position = [0, 0, 0] }) {
  const obstacle = useRef();
  const [timeOffset] = useState(() => Math.random() * 2 * Math.PI); // 2 Math Pi is full 360

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    const y = Math.sin(time + timeOffset) + 1.15;

    obstacle.current.setNextKinematicTranslation({ x: position[0], y: position[1] + y, z: position[2] });
  });

  return (
    <group position={position}>
      <mesh geometry={boxGeometry} material={floorMaterial} position={[0, -0.1, 0]} scale={[4, 0.2, 4]} receiveShadow />
      <RigidBody ref={obstacle} type="kinematicPosition" position={[0, 2, 0]} restitution={0.2} friction={0}>
        <mesh geometry={boxGeometry} material={obstacleMaterial} scale={[3.5, 0.3, 0.3]} castShadow receiveShadow />
      </RigidBody>
    </group>
  );
}

export function BlockAxe({ position = [0, 0, 0] }) {
  const obstacle = useRef();
  const [timeOffset] = useState(() => Math.random() * 2 * Math.PI); // 2 Math Pi is full 360

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    const x = Math.sin(time + timeOffset) * 1.25;

    obstacle.current.setNextKinematicTranslation({ x: position[0] + x, y: position[1] + 0.75, z: position[2] });
  });

  return (
    <group position={position}>
      <mesh geometry={boxGeometry} material={floorMaterial} position={[0, -0.1, 0]} scale={[4, 0.2, 4]} receiveShadow />
      <RigidBody ref={obstacle} type="kinematicPosition" position={[0, 2, 0]}>
        <mesh geometry={boxGeometry} material={obstacleMaterial} scale={[1.5, 1.5, 0.3]} castShadow receiveShadow />
      </RigidBody>
    </group>
  );
}

export function BlockEnd({ position = [0, 0, 0] }) {
  const hamburger = useGLTF("./hamburger.glb");
  hamburger.scene.children.forEach((mesh) => {
    mesh.castShadow = true;
  });

  return (
    <group position={position}>
      <mesh geometry={boxGeometry} material={floorMaterial} position={[0, 0, 0]} scale={[4, 0.2, 4]} receiveShadow />
      <RigidBody type="fixed" colliders="hull" position={[0, 0.25, 0]} restitution={0.2} friction={0}>
        <primitive object={hamburger.scene} scale={0.2} />
      </RigidBody>
    </group>
  );
}

export function Level({ count = 100, types = [BlockSpinner, BlockAxe, BlockLimbo] }) {
  const blocks = useMemo(() => {
    const blocks = [];

    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      blocks.push(type);
    }
    return blocks;
  }, [count, types]);

  return (
    <>
      <Suspense fallback={null}>
        <BlockStart position={[0, 0, 0]} />
        <TileGroup position={[0, 0, 0]} />
        {blocks.map((Block, index) => (
          <group key={index}>
            <Block position={[0, 0, -(index + 1) * 4]} />
            <TileGroup position={[0, 0, -(index + 1) * 4]} />
          </group>
        ))}

        <BlockEnd position={[0, 0, -(count + 1) * 4]} />

        <Bounds length={count + 2} />
      </Suspense>
    </>
  );
}

// grup tyle, ile przeszkód
// grupa  - w grupie do 8 kafelek
//
