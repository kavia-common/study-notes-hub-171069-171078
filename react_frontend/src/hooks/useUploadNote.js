import { useCallback, useMemo, useState } from 'react';
import getSupabaseClient from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * PUBLIC_INTERFACE
 * useUploadNote handles uploading a PDF (and optional thumbnail) to Supabase Storage
 * and creating a corresponding row in the 'notes' table with metadata and storage path.
 *
 * Requirements:
 * - Only authenticated users can upload (uses current session/user from AuthContext).
 * - Upload to Supabase Storage bucket: 'notes'.
 * - Insert into 'notes' table: title, description, subject, tags, level, pdf_path, thumb_path, user_id, size_bytes, mime_type.
 * - Show progress and expose error/success states.
 *
 * Returns:
 * {
 *   uploadNote: async (payload) => { id, ... } | throws,
 *   uploading: boolean,
 *   progress: number (0..100),
 *   error: string,
 *   reset: () => void,
 * }
 */
export function useUploadNote() {
  const supabase = getSupabaseClient();
  const { user, session } = useAuth();

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const bucket = 'notes';

  /**
   * PRIVATE: generate a unique path for storage items
   */
  const generatePath = useCallback((prefix, filename) => {
    const ts = Date.now();
    const safeName = String(filename || 'file')
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9.\-_]/g, '')
      .toLowerCase();
    const uid = user?.id || 'anon';
    return `${prefix}/${uid}/${ts}-${safeName}`;
  }, [user?.id]);

  /**
   * PRIVATE: upload a file to storage with progress estimation.
   * Note: Supabase's upload() does not provide native progress callbacks.
   * We simulate a smooth progress during the async call and finish at 100%.
   */
  const uploadToStorage = useCallback(async (file, prefix) => {
    const path = generatePath(prefix, file.name);

    // Simulated progress ticker
    setProgress(5);
    let intervalId;
    try {
      intervalId = setInterval(() => {
        setProgress((p) => {
          if (p < 85) return p + Math.max(1, Math.floor((90 - p) / 10));
          return p;
        });
      }, 250);

      const { data, error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });
      if (upErr) throw upErr;
      setProgress(100);
      return { path: data.path };
    } finally {
      if (intervalId) clearInterval(intervalId);
    }
  }, [bucket, supabase, generatePath]);

  // PUBLIC_INTERFACE
  const uploadNote = useCallback(async ({
    title,
    description = '',
    subject = '',
    tags = '',
    level = '',
    pdfFile,
    thumbFile = null,
  }) => {
    setError('');
    setUploading(true);
    setProgress(0);

    try {
      if (!session || !user) {
        throw new Error('You must be signed in to upload notes.');
      }
      if (!pdfFile) {
        throw new Error('Please select a PDF file to upload.');
      }
      if (!title || !title.trim()) {
        throw new Error('Please provide a title for your note.');
      }
      if (pdfFile.type !== 'application/pdf') {
        // attempt a permissive check; many PDFs are correctly typed
        if (!pdfFile.name?.toLowerCase().endsWith('.pdf')) {
          throw new Error('Only PDF files are supported.');
        }
      }

      // 1) Upload PDF
      const { path: pdfPath } = await uploadToStorage(pdfFile, 'pdfs');

      // 2) Optional thumbnail upload
      let thumbPath = null;
      if (thumbFile) {
        const { path: tPath } = await uploadToStorage(thumbFile, 'thumbs');
        thumbPath = tPath;
      }

      // 3) Insert row into 'notes' table
      const tagsValue = Array.isArray(tags) ? tags.join(',') : String(tags || '').trim();
      const insertPayload = {
        title: String(title).trim(),
        description: String(description || '').trim(),
        subject: String(subject || '').trim(),
        tags: tagsValue,
        level: String(level || '').trim(),
        pdf_path: pdfPath,
        thumb_path: thumbPath,
        user_id: user.id,
        size_bytes: Number(pdfFile.size || 0),
        mime_type: pdfFile.type || 'application/pdf',
      };

      const { data, error: dbErr } = await supabase
        .from('notes')
        .insert(insertPayload)
        .select('*')
        .single();
      if (dbErr) throw dbErr;

      return data;
    } catch (e) {
      const message = e?.message || 'Upload failed due to an unexpected error.';
      setError(message);
      throw e;
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 600);
    }
  }, [session, user, supabase, uploadToStorage]);

  // PUBLIC_INTERFACE
  const reset = useCallback(() => {
    setError('');
    setProgress(0);
    setUploading(false);
  }, []);

  return useMemo(() => ({
    uploadNote,
    uploading,
    progress,
    error,
    reset,
  }), [uploadNote, uploading, progress, error, reset]);
}

export default useUploadNote;
