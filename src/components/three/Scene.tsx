import { Canvas, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { 
  EffectComposer, 
  RenderPass, 
  BloomEffect, 
  NoiseEffect, 
  ChromaticAberrationEffect, 
  DepthOfFieldEffect 
} from 'postprocessing';
import { usePerformanceTier } from '../../hooks/usePerformanceTier';
import { themeConfig } from '../../theme/theme.config';

extend({ 
  EffectComposer, 
  RenderPass, 
  BloomEffect, 
  NoiseEffect, 
  ChromaticAberrationEffect, 
  DepthOfFieldEffect 
});

interface SceneProps {
  children: React.ReactNode;
  camera?: { position: THREE.Vector3Tuple; fov?: number };
}

export function Scene({ children, camera }: SceneProps) {
  const { tier, config } = usePerformanceTier();
  
  const cameraPosition = camera?.position || [0, 0, 15] as THREE.Vector3Tuple;
  const cameraFov = camera?.fov || 50;

  return (
    <Canvas
      camera={{ position: cameraPosition, fov: cameraFov }}
      gl={{ 
        antialias: tier !== 'LITE', 
        alpha: true, 
        powerPreference: 'high-performance',
        preserveDrawingBuffer: false,
      }}
      dpr={Math.min(config.dpr, window.devicePixelRatio)}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
      onCreated={({ gl }) => {
        gl.setPixelRatio(Math.min(config.dpr, window.devicePixelRatio));
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1;
      }}
    >
      <color attach="background" args={[themeConfig.palette.bg]} />
      <fog attach="fog" args={[themeConfig.palette.bg, 10, 100]} />
      
      {children}
      
      {config.postProcessing.length > 0 && (
        <effectComposer multisampling={tier === 'ULTRA'}>
          <renderPass />
          {config.postProcessing.includes('bloom') && (
            <bloomEffect
              intensity={tier === 'ULTRA' ? 1.2 : 0.8}
              mipmapBlur={true}
              luminanceThreshold={0.8}
              luminanceSmoothing={0.025}
            />
          )}
          {config.postProcessing.includes('noise') && (
            <noiseEffect opacity={0.02} />
          )}
          {config.postProcessing.includes('chromaticAberration') && (
            <chromaticAberrationEffect offset={[0.002, 0.002]} />
          )}
          {config.postProcessing.includes('depthOfField') && (
            <depthOfFieldEffect
              focusDistance={10}
              focalLength={0.05}
              bokehScale={2}
              height={480}
            />
          )}
        </effectComposer>
      )}
    </Canvas>
  );
}