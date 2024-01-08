import * as THREE from "three";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useMemo, useState, useRef, useEffect, Suspense } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useControls } from "leva";
import { ExtrudeGeometry } from "three";

THREE.ColorManagement.legacyMode = false;
THREE.ColorManagement.enabled = true;

const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const cylinderGeometry5 = new THREE.CylinderGeometry(5, 5, 1, 5, 1);
const cylinderGeometry7 = new THREE.CylinderGeometry(5, 5, 1, 7, 1);
const coneGeometry = new THREE.ConeGeometry(2, 15, 5, 1, true);

const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
const tilesMaterial = new THREE.MeshStandardMaterial({ color: 0x151515 });
const obstacleMaterial = new THREE.MeshStandardMaterial({ color: "orangered" });
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x333339 });
const wallTilesMaterial = new THREE.MeshStandardMaterial({ color: 0x393939 });

const shinyMetalMaterial = new THREE.MeshStandardMaterial({ color: 0x989da0, metalness: 1, roughness: 0.5 });

const blackMetalMaterial = new THREE.MeshStandardMaterial({ color: 0x191f22 });
const woodMaterial = new THREE.MeshStandardMaterial({ color: 0xa1662f, metalness: 0.4, roughness: 0.95 });
const darkWoodMaterial = new THREE.MeshStandardMaterial({ color: 0x502900 });

const firePlaceMaterial = new THREE.MeshStandardMaterial({ color: 0x270a08 });

function getRandomSign() {
  return Math.random() < 0.5 ? 1 : -1;
}

