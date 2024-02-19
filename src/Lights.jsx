// import { forwardRef, useEffect, useRef } from 'react';
// import { useFrame } from '@react-three/fiber';
// import { useControls } from "leva";
// import { SpotLightHelper } from 'three';
// import { useHelper } from '@react-three/drei';

// const FollowLight = forwardRef(
//   function FollowLight(props, ref) {
//     const light = useRef();
//     useHelper(light, SpotLightHelper, 'cyan');
//     const warmLightColor = '#FFC8A0';
//     const color = useControls({
//       value: '#cf9a62',
//     })
//     // #ffb08c
  
//     const { position } = useControls({
//     position: {
//       value: { x: 0, y: 5, z: 1 },
//       step: 0.5,
//     },
//   });
//   const positionP = useControls({
//     position: {
//       value: { x: 0, y: 2.66, z: 0 },
//       step: 0.05,
//     },
//     scale: {
//       value: { x: 0.5, y: 0.35, z: 0.6 },
//       step: 0.05,
//     },
//   });

//     return (
       
//     );
//   }
// )

// export default FollowLight;

// // const { position } = useControls({
// //   position: {
// //     value: { x: 0, y: 5, z: 1 },
// //     step: 0.5,
// //   },
// // });
// // const positionP = useControls({
// //   position: {
// //     value: { x: 0, y: 2.66, z: 0 },
// //     step: 0.05,
// //   },
// //   scale: {
// //     value: { x: 0.5, y: 0.35, z: 0.6 },
// //     step: 0.05,
// //   },
// // });
