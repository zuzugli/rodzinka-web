import React from 'react';
import { COLORS, FONTS } from '../theme';
import { Avatar, Card, SectionLabel } from '../components';

const DAYS = [
  { name: 'Lun', num: '31' }, { name: 'Mar', num: '1' },
  { name: 'Mer', num: '2' },  { name: 'Jeu', num: '3' },
  { name: 'Ven', num: '4' },  { name: 'Sam', num: '5' },
  { name: 'Dim', num: '6' },
];
const TODAY = 5;

const MEMBERS = [
  { initials: 'SP', color: COLORS.sophieColor },
  { initials: 'MA', color: COLORS.marcColor },
  { initials: 'LU', color: COLORS.lucieColor },
  { initials: 'TH', color: COLORS.thomasColor },
];

function SunMascot() {
  return (
    <svg width="100" height="112" viewBox="-5 -14 110 126" fill="none">
      {/* Rayons */}
      <line x1="50" y1="26"  x2="50" y2="8"   stroke="#FFD740" strokeWidth="5" strokeLinecap="round"/>
      <line x1="86" y1="54"  x2="72" y2="54"  stroke="#FFD740" strokeWidth="5" strokeLinecap="round"/>
      <line x1="76" y1="84"  x2="66" y2="74"  stroke="#FFD740" strokeWidth="5" strokeLinecap="round"/>
      <line x1="50" y1="82"  x2="50" y2="98"  stroke="#FFD740" strokeWidth="5" strokeLinecap="round"/>
      <line x1="24" y1="84"  x2="34" y2="74"  stroke="#FFD740" strokeWidth="5" strokeLinecap="round"/>
      <line x1="14" y1="54"  x2="28" y2="54"  stroke="#FFD740" strokeWidth="5" strokeLinecap="round"/>
      <line x1="24" y1="26"  x2="34" y2="36"  stroke="#FFD740" strokeWidth="5" strokeLinecap="round"/>
      {/* Bras qui fait coucou */}
      <path d="M70 32 C85 16 90 0 78 -6" stroke="#FFD740" strokeWidth="7" strokeLinecap="round"/>
      <circle cx="76" cy="-8"  r="8" fill="#FFD740"/>
      <circle cx="68" cy="-13" r="5" fill="#FFD740"/>
      <circle cx="84" cy="-13" r="5" fill="#FFD740"/>
      <circle cx="76" cy="-17" r="5" fill="#FFD740"/>
      {/* Corps */}
      <circle cx="50" cy="54" r="28" fill="#FFD740"/>
      {/* Joues */}
      <circle cx="34" cy="60" r="7" fill="#FFB830" opacity="0.4"/>
      <circle cx="66" cy="60" r="7" fill="#FFB830" opacity="0.4"/>
      {/* Yeux */}
      <circle cx="40" cy="48" r="5" fill="#7A5000"/>
      <circle cx="60" cy="48" r="5" fill="#7A5000"/>
      <circle cx="41.5" cy="46.5" r="2" fill="white"/>
      <circle cx="61.5" cy="46.5" r="2" fill="white"/>
      {/* Sourire */}
      <path d="M37 62 Q50 76 63 62" stroke="#7A5000" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

export default function HomeScreen({ navigate }) {
  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '8px 20px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: COLORS.textMuted, marginBottom: 4, fontFamily: FONTS.body }}>
            Dimanche 5 avril
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 800, fontFamily: FONTS.title, color: COLORS.text, lineHeight: 1.2, letterSpacing: -0.5 }}>
            Bonjour,<br />Sophie !
          </h1>
        </div>
        <div style={{ position: 'relative', width: 100, height: 110, flexShrink: 0 }}>
          <div style={{ position: 'absolute', bottom: 0, right: -6, pointerEvents: 'none' }}>
            <SunMascot />
          </div>
          <div style={{ position: 'absolute', top: 0, right: 0, zIndex: 2 }}>
            <Avatar initials="SP" color={COLORS.sophieColor} size="md" />
          </div>
        </div>
      </div>

      {/* Semaine */}
      <Card>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
          {DAYS.map((d, i) => (
            <button key={i} style={{
              flexShrink: 0, width: 46, display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 4, padding: '10px 4px', borderRadius: 16,
              border: 'none', cursor: 'pointer',
              background: i === TODAY ? COLORS.purple : 'transparent',
            }}>
              <span style={{ fontSize: 10, fontWeight: 700, fontFamily: FONTS.body, textTransform: 'uppercase', color: i === TODAY ? 'rgba(255,255,255,0.85)' : COLORS.textMuted }}>
                {d.name}
              </span>
              <span style={{ fontSize: 17, fontWeight: 800, fontFamily: FONTS.title, color: i === TODAY ? '#fff' : COLORS.text }}>
                {d.num}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* Notif */}
      <div style={{ background: COLORS.purpleLight, borderRadius: 18, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: COLORS.purple, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: COLORS.purpleDark, fontFamily: FONTS.body }}>Sortir les poubelles</p>
          <p style={{ fontSize: 12, color: COLORS.purpleDark, opacity: 0.7, fontFamily: FONTS.body }}>Rappel · Aujourd'hui à 19h00</p>
        </div>
      </div>

      {/* Accès rapide */}
      <SectionLabel>Accès rapide</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        {[
          { label: 'Courses', sub: '8 articles', bg: COLORS.pink, color: COLORS.pinkDark, tab: 'shopping' },
          { label: 'Repas', sub: '2 absences', bg: COLORS.blue, color: COLORS.blueDark, tab: 'calendar' },
        ].map(q => (
          <button key={q.label} onClick={() => navigate(q.tab)} style={{
            background: q.bg, borderRadius: 20, padding: 16, border: 'none',
            cursor: 'pointer', textAlign: 'left', minHeight: 100,
          }}>
            <div style={{ fontSize: 15, fontWeight: 800, fontFamily: FONTS.title, color: q.color, marginBottom: 2 }}>{q.label}</div>
            <div style={{ fontSize: 12, fontWeight: 700, fontFamily: FONTS.body, color: q.color, opacity: 0.8 }}>{q.sub}</div>
          </button>
        ))}
      </div>
      <button onClick={() => navigate('reminders')} style={{
        background: COLORS.purpleLight, borderRadius: 20, padding: 16,
        border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', marginBottom: 10,
      }}>
        <div style={{ fontSize: 15, fontWeight: 800, fontFamily: FONTS.title, color: COLORS.purpleDark }}>Rappels</div>
        <div style={{ fontSize: 12, fontWeight: 700, fontFamily: FONTS.body, color: COLORS.purpleDark, opacity: 0.8 }}>2 cette semaine</div>
      </button>

      {/* Famille */}
      <SectionLabel>Famille</SectionLabel>
      <Card>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {MEMBERS.map(m => <Avatar key={m.initials} initials={m.initials} color={m.color} size="sm" />)}
          <span style={{ fontSize: 13, fontFamily: FONTS.body, color: COLORS.textMuted, marginLeft: 4 }}>
            4 membres · Les Martin
          </span>
        </div>
      </Card>
    </div>
  );
}
