"use client";

import { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, PresentationControls, ContactShadows, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getOptimizedVideoUrl } from '../lib/videoOptimizer';

const DEFAULT_HERO_VIDEO = 'https://res.cloudinary.com/dpxpczyhh/video/upload/v1781972444/landscape__jupv1z.mp4';

function IpadModel({ hovered, videoUrl = DEFAULT_HERO_VIDEO, ...props }) {
  const { nodes, materials } = useGLTF('/ipad.glb');
  const groupRef = useRef();
  const [video, setVideo] = useState(null);
  const canvasRef = useRef(null);
  const textureRef = useRef(null);

  // Setup high-definition offscreen canvas with natural iPad screen aspect ratio (~1.406:1)
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1440;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    canvasRef.current = { canvas, ctx };

    const texture = new THREE.CanvasTexture(canvas);
    texture.flipY = false;
    texture.center.set(0.5, 0.5);
    texture.rotation = -Math.PI / 2;
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    textureRef.current = texture;

    return () => {
      texture.dispose();
    };
  }, []);

  useEffect(() => {
    const srcUrl = videoUrl || DEFAULT_HERO_VIDEO;
    const optimized = getOptimizedVideoUrl(srcUrl);
    const vid = document.createElement('video');
    vid.src = optimized;
    vid.crossOrigin = 'Anonymous';
    vid.loop = true;
    vid.muted = true;
    vid.playsInline = true;
    vid.play().catch(() => {});
    setVideo(vid);

    return () => {
      vid.pause();
      vid.removeAttribute('src');
      vid.load();
    };
  }, [videoUrl]);

  useEffect(() => {
    if (materials && textureRef.current) {
      const texture = textureRef.current;
      
      // Auto-detect the screen material and bind canvas texture
      Object.values(materials).forEach((mat) => {
        if (mat.map || mat.emissiveMap || mat.name.toLowerCase().includes('screen')) {
          mat.map = null;
          mat.emissiveMap = texture;
          mat.emissive = new THREE.Color('white');
          mat.emissiveIntensity = 1.0;
          mat.color = new THREE.Color('black');
          mat.toneMapped = false;
          mat.needsUpdate = true;
        }
        
        if (mat.name.toLowerCase().includes('glass') || mat.transparent) {
            mat.transparent = true;
            mat.opacity = 0.05;
            mat.needsUpdate = true;
        }
      });
    }
  }, [materials]);

  useFrame((state, delta) => {
    const targetRotationX = hovered ? -0.1 : 0;
    const targetRotationY = hovered ? 0.2 : 0;

    if (groupRef.current) {
      groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, targetRotationX, 5, delta);
      groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, targetRotationY, 5, delta);
    }

    // Render letterboxed video frame preserving original aspect ratio (16:9, etc.)
    if (video && video.readyState >= 2 && canvasRef.current && textureRef.current) {
      const { canvas, ctx } = canvasRef.current;
      const screenAspect = canvas.width / canvas.height;
      const videoWidth = video.videoWidth || 1920;
      const videoHeight = video.videoHeight || 1080;
      const videoAspect = videoWidth / videoHeight;

      let drawW, drawH, drawX, drawY;
      if (videoAspect > screenAspect) {
        // Video is wider than screen (e.g. 16:9 on ~4:3 screen) -> black bars on top and bottom
        drawW = canvas.width;
        drawH = canvas.width / videoAspect;
        drawX = 0;
        drawY = (canvas.height - drawH) / 2;
      } else {
        // Video is taller -> black bars on left and right
        drawH = canvas.height;
        drawW = canvas.height * videoAspect;
        drawX = (canvas.width - drawW) / 2;
        drawY = 0;
      }

      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, drawX, drawY, drawW, drawH);
      textureRef.current.needsUpdate = true;
    }
  });

  const handleTogglePlay = (e) => {
    e.stopPropagation();
    if (video) {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    }
  };

  return (
    <group {...props} dispose={null} ref={groupRef} onClick={handleTogglePlay} onPointerDown={(e) => e.target.setPointerCapture?.(e.pointerId)} onPointerUp={(e) => e.target.releasePointerCapture?.(e.pointerId)}>
      <group rotation={[Math.PI / 2, 0, 0]}>
        <mesh geometry={nodes.abCKdjTFXRDygDg.geometry} material={materials.JGhcZOBeEEFTHKn} position={[0, 0.004, -0.002]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.AbYqbWxJIHjOZby.geometry} material={materials.EpOuwNoAjZWsZKD} position={[0, 0.003, -0.103]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.alyIYLaJSyxzdjo.geometry} material={materials.kUWkRDVotcMnHsa} position={[-0.129, -0.002, -0.081]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.AuxUZFpIdyYVcpo.geometry} material={materials.HlUmGTGdgbnvPsa} position={[0, 0.004, 0]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.aYGfoaryUOhgTnS.geometry} material={materials.zCUrKvqTeumKwRd} position={[0.135, 0.001, 0]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.BhdBOkQlZaHDoTI.geometry} material={materials.zuOGnslJhlJpvBY} position={[-0.126, -0.003, -0.094]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.BmDZUOLgRVavGIP.geometry} material={materials.INAgtdCGscvtqIb} position={[-0.009, 0.003, -0.103]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.CvToSjLIImJXFhl.geometry} material={materials.zCUrKvqTeumKwRd} position={[0.138, 0.001, 0]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.eYyEVqzuBtjteIL.geometry} material={materials.EpOuwNoAjZWsZKD} position={[0.136, 0.001, 0]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.fbKTxlqodhqsaMX.geometry} material={materials.ObnnNhDMEKJGYGc} position={[0.009, 0.004, -0.103]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.FiSxQFtcGwcRlhx.geometry} material={materials.EpOuwNoAjZWsZKD} position={[-0.126, -0.003, -0.094]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.forEYBSDPZlTPjB.geometry} material={materials.kUWkRDVotcMnHsa} position={[-0.114, -0.002, -0.094]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.hmueEDnpjMcGMDz.geometry} material={materials.INAgtdCGscvtqIb} position={[-0.126, -0.002, -0.094]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.hoqhCUbvqDNHqRQ.geometry} material={materials.zCUrKvqTeumKwRd} position={[0.137, 0.001, 0]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.hpmcIBmvWpyGHCe.geometry} material={materials.LmsMoHQNffKUBTk} position={[0.111, -0.001, 0]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.iBeJOrSUxnhIKau.geometry} material={materials.VHiYeyhfwJCxecr} position={[0.128, -0.001, 0]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.IilirTaurautXUM.geometry} material={materials.GGmNvstEGFjWJgL} position={[-0.126, -0.003, -0.094]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.JGCbxCvPCDUDNDn.geometry} material={materials.ObnnNhDMEKJGYGc} position={[0, 0.004, -0.103]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.jgPRgPdpKSiOXLh.geometry} material={materials.EpOuwNoAjZWsZKD} position={[-0.015, 0.004, -0.03]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.jSATzURBcTcYgwk.geometry} material={materials.GfvpWvxgaKYWFyg} position={[0.137, 0.001, 0]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.KAUAFnASbDDqbjr.geometry} material={materials.GGmNvstEGFjWJgL} position={[-0.009, 0.003, -0.103]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.KEbVxBONOCIIMlV.geometry} material={materials.sbwzFjTAKUIwznL} position={[-0.12, -0.002, -0.081]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.KIKPIQftEQLSIGR.geometry} material={materials.ObnnNhDMEKJGYGc} position={[-0.011, 0.004, -0.042]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.LfbvDayYmwCLGgH.geometry} material={materials.eUutxxUdCpSsNmn} position={[-0.005, 0.004, -0.103]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.LiBWsJueARwHeyy.geometry} material={materials.EpOuwNoAjZWsZKD} position={[-0.12, -0.002, -0.088]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.lZqTYwxpqlcavHT.geometry} material={materials.GfvpWvxgaKYWFyg} position={[-0.126, -0.003, -0.094]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.McvRagXjmFhgQdO.geometry} material={materials.SAojaDrNKuRjUfl} position={[-0.014, 0.001, -0.021]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.MSiFPAFArNdbWRR.geometry} material={materials.ALwGWlgsdcFeIUW} position={[0.136, 0.001, 0]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.nTwZIAwkagNFGnY.geometry} material={materials.bMbvkgDjFaRXBwT} position={[-0.131, 0, 0.001]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.nvUUcAsUXWUkLSN.geometry} material={materials.WmIWTCLERDcqxSX} position={[0.128, -0.001, 0]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.NyGNnOKIVWPDXax.geometry} material={materials.ALwGWlgsdcFeIUW} position={[-0.12, -0.002, -0.081]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.OGSRAhdSqtkjQMb.geometry} material={materials.IHWKjkrmiwbOFTH} position={[0, 0.001, -0.002]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.qpCZMHZiiKuzTcT.geometry} material={materials.IMOWJWdEXKJRkmm} position={[-0.063, 0.001, -0.108]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.rFBGASmDBnpjGSc.geometry} material={materials.zuOGnslJhlJpvBY} position={[-0.009, 0.004, -0.103]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.rQTOHXsvleKeWwr.geometry} material={materials.zhkMyvjxXbwgJAI} position={[-0.126, -0.002, -0.094]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.RTKWTMHQzhACFeV.geometry} material={materials.bMbvkgDjFaRXBwT} position={[0.128, -0.001, 0]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.rYYeUMPiMwFRHIG.geometry} material={materials.EpOuwNoAjZWsZKD} position={[-0.126, 0.002, -0.094]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.TIaOxogwgmXIHqv.geometry} material={materials.zCUrKvqTeumKwRd} position={[0.134, 0.001, 0]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.TvCCuUJvayYeyRp.geometry} material={materials.bMbvkgDjFaRXBwT} position={[0, 0.001, -0.108]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.uuuokMkIpLSMAUC.geometry} material={materials.GfvpWvxgaKYWFyg} position={[0.137, 0.001, 0]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.UVpecKJGwemnicG.geometry} material={materials.INAgtdCGscvtqIb} position={[-0.126, -0.002, -0.094]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.VDrxmwCKuMJbOrN.geometry} material={materials.GfvpWvxgaKYWFyg} position={[0.136, 0.001, 0]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.viFxqLrOsGXiEnE.geometry} material={materials.zhkMyvjxXbwgJAI} position={[-0.009, 0.003, -0.103]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.wTXUGlwJUSOfxZY.geometry} material={materials.zCUrKvqTeumKwRd} position={[0.137, 0.001, 0]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.WWrgLTyPTAXTjUV.geometry} material={materials.euSZRXUQbKsAaPS} position={[-0.025, 0, -0.022]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.xfkAjFnAOwFauIm.geometry} material={materials.IyNcZeQAXJlnfTb} position={[-0.003, -0.001, 0.001]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.XtUsEXbIIYkfVAu.geometry} material={materials.xUNvBRVUcBVKMpV} position={[0.128, -0.001, 0]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.xyobRhOPEwyWxaY.geometry} material={materials.eUutxxUdCpSsNmn} position={[-0.136, 0.004, 0]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.yfRfuoEFNIcZGev.geometry} material={materials.pZEJEUWlAIlYurO} position={[-0.12, -0.003, -0.081]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.yJwCklIOhimiTwo.geometry} material={materials.GfvpWvxgaKYWFyg} position={[0.134, 0.001, 0]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.YNxUkobHtiPdNCm.geometry} material={materials.EpOuwNoAjZWsZKD} position={[-0.004, 0.001, -0.014]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.ZqiJcXiEeUXUJtw.geometry} material={materials.zhkMyvjxXbwgJAI} position={[-0.126, -0.002, -0.094]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
        <mesh geometry={nodes.zzxkxqJBrKgpwhU.geometry} material={materials.RRggASOdsjdJMgp} position={[-0.113, -0.003, -0.081]} rotation={[Math.PI / 6, 0, Math.PI / 2]} scale={0.01} />
      </group>
    </group>
  );
}

