import React, { useState, useRef } from 'react';
import { C, Note, ErrorMsg } from '../../ds/index.jsx';

export function FileUpload({ onUpload, maxMB = 5, accept = '.pdf,.docx,.txt,.md', label, hint, existingName }) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  async function handleFile(file) {
    if (!file) return;
    const limitBytes = maxMB * 1024 * 1024;
    if (file.size > limitBytes) {
      setError(`File too large. Max ${maxMB} MB allowed.`);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onUpload(file);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div
        onClick={() => !loading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files[0]);
        }}
        style={{
          border: `1.5px dashed ${dragging ? C.purple : C.purple + '40'}`,
          borderRadius: 10,
          padding: 20,
          textAlign: 'center',
          background: dragging ? C.purple + '0d' : C.purple + '05',
          cursor: loading ? 'wait' : 'pointer',
          transition: 'all 0.15s'
        }}
      >
        <div style={{ fontSize: 22, marginBottom: 6 }}>
          {loading ? '⏳' : existingName ? '📄' : '📂'}
        </div>
        {existingName ? (
          <div style={{ fontSize: 12, color: C.green, marginBottom: 4, fontWeight: 600 }}>
            ✓ {existingName}
          </div>
        ) : null}
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>
          {loading ? 'Uploading…' : label || 'Drop requirement document here or click to browse'}
        </div>
        <div style={{ fontSize: 10, color: C.dim }}>
          {hint || `PDF · DOCX · TXT · MD · Max ${maxMB} MB`}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files[0])}
        />
      </div>
      <ErrorMsg message={error} />
      <Note>Re-upload replaces the document and triggers a new analysis run.</Note>
    </div>
  );
}
