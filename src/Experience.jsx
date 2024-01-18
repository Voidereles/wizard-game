import { OrbitControls } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import Lights from './Lights.jsx';
import { Level } from './Level.jsx';
import { Perf } from 'r3f-perf';
import Player from './Player.jsx';

export default function Experience() {
  return (
    <>
      <OrbitControls makeDefault enableDamping={false} />
      <Perf showGraph={false} />
      <Physics>
        <Lights />

        <Level />
        {/* <Player /> */}
      </Physics>
    </>
  );
}
