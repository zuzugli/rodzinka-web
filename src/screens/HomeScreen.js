import React from 'react';
import { COLORS, FONTS } from '../theme';
import { Avatar, Card, SectionLabel } from '../components';

const DAY_NAMES   = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTH_NAMES = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'aoû', 'sep', 'oct', 'nov', 'déc'];

function getCurrentWeek() {
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      name: DAY_NAMES[i],
      num: d.getDate().toString(),
      month: MONTH_NAMES[d.getMonth()],
      isToday: d.toDateString() === today.toDateString(),
    };
  });
}

const MEMBERS = [
  { initials: 'SP', color: COLORS.sophieColor },
  { initials: 'MA', color: COLORS.marcColor },
  { initials: 'LU', color: COLORS.lucieColor },
  { initials: 'TH', color: COLORS.thomasColor },
];

function MrHappy() {
  return <img src="/mascot.png" alt="mascotte" style={{ width: 92, height: 92, objectFit: 'contain' }} />;
}

export default function HomeScreen({ navigate }) {
  const week = getCurrentWeek();
  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '8px 20px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, fontFamily: FONTS.title, color: COLORS.text, lineHeight: 1.2, letterSpacing: -0.5 }}>
              Bonjour,<br />Sophie !
            </h1>
          </div>
          <MrHappy />
        </div>
        <Avatar initials="SP" color={COLORS.sophieColor} size="lg" />
      </div>

      {/* Semaine */}
      <Card>
        <div style={{ display: 'flex', gap: 4 }}>
          {week.map((d, i) => (
            <button key={i} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 4, padding: '10px 2px', borderRadius: 16,
              border: 'none', cursor: 'pointer',
              background: d.isToday ? COLORS.purple : 'transparent',
            }}>
              <span style={{ fontSize: 9, fontWeight: 700, fontFamily: FONTS.body, textTransform: 'uppercase', color: d.isToday ? 'rgba(255,255,255,0.85)' : COLORS.textMuted }}>
                {d.name}
              </span>
              <span style={{ fontSize: 15, fontWeight: 800, fontFamily: FONTS.title, color: d.isToday ? '#fff' : COLORS.text }}>
                {d.num}
              </span>
              <span style={{ fontSize: 8, fontWeight: 600, fontFamily: FONTS.body, color: d.isToday ? 'rgba(255,255,255,0.75)' : COLORS.textMuted }}>
                {d.month}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* Rappels de la semaine */}
      <SectionLabel>Rappels de la semaine</SectionLabel>
      <Card style={{ padding: '4px 16px', marginBottom: 10 }}>
        {[
          { title: 'Sortir les poubelles', meta: "Aujourd'hui · 19h00 · Hebdo", dot: COLORS.yellowMid },
          { title: 'Anniversaire de Lucie', meta: 'Jeudi 10 avr · Annuel', dot: '#F48FB1' },
        ].map((r, i, arr) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < arr.length - 1 ? `1px solid ${COLORS.border}` : 'none' }}>
            <div style={{ width: 10, height: 10, borderRadius: 5, background: r.dot, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, fontFamily: FONTS.body }}>{r.title}</p>
              <p style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: FONTS.body, marginTop: 2 }}>{r.meta}</p>
            </div>
          </div>
        ))}
      </Card>

      {/* Accès rapide */}
      <SectionLabel>Accès rapide</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        {[
          { label: 'Courses', sub: '8 articles', bg: COLORS.pink, color: COLORS.pinkDark, tab: 'shopping' },
          { label: 'Repas', sub: '2 absences', bg: '#F48FB1', color: '#fff', tab: 'calendar' },
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
        background: COLORS.green, borderRadius: 20, padding: 16,
        border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', marginBottom: 10,
      }}>
        <div style={{ fontSize: 15, fontWeight: 800, fontFamily: FONTS.title, color: COLORS.greenDark }}>Rappels</div>
        <div style={{ fontSize: 12, fontWeight: 700, fontFamily: FONTS.body, color: COLORS.greenDark, opacity: 0.8 }}>2 cette semaine</div>
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
