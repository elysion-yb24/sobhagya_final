"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, Sparkles } from "@react-three/drei";
import * as THREE from "three";

interface Props {
  position?: [number, number, number];
  size?: number;
  cheap?: boolean;
}

export default function CrystalOrb3D({ position = [0, 0, 0], size = 0.95, cheap = false }: Props) {
  const orb = useRef<THREE.Group>(null!);
  const core = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (orb.current) {
      orb.current.position.y = position[1] + Math.sin(t * 0.9) * 0.12;
      orb.current.rotation.y = t * 0.25;
    }
    if (core.current) {
      const s = 0.55 + Math.sin(t * 1.6) * 0.04;
      core.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={orb} position={position}>
      {/* Outer glass orb */}
      <mesh castShadow>
        <sphereGeometry args={[size, 64, 64]} />
        {cheap ? (
          <meshStandardMaterial
            color="#FFE7B5"
            metalness={0.2}
            roughness={0.05}
            transparent
            opacity={0.55}
          />
        ) : (
          <MeshTransmissionMaterial
            transmission={1}
            thickness={0.6}
            roughness={0.05}
            ior={1.45}
            chromaticAberration={0.06}
            anisotropy={0.4}
            distortion={0.25}
            distortionScale={0.4}
            temporalDistortion={0.1}
            color="#FFEFCC"
            backside
          />
        )}
      </mesh>

      {/* Inner amber core */}
      <mesh ref={core}>
        <sphereGeometry args={[size * 0.55, 32, 32]} />
        <meshStandardMaterial
          color="#FFB347"
          emissive="#F7941D"
          emissiveIntensity={1.4}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Halo sparkles */}
      {!cheap && (
        <Sparkles
          count={36}
          scale={size * 3.2}
          size={3.5}
          speed={0.4}
          color="#FFD58A"
        />
      )}

      {/* Soft point light from inside */}
      <pointLight color="#FFB347" intensity={2.2} distance={6} />
    </group>
  );
}
