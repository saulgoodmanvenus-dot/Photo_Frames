import { useState, useRef, useEffect, Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows } from '@react-three/drei';
import { EffectComposer, N8AO } from '@react-three/postprocessing';
import * as THREE from 'three';
import UploadModal from './UploadModal';
import './FrameViewer.css';

/* ─── 3D Frame Model ─── */
function FrameModel({ imageUrl }) {
  const { scene } = useGLTF('/8x6.glb');
  const textureRef = useRef(null);
  const appliedRef = useRef(false);

  // Log mesh/material names on initial load for debugging
  useEffect(() => {
    const meshes = [];
    scene.traverse((child) => {
      if (child.isMesh) meshes.push(child);
    });
    meshes.forEach((m, i) => {
      console.log(`[GLB] Mesh ${i}: name="${m.name}", material="${m.material?.name}", color=${m.material?.color?.getHexString()}`);
    });
  }, [scene]);

  useEffect(() => {
    if (!imageUrl) {
      appliedRef.current = false;
      return;
    }

    const loader = new THREE.TextureLoader();
    loader.load(imageUrl, (texture) => {
      texture.flipY = false;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
      if (textureRef.current) textureRef.current.dispose();
      textureRef.current = texture;

      const meshes = [];
      scene.traverse((child) => {
        if (child.isMesh) meshes.push(child);
      });

      let applied = false;

      // Strategy 1: Find by material name containing display/screen/photo/picture/image
      scene.traverse((child) => {
        if (child.isMesh) {
          const matName = (child.material?.name || '').toLowerCase();
          const meshName = (child.name || '').toLowerCase();
          if (
            matName.includes('display') || matName.includes('screen') ||
            matName.includes('photo') || matName.includes('picture') ||
            matName.includes('image') || matName.includes('canvas') ||
            meshName.includes('display') || meshName.includes('screen') ||
            meshName.includes('photo') || meshName.includes('picture') ||
            meshName.includes('image') || meshName.includes('canvas')
          ) {
            child.material = child.material.clone();
            child.material.map = texture;
            child.material.color = new THREE.Color(0xffffff);
            child.material.needsUpdate = true;
            applied = true;
            console.log(`[GLB] Applied texture to: "${child.name}" (material: "${child.material.name}")`);
          }
        }
      });

      // Strategy 2: If only 2 meshes, apply to the one that looks like display (lighter color or second mesh)
      if (!applied && meshes.length >= 2) {
        // The display is usually the non-frame mesh — pick the lighter colored one or the second mesh
        let displayMesh = meshes[1]; // default to second mesh
        for (const m of meshes) {
          const c = m.material?.color;
          if (c) {
            const brightness = c.r + c.g + c.b;
            // A lighter/neutral material is likely the display
            if (brightness > 2.0) {
              displayMesh = m;
              break;
            }
          }
        }
        displayMesh.material = displayMesh.material.clone();
        displayMesh.material.map = texture;
        displayMesh.material.color = new THREE.Color(0xffffff);
        displayMesh.material.needsUpdate = true;
        applied = true;
        console.log(`[GLB] Fallback: Applied texture to: "${displayMesh.name}"`);
      }

      // Strategy 3: If single mesh with multiple materials, apply to all
      if (!applied && meshes.length === 1) {
        const mesh = meshes[0];
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map((mat) => {
            const cloned = mat.clone();
            cloned.map = texture;
            cloned.color = new THREE.Color(0xffffff);
            cloned.needsUpdate = true;
            return cloned;
          });
          applied = true;
        } else {
          mesh.material = mesh.material.clone();
          mesh.material.map = texture;
          mesh.material.color = new THREE.Color(0xffffff);
          mesh.material.needsUpdate = true;
          applied = true;
        }
        console.log(`[GLB] Single mesh fallback: Applied texture to: "${mesh.name}"`);
      }

      appliedRef.current = applied;
    });

    return () => {
      if (textureRef.current) {
        textureRef.current.dispose();
        textureRef.current = null;
      }
    };
  }, [imageUrl, scene]);

  return (
    <primitive
      object={scene}
      scale={2.5}
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

/* ─── Wall Background ─── */
function WallPlane() {
  return (
    <mesh position={[0, 0, -0.3]} receiveShadow>
      <planeGeometry args={[12, 8]} />
      <meshStandardMaterial
        color="#ffffff"
        roughness={0.9}
        metalness={0.0}
      />
    </mesh>
  );
}

/* ─── Main Configurator ─── */
const sizes = [
  { label: '8×6"', w: 8, h: 6, price: 399, original: 684 },
  { label: '10×8"', w: 10, h: 8, price: 499, original: 850 },
  { label: '12×8"', w: 12, h: 8, price: 599, original: 999 },
  { label: '14×10"', w: 14, h: 10, price: 699, original: 1140 },
  { label: '16×12"', w: 16, h: 12, price: 899, original: 1500 },
  { label: '20×16"', w: 20, h: 16, price: 1199, original: 1999 },
];

const frameColors = [
  { name: 'Black', hex: '#1a1a1a' },
  { name: 'White', hex: '#f0ede8' },
  { name: 'Natural Wood', hex: '#8B6914' },
  { name: 'Walnut', hex: '#5C4033' },
  { name: 'Gold', hex: '#c9a227' },
  { name: 'Silver', hex: '#a8a8a8' },
];

export default function FrameViewer() {
  const [modalOpen, setModalOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileSize, setUploadedFileSize] = useState('');
  const [selectedSize, setSelectedSize] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);

  const handleImageUpload = useCallback((file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadedImage(url);
    setUploadedFileName(file.name);
    setUploadedFileSize((file.size / 1024).toFixed(0) + ' KB');
    setModalOpen(false);
  }, []);

  const handleRemoveImage = () => {
    if (uploadedImage) URL.revokeObjectURL(uploadedImage);
    setUploadedImage(null);
    setUploadedFileName('');
    setUploadedFileSize('');
  };

  const currentSize = sizes[selectedSize];
  const discount = Math.round((1 - currentSize.price / currentSize.original) * 100);

  const whatsappMessage = encodeURIComponent(
    `Hi! I'd like to order a photo frame.\n\nSize: ${currentSize.label}\nFrame Color: ${frameColors[selectedColor].name}\nPrice: ₹${currentSize.price}\n\nPlease share the details.`
  );

  return (
    <section className="configurator-section section" id="configurator">
      <div className="container">
        <div className="section-title">
          <h2>3D Frame Configurator</h2>
          <div className="section-divider"></div>
          <p>Upload your photo and see how it looks in a beautiful frame, right on your wall</p>
        </div>

        <div className="configurator-wrapper">
          {/* 3D Viewer */}
          <div className="viewer-container">
            <span className="viewer-badge">✨ Interactive 3D</span>
            <div className="viewer-canvas-wrap">
              <Canvas
                camera={{ position: [0, 0.15, 3.5], fov: 40 }}
                gl={{ antialias: true, alpha: false }}
                dpr={[1, 2]}
              >
                <color attach="background" args={['#ffffff']} />
                <ambientLight intensity={0.5} />
                <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
                <directionalLight position={[-3, 3, 2]} intensity={0.3} />
                <spotLight position={[0, 5, 3]} intensity={0.5} angle={0.5} penumbra={0.5} />

                <Suspense fallback={null}>
                  <WallPlane />
                  <FrameModel imageUrl={uploadedImage} />
                  <ContactShadows
                    position={[0, -1.5, 0]}
                    opacity={0.4}
                    scale={10}
                    blur={2}
                  />
                  <Environment preset="apartment" />
                  <EffectComposer disableNormalPass>
                    <N8AO aoRadius={1} intensity={0.75} color="black" />
                  </EffectComposer>
                </Suspense>

                <OrbitControls
                  enablePan={false}
                  enableZoom={true}
                  minDistance={2}
                  maxDistance={6}
                  minPolarAngle={50 * (Math.PI / 180)}
                  maxPolarAngle={88 * (Math.PI / 180)}
                  minAzimuthAngle={-125 * (Math.PI / 180)}
                  maxAzimuthAngle={-30 * (Math.PI / 180)}
                  rotateSpeed={0.4}
                  autoRotate={!uploadedImage}
                  autoRotateSpeed={1.5}
                />
              </Canvas>
            </div>
            <div className="viewer-controls-hint">
              🖱️ Drag to rotate • Scroll to zoom
            </div>
          </div>

          {/* Config Panel */}
          <div className="config-panel">
            {/* Upload Card */}
            <div className="config-card">
              <div className="config-card-title">
                <span className="card-icon">📸</span>
                Upload Your Photo
              </div>
              <div className="upload-area" onClick={() => setModalOpen(true)}>
                <div className="upload-icon">☁️</div>
                <div className="upload-text">Click to Upload Picture</div>
                <div className="upload-hint">JPG, PNG, WEBP • Max 20MB</div>
              </div>

              {uploadedImage && (
                <div className="upload-preview">
                  <img src={uploadedImage} alt="Preview" />
                  <div className="upload-preview-info">
                    <div className="upload-preview-name">{uploadedFileName}</div>
                    <div className="upload-preview-size">{uploadedFileSize}</div>
                  </div>
                  <button className="upload-preview-remove" onClick={handleRemoveImage}>✕</button>
                </div>
              )}
            </div>

            {/* Size Card */}
            <div className="config-card">
              <div className="config-card-title">
                <span className="card-icon">📐</span>
                Select Size
              </div>
              <div className="size-options">
                {sizes.map((size, i) => (
                  <button
                    key={i}
                    className={`size-option ${selectedSize === i ? 'active' : ''}`}
                    onClick={() => setSelectedSize(i)}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Frame Color Card */}
            <div className="config-card">
              <div className="config-card-title">
                <span className="card-icon">🎨</span>
                Frame Color
              </div>
              <div className="frame-colors">
                {frameColors.map((color, i) => (
                  <button
                    key={i}
                    className={`frame-color-btn ${selectedColor === i ? 'active' : ''}`}
                    style={{ background: color.hex }}
                    onClick={() => setSelectedColor(i)}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Price & Order */}
            <div className="config-card">
              <div className="config-card-title">
                <span className="card-icon">💰</span>
                Price
              </div>
              <div className="config-price">
                <span className="price-current">₹{currentSize.price}</span>
                <span className="price-original">₹{currentSize.original}</span>
                <span className="price-discount">{discount}% OFF</span>
              </div>

              <button
                className="config-whatsapp"
                onClick={() => window.open(`https://wa.me/918667219624?text=${whatsappMessage}`, '_blank')}
              >
                💬 Order via WhatsApp
              </button>

              <div className="config-trust">
                <span className="trust-badge"><span className="trust-icon">🚚</span> Free Shipping</span>
                <span className="trust-badge"><span className="trust-icon">✅</span> Quality Guarantee</span>
                <span className="trust-badge"><span className="trust-icon">🔒</span> Secure Payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onUpload={handleImageUpload}
      />
    </section>
  );
}
