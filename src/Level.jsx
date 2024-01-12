import * as THREE from "three";
import { CuboidCollider, InstancedRigidBodies, RigidBody } from "@react-three/rapier";
import { useMemo, useState, useRef, useEffect, Suspense } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import { useControls } from "leva";
import { ExtrudeGeometry } from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";

THREE.ColorManagement.legacyMode = false;
THREE.ColorManagement.enabled = true;

const planeGeometry = new THREE.PlaneGeometry(3, 2);
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const cylinderGeometry5 = new THREE.CylinderGeometry(5, 5, 1, 5, 1);
const cylinderGeometry7 = new THREE.CylinderGeometry(5, 5, 1, 7, 1);
const coneGeometry = new THREE.ConeGeometry(2, 15, 3, 1);

const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x282222 });
const tilesMaterial = new THREE.MeshStandardMaterial({ color: 0x151515 });
const obstacleMaterial = new THREE.MeshStandardMaterial({ color: "orangered" });
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x333339 });
const wallTilesMaterial = new THREE.MeshStandardMaterial({ color: 0x393939 });

const shinyMetalMaterial = new THREE.MeshStandardMaterial({ color: 0x989da0, metalness: 1, roughness: 0.5 });

const blackMetalMaterial = new THREE.MeshStandardMaterial({ color: 0x191f22 });
const woodMaterial = new THREE.MeshStandardMaterial({ color: 0xa1662f, metalness: 0.4, roughness: 0.95 });
const darkWoodMaterial = new THREE.MeshStandardMaterial({ color: 0x502900 });

const firePlaceMaterial = new THREE.MeshStandardMaterial({ color: 0x270a08 });

const textureLoader = new THREE.TextureLoader();
const simpleShadow = textureLoader.load("./simpleShadow2.jpg");

const fireShadowMaterial = new THREE.MeshBasicMaterial({
  color: 0xff8833,
  transparent: true,
  alphaMap: simpleShadow,
  side: THREE.DoubleSide,
});

const degrees45 = Math.PI / 4;
const degrees60 = Math.PI / 3;
const degrees90 = Math.PI / 2;
const degrees180 = Math.PI;

function getRandomSign() {
  return Math.random() < 0.5 ? 1 : -1;
}

export function Bounds({ length = 1 }) {
  const mergedGeometry = BufferGeometryUtils.mergeGeometries([
    new THREE.BoxGeometry(0.3, 3.2 + 3, 4 * length).translate(-2.15, 2.9, -(length * 2) + 2),
    new THREE.BoxGeometry(0.3, 6.2, 4 * length).translate(2.15, 2.9, -(length * 2) + 2),
    new THREE.BoxGeometry(0.3, 0.2, 4 * length).translate(-2, 0.13, -(length * 2) + 2),
    new THREE.BoxGeometry(0.3, 0.2, 4 * length).translate(2, 0.13, -(length * 2) + 2),
    new THREE.BoxGeometry(4, 0.2, 4 * length).translate(0, 6.05, -(length * 2) + 3),
  ]);

  return (
    <>
      {
        <RigidBody type="fixed" colliders="trimesh" restitution={0.2} friction={0}>
          {/* floor */}
          <mesh
            geometry={boxGeometry}
            material={floorMaterial}
            position={[0, -0.09, -(length * 2) + 2]}
            scale={[4, 0.2, 4 * length]}
            receiveShadow
          />
          <mesh geometry={mergedGeometry} material={wallMaterial} receiveShadow castShadow></mesh>;{/* wall left */}
        </RigidBody>
      }
    </>
  );
}

