import * as THREE from 'three';
import { CuboidCollider, InstancedRigidBodies, RigidBody } from '@react-three/rapier';
import { useMemo, useState, useRef, useEffect, Suspense } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import { useControls } from 'leva';
import { ExtrudeGeometry } from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

THREE.ColorManagement.legacyMode = false;
THREE.ColorManagement.enabled = true;

const planeGeometry = new THREE.PlaneGeometry(3, 2);
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const cylinderGeometry5 = new THREE.CylinderGeometry(5, 5, 1, 5, 1);
const cylinderGeometry7 = new THREE.CylinderGeometry(5, 5, 1, 7, 1);
const coneGeometry = new THREE.ConeGeometry(2, 15, 3, 1);

const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x282222 });
const tilesMaterial = new THREE.MeshStandardMaterial({ color: 0x151515 });
const obstacleMaterial = new THREE.MeshStandardMaterial({ color: 'orangered' });
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x333339 });
const wallTilesMaterial = new THREE.MeshStandardMaterial({ color: 0x393939 });

const shinyMetalMaterial = new THREE.MeshStandardMaterial({ color: 0x989da0, metalness: 1, roughness: 0.5 });

const blackMetalMaterial = new THREE.MeshStandardMaterial({ color: 0x191f22 });
const woodMaterial = new THREE.MeshStandardMaterial({ color: 0xa1662f, metalness: 0.4, roughness: 0.95 });
const darkWoodMaterial = new THREE.MeshStandardMaterial({ color: 0x502900 });

const firePlaceMaterial = new THREE.MeshStandardMaterial({ color: 0x270a08 });

const textureLoader = new THREE.TextureLoader();
const simpleShadow = textureLoader.load('./simpleShadow2.jpg');

const fireShadowMaterial = new THREE.MeshBasicMaterial({
  color: 0xff8833,
  transparent: true,
  alphaMap: simpleShadow,
});

const degrees45 = Math.PI / 4;
const degrees60 = Math.PI / 3;
const degrees75 = Math.PI / 2.5;
const degrees90 = Math.PI / 2;
const degrees180 = Math.PI;

function getRandomSign() {
  return Math.random() < 0.5 ? 1 : -1;
}

