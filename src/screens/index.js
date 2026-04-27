import React, { useState, useEffect } from 'react';
import { COLORS, FONTS } from '../theme';
import { Avatar, Card, Modal, PrimaryButton } from '../components';
import { supabase } from '../supabase';

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

function toDateStr(date) {
  return date.toISOString().split('T')[0];
}

// ── CALENDAR ─────────────────────────────────────────────────
export function CalendarScreen({ userName = 'Sophie', userColor = COLORS.sophieColor, userPhoto = null, memberId }) {
  const MEMBERS = getMembers(userName, userColor, userPhoto);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selected, setSelected] = useState(null);
  const [absences, setAbsences] = useState([]);
  const [meals, setMeals] = useState([]);
  const [absentModal, setAbsentModal] = useState(false);
  const [mealModal, setMealModal] = useState(false);
  const [selDate, setSelDate] = useState(null);
  const [selDateEnd, setSelDateEnd] = useState(null);
  const [selMealStart, setSelMealStart] = useState(null);
  const [selMealEnd, setSelMealEnd] = useState(null);
  const [calMonth, setCalMonth] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });
  const [newMealName, setNewMealName] = useState('');
  const [newMealType, setNewMealType] = useState(0);

  async function loadData() {
    const { data: absData } = await supabase.from('reminders').select('*').eq('recurrence', 'absence');
    const { data: mealData } = await supabase.from('meals').select('*');
    if (absData) setAbsences(absData);
    if (mealData) setMeals(mealData);
  }

  useEffect(() => {
    loadData();
    const sub = supabase
      .channel('calendar')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meals' }, () => loadData())
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, []);

  const week = getWeek(weekOffset);

  const addMeal = async () => {
    if (!newMealName.trim() || !selected) return;
    await supabase.from('meals').insert({
      date: toDateStr(selected.date),
      meal_type: newMealType === 0 ? 'lunch' : 'dinner',
      name: newMealName.trim(),
      created_by: userName,
    });
    setNewMealName(''); setMealModal(false);
  };

  const getMealsForSlot = (date, mealIndex) => {
    const dateStr = toDateStr(date);
    const type = mealIndex === 0 ? 'lunch' : 'dinner';
    return meals.filter(m => m.date === dateStr && m.meal_type === type);
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '8px 20px 40px' }}>
      <h2 style={{ fontSize: 32, fontWeight: 800, fontFamily: FONTS.title, color: COLORS.text, letterSpacing: -0.5, marginBottom: 16 }}>Repas</h2>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button onClick={() => setWeekOffset(w => w - 1)} style={{ background: COLORS.surface, border: 'none', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontWeight: 700, fontFamily: FONTS.body }}>‹</button>
        <span style={{ fontFamily: FONTS.body, fontWeight: 700, color: COLORS.text, fontSize: 14 }}>{formatRange(week)}</span>
        <button onClick={() => setWeekOffset(w => w + 1)} style={{ background: COLORS.surface, border: 'none', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', fontWeight: 700, fontFamily: FONTS.body }}>›</button>
      </div>

      {week.map(({ date, isToday }) => (
        <Card key={date.toDateString()} style={{ marginBottom: 10, padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: isToday ? COLORS.purple : COLORS.surface, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 800, fontFamily: FONTS.body, color: isToday ? '#fff' : COLORS.text }}>{date.getDate()}</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, fontFamily: FONTS.body, color: COLORS.text }}>{DAYS[date.getDay() === 0 ? 6 : date.getDay() - 1]}</span>
          </div>
          {MEALS.map((meal, mealIdx) => {
            const slotMeals = getMealsForSlot(date, mealIdx);
            return (
              <div key={meal} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderTop: `1px solid ${COLORS.border}` }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.textMuted, fontFamily: FONTS.body, width: 36 }}>{meal}</span>
                <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {slotMeals.map(m => (
                    <span key={m.id} style={{ background: COLORS.purpleLight, borderRadius: 8, padding: '3px 10px', fontSize: 12, fontWeight: 700, color: COLORS.purpleDark, fontFamily: FONTS.body }}>{m.name}</span>
                  ))}
                </div>
                <button onClick={() => { setSelected({ date }); setNewMealType(mealIdx); setMealModal(true); }} style={{ background: COLORS.surface, border: 'none', borderRadius: 8, width: 26, height: 26, cursor: 'pointer', fontSize: 16, color: COLORS.textMuted }}>+</button>
              </div>
            );
          })}
        </Card>
      ))}

      <Modal visible={mealModal} onClose={() => setMealModal(false)} title="Ajouter un repas">
        <input
          placeholder="Ex: Pâtes bolognaise"
          value={newMealName}
          onChange={e => setNewMealName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addMeal()}
          autoFocus
          style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `2px solid ${COLORS.border}`, fontSize: 15, fontFamily: FONTS.body, outline: 'none', boxSizing: 'border-box', marginBottom: 12 }}
        />
        <PrimaryButton label="Ajouter" onClick={addMeal} />
      </Modal>
    </div>
  );
}