const generateRandomRotation = () => [
  (Math.random() - 0.5) * 0.05,
  (Math.random() - 0.5) * 0.15,
  (Math.random() - 0.5) * 0.15,
];
const FlameBox = ({ position, delay }) => {
  const materialColor = useMemo(() => [Math.random() + 0.8, Math.random() * 0.3, 0], []);
  const [scale, setScale] = useState([1, 1, 1]);
  const [currentPosition, setCurrentPosition] = useState(position);

  useFrame(() => {
    setScale((prevScale) => [
      prevScale[0] * 0.95, // Increase the scale factor for faster shrinking
      prevScale[1] * 0.95,
      prevScale[2] * 0.95,
    ]);

    // Move upward while getting smaller
    setCurrentPosition((prevPosition) => [
      prevPosition[0] * 0.97,
      prevPosition[1] + 0.006, // Adjust the speed of upward movement
      prevPosition[2] * 0.97,
    ]);

    // If the flame box is too small, reset the scale and position
    if (scale[0] < 0.05) {
      setScale([0.4, 0.4, 0.4]);
      setCurrentPosition(position);
    }
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setScale([0.4, 0.4, 0.4]);
      setCurrentPosition(position);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [delay, position]);

  return (
    <group>
      <mesh position={currentPosition} scale={scale}>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshStandardMaterial color={materialColor} transparent opacity={1} />
      </mesh>
    </group>
  );
};

export function FloorTiles({ position = [0, 0, 0] }) {
  const maximumAmount = 36 * 2;
  const minimumAmount = 20 * 2;
  const amountOfTiles = useMemo(() => Math.floor(Math.random() * (2 - 2 + 1)) + 2, []);

  const tileSize = 0.6;
  const yBase = 0.15;
  const yOffset = 0.001;
  const grid = new Set();

  return (
    <group position={position}>
      {Array(amountOfTiles)
        .fill()
        .map((_, index) => {
          const positionBox = getRandomNonOverlappingPosition(_, index, "box");
          const positionCylinder = getRandomNonOverlappingPosition(_, index, "cylinder");

          return (
            <group key={`tileGroup-${index}`}>
              <mesh
                key={`box-${index}`}
                position={positionBox}
                rotation={[(Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.2]}
                castShadow
                geometry={boxGeometry}
                material={wallMaterial}
                scale={[0.9, 0.3, 1.1]}
              />
              <mesh
                key={`cylinder-${index}`}
                position={positionCylinder}
                rotation={[(Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.2]}
                castShadow
                geometry={Math.random() > 0.5 ? cylinderGeometry5 : cylinderGeometry7}
                material={wallMaterial}
                scale={[0.1, 0.1, 0.1]}
              />
            </group>
          );
        })}
    </group>
  );
}

export function TorchesGroup({ position = [-1.5, 1, 2], rotation }) {
  const { nodes } = useGLTF("/torch.glb");

  const isRightTorch = rotation[1] === degrees180;
  const rightBloomRotationY = degrees60 * 2;
  const leftBloomRotationY = degrees60;

  const angledBloomRotation = [0, isRightTorch ? rightBloomRotationY : leftBloomRotationY, 0];
  const angledBloomPosition = [0.05, 1.65, isRightTorch ? -0.5 : 0.5];

  const wallBloomPosition = [-0.3, 1.6, -0.5];

  return (
    <group position={position} dispose={null}>
      <group scale={[0.6, 0.6, 0.6]} rotation={rotation}>
        <RigidBody type="fixed" colliders="hull" restitution={0.2} friction={0}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.WoodPart.geometry}
            material={darkWoodMaterial}
            position={[-0.002, 0.73, 0.001]}
          />
        </RigidBody>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.MetalPart.geometry}
          material={blackMetalMaterial}
          position={[-0.039, 0.817, 0]}
        />
        <mesh
          geometry={planeGeometry}
          material={fireShadowMaterial}
          position={wallBloomPosition}
          rotation={[0, degrees90, 0]}
          scale={[1, 1, 1.5]}
        />
        <mesh geometry={nodes.FirePlace.geometry} material={firePlaceMaterial} position={[0, 1.187, 0]} />

        <mesh
          geometry={planeGeometry}
          material={fireShadowMaterial}
          position={angledBloomPosition}
          scale={[0.5, 1.5, 0.5]}
          rotation={angledBloomRotation}
        />
      </group>
      <group position={[0, 0.67, 0]}>
        {Array.from({ length: 12 }).map((_, index) => (
          <FlameBox
            key={index}
            position={[(Math.random() - 0.5) * 0.2, 0.1, (Math.random() - 0.5) * 0.2]}
            delay={Math.random() * 15000} // Adjust the delay as needed
          />
        ))}
      </group>
    </group>
  );
}

useGLTF.preload("/torch.glb");
useGLTF.preload("/pillar-doubled2.glb");

export function InstancedPillarGroup({ positionZ = 0, count }) {
  const { nodes } = useGLTF("/pillar-doubled2.glb");
  const pillarPairsAmount = count / 2;

  const pillarInstances = useMemo(() => {
    const instances = [];

    for (let i = 0; i < pillarPairsAmount; i++) {
      instances.push({
        key: "pillar-instance-left_" + i,
        position: [-1.8, 2.6, -(i + 1) * 2 * 4 + 6],
        rotation: [0, 0, 0],
        scale: [0.25, 0.14, 0.25],
      });

      instances.push({
        key: "pillar-instance-right_" + i,
        position: [1.8, 2.6, -(i + 1) * 2 * 4 + 6],
        rotation: [0, degrees180, 0],
        scale: [0.25, 0.14, 0.25],
      });
    }

    return instances;
  }, []);

  const pillarGeometry = [];
  pillarGeometry.push(nodes.pillar.geometry, nodes.middleBox.geometry, nodes.bottomBox.geometry);

  const mergedPillarsGeometry = BufferGeometryUtils.mergeGeometries(pillarGeometry);

  return (
    <InstancedRigidBodies type="fixed" colliders="trimesh" instances={pillarInstances}>
      <instancedMesh
        castShadow
        receiveShadow
        args={[mergedPillarsGeometry, wallTilesMaterial, pillarPairsAmount]}
      ></instancedMesh>
    </InstancedRigidBodies>
  );
}

export function WallTiles({ position = [0, 0, 0], count }) {
  const tileRef = useRef();
  console.log(count);

  const maximumAmount = 64 * count;
  const minimumAmount = 32 * count;
  const amountOfTiles = useMemo(
    () => Math.floor(Math.random() * (maximumAmount - minimumAmount + 1)) + minimumAmount,
    []
  );

  const tileGeometry = new THREE.BoxGeometry(0.1, 0.25, 0.5);
  const tileMesh = new THREE.InstancedMesh(tileGeometry, wallTilesMaterial, amountOfTiles);
  tileRef.current = tileMesh;

  const dummy = new THREE.Object3D();

  const heightPositionOfTilesGroup = 1.4;
  const RangeInAxisZ = 4 * count;

  for (let i = 0; i < amountOfTiles; i++) {
    dummy.rotation.x = generateRandomRotation()[0];
    dummy.rotation.y = generateRandomRotation()[1];
    dummy.rotation.z = generateRandomRotation()[2];

    dummy.position.x = Math.random() > 0.5 ? 2.02 : -2.02;
    dummy.position.y = heightPositionOfTilesGroup + Math.random() * 3.5 - 1.75;
    dummy.position.z = Math.random() * (RangeInAxisZ + 2) - RangeInAxisZ;
    dummy.updateMatrix();
    tileMesh.setMatrixAt(i, dummy.matrix);
  }

  return tileRef.current ? (
    <group position={position}>
      <primitive castShadow object={tileRef.current} />
    </group>
  ) : null;
}

const generateRandomShapeGeometry = () => {
  const numVertices = Math.floor(Math.random() * (8 - 5 + 1)) + 5;

  // Generate random lengths for sides
  const sideLengths = Array.from({ length: numVertices }, () => Math.random() * 0.2 + 0.3);

  // Generate random angle for rotation
  const rotationAngle = (Math.random() * degrees180) / 2;

  // Generate vertices based on desired side lengths
  const vertices = sideLengths.map((sideLength, index) => {
    const angle = (2 * degrees180 * index) / numVertices + rotationAngle;
    return new THREE.Vector3(Math.cos(angle) * sideLength, Math.sin(angle) * sideLength, 0);
  });

  // Create a shape geometry using the vertices
  const shapeGeometry = new THREE.Shape(vertices);

  return shapeGeometry;
};

export function RandomShape({
  position = [0, -0.015, -3],
  extrudeSettings = { depth: 0.01, bevelSegments: 1, bevelSize: 1, steps: 1, bevelThickness: 1, bevelOffset: -4 },
}) {
  const shapeGeometry = useMemo(() => {
    const randomShape = generateRandomShapeGeometry(); // Replace this with your actual shape generation function
    return new ExtrudeGeometry(randomShape, extrudeSettings);
  }, [extrudeSettings]);
  return (
    <mesh
      geometry={shapeGeometry}
      scale={[0.05 + Math.random() * 0.1, 0.05 + Math.random() * 0.1, 0.02]}
      position={position}
      rotation={[degrees90, 0, 0]}
      material={wallMaterial}
      castShadow
    />
  );
}

useGLTF.preload("/woodenBar.glb");

export function BlockWoodSpinner({ position = [0, 0, 0] }) {
  const obstacle = useRef();
  const [speed] = useState(() => (Math.random() + 0.7) * getRandomSign()); // if the component will get rerendered, the speed will stay the same

  const { nodes } = useGLTF("/woodenBar.glb");

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    const rotation = new THREE.Quaternion();
    rotation.setFromEuler(new THREE.Euler(0, time * speed, 0));
    obstacle.current.setNextKinematicRotation(rotation);
  });

  return (
    <group position={position} dispose={null}>
      {/* <mesh geometry={boxGeometry} material={floorMaterial} position={[0, -0.1, 0]} scale={[4, 0.2, 4]} receiveShadow /> */}
      <RigidBody
        ref={obstacle}
        type="kinematicPosition"
        position={[getRandomSign(), 0.3, getRandomSign()]}
        restitution={0.2}
        friction={0}
      >
        <mesh
          castShadow
          receiveShadow
          geometry={cylinderGeometry5}
          material={woodMaterial}
          scale={[0.03, 0.3, 0.03]}
          position={[0, 1.5, 0]}
        ></mesh>
        <mesh
          castShadow
          receiveShadow
          geometry={cylinderGeometry5}
          material={woodMaterial}
          scale={[0.03, 0.5, 0.03]}
          position={[0, 0.75, 0]}
        ></mesh>
        <mesh
          castShadow
          receiveShadow
          geometry={cylinderGeometry7}
          material={woodMaterial}
          scale={[0.03, 0.3, 0.03]}
          position={[0, 0, 0]}
        ></mesh>
        <mesh
          castShadow
          receiveShadow
          geometry={cylinderGeometry5}
          material={blackMetalMaterial}
          scale={[0.01, 2, 0.01]}
          position={[0, 0.7, 0]}
        ></mesh>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.woodenBar.geometry}
          material={woodMaterial}
          position={[-0.004, 1.2, -0.012]}
          rotation={[0, degrees90, degrees180]}
          scale={(0.1, 0.1, 0.1)}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.woodenBar.geometry}
          material={woodMaterial}
          position={[-0.004, 0.3, -0.012]}
          scale={(0.1, 0.1, 0.1)}
        />
      </RigidBody>
    </group>
  );
}

