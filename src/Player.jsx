
import { KeyboardControls, useAnimations, useGLTF } from '@react-three/drei'
import { Suspense, useEffect, useRef, useState } from 'react'
import Ecctrl, { EcctrlAnimation, EcctrlJoystick } from 'ecctrl'

// import FollowLight from './Lights';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function Model(props) {
  // const group = useRef();
  const { nodes, materials } = useGLTF("/wizardFinal3.glb");
  return (
    <group dispose={null}>
      <group name="Scene">
        <group name="Armature" scale={0.023} position={[0, -0.87, 0.002]} rotation={[0, - Math.PI / 2, 0]} >
          <skinnedMesh
            name="Body"
            geometry={nodes.Body.geometry}
            material={materials["HatGreen.001"]}
            skeleton={nodes.Body.skeleton}
            castShadow
          />
          <skinnedMesh
            name="BodyBag"
            geometry={nodes.BodyBag.geometry}
            material={materials["HatGreen.001"]}
            skeleton={nodes.BodyBag.skeleton}
            castShadow
          />
          <skinnedMesh
            name="BodyBuckle"
            geometry={nodes.BodyBuckle.geometry}
            material={materials["HatGreen.001"]}
            skeleton={nodes.BodyBuckle.skeleton}
          />
          <primitive object={nodes.mixamorigHips} />
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/wizardFinal3.glb");



export default function Player() {
  const cCtrl = useRef();
  const light = useRef();
  // let newCameraPosition;
  
  const [camCollisionState, useCamCollisionState] = useState(false);
  // const [cameraPosition, setCameraPosition ] = {x: 0, y: 0, z: -5}
  // const [cameraTarget, setCameraTarget ] = {x: 0, y: 0, z: 0}

  useFrame((state) => {
    if (cCtrl.current && light.current) {
      const cCtrlPosition = cCtrl.current.translation();      
      // console.log(state.camera);
     
      if (cCtrlPosition.z > -3) {
        // -0.8 is close to back wall
        light.current.position.z = THREE.MathUtils.lerp(light.current.position.z, cCtrlPosition.z, 0.01);
        light.current.target.position.z = THREE.MathUtils.lerp(light.current.target.position.z, cCtrlPosition.z - 1, 0.01);
        useCamCollisionState(true);
      }
      else {
        useCamCollisionState(false);
        light.current.position.z = THREE.MathUtils.lerp(light.current.position.z, cCtrlPosition.z + 4, 0.08);
        light.current.target.position.z = THREE.MathUtils.lerp(light.current.target.position.z, cCtrlPosition.z - 4, 0.08);
      }


      light.current.target.updateMatrixWorld(); // without it, target of the light source will still be on same point, not being updated
      


      // setCameraTarget(cCtrlPosition);
      // setCameraPosition(cCtrl.current.translation());

    }
  });


  const keyboardMap = [
    { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
    { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
    { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
    { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
    { name: "jump", keys: ["Space"] },
    { name: "run", keys: ["Shift"] },
    { name: "run", keys: ["Shift"] },
    { name: "action1", keys: ["1"] },
  ]

  const characterURL = "/wizardFinal3.glb";

  const animationSet = {
    idle: 'Idle_Armature',
    walk: 'Walk_Armature',
    run: 'Run_Armature',
    jump: 'Jump_Armature',
    jumpIdle: 'Falling_Armature',
    jumpLand: 'JumpLand_Armature',
    fall: 'Falling_Armature', // This is for falling from high sky
    action1: 'Victory_Armature',
  }

  return (

    <Suspense fallback={null}>
      <KeyboardControls map={keyboardMap} >
        {/* <FollowLight ref={light}/> */}
        <spotLight
          ref={light}
          castShadow
          // position={position.value}
          position={[0, 2.5, 0]}
          intensity={305.5}
          color='#cf9a62'
          penumbra={0.05}
          decay={1.8}
          angle={Math.PI / 2.9}
          shadow-mapSize={[1024, 1024]}
        // shadow-focus={0.5}
        // shadow-camera-near={1}
        // shadow-camera-far={40}
        // shadow-camera-top={40}
        // shadow-camera-right={40}
        // shadow-camera-bottom={-40}
        // shadow-camera-left={-40}
        />
        <Ecctrl
          ref={cCtrl}
          camCollision={camCollisionState}
          turnSpeed={30}
          wakeUpDelay={150}
       
          position={[0, 25, -5]}
          maxVelLimit={4}
          capsuleHalfHeight={0.28333}
          sprintMult={1}
          camInitDis={ -2 } // Initial camera distance
          camMaxDis={ -3 } // Maximum camera distance
          camMinDis={ -0.7}  // Minimum camera distance
       
          animated
          camInitDir={{ x: - 0.5, y: Math.PI, z: 0 }}
        >
          <EcctrlAnimation characterURL={characterURL} animationSet={animationSet}>
          <Model />
          </EcctrlAnimation>
        </Ecctrl>
      </KeyboardControls>
    </Suspense>
  )
}

// autoBalanceSpringK = 0.3,
// autoBalanceDampingC = 0.03,
// autoBalanceSpringOnY = 0.5,
// autoBalanceDampingOnY = 0.015,
