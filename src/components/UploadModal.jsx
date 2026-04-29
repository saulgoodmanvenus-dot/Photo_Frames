import { useState, useRef, useCallback } from 'react';

export default function UploadModal({ isOpen, onClose, onUpload }) {
  const [dragging, setDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setPreviewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  }, [handleFile]);

  const handleApply = () => {
    if (previewFile) { onUpload(previewFile); resetState(); }
  };

  const handleChange = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewFile(null);
    setPreviewUrl(null);
  };

  const resetState = () => { setPreviewFile(null); setPreviewUrl(null); setDragging(false); };

  const handleClose = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    resetState();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📸 Upload Your Photo</h3>
          <button className="modal-close" onClick={handleClose}>✕</button>
        </div>

        <div className="modal-body">
          {!previewUrl ? (
            <div
              className={`drop-zone ${dragging ? 'dragging' : ''}`}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="drop-zone-icon">📁</span>
              <div className="drop-zone-title">Drag & Drop Your Photo</div>
              <div className="drop-zone-subtitle">Upload high-resolution images for the best results</div>
              <div className="drop-zone-or">OR</div>
              <button className="drop-zone-browse" type="button">📱 Choose from Device</button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFile(e.target.files?.[0])}
                style={{ display: 'none' }}
              />
            </div>
          ) : (
            <div className="modal-preview">
              <img src={previewUrl} alt="Preview" className="modal-preview-img" />
              <div className="modal-preview-name">
                {previewFile?.name} ({(previewFile?.size / 1024).toFixed(0)} KB)
              </div>
              <div className="modal-preview-actions">
                <button className="modal-btn-apply" onClick={handleApply}>✅ Apply to Frame</button>
                <button className="modal-btn-change" onClick={handleChange}>🔄 Change</button>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          Supported: <span>JPG</span> <span>PNG</span> <span>WEBP</span> <span>HEIC</span>
        </div>
      </div>
    </div>
  );
}
