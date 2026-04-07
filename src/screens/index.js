import React, { useState } from 'react';
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

const MEAL_DATA = {
  0: { 0:{p:['SP','MA','LU','TH'],a:[]}, 1:{p:['SP','MA','LU','TH'],a:[]} },
  1: { 0:{p:['SP','MA','LU','TH'],a:[]}, 1:{p:['SP','LU'],a:['MA','TH']} },
  2: { 0:{p:['SP','MA','TH'],a:['LU']}, 1:{p:['SP','MA','LU','TH'],a:[]} },
  3: { 0:{p:['SP','MA','LU','TH'],a:[]}, 1:{p:['SP','MA','LU','TH'],a:[]} },
  4: { 0:{p:['SP','MA','LU','TH'],a:[]}, 1:{p:['SP','MA','LU','TH'],a:[]} },
  5: { 0:{p:['SP','MA','LU','TH'],a:[]}, 1:{p:['SP','MA','LU','TH'],a:[],note:'Pizza ce soir'} },
  6: { 0:{p:['SP','MA'],a:['LU','TH']}, 1:{p:['SP','MA','LU','TH'],a:[]} },
};

function getMeal(d, m) { return MEAL_DATA[d]?.[m] ?? { p: ['SP','MA','LU','TH'], a: [] }; }

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
  const [absences, setAbsences] = useState([]); // { dateStr, meal, initials, color, photo }
  const week = getWeek(weekOffset);
  const data = selected ? getMeal(selected.d, selected.m) : null;

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
                  const m = getMeal(dayIndex, mi);
                  const bg = isToday ? COLORS.purpleLight : COLORS.surface;
                  const cellDate = week[dayIndex].date;
                  const userAbsent = absences.find(a => a.dateStr === cellDate.toDateString() && a.meal === mi);
                  const staticAbsents = m.a.map(p => MEMBERS.find(x => x.initials === p)).filter(Boolean);
                  const allAbsents = userAbsent ? [userAbsent, ...staticAbsents.filter(x => x.initials !== userAbsent.initials)] : staticAbsents;
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
        {data && MEMBERS.map(m => {
          const isUserAbsent = m === MEMBERS[0] && selected && absences.some(a => a.dateStr === selected.date?.toDateString() && a.meal === selected.m);
          const present = !isUserAbsent && (data.p.includes(m.initials === userName.charAt(0).toUpperCase() ? 'SP' : m.initials) || data.p.includes(m.initials));
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
            const me = MEMBERS[0];
            setAbsences(prev => [...prev.filter(a => !(a.dateStr === selDate.toDateString() && a.meal === selMeal)), { dateStr: selDate.toDateString(), meal: selMeal, initials: me.initials, color: me.color, photo: me.photo }]);
          }
          setAbsentModal(false); setSelDate(null); setSelMeal(null);
        }} />
      </Modal>
    </div>
  );
}

// ── REMINDERS ────────────────────────────────────────────────
const REMINDERS = [
  { id:1, title:'Sortir les poubelles', meta:"Aujourd'hui · 19h00 · Hebdo", cat:'chore', members:['SP','MA','LU','TH'] },
  { id:2, title:"Anniversaire de Lucie", meta:"Jeudi 10 avr · Annuel", cat:'birthday', members:['SP','MA','TH'] },
];
const UPCOMING = [
  { id:3, title:'Révision voiture', meta:"Lun 14 avr · 9h00", cat:'other', members:['MA'] },
  { id:4, title:'Sortir les poubelles', meta:"Sam 12 avr · 19h00 · Hebdo", cat:'chore', members:[] },
];
const CAT = {
  chore:    { dot: COLORS.yellowMid, bg: COLORS.yellow,      c: COLORS.yellowDark, label: 'tâche' },
  birthday: { dot: COLORS.pinkMid,   bg: COLORS.pink,        c: COLORS.pinkDark,   label: 'anniversaire' },
  other:    { dot: '#999',            bg: '#EEEEEE',          c: '#555',            label: 'autre' },
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

export function RemindersScreen({ userName = 'Sophie', userColor = COLORS.sophieColor, userPhoto = null }) {
  const MEMBERS = getMembers(userName, userColor, userPhoto);
  const [modal, setModal] = useState(false);
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div style={{ overflowY: 'auto', flex: 1, padding: '8px 20px 100px' }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, fontFamily: FONTS.title, color: COLORS.text, letterSpacing: -0.5, marginBottom: 4 }}>Rappels</h2>
        <p style={{ fontSize: 13, fontFamily: FONTS.body, color: COLORS.textMuted, marginBottom: 4 }}>2 cette semaine</p>
        <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, margin: '18px 0 10px', fontFamily: FONTS.body }}>Cette semaine</div>
        <Card style={{ padding: '4px 16px' }}>
          {REMINDERS.map((r, i) => <div key={r.id} style={{ borderBottom: i < REMINDERS.length - 1 ? `1px solid ${COLORS.border}` : 'none' }}><ReminderItem item={r} members={MEMBERS} /></div>)}
        </Card>
        <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, margin: '18px 0 10px', fontFamily: FONTS.body }}>À venir</div>
        <Card style={{ padding: '4px 16px' }}>
          {UPCOMING.map((r, i) => <div key={r.id} style={{ borderBottom: i < UPCOMING.length - 1 ? `1px solid ${COLORS.border}` : 'none' }}><ReminderItem item={r} members={MEMBERS} /></div>)}
        </Card>
      </div>
      <button onClick={() => setModal(true)} style={{ position: 'absolute', bottom: 24, right: 20, width: 52, height: 52, borderRadius: 26, background: COLORS.purple, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 16px ${COLORS.purple}66` }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
      <Modal visible={modal} onClose={() => setModal(false)} title="Nouveau rappel">
        <input placeholder="Titre…" style={{ width: '100%', padding: '13px 16px', border: `2px solid ${COLORS.border}`, borderRadius: 14, fontSize: 15, fontFamily: FONTS.body, marginBottom: 10, outline: 'none' }} />
        <input placeholder="Date (ex: 10 avril 2025)" style={{ width: '100%', padding: '13px 16px', border: `2px solid ${COLORS.border}`, borderRadius: 14, fontSize: 15, fontFamily: FONTS.body, marginBottom: 10, outline: 'none' }} />
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          {[['tâche', COLORS.yellow, COLORS.yellowDark], ['anniversaire', COLORS.pink, COLORS.pinkDark], ['autre', '#EEE', '#555']].map(([l, bg, c]) => (
            <button key={l} style={{ flex: 1, padding: 10, borderRadius: 12, border: 'none', background: bg, color: c, fontSize: 12, fontWeight: 700, fontFamily: FONTS.body, cursor: 'pointer' }}>{l}</button>
          ))}
        </div>
        <PrimaryButton label="Créer le rappel" onClick={() => setModal(false)} />
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

      <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 0 10px', fontFamily: FONTS.body }}>Couleur d'avatar</div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        {SWATCHES.map(c => (
          <div key={c} onClick={() => setUserColor?.(c)} style={{ width: 34, height: 34, borderRadius: '50%', background: c, cursor: 'pointer', border: `3px solid ${userColor === c ? COLORS.text : 'transparent'}` }} />
        ))}
      </div>

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
