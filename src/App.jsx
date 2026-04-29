import { useState, useRef, useEffect, Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import { EffectComposer, N8AO, BrightnessContrast, HueSaturation, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import UploadModal from './components/UploadModal';
import './App.css';

/* ─── Environment Model (room/scene) ─── */
function EnvironmentModel({ frameScene, frameY }) {
  const { scene } = useGLTF('/Environment.glb');

  useEffect(() => {
    console.log('[ENV GLB] === Full Scene Hierarchy ===');
    let framesParent = null;
    scene.traverse((obj) => {
      const type = obj.isMesh ? 'MESH' : obj.isLight ? 'LIGHT' : obj.isCamera ? 'CAMERA' : 'OBJECT';
      const pos = obj.position;
      console.log(`[ENV GLB] ${type}: "${obj.name}" | Type: ${obj.type} | Pos: (${pos.x.toFixed(3)}, ${pos.y.toFixed(3)}, ${pos.z.toFixed(3)})`);

      // Find the \"Frames position\" / \"Frame_Position\" empty/object
      const n = (obj.name || '').toLowerCase();
      if (n.includes('frame') && n.includes('position')) {
        framesParent = obj;
        console.log(`[ENV GLB] >>> FRAMES POSITION FOUND: "${obj.name}" at`, pos);
      }

      // Enable shadows on all meshes
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        if (obj.material) {
          obj.material.envMapIntensity = 0.4;
          obj.material.needsUpdate = true;
        }
      }
    });

    // Attach frame scene as child of "Frames position" if found
    if (framesParent && frameScene) {
      // Remove any previous frame children to avoid duplicates
      const toRemove = [];
      framesParent.children.forEach((child) => {
        if (child.userData.__isFrameChild) toRemove.push(child);
      });
      toRemove.forEach((c) => framesParent.remove(c));

      frameScene.userData.__isFrameChild = true;
      frameScene.position.set(0, frameY, 0); // Center on X/Z and set Y offset
      framesParent.add(frameScene);
      console.log('[ENV GLB] Frame attached to Frames position parent at Y:', frameY);
    } else if (!framesParent) {
      console.warn('[ENV GLB] Could not find "Frames position" object — frame will float at root');
    }
  }, [scene, frameScene, frameY]);

  return <primitive object={scene} scale={1.5} position={[0, 0, 0]} />;
}

/* ─── 3D Frame Model (loaded separately, parented to environment) ─── */
function FrameModel({ imageUrl, selectedFrame }) {
  const { scene } = useGLTF('/Frames .glb');
  const textureRef = useRef(null);

  // Show/hide the correct frame variation based on selectedFrame
  useEffect(() => {
    scene.traverse((obj) => {
      // Only toggle top-level children that match frame naming pattern
      if (obj.parent === scene) {
        const n = (obj.name || '').toLowerCase();
        if (n.includes('frame') && n.includes('(')) {
          const isVisible = (obj.name === selectedFrame);
          obj.visible = isVisible;
          if (isVisible) obj.position.set(0, 0, 0); // Snap visible frame to origin
        }
      }
    });

    // Setup shadows and material quality for visible frame
    scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        if (obj.material) {
          obj.material.envMapIntensity = 0.4;
          obj.material.needsUpdate = true;
        }
      }
    });

    console.log('[FRAME GLB] Active frame:', selectedFrame);
  }, [scene, selectedFrame]);

  useEffect(() => {
    if (!imageUrl) return;
    const loader = new THREE.TextureLoader();
    loader.load(imageUrl, (tex) => {
      tex.flipY = false;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      if (textureRef.current) textureRef.current.dispose();
      textureRef.current = tex;

      // Apply texture only to meshes belonging to the selected frame
      scene.traverse((child) => {
        if (!child.isMesh) return;
        // Check if this mesh is a descendant of the selected frame object
        let isInSelectedFrame = false;
        let parent = child.parent;
        while (parent) {
          if (parent.name === selectedFrame) { isInSelectedFrame = true; break; }
          parent = parent.parent;
        }
        if (!isInSelectedFrame) return;

        const mn = (child.material?.name || '').toLowerCase();
        if (mn.includes('photo') || mn.includes('picture') || mn.includes('image') || mn.includes('display') || mn.includes('canvas')) {
          child.material = child.material.clone();
          child.material.map = tex;
          child.material.color = new THREE.Color(0xffffff);
          child.material.needsUpdate = true;
        }
      });
    });
    return () => { if (textureRef.current) { textureRef.current.dispose(); textureRef.current = null; } };
  }, [imageUrl, scene, selectedFrame]);

  return null;
}

