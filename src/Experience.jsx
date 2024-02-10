import { OrbitControls } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import Lights from './Lights.jsx';
import { Level } from './Level.jsx';
import Player from './Player.jsx';
import { Perf } from 'r3f-perf';

export default function Experience() {
  return (
    <>
      <OrbitControls makeDefault enableDamping={false} />
      <Perf showGraph={false} />
      <Physics debug>
        <Level />
        <Player />
        <Lights />
      </Physics>
    </>
  );
}
