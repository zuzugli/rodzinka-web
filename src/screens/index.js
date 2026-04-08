import React, { useState, useEffect } from 'react';
import { COLORS, FONTS } from '../theme';
import { Avatar, Card, Modal, PrimaryButton } from '../components';

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MEALS = ['Midi', 'Soir'];
const BASE_MEMBERS = [
  { initials: 'SP', color: COLORS.sophieColor, name: 'Sophie' },
  { initials: 'MA', color: COLORS.marcColor,   name: 'Marc'   },
  { initials: 'LU', color: COLORS.lucieColor,  name: 'Lucie'  },
  { initials: 'TH', color: COLORS.thomasColor, name: 'Thomas' },
];

function getMembers(userName, userColor, userPhoto) {
  return BASE_MEMBERS.map(m =>
    m.initials === 'SP'
      ? { ...m, initials: userName.charAt(0).toUpperCase(), color: userColor, photo: userPhoto, name: userName }
      : m
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
  const [selMeal, setSelMeal] = useState(null);
  const [calMonth, setCalMonth] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });
  const [absences, setAbsences] = useState(() => { try { const s = localStorage.getItem('cal_absences'); return s ? JSON.parse(s) : []; } catch { return []; } });
  useEffect(() => localStorage.setItem('cal_absences', JSON.stringify(absences)), [absences]);
  const week = getWeek(weekOffset);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div style={{ overflowY: 'auto', flex: 1, padding: '8px 20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, fontFamily: FONTS.title, color: COLORS.text, letterSpacing: -0.5 }}>Repas</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setWeekOffset(o => o - 1)} style={{ width: 36, height: 36, borderRadius: 18, border: `1.5px solid ${COLORS.border}`, background: COLORS.surface, cursor: 'pointer', fontSize: 16, display:'flex', alignItems:'center', justifyContent:'center' }}>‹</button>
            <button onClick={() => setWeekOffset(o => o + 1)} style={{ width: 36, height: 36, borderRadius: 18, border: `1.5px solid ${COLORS.border}`, background: COLORS.surface, cursor: 'pointer', fontSize: 16, display:'flex', alignItems:'center', justifyContent:'center' }}>›</button>
          </div>
        </div>
        <p style={{ fontSize: 13, fontFamily: FONTS.body, color: COLORS.textMuted, marginBottom: 16 }}>{formatRange(week)}</p>

        <Card style={{ padding: 12, overflowX: 'auto' }}>
          <div style={{ minWidth: 420 }}>
            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: '40px repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
              <div />
              {week.map(({ dayIndex, date, isToday }) => (
                <div key={dayIndex} style={{ textAlign: 'center', padding: '6px 2px', borderRadius: 10, background: isToday ? COLORS.purple : 'transparent' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, fontFamily: FONTS.body, textTransform: 'uppercase', color: isToday ? '#fff' : COLORS.textMuted }}>{DAYS[dayIndex]}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, fontFamily: FONTS.title, color: isToday ? '#fff' : COLORS.text }}>{date.getDate()}</div>
                </div>
              ))}
            </div>
            {/* Meal rows */}
            {MEALS.map((meal, mi) => (
              <div key={mi} style={{ display: 'grid', gridTemplateColumns: '40px repeat(7, 1fr)', gap: 4, marginBottom: 6, alignItems: 'stretch' }}>
                <div style={{ fontSize: 9, fontWeight: 700, fontFamily: FONTS.body, color: COLORS.textMuted, textTransform: 'uppercase', writingMode: 'vertical-rl', transform: 'rotate(180deg)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{meal}</div>
                {week.map(({ dayIndex, isToday }) => {
                  const bg = isToday ? COLORS.purpleLight : COLORS.surface;
                  const cellDate = week[dayIndex].date;
                  const userAbsent = absences.some(a => a.dateStr === cellDate.toDateString() && a.meal === mi);
                  const allAbsents = userAbsent ? [MEMBERS[0]] : [];
                  return (
                    <div key={dayIndex} onClick={() => setSelected({ d: dayIndex, m: mi, date: cellDate })} style={{ background: bg, borderRadius: 12, padding: '10px 4px', minHeight: 80, border: `1.5px solid ${isToday ? COLORS.purple : COLORS.border}`, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                      {allAbsents.map((mb, idx) => <Avatar key={idx} initials={mb.initials} color={mb.color} size="xs" photo={mb.photo} />)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </Card>
        <PrimaryButton label="Me marquer absent·e…" onClick={() => setAbsentModal(true)} />
      </div>

      {/* Detail modal */}
      <Modal visible={!!selected} onClose={() => setSelected(null)} title={selected ? `${MEALS[selected.m]} · ${DAYS[selected.d]} ${selected.date?.getDate()} ${MONTH_NAMES[selected.date?.getMonth()]}` : ''}>
        {selected && MEMBERS.map(m => {
          const isUserAbsent = m === MEMBERS[0] && absences.some(a => a.dateStr === selected.date?.toDateString() && a.meal === selected.m);
          const present = !isUserAbsent;
          return (
            <div key={m.initials} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: `1px solid ${COLORS.border}` }}>
              <Avatar initials={m.initials} color={m.color} size="sm" photo={m.photo} />
              <span style={{ flex: 1, fontSize: 15, fontWeight: 700, fontFamily: FONTS.body, color: COLORS.text }}>{m.name}</span>
              <span style={{ background: present ? COLORS.green : COLORS.pink, color: present ? COLORS.greenDark : COLORS.pinkDark, fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 999, fontFamily: FONTS.body }}>
                {present ? 'Présent·e' : 'Absent·e'}
              </span>
            </div>
          );
        })}
        {selected && absences.some(a => a.dateStr === selected.date?.toDateString() && a.meal === selected.m) && (
          <button onClick={() => {
            setAbsences(prev => prev.filter(a => !(a.dateStr === selected.date?.toDateString() && a.meal === selected.m)));
            setSelected(null);
          }} style={{ width: '100%', padding: '12px', borderRadius: 14, border: `2px solid ${COLORS.pinkDark}`, background: 'transparent', color: COLORS.pinkDark, fontSize: 14, fontWeight: 700, fontFamily: FONTS.body, cursor: 'pointer', marginTop: 8 }}>
            Annuler mon absence
          </button>
        )}
        <PrimaryButton label="Fermer" onClick={() => setSelected(null)} />
      </Modal>

      {/* Absent modal */}
      <Modal visible={absentModal} onClose={() => { setAbsentModal(false); setSelDate(null); setSelMeal(null); }} title="Me marquer absent·e">
        {/* Mini calendar */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <button onClick={() => setCalMonth(p => { const d = new Date(p.y, p.m - 1); return { y: d.getFullYear(), m: d.getMonth() }; })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: COLORS.text, padding: '0 6px' }}>‹</button>
            <span style={{ fontSize: 14, fontWeight: 700, fontFamily: FONTS.body, color: COLORS.text, textTransform: 'capitalize' }}>
              {new Date(calMonth.y, calMonth.m).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={() => setCalMonth(p => { const d = new Date(p.y, p.m + 1); return { y: d.getFullYear(), m: d.getMonth() }; })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: COLORS.text, padding: '0 6px' }}>›</button>
          </div>
          {/* Day labels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 4 }}>
            {['L','M','M','J','V','S','D'].map((d, i) => (
              <div key={i} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: COLORS.textMuted, fontFamily: FONTS.body }}>{d}</div>
            ))}
          </div>
          {/* Days grid */}
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
                  const isSelected = selDate && selDate.toDateString() === date.toDateString();
                  const isToday = date.toDateString() === today.toDateString();
                  return (
                    <div key={i} onClick={() => !isPast && setSelDate(date)} style={{
                      textAlign: 'center', padding: '7px 2px', borderRadius: 10, cursor: isPast ? 'default' : 'pointer',
                      background: isSelected ? COLORS.purple : isToday ? COLORS.purpleLight : 'transparent',
                      opacity: isPast ? 0.3 : 1,
                    }}>
                      <span style={{ fontSize: 13, fontWeight: 700, fontFamily: FONTS.body, color: isSelected ? '#fff' : isToday ? COLORS.purpleDark : COLORS.text }}>{d}</span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* Meal choice */}
        <p style={{ fontSize: 11, fontWeight: 700, color: !selDate ? COLORS.border : COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, fontFamily: FONTS.body, marginBottom: 8 }}>Choisir le repas</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, opacity: !selDate ? 0.4 : 1 }}>
          {MEALS.map((m, i) => (
            <div key={i} onClick={() => selDate && setSelMeal(i)} style={{ flex: 1, textAlign: 'center', padding: '12px 8px', borderRadius: 14, border: `2px solid ${selMeal === i ? COLORS.purple : COLORS.border}`, background: selMeal === i ? COLORS.purpleLight : COLORS.surface, cursor: selDate ? 'pointer' : 'default' }}>
              <span style={{ fontSize: 14, fontWeight: 700, fontFamily: FONTS.body, color: selMeal === i ? COLORS.purpleDark : COLORS.text }}>{m}</span>
            </div>
          ))}
        </div>
        <PrimaryButton label="Confirmer l'absence" onClick={() => {
          if (selDate && selMeal !== null) {
            setAbsences(prev => [...prev.filter(a => !(a.dateStr === selDate.toDateString() && a.meal === selMeal)), { dateStr: selDate.toDateString(), meal: selMeal }]);
          }
          setAbsentModal(false); setSelDate(null); setSelMeal(null);
        }} />
      </Modal>
    </div>
  );
}

// ── REMINDERS ────────────────────────────────────────────────
const REMINDERS = [];

const CAT = {
  chore:    { dot: COLORS.yellowMid, bg: COLORS.yellow,  c: COLORS.yellowDark, label: 'tâche' },
  birthday: { dot: COLORS.pinkMid,   bg: COLORS.pink,    c: COLORS.pinkDark,   label: 'anniversaire' },
  autre:    { dot: '#999',           bg: '#EEEEEE',      c: '#555',            label: 'autre' },
};

function ReminderItem({ item, members }) {
  const cat = CAT[item.cat];
  return (
    <div style={{ display: 'flex', gap: 12, padding: '13px 0', alignItems: 'flex-start' }}>
      <div style={{ width: 10, height: 10, borderRadius: 5, background: cat.dot, marginTop: 5, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
          <span style={{ fontSize: 15, fontWeight: 700, fontFamily: FONTS.body, color: COLORS.text }}>{item.title}</span>
          <span style={{ background: cat.bg, color: cat.c, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, fontFamily: FONTS.body }}>{cat.label}</span>
        </div>
        <p style={{ fontSize: 12, fontFamily: FONTS.body, color: COLORS.textMuted }}>{item.meta}</p>
        {item.members.length > 0 && (
          <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
            {item.members.map(initials => { const m = members.find(x => x.initials === initials); return m ? <Avatar key={initials} initials={m.initials} color={m.color} size="xs" photo={m.photo} /> : null; })}
          </div>
        )}
      </div>
    </div>
  );
}

function isThisWeek(dateStr) {
  if (!dateStr) return false;
  const today = new Date(); today.setHours(0,0,0,0);
  const dow = today.getDay();
  const mon = new Date(today); mon.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  const d = new Date(dateStr);
  if (isNaN(d)) return false;
  d.setHours(0,0,0,0);
  return d >= mon && d <= sun;
}

export function RemindersScreen({ userName = 'Sophie', userColor = COLORS.sophieColor, userPhoto = null }) {
  const MEMBERS = getMembers(userName, userColor, userPhoto);
  const [modal, setModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newCat, setNewCat] = useState('autre');
  const [reminders, setReminders] = useState(() => {
    try { const s = localStorage.getItem('reminders'); return s ? JSON.parse(s) : REMINDERS; }
    catch { return REMINDERS; }
  });
  useEffect(() => { localStorage.setItem('reminders', JSON.stringify(reminders)); }, [reminders]);

  const thisWeek = reminders.filter(r => isThisWeek(r.dateStr));
  const upcoming = reminders.filter(r => !isThisWeek(r.dateStr) && new Date(r.dateStr) >= new Date());

  function addReminder() {
    if (!newTitle.trim() || !newDate.trim()) return;
    const dateObj = new Date(newDate);
    if (isNaN(dateObj)) return;
    const meta = dateObj.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
    setReminders(prev => [...prev, { id: Date.now(), title: newTitle.trim(), meta, dateStr: dateObj.toDateString(), cat: newCat, members: [MEMBERS[0].initials] }]);
    setNewTitle(''); setNewDate(''); setNewCat('autre'); setModal(false);
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div style={{ overflowY: 'auto', flex: 1, padding: '8px 20px 100px' }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, fontFamily: FONTS.title, color: COLORS.text, letterSpacing: -0.5, marginBottom: 4 }}>Rappels</h2>
        <p style={{ fontSize: 13, fontFamily: FONTS.body, color: COLORS.textMuted, marginBottom: 4 }}>{thisWeek.length} cette semaine</p>

        {thisWeek.length > 0 && <>
          <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, margin: '18px 0 10px', fontFamily: FONTS.body }}>Cette semaine</div>
          <Card style={{ padding: '4px 16px' }}>
            {thisWeek.map((r, i) => <div key={r.id} style={{ borderBottom: i < thisWeek.length - 1 ? `1px solid ${COLORS.border}` : 'none' }}><ReminderItem item={r} members={MEMBERS} /></div>)}
          </Card>
        </>}

        {upcoming.length > 0 && <>
          <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, margin: '18px 0 10px', fontFamily: FONTS.body }}>À venir</div>
          <Card style={{ padding: '4px 16px' }}>
            {upcoming.map((r, i) => <div key={r.id} style={{ borderBottom: i < upcoming.length - 1 ? `1px solid ${COLORS.border}` : 'none' }}><ReminderItem item={r} members={MEMBERS} /></div>)}
          </Card>
        </>}

        {thisWeek.length === 0 && upcoming.length === 0 && (
          <p style={{ textAlign: 'center', padding: 40, color: COLORS.textMuted, fontFamily: FONTS.body }}>Aucun rappel à venir</p>
        )}
      </div>
      <button onClick={() => setModal(true)} style={{ position: 'absolute', bottom: 24, right: 20, width: 52, height: 52, borderRadius: 26, background: COLORS.purple, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 16px ${COLORS.purple}66` }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
      <Modal visible={modal} onClose={() => setModal(false)} title="Nouveau rappel">
        <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Titre…" style={{ width: '100%', padding: '13px 16px', border: `2px solid ${COLORS.border}`, borderRadius: 14, fontSize: 15, fontFamily: FONTS.body, marginBottom: 10, outline: 'none', boxSizing: 'border-box' }} />
        <input value={newDate} onChange={e => setNewDate(e.target.value)} type="date" style={{ width: '100%', padding: '13px 16px', border: `2px solid ${COLORS.border}`, borderRadius: 14, fontSize: 15, fontFamily: FONTS.body, marginBottom: 10, outline: 'none', boxSizing: 'border-box' }} />
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {[['tâche', 'chore'], ['anniversaire', 'birthday'], ['autre', 'autre']].map(([l, k]) => (
            <button key={k} onClick={() => setNewCat(k)} style={{ flex: 1, padding: 10, borderRadius: 12, border: `2px solid ${newCat === k ? COLORS.text : 'transparent'}`, background: CAT[k]?.bg || '#EEE', color: CAT[k]?.c || '#555', fontSize: 12, fontWeight: 700, fontFamily: FONTS.body, cursor: 'pointer' }}>{l}</button>
          ))}
        </div>
        <PrimaryButton label="Créer le rappel" onClick={addReminder} />
      </Modal>
    </div>
  );
}

// ── PROFILE ──────────────────────────────────────────────────
const SWATCHES = [
  '#FFD740', // jaune
  '#F07A4E', // corail
  '#F48FB1', // rose
  '#E53935', // rouge
  '#AB47BC', // violet
  '#00AFBE', // turquoise
  '#26A69A', // vert menthe
  '#66BB6A', // vert
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
            <input
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { setUserName?.(nameInput); setEditingName(false); } if (e.key === 'Escape') setEditingName(false); }}
              autoFocus
              style={{ fontSize: 20, fontWeight: 800, fontFamily: FONTS.title, color: COLORS.text, border: `2px solid ${COLORS.purple}`, borderRadius: 10, padding: '4px 10px', outline: 'none', width: 160 }}
            />
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
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
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
