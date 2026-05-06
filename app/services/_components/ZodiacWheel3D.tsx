"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

const ZODIAC_GLYPHS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

interface Props {
  radius?: number;
  speed?: number;
}

export default function ZodiacWheel3D({ radius = 2.6, speed = 0.06 }: Props) {
  const group = useRef<THREE.Group>(null!);
  const inner = useRef<THREE.Group>(null!);

  const positions = useMemo(() => {
    return ZODIAC_GLYPHS.map((glyph, i) => {
      const a = (i / ZODIAC_GLYPHS.length) * Math.PI * 2;
      return {
        glyph,
        x: Math.cos(a) * radius,
        z: Math.sin(a) * radius,
        rotY: -a + Math.PI / 2,
      };
    });
  }, [radius]);

  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * speed;
    if (inner.current) inner.current.rotation.y -= dt * speed * 1.6;
  });

  return (
    <group rotation={[Math.PI / 2.6, 0, 0]}>
      <group ref={group}>
        {/* Outer gold ring */}
        <mesh>
          <torusGeometry args={[radius, 0.06, 24, 220]} />
          <meshStandardMaterial
            color="#E8A23A"
            metalness={1}
            roughness={0.18}
            emissive="#FF9C2A"
            emissiveIntensity={0.35}
          />
        </mesh>

        {/* Decorative thin ring */}
        <mesh>
          <torusGeometry args={[radius + 0.18, 0.012, 12, 220]} />
          <meshStandardMaterial
            color="#FFD58A"
            metalness={1}
            roughness={0.1}
            emissive="#FFB23A"
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* 12 small markers */}
        {positions.map((p, i) => (
          <mesh key={`m-${i}`} position={[p.x * 1.07, 0, p.z * 1.07]}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial
              color="#FFE7B5"
              metalness={1}
              roughness={0.15}
              emissive="#FFB23A"
              emissiveIntensity={0.6}
            />
          </mesh>
        ))}

        {/* Glyphs */}
        {positions.map((p, i) => (
          <Text
            key={`g-${i}`}
            position={[p.x * 0.86, 0, p.z * 0.86]}
            rotation={[-Math.PI / 2, 0, p.rotY]}
            fontSize={0.32}
            color="#FFE0A0"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="#7A4512"
          >
            {p.glyph}
          </Text>
        ))}
      </group>

      {/* Counter-rotating inner ring */}
      <group ref={inner}>
        <mesh>
          <torusGeometry args={[radius * 0.55, 0.025, 16, 160]} />
          <meshStandardMaterial
            color="#F7941D"
            metalness={1}
            roughness={0.2}
            emissive="#F7941D"
            emissiveIntensity={0.4}
          />
        </mesh>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const a = (i / 6) * Math.PI * 2;
          return (
            <mesh
              key={`spoke-${i}`}
              position={[Math.cos(a) * radius * 0.55, 0, Math.sin(a) * radius * 0.55]}
            >
              <boxGeometry args={[0.12, 0.02, 0.02]} />
              <meshStandardMaterial
                color="#FFD58A"
                metalness={1}
                roughness={0.15}
                emissive="#FFB23A"
                emissiveIntensity={0.6}
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}
