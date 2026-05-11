"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Float } from "@react-three/drei";
import * as THREE from "three";

/** A glowing planet on its own elliptical orbit. */
function OrbitingPlanet({
  radiusX,
  radiusZ,
  speed,
  size,
  color,
  phase = 0,
  yOffset = 0,
}: {
  radiusX: number;
  radiusZ: number;
  speed: number;
  size: number;
  color: string;
  phase?: number;
  yOffset?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + phase;
    if (ref.current) {
      ref.current.position.x = Math.cos(t) * radiusX;
      ref.current.position.z = Math.sin(t) * radiusZ;
      ref.current.position.y = yOffset + Math.sin(t * 2) * 0.15;
    }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.9}
        roughness={0.35}
        metalness={0.4}
      />
      <pointLight color={color} intensity={0.6} distance={4} decay={2} />
    </mesh>
  );
}

/** Zodiac ring — a torus with 12 small spheres orbiting on it. */
function ZodiacRing() {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.08;
      groupRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.08;
    }
  });

  const markers = useMemo(() => Array.from({ length: 12 }, (_, i) => i), []);

  return (
    <group ref={groupRef} rotation={[Math.PI / 2.6, 0, 0]}>
      {/* Main torus ring */}
      <mesh>
        <torusGeometry args={[2.2, 0.025, 16, 200]} />
        <meshStandardMaterial
          color="#F7B23A"
          emissive="#F7941D"
          emissiveIntensity={0.7}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
      {/* Inner thinner ring */}
      <mesh rotation={[0, 0, Math.PI / 8]}>
        <torusGeometry args={[1.7, 0.01, 12, 160]} />
        <meshStandardMaterial
          color="#FFE7B5"
          emissive="#FFD700"
          emissiveIntensity={0.4}
          transparent
          opacity={0.6}
        />
      </mesh>
      {/* 12 zodiac markers on the outer ring */}
      {markers.map((i) => {
        const a = (i / 12) * Math.PI * 2;
        const x = Math.cos(a) * 2.2;
        const z = Math.sin(a) * 2.2;
        return (
          <mesh key={i} position={[x, 0, z]}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial
              color="#FFE7B5"
              emissive="#FFD700"
              emissiveIntensity={1.5}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/** Central glowing core. */
function CosmicCore() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      const s = 1 + Math.sin(t * 1.5) * 0.04;
      ref.current.scale.set(s, s, s);
    }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.35, 32, 32]} />
      <meshStandardMaterial
        color="#FFD700"
        emissive="#F7941D"
        emissiveIntensity={1.4}
        roughness={0.2}
      />
      <pointLight color="#F7B23A" intensity={2} distance={6} decay={2} />
    </mesh>
  );
}

export default function CosmicScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.8, 5.5], fov: 55 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.25} />
      <pointLight position={[5, 5, 5]} color="#F7B23A" intensity={0.8} />
      <pointLight position={[-5, -3, -5]} color="#8B4513" intensity={0.4} />

      <Stars
        radius={60}
        depth={50}
        count={4500}
        factor={4}
        saturation={0.4}
        fade
        speed={0.5}
      />

      <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.4}>
        <ZodiacRing />
      </Float>

      <CosmicCore />

      <OrbitingPlanet
        radiusX={3.2}
        radiusZ={2.5}
        speed={0.35}
        size={0.18}
        color="#F7941D"
        phase={0}
      />
      <OrbitingPlanet
        radiusX={2.8}
        radiusZ={3.4}
        speed={-0.22}
        size={0.13}
        color="#FFD700"
        phase={2}
        yOffset={0.4}
      />
      <OrbitingPlanet
        radiusX={3.8}
        radiusZ={3.0}
        speed={0.18}
        size={0.22}
        color="#B86A0B"
        phase={4}
        yOffset={-0.3}
      />
    </Canvas>
  );
}
