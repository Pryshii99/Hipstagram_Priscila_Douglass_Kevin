import React, { useState, useRef, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { postsAPI } from '../api/clientes';
import { useToast } from '../context/ToastContext';

const MAX_DESC = 128;
const MAX_TAGS = 10;

export default function NewPostPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const fileRef  = useRef<HTMLInputElement>(null);

  const [file,     setFile]     = useState<File | null>(null);
  const [preview,  setPreview]  = useState<string | null>(null);
  const [desc,     setDesc]     = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags,     setTags]     = useState<string[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [drag,     setDrag]     = useState(false);

  function pickFile(f: File | null | undefined) {
    if (!f) return;
    if (f.size > 5*1024*1024) { showToast('El archivo supera 5 MB.','error'); return; }
    // Solución al error de includes en strings (usando indexOf)
    if (['image/jpeg','image/png','image/webp'].indexOf(f.type) === -1) {
      showToast('Solo JPG, PNG o WebP.','error'); return;
    }
    setFile(f); setPreview(URL.createObjectURL(f));
  }

  function addTag(e: KeyboardEvent<HTMLInputElement>) {
    if ((e.key === 'Enter' || e.key === ' ') && tagInput.trim()) {
      e.preventDefault();
      let t = tagInput.trim().toLowerCase();
      if (!t.startsWith('#')) t = '#' + t;
      
      // Solución al error de includes en arreglos (usando indexOf)
      if (tags.indexOf(t) === -1 && tags.length < MAX_TAGS) {
        setTags(p => [...p, t]);
      }
      setTagInput('');
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { showToast('Selecciona una imagen.','error'); return; }
    const fd = new FormData();
    fd.append('imagen', file);
    fd.append('descripcion', desc);
    fd.append('hashtags', JSON.stringify(tags));
    setLoading(true);
    
    try {
      await postsAPI.create(fd);
      showToast('¡Publicación enviada! Aparecerá en el feed.');
      navigate('/feed');
    } catch (error: any) { 
      // Interceptamos el mensaje específico que viene desde posts.js en el backend
      const backendError = error.response?.data?.error;
      showToast(backendError || 'Error al publicar.', 'error'); 
    } finally { 
      setLoading(false); 
    }
  }

  return (
    <div className="hip-feed">
      <h5 className="fw-bold mb-3" style={{ color:'var(--hip-dark)' }}>
        <i className="bi bi-plus-square-fill me-2"></i>Nueva publicación
      </h5>
      <div className="hip-card p-3">
        <form onSubmit={onSubmit}>

          {/* Drop zone / preview */}
          {preview ? (
            <div className="mb-3 position-relative">
              <img src={preview} alt="preview" className="hip-preview" />
              <button type="button"
                className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 rounded-circle"
                style={{ width:32,height:32,padding:0 }}
                onClick={() => { setFile(null); setPreview(null); }}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          ) : (
            <div className={`hip-drop mb-3 ${drag ? 'over' : ''}`}
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={e => { e.preventDefault(); setDrag(false); pickFile(e.dataTransfer.files[0]); }}
              onClick={() => fileRef.current?.click()}>
              <i className="bi bi-cloud-arrow-up-fill d-block mb-2"></i>
              <p className="mb-1 fw-semibold">Arrastra tu foto aquí o haz click</p>
              <small className="text-muted">JPG, PNG, WebP · Máximo 5 MB</small>
              <input ref={fileRef} type="file" accept="image/*" className="d-none"
                onChange={e => pickFile(e.target.files?.[0])} />
            </div>
          )}

          {/* Descripción */}
          <div className="mb-3">
            <label className="form-label fw-semibold">
              <i className="bi bi-pencil me-1"></i>Descripción
              <span className="text-muted fw-normal ms-1">(opcional)</span>
            </label>
            <textarea className="form-control" rows={3} style={{ borderRadius:10,resize:'none' }}
              placeholder="Escribe algo sobre tu foto..." maxLength={MAX_DESC}
              value={desc} onChange={e => setDesc(e.target.value)} disabled={loading} />
            <div className="text-end mt-1"
              style={{ fontSize:'0.78rem', color: desc.length > 110 ? '#dc3545' : '#aaa' }}>
              {desc.length}/{MAX_DESC}
            </div>
          </div>

          {/* Hashtags */}
          <div className="mb-4">
            <label className="form-label fw-semibold">
              <i className="bi bi-hash me-1"></i>Hashtags
              <span className="text-muted fw-normal ms-1">(opcional, máx. {MAX_TAGS})</span>
            </label>
            <div className="mb-2">
              {tags.map(t => (
                <span key={t} className="hip-chip">
                  {t}
                  <button type="button" onClick={() => setTags(p => p.filter(x => x !== t))}>
                    <i className="bi bi-x"></i>
                  </button>
                </span>
              ))}
            </div>
            {tags.length < MAX_TAGS && (
              <input type="text" className="form-control" style={{ borderRadius:10 }}
                placeholder="#guate #viaje — Enter o Espacio para agregar"
                value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={addTag} disabled={loading} />
            )}
          </div>

          <div className="d-flex gap-2">
            <button type="button" className="btn btn-outline-secondary rounded-pill flex-fill"
              onClick={() => navigate(-1)} disabled={loading}>
              <i className="bi bi-arrow-left me-1"></i>Cancelar
            </button>
            <button type="submit" className="hip-btn-main flex-fill"
              style={{ borderRadius:25 }} disabled={loading || !file}>
              {loading
                ? <><span className="spinner-border spinner-border-sm"></span>Publicando...</>
                : <><i className="bi bi-send-fill"></i>Publicar</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}