// ── REMINDERS ────────────────────────────────────────────────
const CAT = {
  chore:    { dot: '#00AFBE',        bg: '#E0F7FA',      c: '#006878',         label: 'tâche' },
  birthday: { dot: COLORS.pinkMid,   bg: COLORS.pink,    c: COLORS.pinkDark,   label: 'anniversaire' },
  autre:    { dot: '#AB47BC',        bg: '#F3E5F5',      c: '#6A1B9A',         label: 'autre' },
};

function ReminderItem({ item, onPress, onDelete }) {
  const cat = CAT[item.category] || CAT.autre;
  return (
    <Card onClick={() => onPress(item)} style={{ marginBottom: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: cat.dot, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 15, fontWeight: 700, fontFamily: FONTS.body, color: COLORS.text }}>{item.title}</p>
        {item.date && <p style={{ fontSize: 12, color: COLORS.textMuted, fontFamily: FONTS.body }}>{item.date}{item.time ? ` à ${item.time}` : ''}</p>}
      </div>
      <span style={{ background: cat.bg, borderRadius: 8, padding: '3px 10px', fontSize: 11, fontWeight: 700, color: cat.c, fontFamily: FONTS.body }}>{cat.label}</span>
      <button onClick={e => { e.stopPropagation(); onDelete(item.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: COLORS.textMuted, fontSize: 16 }}>✕</button>
    </Card>
  );
}

export function RemindersScreen({ userName, userPhoto, userColor, reminders, setReminders, memberId }) {
  const [modal, setModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newCat, setNewCat] = useState('chore');
  const [newRecur, setNewRecur] = useState('none');

  const addReminder = async () => {
    if (!newTitle.trim()) return;
    await supabase.from('reminders').insert({
      title: newTitle.trim(),
      date: newDate || null,
      time: newTime || null,
      recurrence: newRecur,
      created_by: userName,
    });
    setNewTitle(''); setNewDate(''); setNewTime(''); setNewCat('chore'); setNewRecur('none');
    setModal(false);
  };

  const deleteReminder = async (id) => {
    await supabase.from('reminders').delete().eq('id', id);
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '8px 20px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, fontFamily: FONTS.title, color: COLORS.text, letterSpacing: -0.5 }}>Rappels</h2>
        <button onClick={() => setModal(true)} style={{ width: 36, height: 36, borderRadius: '50%', background: COLORS.purple, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>

      {reminders.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: COLORS.textMuted, fontFamily: FONTS.body }}>Aucun rappel pour l'instant</div>
      )}

      {reminders.map(item => (
        <ReminderItem key={item.id} item={item} onPress={() => {}} onDelete={deleteReminder} />
      ))}

      <Modal visible={modal} onClose={() => setModal(false)} title="Nouveau rappel">
        <input placeholder="Titre du rappel" value={newTitle} onChange={e => setNewTitle(e.target.value)} autoFocus
          style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `2px solid ${COLORS.border}`, fontSize: 15, fontFamily: FONTS.body, outline: 'none', boxSizing: 'border-box', marginBottom: 12 }} />
        <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
          style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `2px solid ${COLORS.border}`, fontSize: 15, fontFamily: FONTS.body, outline: 'none', boxSizing: 'border-box', marginBottom: 12 }} />
        <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)}
          style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `2px solid ${COLORS.border}`, fontSize: 15, fontFamily: FONTS.body, outline: 'none', boxSizing: 'border-box', marginBottom: 12 }} />
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {Object.entries(CAT).map(([k, v]) => (
            <button key={k} onClick={() => setNewCat(k)} style={{ flex: 1, padding: '8px 0', borderRadius: 10, border: `2px solid ${newCat === k ? v.dot : COLORS.border}`, background: newCat === k ? v.bg : COLORS.surface, color: newCat === k ? v.c : COLORS.textMuted, fontSize: 12, fontWeight: 700, fontFamily: FONTS.body, cursor: 'pointer' }}>{v.label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[['none','une fois'],['weekly','hebdo'],['monthly','mensuel']].map(([k, l]) => (
            <button key={k} onClick={() => setNewRecur(k)} style={{ flex: 1, padding: '8px 0', borderRadius: 10, border: `2px solid ${newRecur === k ? COLORS.purple : COLORS.border}`, background: newRecur === k ? COLORS.purpleLight : COLORS.surface, color: newRecur === k ? COLORS.purpleDark : COLORS.textMuted, fontSize: 12, fontWeight: 700, fontFamily: FONTS.body, cursor: 'pointer' }}>{l}</button>
          ))}
        </div>
        <PrimaryButton label="Créer le rappel" onClick={addReminder} />
      </Modal>
    </div>
  );
}

// ── PROFILE ──────────────────────────────────────────────────
const SWATCHES = [
  '#FFD740', '#F07A4E', '#F48FB1', '#E53935',
  '#AB47BC', '#00AFBE', '#26A69A', '#66BB6A',
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