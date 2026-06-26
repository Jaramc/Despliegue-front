import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'RentalAI — Encuentra tu lugar ideal';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #DC97E9 0%, #AC9DF2 50%, #9AB9DB 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 44,
              fontWeight: 700,
              color: '#111827',
            }}
          >
            R
          </div>
          <span style={{ fontSize: 44, fontWeight: 700, color: '#111827' }}>RentalAI</span>
        </div>
        <div style={{ marginTop: 40, fontSize: 72, fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>
          Encuentra tu lugar ideal
        </div>
        <div style={{ marginTop: 24, fontSize: 32, color: '#1f2937' }}>
          Explora, reserva y vive cada ciudad como en casa.
        </div>
      </div>
    ),
    size,
  );
}
