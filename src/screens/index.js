import React, { useState, useEffect } from 'react';
import { COLORS, FONTS } from '../theme';
import { Avatar, Card, Modal, PrimaryButton } from '../components';
import { supabase } from '../supabase';

function toISODate(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MEALS = ['Midi', 'Soir'];
const BASE_MEMBERS = [
  { initials: 'SP', color: COLORS.sophieColor, name: 'Sophie' },
  { initials: 'MA', color: COLORS.marcColor,   name: 'Marc'   },
  { initials: 'LU', color: COLORS.lucieColor,  name: 'Lucie'  },
  { initials: 'TH', color: COLORS.thomasColor, name: 'Thomas' },
];

export function getMembers(userName, userColor, userPhoto) {
  return BASE_MEMBERS.map(m =>
    m.initials === 'SP'
      ? { ...m, display: userName.charAt(0).toUpperCase(), color: userColor, photo: userPhoto, name: userName }
      : { ...m, display: m.initials }
  );
}

const MONTH_NAMES = ['jan','fév','mar','avr','mai','juin','juil','aoû','sep','oct','nov','déc'];

function getWeek(offset) {
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1) + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { dayIndex: i, date: d, isToday: d.toDateString() === today.toDateString() };
  });
}

function formatRange(week) {
  const first = week[0].date;
  const last  = week[6].date;
  const sameMonth = first.getMonth() === last.getMonth();
  return sameMonth
    ? `${first.getDate()} – ${last.getDate()} ${MONTH_NAMES[last.getMonth()]} ${last.getFullYear()}`
    : `${first.getDate()} ${MONTH_NAMES[first.getMonth()]} – ${last.getDate()} ${MONTH_NAMES[last.getMonth()]} ${last.getFullYear()}`;
}