function round2Decimals(num) {
  return Math.round(num * 100) / 100;
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
        <RigidBody type='fixed' colliders='trimesh' restitution={0.2} friction={0}>
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

export function FloorTiles({ position = [0, 0, 0], count }) {
  const instancedCylinderMeshRef = useRef();
  const temp = new THREE.Object3D();

  const yOffset = 0.001;
  const maximumAmount = 4 * count;
  const minimumAmount = 3 * count;
  const amountOfTiles = useMemo(
    () => Math.floor(Math.random() * (maximumAmount - minimumAmount + 1)) + minimumAmount,
    []
  );

  const RangeInAxisZ = 4 * count;
  //maybe delete mathfloor, rethink it...

  useEffect(() => {
    for (let i = 0; i < amountOfTiles; i++) {
      temp.position.set(
        (Math.random() - 0.5) * 3,
        -0.03 + Math.min(yOffset * i, 0.05),

        (Math.random() * (RangeInAxisZ - 2) - RangeInAxisZ) + 2
      );
      temp.scale.set(0.1, 0.1, 0.1);

      temp.rotation.set((Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.2);
      temp.updateMatrix();
      instancedCylinderMeshRef.current.setMatrixAt(i, temp.matrix);
    }

    // instancedCylinderMeshRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  return <instancedMesh ref={instancedCylinderMeshRef} args={[cylinderGeometry5, wallMaterial, amountOfTiles]} />;
}

const createMatrix = (position, rotation, scale) => {
  const matrix = new THREE.Matrix4();
  let innerScale;
  if (!scale) {
    innerScale = new THREE.Vector3(1, 1, 1);
  }
  else {
    innerScale = new THREE.Vector3(scale[0], scale[1], scale[2])
  }
  // Set rotation
  if (position && rotation) {
  
  const rotationMatrix = new THREE.Matrix4();
  rotationMatrix.makeRotationFromEuler(new THREE.Euler(rotation[0], rotation[1], rotation[2]));

  // Set position and apply rotation
  matrix.compose(new THREE.Vector3(position[0], position[1], position[2]), 
                 new THREE.Quaternion().setFromRotationMatrix(rotationMatrix),
                 innerScale);
                }
  return matrix;
};

export function TorchesGroup({ position = [-1.5, 1, 2], count }) {
  const { nodes, materials } = useGLTF('/torch.glb');

  const flameColor = useMemo(() => [Math.random() + 0.8, Math.random() * 0.3, 0], []); 
  // TODO: make various colors

  const torchesPairAmount = Math.floor(count / 5); //in case of 10 its 2

  const flameParticlesPerPair = 24;
  const amountOfFlamesPart = flameParticlesPerPair * torchesPairAmount;
  const tempFlame = new THREE.Object3D();
  const tempBloom = new THREE.Object3D();

  
  const flameRef = useRef();
  const bloomRef = useRef();

  const torchElementsInstances = useMemo(() => {
    const torchInstances = [];
    const flameInstances = [];
    const bloomInstances = [];


    for (let i = 0; i < torchesPairAmount; i++) {
      const torchPositionLeft = [-1.8, 1.5, -(i + 1) * 2 * 8 + 10];
      const torchPositionRight = [1.8, 1.5, -(i + 1) * 2 * 8 + 10];

      torchInstances.push({
        key: 'torch-instance-left_' + i,
        position: torchPositionLeft,
        rotation: [0, 0, 0],
        scale: [0.6, 0.6, 0.6],
      });

      torchInstances.push({
        key: 'torch-instance-right_' + i,
        position: torchPositionRight,
        rotation: [0, degrees180, 0],
        scale: [0.6, 0.6, 0.6],
      });

      bloomInstances.push({
        key: 'angled-bloom-instance-left_' + i,
        position: [torchPositionLeft[0] + 0.15, 1.8, torchPositionLeft[2] + 0.35 ],
        rotation: [0, degrees60, 0],
        scale: [0.4, 0.7, 0.4]
      })
      
      bloomInstances.push({
        key: 'angled-bloom-instance-right_' + i,
        position: [torchPositionRight[0] - 0.15, 1.8, torchPositionRight[2] + 0.35],
        rotation: [0, -degrees60, 0],
        scale: [0.4, 0.7, 0.4]
      })

      bloomInstances.push({
        key: 'wall-bloom-instance-left_' + i,
        position: [torchPositionLeft[0] - 0.1, 1.8, torchPositionLeft[2] - 0.25],
        rotation: [0, degrees90, 0],
        scale: [0.4, 0.6, 0.4]
      })

      bloomInstances.push({
        key: 'wall-bloom-instance-right_' + i,
        position: [torchPositionRight[0] + 0.1, 1.8, torchPositionRight[2] ],
        rotation: [0, -degrees90, 0],
        scale: [0.4, 0.6, 0.4]
      })

      for (let j = 0; j < flameParticlesPerPair; j++) {
        const tempFlameXPosition =
          j % 2 === 0
            ? (Math.random() - 0.5) * 0.2 + torchPositionLeft[0]
            : (Math.random() - 0.5) * 0.2 + torchPositionRight[0];
        
        tempFlame.scale.set(0.1, 0.1, 0.1);

        const initialPosition =  [
          round2Decimals(tempFlameXPosition, -3),
          round2Decimals(0.1 + torchPositionLeft[1], -3),
          round2Decimals((Math.random() - 0.5) * 0.2 + torchPositionLeft[2], -3)];

        const delay = j / 3;
        const initialScaleFactor = Math.random() * 0.1 / (j * 3); 
        // delay goes up as  scale is lesser if the delay is bigger;
        // scale same, if some box it will appear later, smaller it will be

        flameInstances.push({
          delay,
          initialPosition,
          position: [...initialPosition],
          scale: [initialScaleFactor, initialScaleFactor, initialScaleFactor],
        });
      }
    }

    return [torchInstances, flameInstances, bloomInstances];
  }, [count]);



  useFrame((state, delta) => {
    const timeFactor = delta * 0.5;
    torchElementsInstances[1].forEach((instance, index) => {

      if (!(state.clock.elapsedTime < instance.delay)) {
        // If the elapsed time is less than the delay, skip the animation
        instance.scale[0] -= 0.1 * timeFactor;
        instance.scale[1] -= 0.1 * timeFactor;
        instance.scale[2] -= 0.1 * timeFactor;
  
  
        instance.position[0] -= 0.05 * timeFactor;
        instance.position[1] += 0.325 * timeFactor;
        instance.position[2] -= 0.05 * timeFactor;

  
        if (instance.scale[0] < 0.01) {
          [instance.scale[0], instance.scale[1], instance.scale[2]] = [0.08, 0.08, 0.08];
          [instance.position[0], instance.position[1], instance.position[2]] = instance.initialPosition;
        }
      }

  
      const matrix = new THREE.Matrix4();
     // prettier-ignore
      matrix.set(
        instance.scale[0], 0, 0, instance.position[0],
        0, instance.scale[1], 0, instance.position[1],
        0, 0, instance.scale[2], instance.position[2],
        0, 0, 0, 1
      );

      flameRef.current.setMatrixAt(index, matrix);
    });

    flameRef.current.instanceMatrix.needsUpdate = true;
  });

  useEffect(() => {
    torchElementsInstances[2].forEach((instance, index) => {
      const matrix = createMatrix(instance.position, instance.rotation, instance.scale);

      // Use the matrix as needed
      bloomRef.current.setMatrixAt(index, matrix);
    })
  }, [])

  return (
    <group>
      <instancedMesh ref={flameRef} args={[boxGeometry, null, amountOfFlamesPart]}>
        <meshStandardMaterial attach='material' color={flameColor} transparent opacity={1} />
      </instancedMesh>

      <instancedMesh ref={bloomRef} args={[planeGeometry, fireShadowMaterial, torchesPairAmount * 4]} />
    
      <InstancedRigidBodies type='fixed' colliders='hull' instances={torchElementsInstances[0]}>
        <instancedMesh
          castShadow
          receiveShadow
          args={[nodes.TorchGeometry.geometry, materials['Material.002'], torchesPairAmount * 2]}
        />
      </InstancedRigidBodies>
    </group>
  );
}

useGLTF.preload('/torch.glb');
useGLTF.preload('/pillar-doubled2.glb');

export function InstancedPillarGroup({ positionZ = 0, count }) {
  const { nodes } = useGLTF('/pillar-doubled2.glb');
  const pillarPairsAmount = count / 2;

  const pillarInstances = useMemo(() => {
    const instances = [];

    for (let i = 0; i < pillarPairsAmount; i++) {
      instances.push({
        key: 'pillar-instance-left_' + i,
        position: [-1.8, 2.62, -(i + 1) * 2 * 4 + 6],
        rotation: [0, 0, 0],
        scale: [0.25, 0.14, 0.25],
      });

      instances.push({
        key: 'pillar-instance-right_' + i,
        position: [1.8, 2.62, -(i + 1) * 2 * 4 + 6],
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
    <InstancedRigidBodies type='fixed' colliders='trimesh' instances={pillarInstances}>
      <instancedMesh
        castShadow
        receiveShadow
        args={[mergedPillarsGeometry, wallTilesMaterial, count]}
      ></instancedMesh>
    </InstancedRigidBodies>
  );
}

export function WallTiles({ position = [0, 0, 0], count }) {
  const tileRef = useRef();

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

useGLTF.preload('/woodenBar.glb');

export function BlockWoodSpinner({ position = [0, 0, 0] }) {
  const obstacle = useRef();
  const [speed] = useState(() => (Math.random() + 0.7) * getRandomSign()); // if the component will get rerendered, the speed will stay the same

  const { nodes } = useGLTF('/woodenBar.glb');

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
        type='kinematicPosition'
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
        type='kinematicPosition'
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

  const { nodes } = useGLTF('/axe2.glb');

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
        <RigidBody ref={obstacleWhole} type='kinematicPosition' position={[0, 3.8, 0]}>
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

useGLTF.preload('/axe2.glb');

export function BlockEnd({ position = [0, 0, 0] }) {
  // const hamburger = useGLTF("./hamburger.glb");
  // hamburger.scene.children.forEach((mesh) => {
  //   mesh.castShadow = true;
  // });

  return (
    <group position={position}>
      <mesh geometry={boxGeometry} material={floorMaterial} position={[0, 0, 0]} scale={[4, 0.2, 4]} receiveShadow />
      <RigidBody type='fixed' colliders='hull' position={[0, 0.25, 0]} restitution={0.2} friction={0}>
        {/* <primitive object={hamburger.scene} scale={0.2} /> */}
      </RigidBody>
    </group>
  );
}

export function Level({ count = 30, types = [BlockWoodSpinner, BlockAxe, BlockLimbo] }) {
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
        <InstancedPillarGroup count={count} />
        <FloorTiles count={count} />

        <WallTiles position={[0, 0.5, 0]} count={count} />
        <TorchesGroup count={count} />

        {blocks.map((Block, index) => (
          <group key={index}>
            {/* <Block position={[0, 0, -(index + 1) * 4]} /> */}

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
