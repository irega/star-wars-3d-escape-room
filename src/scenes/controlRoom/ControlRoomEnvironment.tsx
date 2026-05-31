import { ImperialRoomShell } from '../../three';

export function ControlRoomEnvironment() {
  return (
    <>
      <pointLight position={[0, 2, -3]} intensity={0.7} color="#4466bb" distance={5} decay={2} />
      <pointLight
        position={[-2.5, 2, -1]}
        intensity={0.55}
        color="#4466bb"
        distance={4}
        decay={2}
      />
      <pointLight position={[0, 3.2, -2]} intensity={0.5} color="#8899cc" distance={6} decay={2} />

      <ImperialRoomShell floorColor="#222838" wallBackColor="#283858" wallSideColor="#262a3a" />
    </>
  );
}
