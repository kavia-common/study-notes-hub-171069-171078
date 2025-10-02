import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import useUploadNote from '../hooks/useUploadNote.js';

/**
 * PUBLIC_INTERFACE
 * Upload page: A form to upload new notes (PDF) with metadata.
 * - Fields: title, description, subject, level, tags (comma-separated), PDF file, optional thumbnail
 * - Only authenticated users can upload (shows sign-in prompt otherwise)
 * - On submit, uploads to Supabase Storage (bucket: notes) then inserts row in 'notes' table
 * - Shows progress and error states, styled per Ocean Professional
 */
export default function Upload() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, reset } = useForm({
    defaultValues: {
      title: '',
      description: '',
      subject: '',
      level: '',
      tags: '',
      pdf: null,
      thumb: null,
    },
    mode: 'onBlur',
  });

  const { uploadNote, uploading, progress, error: uploadError, reset: resetUpload } = useUploadNote();
  const [successMessage, setSuccessMessage] = useState('');

  const subjects = useMemo(
    () => ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'History', 'Language Arts'],
    []
  );
  const levels = useMemo(() => ['Middle School', 'High School', 'Undergraduate', 'Graduate'], []);

  const pdfFile = watch('pdf');
  const thumbFile = watch('thumb');

  async function onSubmit(values) {
    setSuccessMessage('');
    resetUpload();

    try {
      const payload = {
        title: values.title,
        description: values.description,
        subject: values.subject,
        level: values.level,
        tags: values.tags,
        pdfFile: values.pdf?.[0] || null,
        thumbFile: values.thumb?.[0] || null,
      };
      const inserted = await uploadNote(payload);
      setSuccessMessage('Upload successful! Redirecting to Browse…');
      // small delay to show success, then navigate
      setTimeout(() => navigate('/browse'), 800);
      reset({
        title: '',
        description: '',
        subject: '',
        level: '',
        tags: '',
        pdf: null,
        thumb: null,
      });
      return inserted;
    } catch (_e) {
      // error is handled in hook; we just ensure submit state resets
      return null;
    }
  }

  if (loading) {
    return (
      <div className="card" role="status">
        <strong>Loading…</strong>
        <p className="text-muted">Checking your authentication status.</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="card" role="alert">
        <h1>Upload Notes</h1>
        <p className="text-muted" style={{ marginBottom: '0.75rem' }}>
          You must be signed in to upload notes.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <a className="btn" href="/login">Log in</a>
          <a className="btn ghost" href="/signup">Create account</a>
        </div>
      </div>
    );
  }

  return (
    <div className="card" aria-label="Upload form">
      <header style={{ marginBottom: '0.75rem' }}>
        <h1>Upload Notes</h1>
        <p className="text-muted" style={{ margin: 0 }}>
          Share your study notes as PDF with the community.
        </p>
      </header>

      {/* Alerts */}
      {uploadError ? (
        <div
          role="alert"
          className="surface"
          style={{
            borderColor: 'var(--color-error)',
            color: 'var(--color-text)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '0.75rem',
            background: 'linear-gradient(180deg, rgba(239,68,68,0.08), rgba(255,255,255,0.6))',
          }}
        >
          <strong style={{ color: 'var(--color-error)' }}>Error: </strong>
          <span>{uploadError}</span>
        </div>
      ) : null}

      {successMessage ? (
        <div
          role="status"
          className="surface"
          style={{
            borderColor: 'var(--color-success)',
            color: 'var(--color-text)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '0.75rem',
            background: 'linear-gradient(180deg, rgba(245,158,11,0.10), rgba(255,255,255,0.6))',
          }}
        >
          <strong style={{ color: 'var(--color-success)' }}>Success: </strong>
          <span>{successMessage}</span>
        </div>
      ) : null}

      {/* Progress */}
      {(uploading || isSubmitting) && (
        <div className="surface" role="status" aria-live="polite" style={{ padding: '0.75rem', marginBottom: '0.75rem' }}>
          <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
            <span className="text-muted">Uploading…</span>
            <span className="text-muted">{Math.min(100, Math.max(0, Math.round(progress)))}%</span>
          </div>
          <div
            style={{
              width: '100%',
              height: 10,
              background: 'rgba(37,99,235,0.12)',
              borderRadius: 999,
              overflow: 'hidden',
              border: '1px solid var(--color-border)',
            }}
            aria-label="Upload progress"
          >
            <div
              style={{
                width: `${Math.min(100, Math.max(0, progress))}%`,
                height: '100%',
                background: 'var(--color-primary)',
                transition: 'width var(--transition)',
              }}
            />
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {/* Title */}
          <div>
            <label htmlFor="title" style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>
              Title
            </label>
            <input
              id="title"
              type="text"
              placeholder="e.g., Calculus I - Limits and Continuity"
              {...register('title', { required: 'Title is required', minLength: { value: 3, message: 'Title must be at least 3 characters' } })}
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                outline: 'none',
                boxShadow: 'var(--shadow-xs)',
              }}
              onFocus={(e) => (e.currentTarget.style.boxShadow = 'var(--focus-ring)')}
              onBlur={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-xs)')}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'title-error' : undefined}
            />
            {errors.title && (
              <div id="title-error" className="text-muted" style={{ color: 'var(--color-error)', marginTop: 6 }}>
                {errors.title.message}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>
              Description
            </label>
            <textarea
              id="description"
              placeholder="Briefly describe what this note covers…"
              rows={4}
              {...register('description', { maxLength: { value: 1000, message: 'Description too long (max 1000)' } })}
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                outline: 'none',
                boxShadow: 'var(--shadow-xs)',
                resize: 'vertical',
              }}
              onFocus={(e) => (e.currentTarget.style.boxShadow = 'var(--focus-ring)')}
              onBlur={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-xs)')}
            />
          </div>

          {/* Subject and Level */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label htmlFor="subject" style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>
                Subject
              </label>
              <select
                id="subject"
                {...register('subject')}
                style={{
                  width: '100%',
                  height: 44,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  padding: '0 0.5rem',
                }}
              >
                <option value="">Select subject</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="level" style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>
                Level
              </label>
              <select
                id="level"
                {...register('level')}
                style={{
                  width: '100%',
                  height: 44,
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  padding: '0 0.5rem',
                }}
              >
                <option value="">Select level</option>
                {levels.map((lv) => (
                  <option key={lv} value={lv}>{lv}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>
              Tags (comma-separated)
            </label>
            <input
              id="tags"
              type="text"
              placeholder="e.g., limits, continuity, calculus, first-year"
              {...register('tags')}
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                outline: 'none',
                boxShadow: 'var(--shadow-xs)',
              }}
              onFocus={(e) => (e.currentTarget.style.boxShadow = 'var(--focus-ring)')}
              onBlur={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-xs)')}
            />
          </div>

          {/* Files */}
          <div>
            <label htmlFor="pdf" style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>
              PDF File
            </label>
            <input
              id="pdf"
              type="file"
              accept="application/pdf"
              {...register('pdf', { required: 'Please select a PDF file' })}
            />
            <div className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>
              {pdfFile?.[0]?.name ? `Selected: ${pdfFile[0].name}` : 'Only .pdf files are allowed'}
            </div>
            {errors.pdf && (
              <div className="text-muted" style={{ color: 'var(--color-error)', marginTop: 6 }}>
                {errors.pdf.message}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="thumb" style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>
              Optional Thumbnail (PNG/JPG)
            </label>
            <input
              id="thumb"
              type="file"
              accept="image/*"
              {...register('thumb')}
            />
            <div className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>
              {thumbFile?.[0]?.name ? `Selected: ${thumbFile[0].name}` : 'Optional: A small image to show in listings.'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button
            type="submit"
            className="btn"
            disabled={isSubmitting || uploading}
            aria-busy={isSubmitting || uploading}
          >
            {isSubmitting || uploading ? 'Uploading…' : 'Upload Note'}
          </button>
          <button
            type="button"
            className="btn ghost"
            onClick={() => {
              reset();
              resetUpload();
            }}
          >
            Reset
          </button>
        </div>
      </form>

      {/* Responsive tweak */}
      <style>{`
        @media (max-width: 720px) {
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