/* Hook to get the frame scene object for parenting */
function useFrameScene() {
  const { scene } = useGLTF('/Frames .glb');
  return scene;
}

/* ─── Scene Content (coordinates environment + frame) ─── */
function SceneContent({ imageUrl, frameY, selectedFrame }) {
  const frameScene = useFrameScene();
  return (
    <>
      <EnvironmentModel frameScene={frameScene} frameY={frameY} />
      <FrameModel imageUrl={imageUrl} selectedFrame={selectedFrame} />
    </>
  );
}

/* ─── Data ─── */
const sizes = [
  // { label: '4×6"', glbPrefix: '4x6_Frame_', price: 399, original: 684 },
  { label: '6×8"', glbPrefix: '6x8_Frame_', price: 499, original: 850 },
  { label: '8×10"', glbPrefix: '8x10_Frame_', price: 599, original: 999 },
  { label: '8×12"', glbPrefix: '8x12_Frame_', price: 699, original: 1140 },
  { label: '12×30"', disabled: true, price: 999, original: 1650 },
  { label: '12×36"', disabled: true, price: 1199, original: 1999 },
  { label: '16×20"', disabled: true, price: 1099, original: 1800 },
  { label: '16×24"', disabled: true, price: 1299, original: 2100 },
  { label: '18×24"', disabled: true, price: 1499, original: 2400 },
  { label: '20×24"', disabled: true, price: 1599, original: 2600 },
  { label: '20×30"', disabled: true, price: 1999, original: 3200 },
  { label: '24×36"', disabled: true, price: 2499, original: 4000 },
  { label: '20×40"', disabled: true, price: 2799, original: 4500 },
  { label: '30×40"', disabled: true, price: 3499, original: 5500 },
];

const panels = [
  { name: 'Panel 1', idx: 1 },
  { name: 'Panel 2', idx: 2 },
  { name: 'Panel 3', idx: 3 },
  { name: 'Panel 4', idx: 4 },
];

const mats = [
  { name: 'No Mat', color: 'transparent', dashed: true },
  { name: 'White', color: '#ffffff' },
  { name: 'Off-White', color: '#f5f1e8' },
  { name: 'Black', color: '#1a1a1a' },
];

const WA = '918667219624';

