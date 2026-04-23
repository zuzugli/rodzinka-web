import React, { useState } from 'react';
import { COLORS, FONTS } from '../theme';
import { Avatar, Card, SectionLabel } from '../components';
import { getMembers } from './index';

const CAT_DOT = { chore: '#00AFBE', birthday: '#F48FB1', autre: '#AB47BC' };
const MEALS_LABEL = ['Midi', 'Soir'];

function getWeek(offset) {
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1) + offset * 7);
  const DAY_NAMES   = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const MONTH_NAMES = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'aoû', 'sep', 'oct', 'nov', 'déc'];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      name: DAY_NAMES[i],
      num: d.getDate().toString(),
      month: MONTH_NAMES[d.getMonth()],
      isToday: d.toDateString() === today.toDateString(),
      date: d,
    };
  });
}

function getThisWeek(reminders, week) {
  const mon = week[0].date; const sun = week[6].date;
  const today = new Date(); today.setHours(0,0,0,0);
  return reminders.filter(r => {
    const base = new Date(r.dateStr); if (isNaN(base)) return false;
    if (r.recur === 'weekly') {
      const day = base.getDay();
      const cur = new Date(mon);
      while (cur <= sun) { if (cur.getDay() === day) return true; cur.setDate(cur.getDate()+1); }
      return false;
    }
    if (r.recur === 'yearly') {
      const d = new Date(base); d.setFullYear(mon.getFullYear());
      return d >= mon && d <= sun;
    }
    const b = new Date(base); b.setHours(0,0,0,0);
    return b >= mon && b <= sun;
  });
}

function remindersForDay(reminders, date) {
  const d = new Date(date); d.setHours(0,0,0,0);
  return reminders.filter(r => {
    if (!r.dateStr) return false;
    const base = new Date(r.dateStr); if (isNaN(base)) return false;
    if (r.recur === 'weekly') return base.getDay() === d.getDay();
    if (r.recur === 'yearly') return base.getMonth() === d.getMonth() && base.getDate() === d.getDate();
    const bd = new Date(base); bd.setHours(0,0,0,0);
    return bd.getTime() === d.getTime();
  });
}

function absencesForDay(date) {
  try {
    const abs = JSON.parse(localStorage.getItem('cal_absences') || '[]');
    return abs.filter(a => a.dateStr === date.toDateString());
  } catch { return []; }
}

function MrHappy() {
  return <img src="/mascot.png" alt="mascotte" style={{ width: 68, height: 68, objectFit: 'contain', marginRight: 8 }} />;
}