export function BlockLimbo({ position = [0, 0, 0] }) {
  const obstacle = useRef();
  const [timeOffset] = useState(() => Math.random() * 2 * degrees180);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    const y = Math.sin(time + timeOffset) + 2.55;

    obstacle.current.setNextKinematicTranslation({ x: position[0], y: position[1] + y, z: position[2] });
  });

  return (
    <group position={position}>
      {/* <mesh geometry={boxGeometry} material={floorMaterial} position={[0, -0.1, 0]} scale={[4, 0.2, 4]} receiveShadow /> */}
      <RigidBody
        colliders={false}
        ref={obstacle}
        type="kinematicPosition"
        position={[0, 5, 0]}
        restitution={0.2}
        friction={0}
      >
        <mesh
          geometry={cylinderGeometry5}
          material={wallMaterial}
          scale={[0.05, 4, 0.05]}
          rotation={[0, 0, degrees90]}
          castShadow
          receiveShadow
        />
        <group position={[0, -0.8, 0]}>
          {Array.from({ length: 8 }).map((_, index) => (
            <mesh
              key={index}
              geometry={coneGeometry}
              material={blackMetalMaterial}
              scale={(0.09, 0.09, 0.09)}
              position={[index / 1.99 - 1.76, 0, 0]}
              rotation={[degrees180, degrees90, 0]}
            />
          ))}
        </group>
        <CuboidCollider args={[2, 0.8, 0.22]} position={[0, -0.6, 0]} />
      </RigidBody>
    </group>
  );
}