export function CalendarScreen({ userName = 'Sophie', userColor = COLORS.sophieColor, userPhoto = null }) {
  const MEMBERS = getMembers(userName, userColor, userPhoto);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selected, setSelected] = useState(null);
  const [absentModal, setAbsentModal] = useState(false);
  const [selDate, setSelDate] = useState(null);
  const [selDateEnd, setSelDateEnd] = useState(null);
  const [selMealStart, setSelMealStart] = useState(null);
  const [selMealEnd, setSelMealEnd] = useState(null);
  const [calMonth, setCalMonth] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });
  const [absences, setAbsences] = useState([]);
  const [touchStartX, setTouchStartX] = useState(null);
  const [slideDir, setSlideDir] = useState(null);
  const [animKey, setAnimKey] = useState(0);

  async function loadAbsences() {
    const { data } = await supabase.from('meals').select('*').eq('meal_type', 'absence');
    if (data) setAbsences(data.map(a => ({
      id: a.id,
      dateStr: new Date(a.date + 'T12:00:00').toDateString(),
      meal: a.name === 'midi' ? 0 : 1,
      memberInitials: a.created_by,
    })));
  }

  useEffect(() => {
    loadAbsences();
    const sub = supabase.channel('absences')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meals' }, loadAbsences)
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, []);

  const week = getWeek(weekOffset);

  function handleTouchStart(e) { setTouchStartX(e.touches[0].clientX); }
  function handleTouchEnd(e) {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      const dir = diff > 0 ? 'left' : 'right';
      setSlideDir(dir);
      setAnimKey(k => k + 1);
      setWeekOffset(o => o + (diff > 0 ? 1 : -1));
    }
    setTouchStartX(null);
  }

  async function confirmerAbsence() {
    if (selDate && selMealStart !== null && selMealEnd !== null) {
      const endD = selDateEnd || selDate;
      const cur = new Date(selDate);
      while (cur.getTime() <= endD.getTime()) {
        for (let m = 0; m <= 1; m++) {
          const afterStart = cur.getTime() > selDate.getTime() || m >= selMealStart;
          const beforeEnd = cur.getTime() < endD.getTime() || m <= selMealEnd;
          if (afterStart && beforeEnd) {
            await supabase.from('meals').insert({
              date: toISODate(cur),
              meal_type: 'absence',
              name: m === 0 ? 'midi' : 'soir',
              created_by: MEMBERS[0].initials,
            });
          }
        }
        cur.setDate(cur.getDate() + 1);
      }
      await loadAbsences();
    }
    setAbsentModal(false); setSelDate(null); setSelDateEnd(null); setSelMealStart(null); setSelMealEnd(null);
  }

  async function annulerAbsence(dateStr, meal) {
    const absence = absences.find(a => a.dateStr === dateStr && a.meal === meal && a.memberInitials === MEMBERS[0].initials);
    if (absence?.id) await supabase.from('meals').delete().eq('id', absence.id);
    await loadAbsences();
    setSelected(null);
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div style={{ overflowY: 'auto', flex: 1, padding: '8px 20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, fontFamily: FONTS.title, color: COLORS.text, letterSpacing: -0.5 }}>Repas</h2>
            <p style={{ fontSize: 15, fontWeight: 700, fontFamily: FONTS.body, color: COLORS.purple, marginTop: 2 }}>{formatRange(week)}</p>
          </div>
          <img src="/glouton.png" alt="mascotte" style={{ width: 80, height: 80, objectFit: 'contain' }} />
        </div>

        <style>{`
          @keyframes slideFromRight { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
          @keyframes slideFromLeft  { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
        `}</style>
        <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} style={{ touchAction: 'pan-y' }}>
        <Card style={{ padding: 8 }}>
          <div key={animKey} style={{ animation: slideDir ? `${slideDir === 'left' ? 'slideFromRight' : 'slideFromLeft'} 0.25s ease` : 'none' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '28px repeat(7, 1fr)', gap: 3, marginBottom: 6 }}>
              <div />
              {week.map(({ dayIndex, date, isToday }) => (
                <div key={dayIndex} style={{ textAlign: 'center', padding: '5px 1px', borderRadius: 10, background: isToday ? COLORS.purple : 'transparent' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, fontFamily: FONTS.body, textTransform: 'uppercase', color: isToday ? '#fff' : COLORS.textMuted }}>{DAYS[dayIndex]}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, fontFamily: FONTS.title, color: isToday ? '#fff' : COLORS.text }}>{date.getDate()}</div>
                  <div style={{ fontSize: 8, fontWeight: 600, fontFamily: FONTS.body, color: isToday ? 'rgba(255,255,255,0.8)' : COLORS.textMuted }}>{MONTH_NAMES[date.getMonth()]}</div>
                </div>
              ))}
            </div>
            {MEALS.map((meal, mi) => (
              <div key={mi} style={{ display: 'grid', gridTemplateColumns: '28px repeat(7, 1fr)', gap: 3, marginBottom: 4, alignItems: 'stretch' }}>
                <div style={{ fontSize: 8, fontWeight: 700, fontFamily: FONTS.body, color: COLORS.textMuted, textTransform: 'uppercase', writingMode: 'vertical-rl', transform: 'rotate(180deg)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{meal}</div>
                {week.map(({ dayIndex, isToday }) => {
                  const bg = isToday ? COLORS.purpleLight : COLORS.surface;
                  const cellDate = week[dayIndex].date;
                  const userAbsent = absences.some(a => a.dateStr === cellDate.toDateString() && a.meal === mi);
                  const allAbsents = userAbsent ? [MEMBERS[0]] : [];
                  return (
                    <div key={dayIndex} onClick={() => setSelected({ d: dayIndex, m: mi, date: cellDate })} style={{ background: bg, borderRadius: 10, padding: '6px 2px', minHeight: 60, border: `1.5px solid ${isToday ? COLORS.purple : COLORS.border}`, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                      {allAbsents.map((mb, idx) => <Avatar key={idx} initials={mb.display || mb.initials} color={mb.color} size="xs" photo={mb.photo} />)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </Card>
        </div>

        <PrimaryButton label="Me marquer absent·e…" onClick={() => setAbsentModal(true)} />

        {(() => {
          const today = new Date();
          const todayStr = today.toDateString();
          const todayLabel = today.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
          return (
            <>
              <div style={{ marginTop: 20, marginBottom: 6 }}>
                <p style={{ fontSize: 18, fontWeight: 800, fontFamily: FONTS.title, color: COLORS.text }}>Absences du jour</p>
                <p style={{ fontSize: 13, fontFamily: FONTS.body, color: COLORS.textMuted, marginTop: 2 }}>{todayLabel}</p>
              </div>
              <Card style={{ padding: '0 16px' }}>
                {MEALS.map((meal, mi) => {
                  const absentMembers = MEMBERS.filter(m =>
                    absences.some(a => a.dateStr === todayStr && a.meal === mi && a.memberInitials === m.initials)
                    || (m === MEMBERS[0] && absences.some(a => a.dateStr === todayStr && a.meal === mi && !a.memberInitials))
                  );
                  return (
                    <div key={mi} style={{ padding: '14px 0', borderBottom: mi === 0 ? `1px solid ${COLORS.border}` : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: absentMembers.length > 0 ? 10 : 0 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: mi === 0 ? COLORS.purpleLight : '#FFF0D0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: 14 }}>{mi === 0 ? '☀️' : '🌙'}</span>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 800, fontFamily: FONTS.title, color: COLORS.text, flex: 1 }}>{meal}</span>
                        {absentMembers.length === 0 && <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.greenMid, fontFamily: FONTS.body }}>Tout le monde présent</span>}
                      </div>
                      {absentMembers.length > 0 && (
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                          {absentMembers.map(m => (
                            <div key={m.initials} style={{ display: 'flex', alignItems: 'center', gap: 8, background: COLORS.pink, borderRadius: 12, padding: '6px 12px 6px 6px' }}>
                              <Avatar initials={m.display || m.initials} color={m.color} size="xs" photo={m.photo} />
                              <span style={{ fontSize: 13, fontWeight: 700, fontFamily: FONTS.body, color: COLORS.pinkDark }}>{m.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </Card>
            </>
          );
        })()}
      </div>

      <Modal visible={!!selected} onClose={() => setSelected(null)} title={selected ? `${MEALS[selected.m]} · ${DAYS[selected.d]} ${selected.date?.getDate()} ${MONTH_NAMES[selected.date?.getMonth()]}` : ''}>
        {selected && MEMBERS.map(m => {
          const isUserAbsent = m === MEMBERS[0] && absences.some(a => a.dateStr === selected.date?.toDateString() && a.meal === selected.m);
          const present = !isUserAbsent;
          return (
            <div key={m.initials} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: `1px solid ${COLORS.border}` }}>
              <Avatar initials={m.display || m.initials} color={m.color} size="sm" photo={m.photo} />
              <span style={{ flex: 1, fontSize: 15, fontWeight: 700, fontFamily: FONTS.body, color: COLORS.text }}>{m.name}</span>
              <span style={{ background: present ? COLORS.green : COLORS.pink, color: present ? COLORS.greenDark : COLORS.pinkDark, fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 999, fontFamily: FONTS.body }}>
                {present ? 'Présent·e' : 'Absent·e'}
              </span>
            </div>
          );
        })}
        {selected && absences.some(a => a.dateStr === selected.date?.toDateString() && a.meal === selected.m) && (
          <button onClick={() => annulerAbsence(selected.date.toDateString(), selected.m)} style={{ width: '100%', padding: '12px', borderRadius: 14, border: `2px solid ${COLORS.pinkDark}`, background: 'transparent', color: COLORS.pinkDark, fontSize: 14, fontWeight: 700, fontFamily: FONTS.body, cursor: 'pointer', marginTop: 8 }}>
            Annuler mon absence
          </button>
        )}
        <PrimaryButton label="Fermer" onClick={() => setSelected(null)} />
      </Modal>

      <Modal visible={absentModal} onClose={() => { setAbsentModal(false); setSelDate(null); setSelDateEnd(null); setSelMealStart(null); setSelMealEnd(null); }} title="Me marquer absent·e">
        <p style={{ fontSize: 12, color: COLORS.textMuted, fontFamily: FONTS.body, marginBottom: 10 }}>
          {!selDate ? '1. Sélectionne le jour de début' : !selDateEnd ? '2. Sélectionne le jour de fin (ou choisis le repas pour un seul jour)' : `Du ${selDate.toLocaleDateString('fr-FR')} au ${selDateEnd.toLocaleDateString('fr-FR')}`}
        </p>
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <button onClick={() => setCalMonth(p => { const d = new Date(p.y, p.m - 1); return { y: d.getFullYear(), m: d.getMonth() }; })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: COLORS.text, padding: '0 6px' }}>‹</button>
            <span style={{ fontSize: 14, fontWeight: 700, fontFamily: FONTS.body, color: COLORS.text, textTransform: 'capitalize' }}>
              {new Date(calMonth.y, calMonth.m).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={() => setCalMonth(p => { const d = new Date(p.y, p.m + 1); return { y: d.getFullYear(), m: d.getMonth() }; })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: COLORS.text, padding: '0 6px' }}>›</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 4 }}>
            {['L','M','M','J','V','S','D'].map((d, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: COLORS.textMuted, fontFamily: FONTS.body }}>{d}</div>
            ))}
          </div>
          {(() => {
            const today = new Date(); today.setHours(0,0,0,0);
            const firstDay = new Date(calMonth.y, calMonth.m, 1);
            const startOffset = (firstDay.getDay() + 6) % 7;
            const daysInMonth = new Date(calMonth.y, calMonth.m + 1, 0).getDate();
            const cells = [];
            for (let i = 0; i < startOffset; i++) cells.push(null);
            for (let d = 1; d <= daysInMonth; d++) cells.push(d);
            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
                {cells.map((d, i) => {
                  if (!d) return <div key={i} />;
                  const date = new Date(calMonth.y, calMonth.m, d); date.setHours(0,0,0,0);
                  const isPast = date < today;
                  const isStart = selDate && date.toDateString() === selDate.toDateString();
                  const isEnd = selDateEnd && date.toDateString() === selDateEnd.toDateString();
                  const isInRange = selDate && selDateEnd && date > selDate && date < selDateEnd;
                  const isToday = date.toDateString() === today.toDateString();
                  return (
                    <div key={i} onClick={() => {
                      if (isPast) return;
                      if (!selDate || selDateEnd) { setSelDate(date); setSelDateEnd(null); }
                      else if (date >= selDate) { setSelDateEnd(date); }
                      else { setSelDate(date); setSelDateEnd(null); }
                    }} style={{
                      textAlign: 'center', padding: '7px 2px', borderRadius: 10, cursor: isPast ? 'default' : 'pointer',
                      background: isStart || isEnd ? COLORS.purple : isInRange ? COLORS.purpleLight : isToday ? COLORS.purpleLight : 'transparent',
                      opacity: isPast ? 0.3 : 1,
                    }}>
                      <span style={{ fontSize: 13, fontWeight: 700, fontFamily: FONTS.body, color: isStart || isEnd ? '#fff' : isInRange || isToday ? COLORS.purpleDark : COLORS.text }}>{d}</span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        <div style={{ opacity: !selDate ? 0.4 : 1, marginBottom: 12 }}>
          {!selDateEnd ? (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, color: !selDate ? COLORS.border : COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: FONTS.body, marginBottom: 8 }}>Choisir le repas</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {[['Midi', 0, 0], ['Soir', 1, 1], ['Les deux', 0, 1]].map(([label, ms, me]) => {
                  const active = selMealStart === ms && selMealEnd === me;
                  return (
                    <div key={label} onClick={() => { if (selDate) { setSelMealStart(ms); setSelMealEnd(me); } }} style={{ flex: 1, textAlign: 'center', padding: '12px 4px', borderRadius: 14, border: `2px solid ${active ? COLORS.purple : COLORS.border}`, background: active ? COLORS.purpleLight : COLORS.surface, cursor: selDate ? 'pointer' : 'default' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, fontFamily: FONTS.body, color: active ? COLORS.purpleDark : COLORS.text }}>{label}</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: FONTS.body, marginBottom: 6 }}>Repas de début</p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                {MEALS.map((m, i) => (
                  <div key={i} onClick={() => setSelMealStart(i)} style={{ flex: 1, textAlign: 'center', padding: '10px 8px', borderRadius: 14, border: `2px solid ${selMealStart === i ? COLORS.purple : COLORS.border}`, background: selMealStart === i ? COLORS.purpleLight : COLORS.surface, cursor: 'pointer' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, fontFamily: FONTS.body, color: selMealStart === i ? COLORS.purpleDark : COLORS.text }}>{m}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: FONTS.body, marginBottom: 6 }}>Repas de fin</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {MEALS.map((m, i) => (
                  <div key={i} onClick={() => setSelMealEnd(i)} style={{ flex: 1, textAlign: 'center', padding: '10px 8px', borderRadius: 14, border: `2px solid ${selMealEnd === i ? COLORS.purple : COLORS.border}`, background: selMealEnd === i ? COLORS.purpleLight : COLORS.surface, cursor: 'pointer' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, fontFamily: FONTS.body, color: selMealEnd === i ? COLORS.purpleDark : COLORS.text }}>{m}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <PrimaryButton label="Confirmer l'absence" onClick={confirmerAbsence} />
        <button onClick={() => { setAbsentModal(false); setSelDate(null); setSelDateEnd(null); setSelMealStart(null); setSelMealEnd(null); }} style={{ width: '100%', padding: '12px', borderRadius: 14, border: `2px solid ${COLORS.border}`, background: 'transparent', color: COLORS.textMuted, fontSize: 14, fontWeight: 700, fontFamily: FONTS.body, cursor: 'pointer', marginTop: 6 }}>
          Annuler
        </button>
      </Modal>
    </div>
  );
}

// ── REMINDERS ────────────────────────────────────────────────
const REMINDERS = [];

const CAT = {
  chore:    { dot: '#00AFBE',        bg: '#E0F7FA',      c: '#006878',         label: 'tâche' },
  birthday: { dot: COLORS.pinkMid,   bg: COLORS.pink,    c: COLORS.pinkDark,   label: 'anniversaire' },
  autre:    { dot: '#AB47BC',        bg: '#F3E5F5',      c: '#6A1B9A',         label: 'autre' },
};

function ReminderItem({ item, members, onPress }) {
  const cat = CAT[item.cat] || CAT.autre;
  return (
    <div onClick={onPress} style={{ display: 'flex', gap: 12, padding: '13px 0', alignItems: 'flex-start', cursor: 'pointer' }}>
      <div style={{ width: 10, height: 10, borderRadius: 5, background: cat.dot, marginTop: 5, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
          <span style={{ fontSize: 15, fontWeight: 700, fontFamily: FONTS.body, color: COLORS.text }}>{item.title}</span>
          <span style={{ background: cat.bg, color: cat.c, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, fontFamily: FONTS.body }}>{cat.label}</span>
        </div>
        <p style={{ fontSize: 12, fontFamily: FONTS.body, color: COLORS.textMuted }}>{item.meta}</p>
        {item.members && item.members.length > 0 && (
          <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
            {item.members.map(initials => { const m = members.find(x => x.initials === initials); return m ? <Avatar key={initials} initials={m.display || m.initials} color={m.color} size="xs" photo={m.photo} /> : null; })}
          </div>
        )}
      </div>
    </div>
  );
}

function getWeekBounds() {
  const today = new Date(); today.setHours(0,0,0,0);
  const dow = today.getDay();
  const mon = new Date(today); mon.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6); sun.setHours(23,59,59,999);
  return { mon, sun };
}

function nextOccurrence(r) {
  if (!r.dateStr) return null;
  const base = new Date(r.dateStr);
  if (isNaN(base)) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  if (r.recur === 'hebdo') {
    const next = new Date(today);
    const diff = (base.getDay() - today.getDay() + 7) % 7;
    next.setDate(today.getDate() + diff);
    return next;
  }
  if (r.recur === 'annuel') {
    const next = new Date(today.getFullYear(), base.getMonth(), base.getDate());
    if (next < today) next.setFullYear(next.getFullYear() + 1);
    return next;
  }
  return base;
}

function isThisWeek(r) {
  const d = nextOccurrence(r);
  if (!d) return false;
  const { mon, sun } = getWeekBounds();
  return d >= mon && d <= sun;
}

function isUpcoming(r) {
  const d = nextOccurrence(r);
  if (!d) return false;
  const { sun } = getWeekBounds();
  const today = new Date(); today.setHours(0,0,0,0);
  return d > sun || (r.recur && d >= today);
}

export function RemindersScreen({ userName = 'Sophie', userColor = COLORS.sophieColor, userPhoto = null, reminders = [], setReminders }) {
  const MEMBERS = getMembers(userName, userColor, userPhoto);
  const [modal, setModal] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDay, setNewDay] = useState('');
  const [newMonth, setNewMonth] = useState('');
  const [newYear, setNewYear] = useState(String(new Date().getFullYear()));
  const [newCat, setNewCat] = useState('autre');
  const [newRecur, setNewRecur] = useState('none');

  const thisWeek = reminders.filter(r => isThisWeek(r));
  const upcoming = reminders.filter(r => !isThisWeek(r) && (() => { const d = nextOccurrence(r); return d && d >= new Date(); })());

  function toggleMember(reminderId, initials) {
    setReminders(prev => prev.map(r => {
      if (r.id !== reminderId) return r;
      const has = r.members.includes(initials);
      return { ...r, members: has ? r.members.filter(i => i !== initials) : [...r.members, initials] };
    }));
    setSelectedReminder(prev => {
      if (!prev || prev.id !== reminderId) return prev;
      const has = prev.members.includes(initials);
      return { ...prev, members: has ? prev.members.filter(i => i !== initials) : [...prev.members, initials] };
    });
  }

  async function addReminder() {
    if (!newTitle.trim() || !newDay || !newMonth) return;
    const dateObj = new Date(Number(newYear), Number(newMonth) - 1, Number(newDay));
    if (isNaN(dateObj)) return;
    await supabase.from('reminders').insert({
      title: newTitle.trim(),
      date: toISODate(dateObj),
      recurrence: newRecur,
      created_by: MEMBERS[0].initials,
    });
    setNewTitle(''); setNewDay(''); setNewMonth(''); setNewYear(String(new Date().getFullYear())); setNewCat('autre'); setNewRecur('none'); setModal(false);
  }

  async function deleteReminder(id) {
    await supabase.from('reminders').delete().eq('id', id);
    setSelectedReminder(null);
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div style={{ overflowY: 'auto', flex: 1, padding: '8px 20px 100px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 4 }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, fontFamily: FONTS.title, color: COLORS.text, letterSpacing: -0.5 }}>Rappels</h2>
            <p style={{ fontSize: 13, fontFamily: FONTS.body, color: COLORS.textMuted, marginTop: 4 }}>{thisWeek.length} cette semaine</p>
          </div>
          <img src="/chatouille.png" alt="mascotte" style={{ width: 115, height: 115, objectFit: 'contain' }} />
        </div>

        {thisWeek.length > 0 && <>
          <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, margin: '18px 0 10px', fontFamily: FONTS.body }}>Cette semaine</div>
          <Card style={{ padding: '4px 16px' }}>
            {thisWeek.map((r, i) => <div key={r.id} style={{ borderBottom: i < thisWeek.length - 1 ? `1px solid ${COLORS.border}` : 'none' }}><ReminderItem item={r} members={MEMBERS} onPress={() => setSelectedReminder(r)} /></div>)}
          </Card>
        </>}

        {upcoming.length > 0 && <>
          <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, margin: '18px 0 10px', fontFamily: FONTS.body }}>À venir</div>
          <Card style={{ padding: '4px 16px' }}>
            {upcoming.map((r, i) => <div key={r.id} style={{ borderBottom: i < upcoming.length - 1 ? `1px solid ${COLORS.border}` : 'none' }}><ReminderItem item={r} members={MEMBERS} onPress={() => setSelectedReminder(r)} /></div>)}
          </Card>
        </>}

        {thisWeek.length === 0 && upcoming.length === 0 && (
          <p style={{ textAlign: 'center', padding: 40, color: COLORS.textMuted, fontFamily: FONTS.body }}>Aucun rappel à venir</p>
        )}
      </div>
      <button onClick={() => setModal(true)} style={{ position: 'absolute', bottom: 24, right: 20, width: 52, height: 52, borderRadius: 26, background: COLORS.purple, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 16px ${COLORS.purple}66` }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>

      <Modal visible={!!selectedReminder} onClose={() => setSelectedReminder(null)} title={selectedReminder?.title || ''}>
        {selectedReminder && <>
          <p style={{ fontSize: 12, fontFamily: FONTS.body, color: COLORS.textMuted, marginBottom: 16 }}>{selectedReminder.meta}</p>
          <p style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: FONTS.body, marginBottom: 10 }}>Notifications</p>
          {BASE_MEMBERS.map(bm => {
            const m = MEMBERS.find(x => x.initials === bm.initials) || bm;
            const isIn = selectedReminder.members && selectedReminder.members.includes(m.initials);
            return (
              <div key={m.initials} onClick={() => toggleMember(selectedReminder.id, m.initials)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: `1px solid ${COLORS.border}`, cursor: 'pointer' }}>
                <Avatar initials={m.display || m.initials} color={m.color} size="sm" photo={m.photo} />
                <span style={{ flex: 1, fontSize: 15, fontWeight: 700, fontFamily: FONTS.body, color: COLORS.text }}>{m.name}</span>
                <div style={{ width: 46, height: 27, borderRadius: 14, background: isIn ? COLORS.greenMid : COLORS.border, position: 'relative', transition: 'background 0.2s' }}>
                  <div style={{ position: 'absolute', top: 3, left: isIn ? 22 : 3, width: 21, height: 21, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                </div>
              </div>
            );
          })}
          <PrimaryButton label="Fermer" onClick={() => setSelectedReminder(null)} />
          <button onClick={() => deleteReminder(selectedReminder.id)} style={{ width: '100%', padding: '12px', borderRadius: 14, border: `2px solid ${COLORS.pinkDark}`, background: 'transparent', color: COLORS.pinkDark, fontSize: 14, fontWeight: 700, fontFamily: FONTS.body, cursor: 'pointer', marginTop: 6 }}>
            Supprimer ce rappel
          </button>
        </>}
      </Modal>

      <Modal visible={modal} onClose={() => setModal(false)} title="Nouveau rappel">
        <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Titre…" style={{ width: '100%', padding: '13px 16px', border: `2px solid ${COLORS.border}`, borderRadius: 14, fontSize: 15, fontFamily: FONTS.body, marginBottom: 10, outline: 'none', boxSizing: 'border-box' }} />
        <p style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: FONTS.body, marginBottom: 8 }}>Date</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <select value={newDay} onChange={e => setNewDay(e.target.value)} style={{ flex: 1, padding: '12px 8px', border: `2px solid ${COLORS.border}`, borderRadius: 14, fontSize: 15, fontFamily: FONTS.body, outline: 'none', background: '#fff' }}>
            <option value="">Jour</option>
            {Array.from({length:31},(_,i)=>i+1).map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={newMonth} onChange={e => setNewMonth(e.target.value)} style={{ flex: 2, padding: '12px 8px', border: `2px solid ${COLORS.border}`, borderRadius: 14, fontSize: 15, fontFamily: FONTS.body, outline: 'none', background: '#fff' }}>
            <option value="">Mois</option>
            {['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'].map((m,i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
          <select value={newYear} onChange={e => setNewYear(e.target.value)} style={{ flex: 1, padding: '12px 8px', border: `2px solid ${COLORS.border}`, borderRadius: 14, fontSize: 15, fontFamily: FONTS.body, outline: 'none', background: '#fff' }}>
            {Array.from({length:5},(_,i)=>new Date().getFullYear()+i).map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <p style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: FONTS.body, marginBottom: 8 }}>Catégorie</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {[['tâche', 'chore'], ['anniversaire', 'birthday'], ['autre', 'autre']].map(([l, k]) => (
            <button key={k} onClick={() => setNewCat(k)} style={{ flex: 1, padding: 10, borderRadius: 12, border: `2px solid ${newCat === k ? COLORS.text : 'transparent'}`, background: CAT[k]?.bg || '#EEE', color: CAT[k]?.c || '#555', fontSize: 12, fontWeight: 700, fontFamily: FONTS.body, cursor: 'pointer' }}>{l}</button>
          ))}
        </div>
        <p style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: FONTS.body, marginBottom: 8 }}>Récurrence</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {[['Aucune', 'none'], ['Hebdo', 'hebdo'], ['Annuel', 'annuel']].map(([l, k]) => (
            <button key={k} onClick={() => setNewRecur(k)} style={{ flex: 1, padding: 10, borderRadius: 12, border: `2px solid ${newRecur === k ? COLORS.purple : COLORS.border}`, background: newRecur === k ? COLORS.purpleLight : COLORS.surface, color: newRecur === k ? COLORS.purpleDark : COLORS.textMuted, fontSize: 12, fontWeight: 700, fontFamily: FONTS.body, cursor: 'pointer' }}>{l}</button>
          ))}
        </div>
        <PrimaryButton label="Créer le rappel" onClick={addReminder} />
      </Modal>
    </div>
  );
}

// ── PROFILE ──────────────────────────────────────────────────
const SWATCHES = [
  '#FFD740', '#F07A4E', '#F48FB1', '#E53935', '#AB47BC', '#00AFBE', '#66BB6A',
];

export function ProfileScreen({ userName = 'Sophie', setUserName, userPhoto, setUserPhoto, userColor = '#FFD740', setUserColor }) {
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);
  const [notifs, setNotifs] = useState({ shopping: true, meals: true, reminders: true });
  const [copied, setCopied] = useState(false);

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setUserPhoto?.(ev.target.result);
    reader.readAsDataURL(file);
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '8px 20px 40px' }}>
      <h2 style={{ fontSize: 32, fontWeight: 800, fontFamily: FONTS.title, color: COLORS.text, letterSpacing: -0.5, marginBottom: 16 }}>Profil</h2>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 0 20px' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <Avatar initials={userName.charAt(0).toUpperCase()} color={userColor} size="lg" photo={userPhoto} />
          <label style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: COLORS.text, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid #fff' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
          </label>
        </div>
        {userPhoto && (
          <button onClick={() => setUserPhoto?.(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: COLORS.textMuted, fontFamily: FONTS.body, textDecoration: 'underline' }}>
            Supprimer la photo
          </button>
        )}
        {editingName ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input value={nameInput} onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { setUserName?.(nameInput); setEditingName(false); } if (e.key === 'Escape') setEditingName(false); }}
              autoFocus style={{ fontSize: 20, fontWeight: 800, fontFamily: FONTS.title, color: COLORS.text, border: `2px solid ${COLORS.purple}`, borderRadius: 10, padding: '4px 10px', outline: 'none', width: 160 }} />
            <button onClick={() => { setUserName?.(nameInput); setEditingName(false); }} style={{ background: COLORS.purple, color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', fontWeight: 700, fontFamily: FONTS.body, cursor: 'pointer' }}>OK</button>
          </div>
        ) : (
          <p onClick={() => { setNameInput(userName); setEditingName(true); }} style={{ fontSize: 28, fontWeight: 800, fontFamily: FONTS.title, color: COLORS.text, cursor: 'pointer' }}>{userName} ✎</p>
        )}
        <div style={{ background: COLORS.purpleLight, borderRadius: 999, padding: '3px 14px 6px', textAlign: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.purpleDark, fontFamily: FONTS.body, lineHeight: 1 }}>Famille Tchenio-Gaubert</span>
        </div>
      </div>

      {!userPhoto && <>
        <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 0 10px', fontFamily: FONTS.body }}>Couleur d'avatar</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20, justifyContent: 'center' }}>
          {SWATCHES.map(c => (
            <div key={c} onClick={() => setUserColor?.(c)} style={{ width: 34, height: 34, borderRadius: '50%', background: c, cursor: 'pointer', border: `3px solid ${userColor === c ? COLORS.text : 'transparent'}` }} />
          ))}
        </div>
      </>}

      <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, fontFamily: FONTS.body }}>Notifications</div>
      <Card style={{ padding: '0 16px' }}>
        {[['shopping', 'Nouveaux articles'], ['meals', 'Absences repas'], ['reminders', 'Rappels']].map(([k, l], i, arr) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < arr.length - 1 ? `1px solid ${COLORS.border}` : 'none' }}>
            <span style={{ fontSize: 15, fontWeight: 700, fontFamily: FONTS.body, color: COLORS.text }}>{l}</span>
            <div onClick={() => setNotifs(p => ({ ...p, [k]: !p[k] }))} style={{ width: 46, height: 27, borderRadius: 14, background: notifs[k] ? COLORS.greenMid : COLORS.border, cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
              <div style={{ position: 'absolute', top: 3, left: notifs[k] ? 22 : 3, width: 21, height: 21, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
            </div>
          </div>
        ))}
      </Card>

      <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, margin: '20px 0 10px', fontFamily: FONTS.body }}>Code famille</div>
      <div style={{ background: COLORS.yellow, borderRadius: 24, padding: 22, textAlign: 'center' }}>
        <p style={{ fontSize: 12, fontFamily: FONTS.body, color: COLORS.yellowDark, opacity: 0.75, marginBottom: 8 }}>Partagez ce code pour inviter la famille</p>
        <p style={{ fontSize: 32, fontWeight: 800, fontFamily: FONTS.title, color: COLORS.yellowDark, letterSpacing: 8 }}>TCHN42</p>
        <button onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ background: COLORS.text, color: '#fff', border: 'none', borderRadius: 12, padding: '11px 28px', fontSize: 14, fontWeight: 700, fontFamily: FONTS.body, cursor: 'pointer', marginTop: 14 }}>
          {copied ? '✓ Copié !' : 'Copier'}
        </button>
      </div>
    </div>
  );
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations().then(regs => {
      regs.forEach(r => r.unregister());
    });
  });
}