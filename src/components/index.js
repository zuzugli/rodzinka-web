import React from 'react';
import { COLORS, FONTS } from '../theme';

export function Avatar({ initials, color, size = 'sm', photo }) {
  const dim = { xs: 24, sm: 32, md: 46, lg: 72 }[size];
  const fs  = { xs: 9,  sm: 11, md: 15, lg: 32 }[size];
  if (photo) {
    return (
      <div style={{
        width: dim, height: dim, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
      }}>
        <img src={photo} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  }
  return (
    <div style={{
      width: dim, height: dim, borderRadius: '50%',
      background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: fs, fontWeight: 800, fontFamily: FONTS.body, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

export function Card({ children, style = {} }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 20, padding: 16,
      border: `1px solid ${COLORS.border}`, marginBottom: 10, ...style,
    }}>
      {children}
    </div>
  );
}

export function Tag({ label, bg, color }) {
  return (
    <span style={{
      background: bg, color, borderRadius: 999,
      padding: '3px 10px', fontSize: 11, fontWeight: 700, fontFamily: FONTS.body,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}

export function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, color: COLORS.textMuted,
      textTransform: 'uppercase', letterSpacing: 0.8,
      margin: '18px 0 10px', fontFamily: FONTS.body,
    }}>
      {children}
    </div>
  );
}

export function PrimaryButton({ label, onClick, color }) {
  return (
    <button onClick={onClick} style={{
      background: color || COLORS.purple, color: '#fff', border: 'none',
      borderRadius: 14, padding: '14px 24px', fontSize: 15, fontWeight: 700,
      fontFamily: FONTS.body, cursor: 'pointer', width: '100%', marginTop: 8,
    }}>
      {label}
    </button>
  );
}

export function Modal({ visible, onClose, title, children }) {
  if (!visible) return null;
  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)',
      display: 'flex', alignItems: 'flex-end', zIndex: 100,
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: '28px 28px 0 0',
        padding: 24, width: '100%',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 36, height: 4, background: COLORS.border, borderRadius: 2, margin: '0 auto 20px' }} />
        <div style={{ fontSize: 22, fontWeight: 800, fontFamily: FONTS.title, color: COLORS.text, marginBottom: 16 }}>
          {title}
        </div>
        {children}
      </div>
    </div>
  );
}

export function Input({ placeholder, value, onChange }) {
  return (
    <input
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%', padding: '13px 16px', border: `2px solid ${COLORS.border}`,
        borderRadius: 14, fontSize: 15, fontFamily: FONTS.body,
        color: COLORS.text, background: COLORS.surface, outline: 'none',
        marginBottom: 10,
      }}
    />
  );
}
