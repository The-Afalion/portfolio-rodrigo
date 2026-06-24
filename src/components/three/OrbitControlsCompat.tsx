"use client";

import { OrbitControls as DreiOrbitControls } from "@react-three/drei";
import type { ComponentType } from "react";

type OrbitControlsCompatProps = Record<string, unknown>;

export default function OrbitControlsCompat(props: OrbitControlsCompatProps) {
  const Controls = DreiOrbitControls as unknown as ComponentType<OrbitControlsCompatProps>;
  return <Controls {...props} />;
}