useGLTF.preload('/ipad.glb');

function Loader() {
  return (
    <Html center>
      <div style={{ color: '#000', fontWeight: '500' }}>Loading iPad 3D...</div>
    </Html>
  );
}

function ResponsiveIpadScene({ hovered, heroVideoUrl }) {
  const { viewport } = useThree();

  // Dynamic Scale & Positioning calculation:
  // Base scale is 2.5 on high-res desktop monitors.
  // The iPad model geometry in 3D units has width ~0.28 and height ~0.20 (at scale 1).
  // We ensure the iPad model never exceeds 82% of viewport width and 68% of viewport height (leaving space for laurel badge below).
  const maxScaleFromWidth = (viewport.width * 0.82) / 0.28;
  const maxScaleFromHeight = (viewport.height * 0.68) / 0.20;
  const dynamicScale = Math.min(2.5, maxScaleFromWidth, maxScaleFromHeight);

  // Position the iPad slightly above the center (positive Y in Three.js is UP)
  // so the bottom area remains clean for the laurel wreath award badge
  const yOffset = viewport.height * 0.035;
  const shadowY = -0.32 * (dynamicScale / 2.5) + yOffset;

  return (
    <>
      <PresentationControls 
        global 
        rotation={[0, 0, 0]} 
        polar={[-0.35, 0.2]} 
        azimuth={[-0.85, 0.75]} 
        config={{ mass: 2, tension: 400 }} 
        snap={{ mass: 4, tension: 400 }}
      >
        <IpadModel 
          hovered={hovered} 
          videoUrl={heroVideoUrl} 
          scale={dynamicScale} 
          position={[0, yOffset, 0]} 
          rotation={[Math.PI / 1, 3, 0]} 
        />
      </PresentationControls>
      
      <ContactShadows 
        position={[0, shadowY, 0]} 
        opacity={0.4} 
        scale={6 * (dynamicScale / 2.5)} 
        blur={2.8} 
        far={3.5} 
      />
      <Environment preset="city" />
    </>
  );
}

export default function Ipad3D() {
  const [hovered, setHovered] = useState(false);
  const [heroVideoUrl, setHeroVideoUrl] = useState(DEFAULT_HERO_VIDEO);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'hero'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().videoUrl) {
        setHeroVideoUrl(docSnap.data().videoUrl);
      }
    }, (error) => {
      console.warn("Could not load hero video from settings:", error);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div 
      className="device-mockup glass" 
      style={{ width: '100%', height: '100%', border: 'none', background: 'transparent', boxShadow: 'none' }}
      onPointerOver={() => setHovered(true)} 
      onPointerOut={() => setHovered(false)}
    >
      <Canvas 
        camera={{ position: [0, 0, 1.2], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} />
        <pointLight position={[-10, -10, -10]} intensity={1} />
        
        <Suspense fallback={<Loader />}>
          <ResponsiveIpadScene hovered={hovered} heroVideoUrl={heroVideoUrl} />
        </Suspense>
      </Canvas>
    </div>
  );
}