/* ─── App ─── */
export default function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [image, setImage] = useState('/Pic.png');
  const [fileName, setFileName] = useState('Pic.png');
  const [fileSize, setFileSize] = useState('8.8 MB');
  const [sizeIdx, setSizeIdx] = useState(0);
  const [panelIdx, setPanelIdx] = useState(0);
  const [matIdx, setMatIdx] = useState(0);
  const [sunPos, setSunPos] = useState([-2.3, 3.1, -2.7]);
  const [sunIntensity, setSunIntensity] = useState(0);
  const [hdriIntensity, setHdriIntensity] = useState(0.8);
  const [frameY, setFrameY] = useState(1.1);
  const [camTargetY, setCamTargetY] = useState(1.65);
  const [minAzimuth, setMinAzimuth] = useState(-112);
  const [maxAzimuth, setMaxAzimuth] = useState(-46);
  
  // Post-processing states
  const [postExposure, setPostExposure] = useState(0.1);
  const [contrast, setContrast] = useState(0.15);
  const [saturation, setSaturation] = useState(0.1);
  const [vignette, setVignette] = useState(0.5);
  const [showControls, setShowControls] = useState(false);

  const handleUpload = useCallback((file) => {
    if (!file) return;
    setImage(URL.createObjectURL(file));
    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(0) + ' KB');
    setModalOpen(false);
  }, []);

  const handleRemove = () => {
    if (image) URL.revokeObjectURL(image);
    setImage(null); setFileName(''); setFileSize('');
  };

  const s = sizes[sizeIdx];
  const selectedFrame = `${s.glbPrefix}(${panels[panelIdx].idx})`;
  const disc = Math.round((1 - s.price / s.original) * 100);
  const waMsg = encodeURIComponent(
    `Hi! I'd like to order a photo frame.\n\nSize: ${s.label}\nPanel: ${panels[panelIdx].name}\nPrice: ₹${s.price}\n\nPlease share details.`
  );

  return (
    <div className="app">
      {/* ─── Scene Controller ─── */}
      <div style={{ position: 'absolute', top: 60, right: 320, zIndex: 1000, background: 'rgba(255,255,255,0.92)', padding: showControls ? 15 : 10, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backdropFilter: 'blur(8px)', minWidth: showControls ? 160 : 'auto' }}>
        <h4 
          style={{ margin: showControls ? '0 0 10px' : '0', fontSize: showControls ? 12 : 18, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          onClick={() => setShowControls(!showControls)}
          title="Scene Controls"
        >
          {showControls ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <span>⚙️ Scene Controls</span>
              <span>▼</span>
            </div>
          ) : (
            <span>⚙️</span>
          )}
        </h4>
        
        {showControls && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, borderTop: '1px solid #ddd', paddingTop: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 'bold', width: 60 }}>HDRI Int</span>
          <input
            type="range" min="0" max="5" step="0.1"
            value={hdriIntensity}
            onChange={(e) => setHdriIntensity(parseFloat(e.target.value))}
          />
          <span style={{ fontSize: 10, width: 30 }}>{hdriIntensity}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, borderTop: '1px solid #ddd', paddingTop: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 'bold', width: 60 }}>Frame Y</span>
          <input
            type="range" min="-3" max="5" step="0.01"
            value={frameY}
            onChange={(e) => setFrameY(parseFloat(e.target.value))}
          />
          <span style={{ fontSize: 10, width: 30 }}>{frameY}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, borderTop: '1px solid #ddd', paddingTop: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 'bold', width: 60 }}>Cam Trgt Y</span>
          <input
            type="range" min="-1" max="4" step="0.01"
            value={camTargetY}
            onChange={(e) => setCamTargetY(parseFloat(e.target.value))}
          />
          <span style={{ fontSize: 10, width: 30 }}>{camTargetY}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, borderTop: '1px solid #ddd', paddingTop: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 'bold', width: 60 }}>Exposure</span>
          <input
            type="range" min="-1" max="1" step="0.05"
            value={postExposure}
            onChange={(e) => setPostExposure(parseFloat(e.target.value))}
          />
          <span style={{ fontSize: 10, width: 30 }}>{postExposure}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 'bold', width: 60 }}>Contrast</span>
          <input
            type="range" min="-1" max="1" step="0.05"
            value={contrast}
            onChange={(e) => setContrast(parseFloat(e.target.value))}
          />
          <span style={{ fontSize: 10, width: 30 }}>{contrast}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 'bold', width: 60 }}>Saturation</span>
          <input
            type="range" min="-1" max="1" step="0.05"
            value={saturation}
            onChange={(e) => setSaturation(parseFloat(e.target.value))}
          />
          <span style={{ fontSize: 10, width: 30 }}>{saturation}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 'bold', width: 60 }}>Vignette</span>
          <input
            type="range" min="0" max="1" step="0.05"
            value={vignette}
            onChange={(e) => setVignette(parseFloat(e.target.value))}
          />
          <span style={{ fontSize: 10, width: 30 }}>{vignette}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, borderTop: '1px solid #ddd', paddingTop: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 'bold', width: 60 }}>Min Azimuth</span>
          <input
            type="range" min="-180" max="180" step="1"
            value={minAzimuth}
            onChange={(e) => setMinAzimuth(parseFloat(e.target.value))}
          />
          <span style={{ fontSize: 10, width: 30 }}>{minAzimuth}°</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 'bold', width: 60 }}>Max Azimuth</span>
          <input
            type="range" min="-180" max="180" step="1"
            value={maxAzimuth}
            onChange={(e) => setMaxAzimuth(parseFloat(e.target.value))}
          />
          <span style={{ fontSize: 10, width: 30 }}>{maxAzimuth}°</span>
        </div>
        <button
          style={{ marginTop: 15, padding: '6px 12px', background: '#333', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', width: '100%', fontSize: 12, fontWeight: 'bold' }}
          onClick={() => {
            const data = `HDRI Int: ${hdriIntensity}\nFrame Y: ${frameY}\nCam Target Y: ${camTargetY}\nExposure: ${postExposure}\nContrast: ${contrast}\nSaturation: ${saturation}\nVignette: ${vignette}\nMin Azimuth: ${minAzimuth}\nMax Azimuth: ${maxAzimuth}`;
            navigator.clipboard.writeText(data);
            alert('Values copied to clipboard!');
          }}
        >
          📋 Copy Values
        </button>
          </>
        )}
      </div>

      {/* ─── Top Bar ─── */}
      <header className="topbar">
        <div className="topbar-logo">
          <span className="logo-icon">🖼</span>
          Frame<span className="logo-accent">Craft</span>
        </div>

        <div className="topbar-center">
          {!image ? (
            <button className="topbar-upload-btn" onClick={() => setModalOpen(true)}>
              📤 Upload Image
            </button>
          ) : (
            <>
              <button className="topbar-upload-new" onClick={() => setModalOpen(true)}>
                🔄 Upload New Image
              </button>
              <span className="topbar-file-info">{fileName}</span>
            </>
          )}
        </div>

        <div className="topbar-actions">
          <a href="tel:+918667219624" className="topbar-phone">📞 +91 8667219624</a>
          <a
            href={`https://wa.me/${WA}?text=${encodeURIComponent('Hi! I am interested in your photo framing services.')}`}
            target="_blank" rel="noopener noreferrer"
            className="topbar-wa"
          >
            💬 WhatsApp
          </a>
        </div>
      </header>

      {/* ─── Main Body ─── */}
      <div className="main-body">

        {/* LEFT — Panel Design Selector */}
        <div className="frame-sidebar">
          <div className="frame-sidebar-title">Panels</div>
          <div className="frame-sidebar-scroll">
            {panels.map((p, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <button
                  className={`frame-swatch ${panelIdx === i ? 'active' : ''}`}
                  onClick={() => setPanelIdx(i)}
                  title={p.name}
                >
                  <span className="swatch-fill" style={{ backgroundImage: `url('/Panel Images/${p.name}.png')`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'block' }}></span>
                </button>
                <span className="frame-swatch-label">{p.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER — 3D Viewer + Bottom Size Bar */}
        <div className="viewer-center">
          <div className="viewer-canvas-area">
            <span className="viewer-tag">✦ Interactive 3D</span>
            <Canvas
              camera={{ position: [0, camTargetY, 1.8], fov: 38 }}
              shadows
              gl={{
                antialias: true,
                alpha: false,
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.1,
                powerPreference: 'high-performance',
              }}
              dpr={[1, 1.5]}
              style={{ width: '100%', height: '100%' }}
            >
              <color attach="background" args={['#ffffff']} />

              {/* ─── HDRI Lighting (replaces environment lights) ─── */}

              {/* Main key light (sun) with soft shadows */}
              <directionalLight
                position={sunPos}
                intensity={sunIntensity}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-far={20}
                shadow-camera-left={-4}
                shadow-camera-right={4}
                shadow-camera-top={4}
                shadow-camera-bottom={-4}
                shadow-bias={-0.0003}
                shadow-normalBias={0.02}
                shadow-radius={4}
                color="#fff4e6"
              />

              <Suspense fallback={null}>
                <SceneContent imageUrl={image} frameY={frameY} selectedFrame={selectedFrame} />
                {/* HDRI environment from EXR file */}
                <Environment
                  files="/overcast_soil_puresky_1k.exr"
                  environmentIntensity={hdriIntensity}
                />
                <EffectComposer disableNormalPass>
                  <N8AO aoRadius={1} intensity={0.75} color="black" />
                  <BrightnessContrast brightness={postExposure} contrast={contrast} />
                  <HueSaturation saturation={saturation} />
                  <Vignette offset={0.5} darkness={vignette} eskil={false} />
                </EffectComposer>
              </Suspense>

              <OrbitControls
                enablePan={false}
                enableZoom
                minDistance={1.0}
                maxDistance={3.5}
                target={[0, camTargetY, 0]}
                minPolarAngle={50 * (Math.PI / 180)}
                maxPolarAngle={90 * (Math.PI / 180)}
                minAzimuthAngle={minAzimuth * (Math.PI / 180)}
                maxAzimuthAngle={maxAzimuth * (Math.PI / 180)}
                enableDamping
                dampingFactor={0.08}
                rotateSpeed={0.4}
                autoRotate={image === '/Pic.png' || !image}
                autoRotateSpeed={0.2}
              />
            </Canvas>
            <div className="viewer-hint">🖱 Drag to rotate · Scroll to zoom</div>
          </div>
        </div>

        {/* RIGHT — Options Panel */}
        <aside className="options-panel">
          <div className="options-scroll">

            {/* Upload */}
            <div className="opt-section">
              <span className="opt-label">Your Photo</span>
              {!image ? (
                <div className="panel-upload-area" onClick={() => setModalOpen(true)}>
                  <div className="panel-upload-icon">📤</div>
                  <div className="panel-upload-text">Upload Image</div>
                  <div className="panel-upload-hint">JPG, PNG, WEBP · Max 20MB</div>
                </div>
              ) : (
                <div className="panel-preview">
                  <img src={image} alt="preview" />
                  <div className="panel-preview-info">
                    <div className="panel-preview-name">{fileName}</div>
                    <div className="panel-preview-meta">{fileSize}</div>
                  </div>
                  <div className="panel-preview-btns">
                    <button className="panel-preview-btn" onClick={() => setModalOpen(true)} title="Change">🔄</button>
                    <button className="panel-preview-btn remove" onClick={handleRemove} title="Remove">✕</button>
                  </div>
                </div>
              )}
            </div>

            <div className="opt-separator" />

            {/* Mat */}
            <div className="opt-section">
              <span className="opt-label">Mat</span>
              <div className="mat-row">
                {mats.map((m, i) => (
                  <button
                    key={i}
                    className={`mat-btn ${matIdx === i ? 'active' : ''}`}
                    onClick={() => setMatIdx(i)}
                  >
                    <span
                      className="mat-dot"
                      style={{
                        background: m.color === 'transparent' ? '#fff' : m.color,
                        border: m.dashed ? '2px dashed #ccc' : '1px solid #ddd',
                      }}
                    />
                    <span className="mat-name">{m.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="opt-separator" />

            {/* Orientation */}
            <div className="opt-section">
              <span className="opt-label">Orientation</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="size-pill"
                  disabled
                  style={{ flex: 1, opacity: 0.5, cursor: 'not-allowed' }}
                >
                  Portrait
                </button>
                <button
                  className="size-pill"
                  disabled
                  style={{ flex: 1, opacity: 0.5, cursor: 'not-allowed' }}
                >
                  Landscape
                </button>
              </div>
            </div>

            <div className="opt-separator" />

            {/* Size */}
            <div className="opt-section">
              <span className="opt-label">Size</span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {sizes.map((sz, i) => (
                  <button
                    key={i}
                    className={`size-pill ${sizeIdx === i ? 'active' : ''}`}
                    onClick={() => !sz.disabled && setSizeIdx(i)}
                    disabled={sz.disabled}
                    style={{ position: 'static', flex: '1 1 auto', margin: 0, opacity: sz.disabled ? 0.5 : 1, cursor: sz.disabled ? 'not-allowed' : 'pointer' }}
                  >
                    {sz.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* CTA */}
          <div className="options-cta">
            <div className="cta-price-row">
              <span className="cta-price">₹{s.price}</span>
              <span className="cta-orig">₹{s.original}</span>
              <span className="cta-badge">{disc}% OFF</span>
            </div>
            <button
              className="cta-wa-btn"
              onClick={() => window.open(`https://wa.me/${WA}?text=${waMsg}`, '_blank')}
            >
              💬 Order via WhatsApp
            </button>
            <div className="cta-badges">
              <span>🚚 Free Shipping</span>
              <span>✅ Quality Guarantee</span>
              <span>🔒 Secure</span>
            </div>
          </div>
        </aside>
      </div>

      {/* WhatsApp Float */}
      <div className="wa-float">
        <button
          className="wa-float-btn"
          onClick={() => window.open(`https://wa.me/${WA}?text=${encodeURIComponent('Hi! I need help with framing.')}`, '_blank')}
          aria-label="Chat on WhatsApp"
        >
          💬
        </button>
      </div>

      {/* Modal */}
      <UploadModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onUpload={handleUpload} />
    </div>
  );
}
