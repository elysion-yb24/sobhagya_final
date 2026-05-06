"use client";

import React, { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars, Float, Environment } from "@react-three/drei";
import ZodiacWheel3D from "./ZodiacWheel3D";
import CrystalOrb3D from "./CrystalOrb3D";

/**
 * Compact, contained 3D portal — designed to live inside a fixed-size circular frame.
 * Camera + composition tuned so wheel and orb stay centered with breathing room.
 */
export default function CosmicHero3D() {
  const [isMobile, setIsMobile] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mqM = window.matchMedia("(max-width: 768px)");
    const mqR = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setIsMobile(mqM.matches);
      setReduced(mqR.matches);
    };
    update();
    mqM.addEventListener("change", update);
    mqR.addEventListener("change", update);
    return () => {
      mqM.removeEventListener("change", update);
      mqR.removeEventListener("change", update);
    };
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0.2, 7.2], fov: 38 }}
      dpr={[1, isMobile ? 1.25 : 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} color="#FFD58A" />
      <directionalLight position={[-4, -2, -3]} intensity={0.4} color="#F7941D" />
      <pointLight position={[0, 0, 2]} intensity={0.7} color="#FFB347" />

      {/* Subtle starfield */}
      <Stars
        radius={50}
        depth={30}
        count={isMobile ? 800 : 2200}
        factor={3}
        saturation={0.5}
        fade
        speed={reduced ? 0 : 0.4}
      />

      {/* Zodiac wheel — slightly tilted, centered */}
      <Float
        speed={reduced ? 0 : 1.0}
        rotationIntensity={reduced ? 0 : 0.18}
        floatIntensity={reduced ? 0 : 0.3}
      >
        <ZodiacWheel3D radius={2.4} speed={reduced ? 0 : 0.05} />
      </Float>

      {/* Crystal orb sits in the center of the wheel, slightly behind */}
      <Float
        speed={reduced ? 0 : 1.4}
        rotationIntensity={reduced ? 0 : 0.3}
        floatIntensity={reduced ? 0 : 0.4}
      >
        <CrystalOrb3D position={[0, 0, 0]} size={0.85} cheap={isMobile} />
      </Float>

      <Environment preset="sunset" />
    </Canvas>
  );
}
