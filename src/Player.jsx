
import { KeyboardControls, useAnimations, useGLTF } from '@react-three/drei'
import { Suspense, useRef } from 'react'
import Ecctrl, { EcctrlAnimation, EcctrlJoystick } from 'ecctrl'
import { Physics } from '@react-three/rapier';



export function Model(props) {
  const group = useRef();
  const { nodes, materials, animations } = useGLTF("/wizard11.glb");
  const { actions } = useAnimations(animations, group);
  return (
    <group ref={group} {...props} dispose={null}>
      <group name="Scene">
        <group name="Armature" rotation={[Math.PI / 2, 0, 0]} scale={0.018}>
          <skinnedMesh
            name="Body"
            geometry={nodes.Body.geometry}
            material={materials["HatGreen.002"]}
            skeleton={nodes.Body.skeleton}
          />
          <skinnedMesh
            name="BodyBag"
            geometry={nodes.BodyBag.geometry}
            material={materials["HatGreen.002"]}
            skeleton={nodes.BodyBag.skeleton}
          />
          <skinnedMesh
            name="BodyBuckle"
            geometry={nodes.BodyBuckle.geometry}
            material={materials["HatGreen.002"]}
            skeleton={nodes.BodyBuckle.skeleton}
          />
          <primitive object={nodes.mixamorigHips} />
        </group>
      </group>
    </group>
  );
}



export default function Player() {
  
  const keyboardMap = [
    { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
    { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
    { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
    { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
    { name: "jump", keys: ["Space"] },
    { name: "run", keys: ["Shift"] },

  ]

  const characterURL = "/wizard11.glb";

  const animationSet = {
    idle: 'Idle_Armature',
    walk: 'Walk_Armature',
    run: 'Walk_Armature',
    jump:'Walk_Armatured',
    jumpIdle: 'Idle_Armature',
    jumpLand: 'Walk_Armature',
    fall: 'Walk_Armature',
    action1: 'Walk_Armature',
    action2: 'Walk_Armature',
    action3: 'Walk_Armature',
    action4: 'Walk_Armature',
  }


  return (
    
      <Suspense fallback={null}>
        <KeyboardControls map={keyboardMap}>
        <Ecctrl  position={[1, 20, -5]} debug floatHeight={0.2}>
          <EcctrlAnimation characterURL={characterURL} animationSet={animationSet}>
            <Model  />
          </EcctrlAnimation>
        </Ecctrl>
        </KeyboardControls>
    </Suspense>
 
  )
}
