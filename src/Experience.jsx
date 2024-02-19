import { OrbitControls } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
// import FollowLight from './Lights.jsx';
import { Level } from './Level.jsx';
import Player from './Player.jsx';
import { Perf } from 'r3f-perf';


import * as THREE from 'three';
import { CuboidCollider, InstancedRigidBodies, RigidBody } from '@react-three/rapier';
import { useMemo, useState, useRef, useEffect, Suspense } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import { useControls } from 'leva';
import { ExtrudeGeometry } from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { generateRandomShapeGeometry } from './Level.jsx';

const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x333339 });
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x282222 });
export function Bounds({ length = 1 }) {
  return (
    <>
      
        <RigidBody type='fixed' restitution={0.2} friction={1}>
          {/* <CuboidCollider args={ [ 4, 6, 0.2 ] } position={ [ 0, 3, 1.7 ] } /> */}
          <mesh
              geometry={boxGeometry}
              material={floorMaterial}
              position={[0, -0.09,  -((length + 2) * 2) + 2]}
              scale={[6, 0.2, 4 * (length + 2)]}
              receiveShadow
          />
          
        </RigidBody>
        {/* <RigidBody  type='fixed' collider="hull">
          <mesh
                geometry={boxGeometry}
                material={floorMaterial}
                position={[-3.5, 2.9,-(length * 2) + 2]}
                scale={[1, 3.2 + 3, 4 * length]}
                receiveShadow
            />
        </RigidBody>
        <RigidBody  type='fixed' collider="hull" >
          <mesh
                geometry={boxGeometry}
                material={floorMaterial}
                position={[3.5, 2.9, -(length * 2) + 2]}
                scale={[1, 3.2 + 3, 4 * length]}
                receiveShadow
            />
        </RigidBody> */}
      
      
    </>
  );
}


export default function Experience() {
  const length = 10;
  
  return (
    <>
      {/* <OrbitControls makeDefault enableDamping={false} /> */}
      <Perf showGraph={false} />
      <Physics >
        <Bounds length={length} />
        <Player />
        <Suspense>
          <Level count={length}/>
        </Suspense>
      </Physics>
      
      <ambientLight color={0xffd2ad} intensity={1} />
    </>
  );
}
