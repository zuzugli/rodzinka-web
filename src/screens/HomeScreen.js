import React from 'react';
import { COLORS, FONTS } from '../theme';

const DAYS = [
  { name: 'LUN', num: '31' }, { name: 'MAR', num: '1' },
  { name: 'MER', num: '2' },  { name: 'JEU', num: '3' },
  { name: 'VEN', num: '4' },  { name: 'SAM', num: '5' },
  { name: 'DIM', num: '6' },
];
const TODAY = 5;

const MEMBERS = [
  { initials: 'SP', color: COLORS.sophieColor },
  { initials: 'MA', color: COLORS.marcColor },
  { initials: 'LU', color: COLORS.lucieColor },
  { initials: 'TH', color: COLORS.thomasColor },
];


function Mascot() {
  return (
    <svg width="120" height="130" viewBox="0 0 140 160" fill="none"
      style={{ position: 'absolute', right: 0, bottom: 0, opacity: 0.18, pointerEvents: 'none' }}>
      <ellipse cx="70" cy="105" rx="45" ry="48" fill="#F472B6"/>
      <circle cx="70" cy="55" r="34" fill="#FBBF97"/>
      <circle cx="58" cy="50" r="6" fill="#1A1A1A"/>
      <circle cx="82" cy="50" r="6" fill="#1A1A1A"/>
      <circle cx="60" cy="48" r="2" fill="#fff"/>
      <circle cx="84" cy="48" r="2" fill="#fff"/>
      <path d="M58 64 Q70 76 82 64" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <circle cx="38" cy="52" r="9" fill="#FBBF97"/>
      <circle cx="102" cy="52" r="9" fill="#FBBF97"/>
      <circle cx="52" cy="63" r="7" fill="#F472B6" opacity="0.35"/>
      <circle cx="88" cy="63" r="7" fill="#F472B6" opacity="0.35"/>
    </svg>
  );
}

export default function HomeScreen({ navigate }) {
  return (
    <div style={{ height: '100%', overflowY: 'auto', background: COLORS.background, position: 'relative' }}>
      <div style={{ padding: '12px 20px 100px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: COLORS.textMuted, fontFamily: FONTS.body, marginBottom: 2 }}>Dimanche 5 avril</p>
            <h1 style={{ fontSize: 28, fontWeight: 900, fontFamily: FONTS.title, color: COLORS.text, whiteSpace: 'nowrap', letterSpacing: -0.5 }}>
              Bonjour, Sophie !
            </h1>
          </div>
          <div style={{ position: 'relative', marginLeft: 12, width: 60, height: 60, flexShrink: 0 }}>
            <svg width="60" height="60" viewBox="0 0 60 60" style={{ position: 'absolute', inset: 0 }}>
              <path d="M30 4 C46 4 58 14 56 30 C54 46 42 58 28 56 C14 54 4 42 6 28 C8 12 14 4 30 4Z" fill={COLORS.sophieColor}/>
            </svg>
            <div style={{ width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
              <span style={{ fontSize: 18, fontWeight: 900, color: '#fff', fontFamily: FONTS.body }}>SP</span>
            </div>
          </div>
        </div>

        {/* Semaine — tous les jours sur une ligne */}
        <div style={{ background: COLORS.card, borderRadius: 24, padding: '12px 8px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {DAYS.map((d, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '8px 2px', borderRadius: 14, background: i === TODAY ? COLORS.pink : 'transparent' }}>
                <span style={{ fontSize: 9, fontWeight: 800, fontFamily: FONTS.body, textTransform: 'uppercase', color: i === TODAY ? '#fff' : COLORS.textMuted }}>{d.name}</span>
                <span style={{ fontSize: 15, fontWeight: 900, fontFamily: FONTS.title, color: i === TODAY ? '#fff' : COLORS.text }}>{d.num}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Notif */}
        <div style={{ background: COLORS.pinkLight, borderRadius: 20, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <div style={{ width: 42, height: 42, borderRadius: 14, background: COLORS.pink, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: COLORS.pinkDark, fontFamily: FONTS.body }}>Sortir les poubelles</p>
            <p style={{ fontSize: 12, color: COLORS.pinkDark, opacity: 0.7, fontFamily: FONTS.body }}>Rappel · Aujourd'hui à 19h00</p>
          </div>
          <span style={{ fontSize: 24 }}>🔔</span>
        </div>

        {/* Accès rapide */}
        <p style={{ fontSize: 12, fontWeight: 800, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, fontFamily: FONTS.body }}>Accès rapide</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          {[
            { label: 'Courses', sub: '8 articles', bg: COLORS.pinkLight, color: COLORS.pinkDark, accent: COLORS.pink, emoji: '🛒', tab: 'shopping' },
            { label: 'Repas', sub: '2 absences', bg: COLORS.tealLight, color: COLORS.tealDark, accent: COLORS.teal, emoji: '🍽️', tab: 'calendar' },
          ].map(q => (
            <button key={q.label} onClick={() => navigate(q.tab)} style={{ background: q.bg, borderRadius: 24, padding: '18px 14px', border: 'none', textAlign: 'left', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transition: 'transform 0.15s', position: 'relative', overflow: 'hidden' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'rotate(-1deg) scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>{q.emoji}</div>
              <div style={{ fontSize: 15, fontWeight: 900, fontFamily: FONTS.title, color: q.color, marginBottom: 2 }}>{q.label}</div>
              <div style={{ fontSize: 12, fontWeight: 700, fontFamily: FONTS.body, color: q.color, opacity: 0.75 }}>{q.sub}</div>
            </button>
          ))}
        </div>
        <button onClick={() => navigate('reminders')} style={{ background: COLORS.lavenderLight, borderRadius: 24, padding: '14px 18px', border: 'none', width: '100%', textAlign: 'left', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <span style={{ fontSize: 26 }}>⏰</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, fontFamily: FONTS.title, color: COLORS.lavenderDark }}>Rappels</div>
            <div style={{ fontSize: 12, fontWeight: 700, fontFamily: FONTS.body, color: COLORS.lavenderDark, opacity: 0.75 }}>2 cette semaine</div>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 15, fontFamily: FONTS.accent, color: COLORS.lavender }}>voir →</div>
        </button>

        {/* Famille */}
        <p style={{ fontSize: 12, fontWeight: 800, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, fontFamily: FONTS.body }}>La famille</p>
        <div style={{ background: COLORS.card, borderRadius: 24, padding: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {MEMBERS.map(m => (
              <div key={m.initials} style={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
                <svg width="40" height="40" viewBox="0 0 40 40" style={{ position: 'absolute', inset: 0 }}>
                  <path d="M20 3 C32 3 38 10 37 20 C36 30 28 38 18 37 C8 36 2 28 4 18 C6 8 8 3 20 3Z" fill={m.color}/>
                </svg>
                <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
                  <span style={{ fontSize: 11, fontWeight: 900, color: '#fff', fontFamily: FONTS.body }}>{m.initials}</span>
                </div>
              </div>
            ))}
            <div style={{ marginLeft: 6 }}>
              <p style={{ fontSize: 13, fontWeight: 700, fontFamily: FONTS.body, color: COLORS.text }}>Les Martin</p>
              <p style={{ fontSize: 14, fontFamily: FONTS.accent, color: COLORS.textMuted }}>4 membres 💛</p>
            </div>
          </div>
          <Mascot />
        </div>

      </div>
    </div>
  );
}