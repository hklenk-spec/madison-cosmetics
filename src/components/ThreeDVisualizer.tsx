import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface ThreeDVisualizerProps {
  category: 'kosmetikstift' | 'duefte';
  config: Record<string, any>;
  onPartClick?: (partKey: string) => void;
  exploded?: boolean;
  autoRotate?: boolean;
}

export const ThreeDVisualizer: React.FC<ThreeDVisualizerProps> = ({
  category,
  config,
  onPartClick,
  exploded = false,
  autoRotate = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

  const explodedRef = useRef(exploded);
  useEffect(() => {
    explodedRef.current = exploded;
  }, [exploded]);

  const autoRotateRef = useRef(autoRotate);
  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;

    // Dimensions
    let width = container.clientWidth || 400;
    let height = container.clientHeight || 320;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, category === 'kosmetikstift' ? 0 : 0.5, category === 'kosmetikstift' ? 6 : 5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.1; // Limit under-table view
    controls.minDistance = 2.5;
    controls.maxDistance = 8;
    controls.enablePan = false;
    controls.autoRotate = autoRotateRef.current;
    controls.autoRotateSpeed = 2.0;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Warm key light
    const keyLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    // Cool fill light from left/back
    const fillLight = new THREE.DirectionalLight(0xe6f0ff, 0.7);
    fillLight.position.set(-6, 3, -2);
    scene.add(fillLight);

    // Gold highlights reflection light
    const goldHighlightLight = new THREE.PointLight(0xd4af37, 1.0, 10);
    goldHighlightLight.position.set(2, 1, 3);
    scene.add(goldHighlightLight);

    // Soft rim light
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
    rimLight.position.set(0, -3, -5);
    scene.add(rimLight);

    // Luxury Studio Ground Reflection Disk
    const floorGeo = new THREE.RingGeometry(0, 1.8, 64);
    const floorMat = new THREE.MeshPhysicalMaterial({
      color: 0xFAF9F6,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.8,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = category === 'kosmetikstift' ? -1.8 : -1.2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Master Group for configuration models
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    // --- Dynamic Textures Generator (Labels) ---
    // --- Dynamic Textures Generator (Labels & Screen Prints & Foil Stamping) ---
    const createLabelTexture = (
      titleText: string,
      subtitleText: string,
      isSiebdruck: boolean,
      printColor: 'schwarz' | 'weiss' | 'gold',
      isHeissfolie: boolean,
      foilColor: 'gold' | 'silber' | 'rose'
    ) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        if (isSiebdruck) {
          // Transparent background for direct screen printing
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Print color selection
          let hexColor = '#111111'; // schwarz
          if (printColor === 'weiss') hexColor = '#FFFFFF';
          else if (printColor === 'gold') hexColor = '#D4AF37'; // gold
          
          ctx.strokeStyle = hexColor;
          ctx.fillStyle = hexColor;
          
          // Border
          ctx.lineWidth = 4;
          ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
          
          // Inner thin border
          ctx.lineWidth = 1;
          ctx.strokeRect(28, 28, canvas.width - 56, canvas.height - 56);
          
          // Text settings
          ctx.textAlign = 'center';
          ctx.font = 'bold 36px serif';
          ctx.letterSpacing = '6px';
          ctx.fillText(titleText.toUpperCase(), canvas.width / 2, 110);
          
          ctx.font = '22px monospace';
          ctx.letterSpacing = '4px';
          ctx.fillText(subtitleText.toUpperCase(), canvas.width / 2, 175);
        } else if (isHeissfolie) {
          // Luxury paper background
          ctx.fillStyle = '#FAF9F6';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Gradient for hot foil stamp
          let foilGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          if (foilColor === 'silber') {
            foilGrad.addColorStop(0, '#E8E8E8');
            foilGrad.addColorStop(0.25, '#FFFFFF');
            foilGrad.addColorStop(0.5, '#B0B0B0');
            foilGrad.addColorStop(0.75, '#FFFFFF');
            foilGrad.addColorStop(1, '#8C8C8C');
          } else if (foilColor === 'rose') {
            foilGrad.addColorStop(0, '#E5A493');
            foilGrad.addColorStop(0.3, '#FFD3C4');
            foilGrad.addColorStop(0.6, '#B27666');
            foilGrad.addColorStop(0.8, '#FFD3C4');
            foilGrad.addColorStop(1, '#8E5244');
          } else {
            // Gold foil
            foilGrad.addColorStop(0, '#CF9E3A');
            foilGrad.addColorStop(0.3, '#FFF3A8');
            foilGrad.addColorStop(0.5, '#A47E3C');
            foilGrad.addColorStop(0.8, '#FFF3A8');
            foilGrad.addColorStop(1, '#805C15');
          }
          
          ctx.strokeStyle = foilGrad;
          ctx.fillStyle = foilGrad;
          
          // Outer thick border
          ctx.lineWidth = 6;
          ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);
          
          // Inner thin border
          ctx.lineWidth = 1.5;
          ctx.strokeRect(25, 25, canvas.width - 50, canvas.height - 50);
          
          // Text settings
          ctx.textAlign = 'center';
          ctx.font = 'bold 36px serif';
          ctx.letterSpacing = '6px';
          ctx.fillText(titleText.toUpperCase(), canvas.width / 2, 110);
          
          ctx.font = '22px monospace';
          ctx.letterSpacing = '4px';
          ctx.fillText(subtitleText.toUpperCase(), canvas.width / 2, 175);
        } else {
          // Standard label
          ctx.fillStyle = '#FAF9F6';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Border
          ctx.strokeStyle = '#A47E3C';
          ctx.lineWidth = 6;
          ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);
          
          // Inner thin border
          ctx.strokeStyle = '#A47E3C';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(25, 25, canvas.width - 50, canvas.height - 50);
  
          // Text settings
          ctx.textAlign = 'center';
          ctx.fillStyle = '#111111';
          ctx.font = 'bold 36px serif';
          ctx.letterSpacing = '6px';
          ctx.fillText(titleText.toUpperCase(), canvas.width / 2, 110);
  
          ctx.fillStyle = '#A47E3C';
          ctx.font = '22px monospace';
          ctx.letterSpacing = '4px';
          ctx.fillText(subtitleText.toUpperCase(), canvas.width / 2, 175);
        }
      }
      const texture = new THREE.CanvasTexture(canvas);
      return texture;
    };

    // --- MODEL BUILDERS ---
    const buildModel = () => {
      // Clear previous meshes
      while (modelGroup.children.length > 0) {
        modelGroup.remove(modelGroup.children[0]);
      }

      const goldMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xd4af37,
        metalness: 0.65,
        roughness: 0.25,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
      });

      const silverMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xdddddd,
        metalness: 0.62,
        roughness: 0.25,
        clearcoat: 1.0
      });

      const darkMetalMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x222222,
        metalness: 0.55,
        roughness: 0.32
      });

      if (category === 'duefte') {
        // ------------------ FRAGRANCE BOTTLE 3D ------------------
        const volume = config.flaschenvolumen || '50ml';
        const shape = config.flaschenform || 'eckig';
        const colorType = config.flaschenfarbe || 'klar';
        const finish = config.flaschenveredelung || 'siebdruck';
        const capSelection = config.kappe || 'pp';
        const fragranceName = config.duft || 'MAISON LUXE';

        // Scale factor based on volume
        let scale = 1.0;
        if (volume === '100ml') scale = 1.25;
        if (volume === '75ml') scale = 1.15;
        if (volume === '50ml') scale = 1.0;
        if (volume === '30ml') scale = 0.85;
        if (volume === '5ml') scale = 0.55;

        // 1. Bottle Body Geometry
        let bodyGeo: THREE.BufferGeometry;
        const bodyHeight = 1.6 * scale;
        const bodyRadius = 0.7 * scale;

        if (shape === 'rund') {
          bodyGeo = new THREE.CylinderGeometry(bodyRadius, bodyRadius, bodyHeight, 32);
        } else if (shape === 'oval') {
          bodyGeo = new THREE.CylinderGeometry(bodyRadius, bodyRadius, bodyHeight, 32);
          bodyGeo.scale(1.3, 1, 0.75); // make it oval
        } else if (shape === 'antelope') {
          // Custom "Violet Antelope" reconstruction from the technical sketch
          const cylGeo = new THREE.CylinderGeometry(1, 1, bodyHeight, 64, 32);
          const posAttr = cylGeo.attributes.position;
          
          for (let i = 0; i < posAttr.count; i++) {
            const x = posAttr.getX(i);
            const y = posAttr.getY(i);
            const z = posAttr.getZ(i);
            
            const u = (y / bodyHeight) + 0.5; // Normalized height from 0 (bottom) to 1 (top)
            
            let wFactor = 1.0;
            let dFactor = 1.0;
            
            const wBot = 47.2 / 95.3;
            const wMid = 1.0;
            const wTop = 64.5 / 95.3;
            
            const dBot = 28.21 / 43.3;
            const dMid = 1.0;
            const dTop = 33.0 / 43.3;
            
            if (u < 0.35) {
              const t = u / 0.35;
              wFactor = wBot + (wMid - wBot) * (2 * t - t * t);
              dFactor = dBot + (dMid - dBot) * (2 * t - t * t);
            } else {
              const t = (u - 0.35) / 0.65;
              wFactor = wMid - (wMid - wTop) * (t * t);
              dFactor = dMid - (dMid - dTop) * (t * t);
            }
            
            // Scaled maximum width is 1.3x and depth is 0.59x of the bodyRadius (43.3/95.3 ratio)
            posAttr.setX(i, x * bodyRadius * wFactor * 1.3);
            posAttr.setZ(i, z * bodyRadius * dFactor * 0.59);
          }
          cylGeo.computeVertexNormals();
          bodyGeo = cylGeo;
        } else {
          // eckig (classic square box)
          bodyGeo = new THREE.BoxGeometry(bodyRadius * 1.3, bodyHeight, bodyRadius * 1.3);
        }

        // 2. Bottle Material
        let bodyMat: THREE.Material;
        
        // Define color based on selections
        let bottleColor = 0xffffff;
        if (shape === 'antelope' && colorType === 'klar') {
          bottleColor = 0xE2A695; // Premium Rose-Peach luxury glass tint matching physical photograph!
        } else if (colorType === 'lackiert') {
          bottleColor = 0x111111; // sleek dark lacquer
        } else if (colorType === 'bespruht') {
          bottleColor = 0x5a3e1a; // gradient cognac/gold
        } else if (colorType === 'sandstrahlen') {
          bottleColor = 0xece9e2; // frosted white
        } else if (colorType === 'metallisiert') {
          bottleColor = 0xd4af37; // mirror gold
        }

        if (colorType === 'metallisiert') {
          bodyMat = new THREE.MeshPhysicalMaterial({
            color: bottleColor,
            metalness: 1.0,
            roughness: 0.1,
            clearcoat: 1.0,
            clearcoatRoughness: 0.05
          });
        } else if (colorType === 'lackiert') {
          bodyMat = new THREE.MeshPhysicalMaterial({
            color: bottleColor,
            metalness: 0.1,
            roughness: 0.8,
            clearcoat: 0.2
          });
        } else {
          // Glass transparent materials
          const matt = config.mattierungsgrad !== undefined ? config.mattierungsgrad : 0;
          let finalRoughness = 0.05;
          let finalTransmission = 0.95;
          let finalOpacity = shape === 'antelope' ? 0.35 : 0.25;

          if (colorType === 'sandstrahlen') {
            finalRoughness = 0.05 + (matt / 100) * 0.65;
            finalTransmission = 0.95 - (matt / 100) * 0.45;
            finalOpacity = 0.25 + (matt / 100) * 0.35;
          }

          bodyMat = new THREE.MeshPhysicalMaterial({
            color: bottleColor,
            transparent: true,
            opacity: finalOpacity,
            roughness: finalRoughness,
            metalness: 0.02,
            transmission: finalTransmission,
            ior: 1.52, // Glass IOR
            thickness: (shape === 'antelope' ? 0.48 : 0.18) * scale, // thicker walls for premium look
            clearcoat: 1.0,
            clearcoatRoughness: 0.01
          });
        }

        const bottleMesh = new THREE.Mesh(bodyGeo, bodyMat);
        bottleMesh.position.y = bodyHeight / 2 - 0.7;
        bottleMesh.castShadow = true;
        bottleMesh.receiveShadow = true;
        bottleMesh.userData = { partKey: 'flaschenvolumen' };
        modelGroup.add(bottleMesh);

        // 3. Liquid inside (only visible for translucent glass bottles)
        if (colorType !== 'metallisiert' && colorType !== 'lackiert' && volume !== '5ml') {
          let liquidGeo: THREE.BufferGeometry;
          const liqHeight = bodyHeight * 0.7;
          const liqRadius = bodyRadius * 0.82;

          if (shape === 'rund') {
            liquidGeo = new THREE.CylinderGeometry(liqRadius, liqRadius * 0.95, liqHeight, 32);
          } else if (shape === 'oval') {
            liquidGeo = new THREE.CylinderGeometry(liqRadius, liqRadius * 0.95, liqHeight, 32);
            liquidGeo.scale(1.3, 1, 0.75);
          } else if (shape === 'antelope') {
            // Liquid inside for Violet Antelope
            const liqCylGeo = new THREE.CylinderGeometry(1, 1, liqHeight, 64, 32);
            const liqPosAttr = liqCylGeo.attributes.position;
            
            for (let i = 0; i < liqPosAttr.count; i++) {
              const x = liqPosAttr.getX(i);
              const y = liqPosAttr.getY(i);
              const z = liqPosAttr.getZ(i);
              
              const u = (y / liqHeight) + 0.5;
              
              let wFactor = 1.0;
              let dFactor = 1.0;
              
              const wBot = 47.2 / 95.3;
              const wMid = 1.0;
              const wTop = 64.5 / 95.3;
              
              const dBot = 28.21 / 43.3;
              const dMid = 1.0;
              const dTop = 33.0 / 43.3;
              
              if (u < 0.35) {
                const t = u / 0.35;
                wFactor = wBot + (wMid - wBot) * (2 * t - t * t);
                dFactor = dBot + (dMid - dBot) * (2 * t - t * t);
              } else {
                const t = (u - 0.35) / 0.65;
                wFactor = wMid - (wMid - wTop) * (t * t);
                dFactor = dMid - (dMid - dTop) * (t * t);
              }
              
              liqPosAttr.setX(i, x * liqRadius * wFactor * 1.3);
              liqPosAttr.setZ(i, z * liqRadius * dFactor * 0.59);
            }
            liqCylGeo.computeVertexNormals();
            liquidGeo = liqCylGeo;
          } else {
            liquidGeo = new THREE.BoxGeometry(liqRadius * 1.3, liqHeight, liqRadius * 1.3);
          }

          const liquidMat = new THREE.MeshPhysicalMaterial({
            color: 0xe5b869, // Warm golden luxury amber liquid
            transparent: true,
            opacity: 0.7,
            transmission: 0.85,
            roughness: 0.05,
            ior: 1.33 // Water/Alcohol IOR
          });
          const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
          // Position inside bottle slightly offset from bottom
          liquidMesh.position.y = (bodyHeight / 2 - 0.7) - (bodyHeight * 0.1);
          liquidMesh.userData = { partKey: 'flaschenvolumen' };
          modelGroup.add(liquidMesh);
        }

        // 4. Sprayer Pump & Neck
        const neckGeo = new THREE.CylinderGeometry(0.18 * scale, 0.18 * scale, 0.25 * scale, 32);
        const neckMesh = new THREE.Mesh(neckGeo, goldMaterial);
        neckMesh.position.y = bodyHeight - 0.65;
        neckMesh.castShadow = true;
        neckMesh.userData = { partKey: 'pumpe', name: 'hals' };
        modelGroup.add(neckMesh);

        // Steigrohr / Dip Tube (filigranes, hochtransparentes Zylinderrohr)
        const dipTubeGeo = new THREE.CylinderGeometry(0.015 * scale, 0.015 * scale, bodyHeight * 0.95, 8);
        const dipTubeMat = new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.4,
          roughness: 0.1,
          transmission: 0.95,
          ior: 1.49 // PP Index of Refraction
        });
        const dipTubeMesh = new THREE.Mesh(dipTubeGeo, dipTubeMat);
        // Position inside the bottle, extending downwards from pump
        dipTubeMesh.position.set(0, bodyHeight / 2 - 0.7 - (bodyHeight * 0.08), 0);
        dipTubeMesh.castShadow = false;
        dipTubeMesh.receiveShadow = false;
        dipTubeMesh.userData = { partKey: 'pumpe', name: 'steigrohr' };
        modelGroup.add(dipTubeMesh);

        // 5. Custom Label Plate & Screenprinting
        if (finish === 'label' || finish === 'heissfolie' || finish === 'siebdruck') {
          const isSiebdruck = finish === 'siebdruck';
          const isHeissfolie = finish === 'heissfolie';
          
          const labelGeo = shape === 'rund' 
            ? new THREE.CylinderGeometry(bodyRadius * (isSiebdruck ? 1.005 : 1.01), bodyRadius * (isSiebdruck ? 1.005 : 1.01), 0.6 * scale, 32, 1, true, -Math.PI/3, Math.PI * 2/3) 
            : new THREE.PlaneGeometry(0.85 * scale, 0.55 * scale);
            
          const printCol = config.siebdruckfarbe || 'weiss';
          const foilCol = config.folienfarbe || 'gold';
          
          const labelTexture = createLabelTexture(fragranceName, volume, isSiebdruck, printCol, isHeissfolie, foilCol);
          
          let labelMat: THREE.MeshPhysicalMaterial;
          
          if (isSiebdruck) {
            labelMat = new THREE.MeshPhysicalMaterial({
              map: labelTexture,
              transparent: true,
              opacity: 0.9,
              roughness: printCol === 'gold' ? 0.15 : 0.8,
              metalness: printCol === 'gold' ? 1.0 : 0.0,
              side: THREE.DoubleSide,
              depthWrite: false, // Prevents sorting glitches with glass transparency
            });
          } else if (isHeissfolie) {
            labelMat = new THREE.MeshPhysicalMaterial({
              map: labelTexture,
              roughness: 0.1,
              metalness: 0.85,
              side: THREE.DoubleSide
            });
          } else {
            // standard structured paper label
            labelMat = new THREE.MeshPhysicalMaterial({
              map: labelTexture,
              roughness: 0.45,
              metalness: 0.1,
              side: THREE.DoubleSide
            });
          }
          
          const labelMesh = new THREE.Mesh(labelGeo, labelMat);
          
          if (shape === 'rund') {
            labelMesh.position.set(0, bodyHeight / 2 - 0.7, 0);
          } else if (shape === 'oval') {
            labelMesh.position.set(0, bodyHeight / 2 - 0.7, bodyRadius * (isSiebdruck ? 0.755 : 0.76));
          } else if (shape === 'antelope') {
            labelMesh.position.set(0, bodyHeight / 2 - 0.7, bodyRadius * (isSiebdruck ? 0.592 : 0.595));
          } else {
            labelMesh.position.set(0, bodyHeight / 2 - 0.7, bodyRadius * (isSiebdruck ? 0.655 : 0.66));
          }
          labelMesh.userData = { partKey: 'flaschenveredelung' };
          modelGroup.add(labelMesh);
        }

        // 6. Bottle Cap
        if (capSelection !== 'ohne') {
          let capGeo: THREE.BufferGeometry;
          const capHeight = 0.5 * scale;
          const capRadius = 0.36 * scale;

          if (capSelection === 'holz') {
            // Elegant tall wooden cylinder
            capGeo = new THREE.CylinderGeometry(capRadius * 1.1, capRadius * 1.1, capHeight * 1.2, 32);
          } else if (capSelection === 'zamak') {
            // Heavy architectural metal block cap
            capGeo = new THREE.BoxGeometry(capRadius * 1.8, capHeight * 0.9, capRadius * 1.8);
          } else if (capSelection === 'surlyn') {
            // Signature thick glass-like cube
            capGeo = new THREE.BoxGeometry(capRadius * 2.0, capHeight * 1.1, capRadius * 2.0);
          } else {
            // Classic Cylinder (PP, ABS, Aluminium)
            capGeo = new THREE.CylinderGeometry(capRadius, capRadius, capHeight, 32);
          }

          let capMat: THREE.Material;
          if (capSelection === 'holz') {
            capMat = new THREE.MeshPhysicalMaterial({
              color: 0x5C4033, // Premium walnut color
              roughness: 0.75,
              metalness: 0.05
            });
          } else if (capSelection === 'zamak') {
            const finishType = config.kappen_finish || 'poliert';
            capMat = new THREE.MeshPhysicalMaterial({
              color: 0xdddddd,
              metalness: finishType === 'gebuerstet' ? 0.55 : 0.62,
              roughness: finishType === 'gebuerstet' ? 0.45 : 0.22,
              clearcoat: finishType === 'gebuerstet' ? 0.2 : 1.0
            });
          } else if (capSelection === 'aluminium') {
            const finishType = config.kappen_finish || 'poliert';
            capMat = new THREE.MeshPhysicalMaterial({
              color: 0xd4af37,
              metalness: finishType === 'gebuerstet' ? 0.55 : 0.65,
              roughness: finishType === 'gebuerstet' ? 0.45 : 0.22,
              clearcoat: finishType === 'gebuerstet' ? 0.2 : 1.0,
              clearcoatRoughness: finishType === 'gebuerstet' ? 0.5 : 0.05
            });
          } else if (capSelection === 'surlyn') {
            // Glassy transparent block
            capMat = new THREE.MeshPhysicalMaterial({
              color: 0xffffff,
              transparent: true,
              opacity: 0.45,
              transmission: 0.95,
              ior: 1.49,
              roughness: 0.05,
              thickness: 0.15
            });
          } else {
            // ABS / PP dark elegant
            capMat = darkMetalMaterial;
          }

          const capMesh = new THREE.Mesh(capGeo, capMat);
          capMesh.position.y = bodyHeight + (capSelection === 'holz' ? 0.35 : 0.25) * scale - 0.7;
          capMesh.castShadow = true;
          capMesh.userData = { partKey: 'kappe' };
          modelGroup.add(capMesh);
        }

      } else {
        // ------------------ COSMETIC PEN 3D ------------------
        const material = config.materialart || 'kunststoff';
        const endCap = config.endkappe || 'ohne';
        const texture = config.textur || 'MGT';

        // Stiftkörper (Long Zylinder)
        const penLength = 3.6;
        const penRadius = 0.09;
        const bodyGeo = new THREE.CylinderGeometry(penRadius, penRadius, penLength, 32);
        
        let bodyMat: THREE.Material;
        if (material === 'holz') {
          bodyMat = new THREE.MeshPhysicalMaterial({
            color: 0x5C4033, // Sustainable Cedarwood
            roughness: 0.65,
            metalness: 0.1
          });
        } else {
          // Premium high-gloss plastic
          bodyMat = new THREE.MeshPhysicalMaterial({
            color: 0x111111, // Glossy piano black
            roughness: 0.08,
            metalness: 0.1,
            clearcoat: 1.0
          });
        }
        
        const penMesh = new THREE.Mesh(bodyGeo, bodyMat);
        penMesh.rotation.z = Math.PI / 4; // Angle it nicely in 3D
        penMesh.rotation.y = Math.PI / 6;
        penMesh.castShadow = true;
        penMesh.receiveShadow = true;
        penMesh.userData = { partKey: 'materialart' };
        modelGroup.add(penMesh);

        // Core Branding Ring
        const ringGeo = new THREE.CylinderGeometry(penRadius * 1.04, penRadius * 1.04, 0.1, 32);
        const ringMesh = new THREE.Mesh(ringGeo, goldMaterial);
        ringMesh.position.set(-0.4, 0.4, 0); // Position along the rotated vector
        ringMesh.rotation.z = Math.PI / 4;
        ringMesh.rotation.y = Math.PI / 6;
        ringMesh.userData = { partKey: 'materialart' };
        modelGroup.add(ringMesh);

        // Protective cap (on one end)
        const capGeo = new THREE.CylinderGeometry(penRadius * 1.08, penRadius * 1.08, 0.9, 32);
        const capMat = new THREE.MeshPhysicalMaterial({
          color: 0x111111,
          metalness: 0.8,
          roughness: 0.15,
          clearcoat: 0.8
        });
        const capMesh = new THREE.Mesh(capGeo, capMat);
        // Position on top-right end
        const offsetDist = penLength / 2 - 0.4;
        capMesh.position.set(-offsetDist * Math.cos(Math.PI/4), offsetDist * Math.sin(Math.PI/4), 0);
        capMesh.rotation.z = Math.PI / 4;
        capMesh.rotation.y = Math.PI / 6;
        capMesh.castShadow = true;
        capMesh.userData = { partKey: 'materialart' };
        modelGroup.add(capMesh);

        // Texture color representation (Tip on the other end)
        let textureColor = 0xd4af37; // Default gold/MGL
        if (texture === 'MGT') textureColor = 0x8b0000; // dark matte red
        else if (texture === 'MAA') textureColor = 0x2e8b57; // active teal/green
        else if (texture === 'ABC') textureColor = 0x704214; // classic wood bronze
        else if (texture === 'DEW') textureColor = 0xdb7093; // dewy rose pink

        const tipGeo = new THREE.ConeGeometry(penRadius * 0.95, 0.28, 32);
        const tipMat = new THREE.MeshPhysicalMaterial({
          color: textureColor,
          roughness: texture === 'MGL' ? 0.25 : (texture === 'MGT' ? 0.8 : 0.15),
          metalness: texture === 'MGL' ? 0.65 : 0.05
        });
        const tipMesh = new THREE.Mesh(tipGeo, tipMat);
        const tipOffset = -penLength / 2 - 0.14;
        tipMesh.position.set(-tipOffset * Math.cos(Math.PI/4), tipOffset * Math.sin(Math.PI/4), 0);
        tipMesh.rotation.z = Math.PI / 4 + Math.PI;
        tipMesh.rotation.y = Math.PI / 6;
        tipMesh.userData = { partKey: 'textur' };
        modelGroup.add(tipMesh);

        // Applicator / End Cap (Bottom-Left)
        if (endCap !== 'ohne') {
          let endGeo: THREE.BufferGeometry;
          let endMat: THREE.Material = goldMaterial;
          const endOffset = penLength / 2 + 0.1;

          if (endCap === 'buerste') {
            endGeo = new THREE.CylinderGeometry(penRadius * 1.3, penRadius * 0.8, 0.35, 16);
            endMat = new THREE.MeshPhysicalMaterial({ color: 0x444444, roughness: 0.95 });
          } else if (endCap === 'pinsel') {
            endGeo = new THREE.ConeGeometry(penRadius * 0.8, 0.4, 16);
            endMat = new THREE.MeshPhysicalMaterial({ color: 0xe5c158, roughness: 0.4 });
          } else if (endCap === 'roller') {
            endGeo = new THREE.SphereGeometry(penRadius * 1.2, 16, 16);
            endMat = silverMaterial;
          } else {
            // Metallkappe (gold capped cylinder)
            endGeo = new THREE.CylinderGeometry(penRadius * 1.05, penRadius * 1.05, 0.3, 32);
            endMat = goldMaterial;
          }

          const endMesh = new THREE.Mesh(endGeo, endMat);
          endMesh.position.set(-endOffset * Math.cos(Math.PI/4), endOffset * Math.sin(Math.PI/4), 0);
          endMesh.rotation.z = Math.PI / 4 + (endCap === 'pinsel' ? Math.PI : 0);
          endMesh.rotation.y = Math.PI / 6;
          endMesh.castShadow = true;
          endMesh.userData = { partKey: 'endkappe' };
          modelGroup.add(endMesh);
        }
      }

      // 100% Visibility & Centering: Mathematical Bounding Box & Centering Logic
      // Bypasses Three.js asynchronous matrix update delays to ensure immediate, flawless alignment
      let ymin = -0.7;
      let ymax = 0.5;
      
      if (category === 'duefte') {
        const volume = config.flaschenvolumen || '50ml';
        const capSelection = config.kappe || 'pp';
        
        let scale = 1.0;
        if (volume === '100ml') scale = 1.25;
        if (volume === '75ml') scale = 1.15;
        if (volume === '50ml') scale = 1.0;
        if (volume === '30ml') scale = 0.85;
        if (volume === '5ml') scale = 0.55;
        
        const bodyHeight = 1.6 * scale;
        
        if (capSelection === 'ohne') {
          ymax = bodyHeight + 0.125 * scale - 0.65;
        } else {
          let capHeight = 0.5 * scale;
          let capOffsetY = 0.25;
          if (capSelection === 'holz') {
            capHeight = 0.6 * scale;
            capOffsetY = 0.35;
          } else if (capSelection === 'zamak') {
            capHeight = 0.45 * scale;
          } else if (capSelection === 'surlyn') {
            capHeight = 0.55 * scale;
          }
          
          ymax = bodyHeight + capOffsetY * scale - 0.7 + capHeight / 2;
        }
      } else {
        // kosmetikstift (pen)
        ymin = -1.35;
        ymax = 1.35;
      }
      
      const centerY = (ymin + ymax) / 2;
      const sizeY = ymax - ymin;
      
      // Shift modelGroup so its vertical center is at y = 0
      modelGroup.position.y = -centerY;
      
      // Place the reflection floor exactly at the bottom of the active model in world space
      floor.position.y = ymin - centerY - 0.01;
      
      // Calculate dynamic camera distance to prevent clipping on larger sizes (e.g. 100ml)
      // while maintaining close-up premium views on smaller sizes (e.g. 5ml)
      const idealDist = category === 'kosmetikstift'
        ? 6.0
        : Math.max(3.5, Math.min(6.0, sizeY * 2.1));
      
      // Preserve user's orbit rotation angles while adjusting distance
      if (camera && controls) {
        const currentDir = new THREE.Vector3().copy(camera.position).sub(controls.target).normalize();
        camera.position.copy(currentDir).multiplyScalar(idealDist);
        
        controls.minDistance = idealDist * 0.65;
        controls.maxDistance = idealDist * 1.75;
        controls.update();
      }
    };

    // Build the initial model
    buildModel();
    setLoading(false);

    // Rebuild model when config changes
    buildModel();

    // Raycaster for interactive click selection on 3D parts
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let mouseDownPos = { x: 0, y: 0 };

    const onMouseDown = (event: MouseEvent) => {
      mouseDownPos = { x: event.clientX, y: event.clientY };
    };

    const onMouseUp = (event: MouseEvent) => {
      const deltaX = Math.abs(event.clientX - mouseDownPos.x);
      const deltaY = Math.abs(event.clientY - mouseDownPos.y);

      // Only trigger click logic if dragging distance was minimal (prevents trigger during orbit rotate)
      if (deltaX < 5 && deltaY < 5) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(modelGroup.children, true);

        if (intersects.length > 0) {
          let clickedObj: THREE.Object3D | null = intersects[0].object;
          while (clickedObj && clickedObj !== scene) {
            if (clickedObj.userData && clickedObj.userData.partKey) {
              const partKey = clickedObj.userData.partKey;
              if (onPartClick) {
                onPartClick(partKey);
              }

              // Ultra-premium micro-interaction: temporary gold emissive glow flash
              const originalObj = clickedObj as THREE.Mesh;
              if (originalObj.material && 'emissive' in originalObj.material) {
                const mat = originalObj.material as any;
                const origEmissive = mat.emissive.getHex();
                mat.emissive.setHex(0xA47E3C);
                setTimeout(() => {
                  mat.emissive.setHex(origEmissive);
                }, 200);
              }
              break;
            }
            clickedObj = clickedObj.parent;
          }
        }
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(modelGroup.children, true);

      let isHoveringPart = false;
      if (intersects.length > 0) {
        let clickedObj: THREE.Object3D | null = intersects[0].object;
        while (clickedObj && clickedObj !== scene) {
          if (clickedObj.userData && clickedObj.userData.partKey) {
            isHoveringPart = true;
            break;
          }
          clickedObj = clickedObj.parent;
        }
      }

      // Cursor styling for direct click interaction
      if (isHoveringPart) {
        renderer.domElement.style.cursor = 'pointer';
      } else {
        renderer.domElement.style.cursor = 'grab';
      }
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('mousemove', onMouseMove);

    // --- ANIMATION LOOP ---
    let animationFrameId: number;
    let currentExplodeFactor = 0.0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.autoRotate = autoRotateRef.current;
      controls.update();

      // Exploded View Lerp Animation
      const targetFactor = explodedRef.current ? 1.0 : 0.0;
      currentExplodeFactor += (targetFactor - currentExplodeFactor) * 0.08;

      modelGroup.children.forEach((child) => {
        if (!child.userData) return;
        const { partKey, basePosition } = child.userData;

        // Cache base position for animation stability
        if (!basePosition) {
          child.userData.basePosition = child.position.clone();
        }
        
        const basePos = child.userData.basePosition;

        if (partKey === 'kappe') {
          // Verschlusskappe slides far up
          child.position.y = basePos.y + currentExplodeFactor * 1.5;
        } else if (partKey === 'pumpe') {
          // Sprayer pump collar and dip tube slide up
          child.position.y = basePos.y + currentExplodeFactor * 0.7;
        } else if (partKey === 'flaschenveredelung') {
          // Label floats outwards
          child.position.z = basePos.z + currentExplodeFactor * 0.35;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    // --- RESIZE HANDLER ---
    const handleResize = () => {
      if (!containerRef.current) return;
      width = containerRef.current.clientWidth;
      height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      controls.dispose();
      renderer.dispose();
      scene.clear();
    };
  }, [category, config, onPartClick]);

  return (
    <div ref={containerRef} className="w-full h-full relative flex items-center justify-center">
      {loading && (
        <div className="absolute inset-0 bg-madison-alabaster/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
          <div className="w-8 h-8 border-2 border-madison-gold border-t-transparent rounded-full animate-spin mb-3" />
          <span className="text-[10px] font-bold tracking-widest text-madison-muted uppercase">
            3D Studio lädt...
          </span>
        </div>
      )}
      <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing outline-none" />
      
      {/* 3D Interactivity Prompt overlay */}
      <div className="absolute bottom-4 left-4 right-4 pointer-events-none flex items-center justify-between text-[9px] tracking-widest text-madison-muted uppercase font-bold select-none px-2">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-madison-gold animate-ping" />
          <span>Interaktiv: Ziehen zum Drehen</span>
        </span>
        <span>Mausrad zum Zoomen</span>
      </div>
    </div>
  );
};