export function BlockAxe({ position = [0, 0, 0] }) {
  const obstacleWhole = useRef();
  const [timeOffset] = useState(() => Math.random() * 2 * degrees180);

  const { nodes } = useGLTF("/axe2.glb");

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    const speedFactor = 3;

    const rotationAngle = (Math.sin(speedFactor * (time + timeOffset)) * degrees180) / 4.5;

    const rotation = new THREE.Quaternion();
    rotation.setFromEuler(new THREE.Euler(0, 0, rotationAngle));
    obstacleWhole.current.setNextKinematicRotation(rotation);
  });

  return (
    <group position={position}>
      {/* <mesh geometry={boxGeometry} material={floorMaterial} position={[0, -0.1, 0]} scale={[4, 0.2, 4]} receiveShadow /> */}
      <group position={(0, 0, 0)}>
        <RigidBody ref={obstacleWhole} type="kinematicPosition" position={[0, 3.8, 0]}>
          {/* <group dispose={null} position={[0, 0, 0]}> */}
          {/* axe blade */}
          {/* <mesh castShadow receiveShadow geometry={nodes.Cube.geometry} material={shinyMetalMaterial} /> */}
          {/* </group> */}
          {/* <group position={[0, 3.1, 0]}>
            <mesh
              geometry={cylinderGeometry7}
              material={woodMaterial}
              // position={(0, 4, 0)}
              rotation={[0, Math.PI / 2, 0]}
              scale={[0.02, 5, 0.05]}
              castShadow
              receiveShadow
            />
          </group> */}
          <group dispose={null}>
            <mesh castShadow receiveShadow geometry={nodes.blade.geometry} material={shinyMetalMaterial} />
            <mesh castShadow receiveShadow geometry={nodes.handle.geometry} material={woodMaterial} />
          </group>
        </RigidBody>
      </group>
    </group>
  );
}