export default function HomeScreen({ navigate, userName = 'Sophie', userPhoto, userColor = '#FFD740', reminders = [] }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(null);
  const [touchStartX, setTouchStartX] = useState(null);

  const week = getWeek(weekOffset);
  const thisWeek = getThisWeek(reminders, week);
  const MEMBERS = getMembers(userName, userColor, userPhoto);

  function handleTouchStart(e) { setTouchStartX(e.touches[0].clientX); }
  function handleTouchEnd(e) {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      e.preventDefault();
      setWeekOffset(o => o + (diff > 0 ? 1 : -1));
      setSelectedDay(null);
    }
    setTouchStartX(null);
  }

  const dayDetail = selectedDay ? {
    rappels: remindersForDay(reminders, selectedDay),
    absences: absencesForDay(selectedDay),
  } : null;

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '8px 20px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: FONTS.title, color: COLORS.text, lineHeight: 1.2, letterSpacing: -0.5, flex: 1 }}>
          Bonjour,<br /><span style={{ whiteSpace: 'nowrap' }}>{userName} !</span>
        </h1>
        <MrHappy />
        <Avatar initials={userName.charAt(0).toUpperCase()} color={userColor} size="md" photo={userPhoto} />
      </div>

      {/* Semaine — glissable + jours cliquables */}
      <SectionLabel>Cette semaine</SectionLabel>
      <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} style={{ touchAction: 'pan-y' }}>
        <Card style={{ marginBottom: 0, borderRadius: dayDetail ? '20px 20px 0 0' : 20 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {week.map((d, i) => {
              const isSelected = selectedDay && selectedDay.toDateString() === d.date.toDateString();
              const bg = isSelected ? COLORS.text : d.isToday ? COLORS.purple : 'transparent';
              const c  = (isSelected || d.isToday) ? '#fff' : COLORS.text;
              const cm = (isSelected || d.isToday) ? 'rgba(255,255,255,0.75)' : COLORS.textMuted;
              return (
                <button key={i}
                  onClick={() => setSelectedDay(prev =>
                    prev && prev.toDateString() === d.date.toDateString() ? null : d.date
                  )}
                  onTouchEnd={e => {
                    if (Math.abs(touchStartX - e.changedTouches[0].clientX) < 10) {
                      e.stopPropagation();
                      setSelectedDay(prev =>
                        prev && prev.toDateString() === d.date.toDateString() ? null : d.date
                      );
                    }
                  }}
                  style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 4, padding: '10px 2px', borderRadius: 16, border: 'none', cursor: 'pointer', background: bg,
                }}>
                  <span style={{ fontSize: 11, fontWeight: 700, fontFamily: FONTS.body, textTransform: 'uppercase', color: cm }}>{d.name}</span>
                  <span style={{ fontSize: 19, fontWeight: 800, fontFamily: FONTS.title, color: c }}>{d.num}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, fontFamily: FONTS.body, color: cm }}>{d.month}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Détail du jour sélectionné */}
        {dayDetail && (
          <div style={{
            background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderTop: 'none',
            borderRadius: '0 0 20px 20px', padding: '14px 16px 16px', marginBottom: 10,
          }}>
            {dayDetail.rappels.length === 0 && dayDetail.absences.length === 0 ? (
              <p style={{ fontSize: 13, color: COLORS.textMuted, fontFamily: FONTS.body }}>Rien ce jour-là</p>
            ) : (
              <>
                {dayDetail.rappels.map(r => (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 4, background: CAT_DOT[r.cat] || '#AB47BC', flexShrink: 0 }} />
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, fontFamily: FONTS.body }}>{r.title}</span>
                      {r.meta ? <span style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: FONTS.body, marginLeft: 6 }}>{r.meta}</span> : null}
                    </div>
                  </div>
                ))}
                {dayDetail.absences.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 4, background: COLORS.pinkMid, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, fontFamily: FONTS.body }}>
                      Absent·e — {dayDetail.absences.map(a => MEALS_LABEL[a.meal]).join(' & ')}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Rappels de la semaine */}
      <SectionLabel>Rappels de la semaine</SectionLabel>
      <Card style={{ padding: '4px 16px', marginBottom: 10 }}>
        {thisWeek.length === 0
          ? <p style={{ fontSize: 13, color: COLORS.textMuted, fontFamily: FONTS.body, padding: '12px 0' }}>Aucun rappel cette semaine</p>
          : thisWeek.map((r, i, arr) => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < arr.length - 1 ? `1px solid ${COLORS.border}` : 'none' }}>
              <div style={{ width: 10, height: 10, borderRadius: 5, background: CAT_DOT[r.cat] || '#AB47BC', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, fontFamily: FONTS.body }}>{r.title}</p>
                <p style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: FONTS.body, marginTop: 2 }}>{r.meta}</p>
              </div>
            </div>
          ))
        }
      </Card>

      {/* Accès rapide */}
      <SectionLabel>Accès rapide</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        {[
          { label: 'Courses', sub: '8 articles', bg: '#FFD740', color: '#fff', tab: 'shopping' },
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
        background: '#00AFBE', borderRadius: 20, padding: 16,
        border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', marginBottom: 10,
      }}>
        <div style={{ fontSize: 15, fontWeight: 800, fontFamily: FONTS.title, color: '#fff' }}>Rappels</div>
        <div style={{ fontSize: 12, fontWeight: 700, fontFamily: FONTS.body, color: '#fff', opacity: 0.85 }}>{thisWeek.length} cette semaine</div>
      </button>

      {/* Famille */}
      <SectionLabel>Famille</SectionLabel>
      <Card>
        <p style={{ fontSize: 13, fontWeight: 700, fontFamily: FONTS.body, color: COLORS.textMuted, marginBottom: 12 }}>
          Les Tchenio-Gaubert · {MEMBERS.length} membres
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          {MEMBERS.map(m => (
            <div key={m.initials} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <Avatar initials={m.display || m.initials} color={m.color} size="md" photo={m.photo} />
              <span style={{ fontSize: 11, fontWeight: 700, fontFamily: FONTS.body, color: COLORS.text }}>{m.name}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
