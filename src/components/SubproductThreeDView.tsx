import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface SubproductThreeDViewProps {
  categoryKey: string;
  optionValue: string;
}

export const SubproductThreeDView: React.FC<SubproductThreeDViewProps> = ({ categoryKey, optionValue }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- SETUP SCENE, CAMERA & RENDERER ---
    const scene = new THREE.Scene();
    
    const width = containerRef.current.clientWidth || 300;
    const height = containerRef.current.clientHeight || 300;
    
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- LIGHTS ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff8ee, 1.5);
    keyLight.position.set(3, 4, 3);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xa47e3c, 0.45);
    fillLight.position.set(-3, -2, -1);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
    rimLight.position.set(-3, 3, -3);
    scene.add(rimLight);

    const topLight = new THREE.SpotLight(0xffffff, 0.8, 10, Math.PI / 6, 0.5, 1);
    topLight.position.set(0, 4, 0);
    scene.add(topLight);

    // --- CONTROLS ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1.5;
    controls.maxDistance = 6.0;
    controls.enablePan = false;

    // --- GROUND SHADOW RECEIVER PLANE ---
    const groundGeom = new THREE.PlaneGeometry(10, 10);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.15 });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.position.y = -0.9;
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // --- MODEL CONTAINER ---
    const componentGroup = new THREE.Group();
    scene.add(componentGroup);

    // --- PROCEDURAL TEXTURES (Wood grains etc.) ---
    const createWoodTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Soft beige base
        ctx.fillStyle = '#E5D3B3';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add random wood grain line layers
        ctx.strokeStyle = '#B38B6D';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < canvas.height; i += 4) {
          ctx.beginPath();
          const offset = Math.sin(i * 0.05) * 8 + Math.random() * 2;
          ctx.moveTo(0, i);
          ctx.bezierCurveTo(64, i + offset, 192, i - offset, 256, i);
          ctx.stroke();
        }
      }
      return new THREE.CanvasTexture(canvas);
    };

    // --- BUILD ISOLATED GEOMETRIES ---
    const buildComponent = () => {
      // Clear container
      while (componentGroup.children.length > 0) {
        componentGroup.remove(componentGroup.children[0]);
      }

      // Materials Matrix
      const goldMat = new THREE.MeshPhysicalMaterial({
        color: 0xd4af37,
        metalness: 0.65,
        roughness: 0.24,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05
      });

      const silverMat = new THREE.MeshPhysicalMaterial({
        color: 0xdddddd,
        metalness: 0.62,
        roughness: 0.24,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05
      });

      const glossyBlackMat = new THREE.MeshPhysicalMaterial({
        color: 0x111111,
        metalness: 0.2,
        roughness: 0.1,
        clearcoat: 1.0
      });

      const crystalGlassMat = new THREE.MeshPhysicalMaterial({
        color: 0xf5f8fa,
        transparent: true,
        opacity: 0.45,
        roughness: 0.08,
        metalness: 0.1,
        transmission: 0.88,
        ior: 1.52,
        thickness: 0.8,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02
      });

      const satinAmberMat = new THREE.MeshPhysicalMaterial({
        color: 0xc17a3a,
        transparent: true,
        opacity: 0.55,
        roughness: 0.18,
        metalness: 0.1,
        transmission: 0.8,
        ior: 1.48,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05
      });

      const satinVioletMat = new THREE.MeshPhysicalMaterial({
        color: 0x5e207b,
        transparent: true,
        opacity: 0.55,
        roughness: 0.15,
        metalness: 0.15,
        transmission: 0.78,
        ior: 1.5,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05
      });

      // 1. FLASCHENFORM (Bottle Shape in Isolation)
      if (categoryKey === 'flaschenform') {
        let geom: THREE.BufferGeometry;
        
        if (optionValue === 'rund') {
          geom = new THREE.CylinderGeometry(0.55, 0.55, 1.2, 32);
        } else if (optionValue === 'oval') {
          geom = new THREE.CylinderGeometry(0.55, 0.55, 1.2, 32);
          geom.scale(1.3, 1, 0.7);
        } else if (optionValue === 'antelope') {
          // Spline-curved Violet Antelope shape
          const baseGeom = new THREE.CylinderGeometry(0.8, 0.8, 1.2, 64, 32);
          const pos = baseGeom.attributes.position;
          for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const z = pos.getZ(i);
            const u = (y / 1.2) + 0.5; // 0 to 1
            
            let wFactor = 1.0;
            let dFactor = 1.0;
            
            if (u < 0.35) {
              const t = u / 0.35;
              wFactor = 0.5 + 0.5 * (2 * t - t * t);
              dFactor = 0.65 + 0.35 * (2 * t - t * t);
            } else {
              const t = (u - 0.35) / 0.65;
              wFactor = 1.0 - 0.32 * (t * t);
              dFactor = 1.0 - 0.24 * (t * t);
            }
            
            pos.setX(i, x * wFactor * 1.25);
            pos.setZ(i, z * dFactor * 0.7);
          }
          baseGeom.computeVertexNormals();
          geom = baseGeom;
        } else {
          // eckig / classic box
          geom = new THREE.BoxGeometry(0.8, 1.2, 0.8);
        }

        // Render Flakon body + Neck thread in isolation
        const bottleMesh = new THREE.Mesh(geom, crystalGlassMat);
        bottleMesh.castShadow = true;
        bottleMesh.receiveShadow = true;
        componentGroup.add(bottleMesh);

        // Add a detailed small silver neck ring on top
        const neckGeom = new THREE.CylinderGeometry(0.2, 0.2, 0.25, 24);
        const neckMesh = new THREE.Mesh(neckGeom, silverMat);
        neckMesh.position.y = 0.725;
        componentGroup.add(neckMesh);
      } 
      
      // 2. KAPPE (Caps in Isolation)
      else if (categoryKey === 'kappe') {
        if (optionValue === 'zamak') {
          // Heavy, rich gold chamfered metal cap
          const capGeom = new THREE.CylinderGeometry(0.48, 0.48, 0.5, 32);
          const mesh = new THREE.Mesh(capGeom, goldMat);
          mesh.castShadow = true;
          componentGroup.add(mesh);
          
          // Small interior recess
          const ringGeom = new THREE.CylinderGeometry(0.38, 0.38, 0.05, 32);
          const ring = new THREE.Mesh(ringGeom, glossyBlackMat);
          ring.position.y = -0.25;
          componentGroup.add(ring);
        } else if (optionValue === 'holz') {
          // Beautiful Ash wood grain cylinder
          const woodTex = createWoodTexture();
          const woodMat = new THREE.MeshStandardMaterial({
            map: woodTex,
            roughness: 0.5,
            metalness: 0.05
          });
          const capGeom = new THREE.CylinderGeometry(0.5, 0.5, 0.65, 32);
          const mesh = new THREE.Mesh(capGeom, woodMat);
          mesh.castShadow = true;
          componentGroup.add(mesh);
        } else if (optionValue === 'surlyn') {
          // Crystalline cube transparent surlyn cap
          const capGeom = new THREE.BoxGeometry(0.8, 0.8, 0.8);
          const mesh = new THREE.Mesh(capGeom, new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.15,
            roughness: 0.02,
            metalness: 0.15,
            transmission: 0.95,
            ior: 1.8, // high diamond index
            thickness: 0.6
          }));
          mesh.castShadow = true;
          componentGroup.add(mesh);
          
          // Inner core representation
          const coreGeom = new THREE.CylinderGeometry(0.24, 0.24, 0.45, 16);
          const core = new THREE.Mesh(coreGeom, goldMat);
          componentGroup.add(core);
        } else if (optionValue === 'abs') {
          // Glossy piano-black ABS cap
          const capGeom = new THREE.CylinderGeometry(0.45, 0.45, 0.55, 32);
          const mesh = new THREE.Mesh(capGeom, glossyBlackMat);
          mesh.castShadow = true;
          componentGroup.add(mesh);
        } else if (optionValue === 'aluminium') {
          // Brushed gold aluminium cap
          const capGeom = new THREE.CylinderGeometry(0.46, 0.46, 0.52, 32);
          const mesh = new THREE.Mesh(capGeom, new THREE.MeshPhysicalMaterial({
            color: 0xe5c158,
            metalness: 0.55,
            roughness: 0.35
          }));
          mesh.castShadow = true;
          componentGroup.add(mesh);
        } else {
          // Eco PP - simple white/grey matte polymer cap
          const capGeom = new THREE.CylinderGeometry(0.45, 0.45, 0.4, 32);
          const mesh = new THREE.Mesh(capGeom, new THREE.MeshStandardMaterial({
            color: 0xf5f5f5,
            roughness: 0.35
          }));
          mesh.castShadow = true;
          componentGroup.add(mesh);
        }
      } 
      
      // 3. PUMPE (Atomizers in Isolation)
      else if (categoryKey === 'pumpe') {
        // COLLAR cylinder base
        const collarGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.38, 32);
        const collarMat = optionValue === 'schnapp' ? glossyBlackMat : silverMat;
        const collar = new THREE.Mesh(collarGeom, collarMat);
        collar.castShadow = true;
        componentGroup.add(collar);
        
        // Actuator pump head nozzle
        const headGeom = new THREE.CylinderGeometry(0.18, 0.18, 0.35, 24);
        const head = new THREE.Mesh(headGeom, optionValue === 'schnapp' ? glossyBlackMat : silverMat);
        head.position.y = 0.28;
        head.castShadow = true;
        componentGroup.add(head);

        // Spray nozzle tiny opening
        const sprayGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.06, 8);
        const spray = new THREE.Mesh(sprayGeom, goldMat);
        spray.rotation.x = Math.PI / 2;
        spray.position.set(0, 0.33, 0.16);
        componentGroup.add(spray);
      } 
      
      // 4. FLASCHENFARBE (Rotating Glass color sphere/jar)
      else if (categoryKey === 'flaschenfarbe') {
        const bottleGeom = new THREE.CylinderGeometry(0.5, 0.5, 0.9, 32);
        let selectedMat = crystalGlassMat;
        if (optionValue === 'schwarz') selectedMat = glossyBlackMat;
        if (optionValue === 'amber') selectedMat = satinAmberMat;
        if (optionValue === 'violett') selectedMat = satinVioletMat;

        const mesh = new THREE.Mesh(bottleGeom, selectedMat);
        mesh.castShadow = true;
        componentGroup.add(mesh);
      }
      
      // 4b. FLASCHENVOLUMEN (Bottles representing volumes)
      else if (categoryKey === 'flaschenvolumen') {
        let size = 1.0;
        if (optionValue === '100ml') size = 1.3;
        else if (optionValue === '75ml') size = 1.15;
        else if (optionValue === '50ml') size = 1.0;
        else if (optionValue === '30ml') size = 0.85;
        else if (optionValue === '5ml') size = 0.55;

        // Render a nice cylinder bottle representing this volume
        const geom = new THREE.CylinderGeometry(0.38, 0.38, 0.9 * size, 32);
        const bottleMesh = new THREE.Mesh(geom, crystalGlassMat);
        bottleMesh.castShadow = true;
        bottleMesh.receiveShadow = true;
        componentGroup.add(bottleMesh);

        // Add a detailed small silver neck ring on top
        const neckGeom = new THREE.CylinderGeometry(0.14, 0.14, 0.22, 24);
        const neckMesh = new THREE.Mesh(neckGeom, silverMat);
        neckMesh.position.y = 0.45 * size + 0.11;
        componentGroup.add(neckMesh);
      }

      // 4c. KOSMETIKSTIFT CATEGORIES (Body, Tip, Materials)
      else if (categoryKey === 'farbe' || categoryKey === 'material' || categoryKey === 'spitze') {
        if (categoryKey === 'farbe') {
          // Render pen body cylinder with chosen color
          let col = 0x111111;
          if (optionValue === 'schwarz') col = 0x111111;
          else if (optionValue === 'gold') col = 0xd4af37;
          else if (optionValue === 'silber') col = 0xcccccc;
          else if (optionValue === 'roségold') col = 0xb76e79;
          
          const bodyGeom = new THREE.CylinderGeometry(0.18, 0.18, 1.4, 24);
          const bodyMat = new THREE.MeshPhysicalMaterial({ color: col, metalness: 0.58, roughness: 0.25, clearcoat: 1.0 });
          const mesh = new THREE.Mesh(bodyGeom, bodyMat);
          mesh.castShadow = true;
          componentGroup.add(mesh);
        } else if (categoryKey === 'material') {
          // Render pen sleeve with distinct texture (wood, high-gloss lacquer, metal)
          let sleeveMat: THREE.Material = goldMat;
          if (optionValue === 'holz') {
            const woodTex = createWoodTexture();
            sleeveMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.45 });
          } else if (optionValue === 'lack') {
            sleeveMat = glossyBlackMat;
          } else if (optionValue === 'metall') {
            sleeveMat = silverMat;
          }
          const sleeveGeom = new THREE.CylinderGeometry(0.19, 0.19, 1.2, 24);
          const mesh = new THREE.Mesh(sleeveGeom, sleeveMat);
          mesh.castShadow = true;
          componentGroup.add(mesh);
        } else if (categoryKey === 'spitze') {
          // Render a detailed cosmetics precision pen tip
          const holderGeom = new THREE.CylinderGeometry(0.15, 0.15, 0.4, 24);
          const holder = new THREE.Mesh(holderGeom, silverMat);
          holder.position.y = -0.2;
          componentGroup.add(holder);

          let tipColor = 0x3a2118; // soft brown
          if (optionValue === 'fein') tipColor = 0x111111;
          else if (optionValue === 'breit') tipColor = 0x7c3f3f;

          const tipGeom = new THREE.ConeGeometry(0.08, 0.35, 16);
          const tipMat = new THREE.MeshStandardMaterial({ color: tipColor, roughness: 0.8 });
          const tip = new THREE.Mesh(tipGeom, tipMat);
          tip.position.y = 0.155;
          tip.castShadow = true;
          componentGroup.add(tip);
        }
      }
      
      // 5. DEFAULT: Volumina / Veredelung (Generic luxury cylinder/tablet)
      else {
        const plateGeom = new THREE.BoxGeometry(0.9, 0.9, 0.15);
        let material = goldMat;
        
        if (optionValue === 'satinierung') material = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, roughness: 0.6, metalness: 0.1 });
        if (optionValue === 'siebdruck') material = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.2, clearcoat: 1.0 });

        const mesh = new THREE.Mesh(plateGeom, material);
        mesh.castShadow = true;
        componentGroup.add(mesh);
      }
    };

    buildComponent();

    // --- ANIMATION RENDERING LOOP ---
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      
      // Slow elegant auto-rotation
      componentGroup.rotation.y += 0.0055;
      
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Force a resize check after a short delay to account for modal opening transitions
    const forceResizeTimeout = setTimeout(() => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth || 300;
        const h = containerRef.current.clientHeight || 300;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    }, 150);

    // --- RESPONSIVE RESIZING WITH RESIZEOBSERVER ---
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width || containerRef.current?.clientWidth || 300;
        const h = entry.contentRect.height || containerRef.current?.clientHeight || 300;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // --- CLEANUP ---
    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(forceResizeTimeout);
      resizeObserver.disconnect();
      if (containerRef.current && renderer.domElement) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        containerRef.current.removeChild(renderer.domElement);
      }
      scene.clear();
      renderer.dispose();
    };
  }, [categoryKey, optionValue]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[300px] flex items-center justify-center relative cursor-grab active:cursor-grabbing select-none"
    />
  );
};