useGLTF.preload("/axe2.glb");

export function BlockEnd({ position = [0, 0, 0] }) {
  // const hamburger = useGLTF("./hamburger.glb");
  // hamburger.scene.children.forEach((mesh) => {
  //   mesh.castShadow = true;
  // });

  return (
    <group position={position}>
      <mesh geometry={boxGeometry} material={floorMaterial} position={[0, 0, 0]} scale={[4, 0.2, 4]} receiveShadow />
      <RigidBody type="fixed" colliders="hull" position={[0, 0.25, 0]} restitution={0.2} friction={0}>
        {/* <primitive object={hamburger.scene} scale={0.2} /> */}
      </RigidBody>
    </group>
  );
}

export function Level({ count = 10, types = [BlockWoodSpinner, BlockAxe, BlockLimbo] }) {
  // export function Level({ count = 5, types = [BlockLimbo] }) {
  const blocks = useMemo(() => {
    const blocks = [];

    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      blocks.push(type);
    }
    return blocks;
  }, [count, types]);
  // console.log(blocks);
  // 145 calls 13164 triangles with optyimized code
  return (
    <>
      <Suspense fallback={null}>
        {/* <RandomShape /> */}
        {/* <WallTiles position={[0, 1, 0]} /> */}
        {/* <PillarGroup blocksAmount={count} />
        <PillarGroup blocksAmount={count} isRightPillar={true} /> */}
        {/* <PillarGroup position={[0, 3, 0]} shadowToggle={false} /> */}
        <InstancedPillarGroup count={count} />
        <FloorTiles count={count} />

        <WallTiles position={[0, 0.5, 0]} count={count} />

        {/* {index % 2 === 1 && <PillarGroup position={[0, 0, -(index + 1) * 4]} />} */}
        {/* {index % 2 === 1 && <PillarGroup position={[0, 3, -(index + 1) * 4]} shadowToggle={false} />} */}

        {blocks.map((Block, index) => (
          <group key={index}>
            {/* <Block position={[0, 0, -(index + 1) * 4]} /> */}

            {/* <PillarGroup position={[0, 0, -(index + 1) * 4]} isRightPillar={true} /> */}
            {/* {index % 5 === 0 && <TorchesGroup position={[-1.8, 1, -(index + 1) * 4 - 2]} rotation={[0, 0, 0]} />}
            {index % 5 === 0 && (
              <TorchesGroup position={[1.8, 1, -(index + 1) * 4 - 2]} rotation={[0, degrees180, 0]} />
            )} */}
          </group>
        ))}

        {/* <BlockEnd position={[0, 0, -(count + 1) * 4]} /> */}

        <Bounds length={count + 2} />
      </Suspense>
    </>
  );
}
