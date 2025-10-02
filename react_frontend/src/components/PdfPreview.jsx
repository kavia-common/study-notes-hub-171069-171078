import React, { useEffect, useMemo, useState } from 'react';
import getSupabaseClient from '../lib/supabaseClient';

/**
 * PUBLIC_INTERFACE
 * PdfPreview renders an iframe preview of a PDF stored in Supabase Storage.
 *
 * Props:
 * - bucket: string (e.g., 'notes')
 * - path: string (storage path inside bucket, e.g., 'pdfs/<uid>/<file>.pdf')
 * - fileName?: string (used for download attribute and alt text)
 * - signedSeconds?: number (default 600s)
 * - height?: number|string (default 680)
 *
 * Behavior:
 * - Generates a signed URL to securely access the PDF for preview.
 * - Shows loading and error states.
 * - Exposes the generated signed URL via onSignedUrl callback (optional).
 */
export default function PdfPreview({
  bucket = 'notes',
  path,
  fileName = 'document.pdf',
  signedSeconds = 600,
  height = 680,
  onSignedUrl,
}) {
  const supabase = getSupabaseClient();
  const [signedUrl, setSignedUrl] = useState('');
  const [loading, setLoading] = useState(!!path);
  const [error, setError] = useState('');

  const iframeStyle = useMemo(
    () => ({
      width: '100%',
      height: typeof height === 'number' ? `${height}px` : height,
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-sm)',
      background: 'var(--color-surface)',
    }),
    [height]
  );

  useEffect(() => {
    let ignore = false;

    async function getSigned() {
      setError('');
      setLoading(true);
      try {
        if (!bucket || !path) {
          throw new Error('Missing storage location for PDF.');
        }
        const { data, error: signErr } = await supabase.storage
          .from(bucket)
          .createSignedUrl(path, signedSeconds);

        if (signErr) throw signErr;
        if (!ignore) {
          setSignedUrl(data?.signedUrl || '');
          onSignedUrl?.(data?.signedUrl || '');
        }
      } catch (e) {
        if (!ignore) setError(e?.message || 'Failed to load PDF preview.');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    if (path) getSigned();

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bucket, path, signedSeconds]);

  if (loading) {
    return (
      <div className="surface" role="status" style={{ padding: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span className="text-muted">Preparing secure preview…</span>
          <span className="text-muted">Please wait</span>
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
        >
          <div
            style={{
              width: '75%',
              height: '100%',
              background: 'var(--color-primary)',
              transition: 'width var(--transition)',
            }}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" role="alert" style={{ borderColor: 'var(--color-error)' }}>
        <strong style={{ color: 'var(--color-error)' }}>Preview unavailable</strong>
        <p className="text-muted" style={{ marginTop: 6 }}>{error}</p>
        <p className="text-muted" style={{ marginTop: 6 }}>
          Try refreshing the page or downloading the file directly if you have access.
        </p>
      </div>
    );
  }

  if (!signedUrl) {
    return (
      <div className="card" role="alert">
        <strong>Preview not available</strong>
        <p className="text-muted" style={{ marginTop: 6 }}>
          The PDF link could not be generated. Please try again later.
        </p>
      </div>
    );
  }

  // For maximum compatibility, we use an iframe. Some browsers display PDFs inline with built-in viewer.
  return (
    <iframe
      title={`Preview of ${fileName}`}
      src={signedUrl}
      style={iframeStyle}
      loading="lazy"
    />
  );
}