export function Bounds({ length = 1 }) {
  return (
    <>
      {
        <RigidBody type="fixed" restitution={0.2} friction={0}>
          {/* wall left */}
          <mesh
            position={[-2.15, 1.4, -(length * 2) + 2]}
            geometry={boxGeometry}
            material={wallMaterial}
            scale={[0.3, 3.2, 4 * length]}
            receiveShadow
          ></mesh>

          <mesh
            position={[-2.15, 1.4 + 3, -(length * 2) + 2]}
            geometry={boxGeometry}
            material={wallMaterial}
            scale={[0.3, 3.2, 4 * length]}
          ></mesh>

          {/* wall right */}
          <mesh
            position={[2.15, 1.4, -(length * 2) + 2]}
            geometry={boxGeometry}
            material={wallMaterial}
            scale={[0.3, 3.2, 4 * length]}
            receiveShadow
          ></mesh>

          <mesh
            position={[2.15, 1.4 + 3, -(length * 2) + 2]}
            geometry={boxGeometry}
            material={wallMaterial}
            scale={[0.3, 3.2, 4 * length]}
          ></mesh>

          {/* bottom left */}
          <mesh
            position={[-2, 0.13, -(length * 2) + 3]}
            geometry={boxGeometry}
            material={wallMaterial}
            scale={[0.3, 0.2, 4 * length]}
            receiveShadow
            castShadow
          ></mesh>

          {/* bottom right */}
          <mesh
            position={[2, 0.13, -(length * 2) + 3]}
            geometry={boxGeometry}
            material={wallMaterial}
            scale={[0.3, 0.2, 4 * length]}
            receiveShadow
            castShadow
          ></mesh>

          <mesh
            position={[0, 6.05, -(length * 2) + 3]}
            geometry={boxGeometry}
            material={wallMaterial}
            scale={[4, 0.2, 4 * length]}
            receiveShadow
            castShadow
          ></mesh>

          {/* <mesh
            position={[0, 0.55, - ]}
            geometry={boxGeometry}
            material={wallMaterial}
            scale={[4.6, 1.5, 0.3]}
            receiveShadow
          ></mesh> */}
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
    <mesh position={currentPosition} scale={scale}>
      <boxGeometry args={[0.2, 0.2, 0.2]} />
      <meshStandardMaterial color={materialColor} transparent opacity={1} />
    </mesh>
  );
};

export function TileBottomGroup({ position = [0, 0, 0] }) {
  const amountOfTiles = useMemo(() => Math.floor(Math.random() * (2 - 2 + 1)) + 2, []);

  const tileSize = 0.6;
  const yBase = 0.15;
  const yOffset = 0.001;
  const grid = new Set();

  function getRandomNonOverlappingPosition(_, index, type) {
    let x, z;
    do {
      if (type === "box") {
        x = (Math.random() - 0.5) * 3; // Random X value between -1.5 and 1.5
        z = (Math.random() - 0.5) * 3 * 1.2; // Random Z value between -1.8 and 1.8
      } else {
        x = Math.random() * 2.4 - 1.2;
        z = Math.random() * 4 - 2;
      }
    } while (isOverlapping(x, z));

    grid.add(`${x},${z}`);
    let y;
    type === "box" ? (y = yOffset * index - yBase) : (y = -0.03 + yOffset * index);

    return [x, y, z];
  }

  function isOverlapping(x, z, tolerance = 0.2) {
    // Check if the new position is too close to an existing position
    for (const coords of grid) {
      const [existingX, existingZ] = coords.split(",").map(Number);
      const distance = Math.sqrt((existingX - x) ** 2 + (existingZ - z) ** 2);

      if (distance < tileSize - tolerance) {
        return true; // Overlapping
      }
    }
    return false; // Not overlapping
  }

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
        <mesh geometry={nodes.FirePlace.geometry} material={firePlaceMaterial} position={[0, 1.187, 0]} />
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

export function PillarGroup({ position = [0, 0, 0], shadowToggle = true }) {
  const { nodes } = useGLTF("/pillar-empty.glb");

  return (
    <group dispose={null} position={position}>
      <RigidBody type="fixed" colliders="hull" position={[-1.8, 0.17, -2]} restitution={0.2} friction={0}>
        <mesh
          geometry={boxGeometry}
          material={wallTilesMaterial}
          scale={[0.45, -0.15, 0.6]}
          position={[0, 2.76, 0]}
          castShadow={shadowToggle}
          receiveShadow={shadowToggle}
        />
        <mesh
          geometry={boxGeometry}
          material={wallTilesMaterial}
          scale={[0.5, 0.35, 0.6]}
          position={[0, 0.03, 0]}
          castShadow={shadowToggle}
          receiveShadow={shadowToggle}
        />
        <mesh
          geometry={nodes.Cube.geometry}
          material={wallTilesMaterial}
          scale={[0.25, 0.14, 0.25]}
          castShadow={shadowToggle}
          receiveShadow={shadowToggle}
        />
      </RigidBody>
      <RigidBody
        type="fixed"
        colliders="hull"
        position={[1.8, 0.17, -2]}
        rotation={[0, Math.PI, 0]}
        restitution={0.2}
        friction={0}
        castShadow={shadowToggle}
        receiveShadow={shadowToggle}
      >
        <mesh
          geometry={boxGeometry}
          material={wallTilesMaterial}
          scale={[0.45, -0.15, 0.6]}
          position={[0, 2.76, 0]}
          castShadow={shadowToggle}
          receiveShadow={shadowToggle}
        />
        <mesh
          geometry={boxGeometry}
          material={wallTilesMaterial}
          scale={[0.5, 0.35, 0.6]}
          position={[0, 0.03, 0]}
          castShadow={shadowToggle}
          receiveShadow={shadowToggle}
        />
        <mesh
          geometry={nodes.Cube.geometry}
          material={wallTilesMaterial}
          scale={[0.25, 0.14, 0.25]}
          castShadow={shadowToggle}
          receiveShadow={shadowToggle}
        />
      </RigidBody>
    </group>
  );
}

export function WallTileGroup({ position = [0, 0, 0] }) {
  const amountOfTiles = useMemo(() => Math.floor(Math.random() * (20 - 10 + 1)) + 10, []);
  const tileSize = { x: 0.1, y: 0.25, z: 0.5 };

  const generateRandomPosition = (occupiedPositions) => {
    let newPosition;
    const tolerance = 0.5; // Adjust as needed

    do {
      newPosition = {
        x: Math.random() > 0.5 ? 2.02 : -2.02,
        y: 0.5 + Math.random() * (2.5 - 0.5),
        z: Math.random() * 3.5 - 1.75,
      };
    } while (isOverlap(newPosition, occupiedPositions, tolerance));

    return newPosition;
  };

  const isOverlap = (newPosition, occupiedPositions, tolerance) => {
    for (const pos of occupiedPositions) {
      if (
        Math.abs(newPosition.x - pos.x) < tolerance &&
        Math.abs(newPosition.y - pos.y) < tolerance &&
        Math.abs(newPosition.z - pos.z) < tolerance
      ) {
        return true; // overlap detected
      }
    }
    return false; // no overlap
  };

  const initialPositions = [];

  return (
    <group position={position}>
      {Array(amountOfTiles)
        .fill()
        .map((_, index) => {
          const randomPosition = generateRandomPosition(initialPositions);
          initialPositions.push(randomPosition);
          const randomRotation = generateRandomRotation();

          return (
            <mesh
              key={index}
              position={[randomPosition.x, randomPosition.y, randomPosition.z]}
              rotation={randomRotation}
              receiveShadow
              castShadow
              geometry={boxGeometry}
              material={wallTilesMaterial}
              scale={[tileSize.x, tileSize.y, tileSize.z]}
            />
          );
        })}
    </group>
  );
}

const generateRandomShapeGeometry = () => {
  const numVertices = Math.floor(Math.random() * (8 - 5 + 1)) + 5;

  // Generate random lengths for sides
  const sideLengths = Array.from({ length: numVertices }, () => Math.random() * 0.2 + 0.3);

  // Generate random angle for rotation
  const rotationAngle = (Math.random() * Math.PI) / 2;

  // Generate vertices based on desired side lengths
  const vertices = sideLengths.map((sideLength, index) => {
    const angle = (2 * Math.PI * index) / numVertices + rotationAngle;
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
      rotation={[Math.PI / 2, 0, 0]}
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
      <mesh geometry={boxGeometry} material={floorMaterial} position={[0, -0.1, 0]} scale={[4, 0.2, 4]} receiveShadow />
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
          rotation={[0, Math.PI / 2, Math.PI]}
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
  const obstacleWhole = useRef();
  const [timeOffset] = useState(() => Math.random() * 2 * Math.PI); // 2 Math Pi is full 360

  const { nodes } = useGLTF("/axe2.glb");

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    const speedFactor = 3;

    const rotationAngle = (Math.sin(speedFactor * (time + timeOffset)) * Math.PI) / 4.5;

    const rotation = new THREE.Quaternion();
    rotation.setFromEuler(new THREE.Euler(0, 0, rotationAngle));
    obstacleWhole.current.setNextKinematicRotation(rotation);
  });

  return (
    <group position={position}>
      <mesh geometry={boxGeometry} material={floorMaterial} position={[0, -0.1, 0]} scale={[4, 0.2, 4]} receiveShadow />
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

// export function Level({ count = 10, types = [BlockSpinner, BlockAxe, BlockLimbo] }) {
export function Level({ count = 5, types = [BlockWoodSpinner, BlockAxe] }) {
  const blocks = useMemo(() => {
    const blocks = [];

    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      console.log(type);
      console.log(types);
      blocks.push(type);
    }
    return blocks;
  }, [count, types]);
  // console.log(blocks);

  return (
    <>
      <Suspense fallback={null}>
        <BlockStart position={[0, 0, 0]} />
        <RandomShape />
        <WallTileGroup position={[0, 1, 0]} />
        <PillarGroup />
        {/* <Torch position={[-1, 0, -2]} />
        <Torch position={[-1, 0, -2]} /> */}
        {/* <Torch /> */}
        {blocks.map((Block, index) => (
          <group key={index}>
            <Block position={[0, 0, -(index + 1) * 4]} />
            <TileBottomGroup position={[0, 0, -(index + 1) * 4]} tileIndex={index} />
            <WallTileGroup position={[0, 0.5, -(index + 1) * 4]} />
            {index % 2 === 1 && <PillarGroup position={[0, 0, -(index + 1) * 4]} />}
            {index % 2 === 1 && <PillarGroup position={[0, 3, -(index + 1) * 4]} shadowToggle={false} />}
            {index % 5 === 0 && <TorchesGroup position={[-1.8, 1, -(index + 1) * 4 - 2]} rotation={[0, 0, 0]} />}
            {index % 5 === 0 && <TorchesGroup position={[1.8, 1, -(index + 1) * 4 - 2]} rotation={[0, Math.PI, 0]} />}
          </group>
        ))}

        <BlockEnd position={[0, 0, -(count + 1) * 4]} />

        <Bounds length={count + 2} />
      </Suspense>
    </>
  );
}
