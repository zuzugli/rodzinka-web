import React, { useState } from 'react';
import { COLORS, FONTS } from '../theme';
import { Avatar, Card, Modal, PrimaryButton } from '../components';

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MEALS = ['Matin', 'Midi', 'Soir'];
const MEMBERS = [
  { initials: 'SP', color: COLORS.sophieColor },
  { initials: 'MA', color: COLORS.marcColor },
  { initials: 'LU', color: COLORS.lucieColor },
  { initials: 'TH', color: COLORS.thomasColor },
];
const NAMES = { SP: 'Sophie', MA: 'Marc', LU: 'Lucie', TH: 'Thomas' };

const MEAL_DATA = {
  0: { 0:{p:['SP','MA','LU','TH'],a:[]}, 1:{p:['SP','LU','TH'],a:['MA']}, 2:{p:['SP','MA','LU','TH'],a:[]} },
  5: { 0:{p:['SP','MA','LU'],a:['TH']}, 1:{p:['SP','MA','LU','TH'],a:[]}, 2:{p:['SP','MA','LU','TH'],a:[],note:'Pizza ce soir'} },
  6: { 0:{p:['SP','MA','LU','TH'],a:[]}, 1:{p:['SP','MA'],a:['LU','TH']}, 2:{p:['SP','MA','LU','TH'],a:[]} },
};

function getMeal(d, m) { return MEAL_DATA[d]?.[m] ?? { p: ['SP','MA','LU','TH'], a: [] }; }

export function CalendarScreen() {
  const [selected, setSelected] = useState(null);
  const [absentModal, setAbsentModal] = useState(false);
  const [selMeal, setSelMeal] = useState(1);
  const data = selected ? getMeal(selected.d, selected.m) : null;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div style={{ overflowY: 'auto', flex: 1, padding: '8px 20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, fontFamily: FONTS.title, color: COLORS.text, letterSpacing: -0.5 }}>Repas</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {['‹','›'].map(a => (
              <button key={a} style={{ width: 36, height: 36, borderRadius: 18, border: `1.5px solid ${COLORS.border}`, background: COLORS.surface, cursor: 'pointer', fontSize: 16, display:'flex', alignItems:'center', justifyContent:'center' }}>{a}</button>
            ))}
          </div>
        </div>
        <p style={{ fontSize: 13, fontFamily: FONTS.body, color: COLORS.textMuted, marginBottom: 16 }}>31 mars – 6 avr 2025</p>

        <Card style={{ padding: 10 }}>
          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '52px 1fr 1fr 1fr', gap: 4, marginBottom: 8 }}>
            <div />
            {[0, 5, 6].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, fontFamily: FONTS.body, textTransform: 'uppercase', padding: '4px 0', background: d === 5 ? COLORS.purpleLight : 'transparent', borderRadius: d === 5 ? 8 : 0, color: d === 5 ? COLORS.purpleDark : COLORS.textMuted }}>
                {DAYS[d]}{d === 5 ? ' ✦' : ''}
              </div>
            ))}
          </div>
          {/* Meal rows */}
          {MEALS.map((meal, mi) => (
            <div key={mi} style={{ display: 'grid', gridTemplateColumns: '52px 1fr 1fr 1fr', gap: 4, marginBottom: 5, alignItems: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 700, fontFamily: FONTS.body, color: COLORS.textMuted, textTransform: 'uppercase' }}>{meal}</div>
              {[0, 5, 6].map(d => {
                const m = getMeal(d, mi);
                const bg = d === 5 ? COLORS.purpleLight : m.note ? COLORS.yellow : COLORS.surface;
                return (
                  <div key={d} onClick={() => setSelected({ d, m: mi })} style={{ background: bg, borderRadius: 12, padding: '8px 6px', minHeight: 54, border: `1.5px solid ${COLORS.border}`, cursor: 'pointer' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      {m.p.map(p => { const mb = MEMBERS.find(x => x.initials === p); return mb ? <Avatar key={p} initials={p} color={mb.color} size="xs" /> : null; })}
                    </div>
                    {m.a.length > 0 ? (
                      <div style={{ background: COLORS.pink, borderRadius: 6, padding: '2px 5px', marginTop: 3, display: 'inline-block' }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: COLORS.pinkDark, fontFamily: FONTS.body }}>{m.a.join(', ')} absent{m.a.length > 1 ? 's' : ''}</span>
                      </div>
                    ) : m.note ? (
                      <p style={{ fontSize: 10, fontWeight: 700, color: COLORS.yellowDark, marginTop: 3, fontFamily: FONTS.body }}>{m.note}</p>
                    ) : (
                      <p style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 3, fontFamily: FONTS.body }}>{m.p.length} présents</p>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </Card>
        <PrimaryButton label="Me marquer absent·e…" onClick={() => setAbsentModal(true)} />
      </div>

      {/* Detail modal */}
      <Modal visible={!!selected} onClose={() => setSelected(null)} title={selected ? `${MEALS[selected.m]} · ${DAYS[selected.d]}` : ''}>
        {data && MEMBERS.map(m => {
          const present = data.p.includes(m.initials);
          return (
            <div key={m.initials} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: `1px solid ${COLORS.border}` }}>
              <Avatar initials={m.initials} color={m.color} size="sm" />
              <span style={{ flex: 1, fontSize: 15, fontWeight: 700, fontFamily: FONTS.body, color: COLORS.text }}>{NAMES[m.initials]}</span>
              <span style={{ background: present ? COLORS.green : COLORS.pink, color: present ? COLORS.greenDark : COLORS.pinkDark, fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 999, fontFamily: FONTS.body }}>
                {present ? 'Présent·e' : 'Absent·e'}
              </span>
            </div>
          );
        })}
        <PrimaryButton label="Fermer" onClick={() => setSelected(null)} />
      </Modal>

      {/* Absent modal */}
      <Modal visible={absentModal} onClose={() => setAbsentModal(false)} title="Me marquer absent·e">
        {MEALS.map((m, i) => (
          <div key={i} onClick={() => setSelMeal(i)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, border: `2px solid ${selMeal === i ? COLORS.purple : COLORS.border}`, background: selMeal === i ? COLORS.purpleLight : COLORS.surface, marginBottom: 10, cursor: 'pointer' }}>
            <div style={{ width: 20, height: 20, borderRadius: 10, border: `2px solid ${selMeal === i ? COLORS.purple : COLORS.border}`, background: selMeal === i ? COLORS.purple : 'transparent' }} />
            <span style={{ fontSize: 15, fontWeight: 700, fontFamily: FONTS.body, color: selMeal === i ? COLORS.purpleDark : COLORS.text }}>{m}</span>
          </div>
        ))}
        <PrimaryButton label="Confirmer l'absence" onClick={() => setAbsentModal(false)} />
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

function ReminderItem({ item }) {
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
            {item.members.map(initials => { const m = MEMBERS.find(x => x.initials === initials); return m ? <Avatar key={initials} initials={initials} color={m.color} size="xs" /> : null; })}
          </div>
        )}
      </div>
    </div>
  );
}

export function RemindersScreen() {
  const [modal, setModal] = useState(false);
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div style={{ overflowY: 'auto', flex: 1, padding: '8px 20px 100px' }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, fontFamily: FONTS.title, color: COLORS.text, letterSpacing: -0.5, marginBottom: 4 }}>Rappels</h2>
        <p style={{ fontSize: 13, fontFamily: FONTS.body, color: COLORS.textMuted, marginBottom: 4 }}>2 cette semaine</p>
        <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, margin: '18px 0 10px', fontFamily: FONTS.body }}>Cette semaine</div>
        <Card style={{ padding: '4px 16px' }}>
          {REMINDERS.map((r, i) => <div key={r.id} style={{ borderBottom: i < REMINDERS.length - 1 ? `1px solid ${COLORS.border}` : 'none' }}><ReminderItem item={r} /></div>)}
        </Card>
        <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, margin: '18px 0 10px', fontFamily: FONTS.body }}>À venir</div>
        <Card style={{ padding: '4px 16px' }}>
          {UPCOMING.map((r, i) => <div key={r.id} style={{ borderBottom: i < UPCOMING.length - 1 ? `1px solid ${COLORS.border}` : 'none' }}><ReminderItem item={r} /></div>)}
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
const SWATCHES = [COLORS.sophieColor, COLORS.marcColor, COLORS.lucieColor, COLORS.thomasColor, '#5BB8FF', '#FFD740'];

export function ProfileScreen({ userName = 'Sophie', setUserName }) {
  const [color, setColor] = useState(COLORS.sophieColor);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);
  const [notifs, setNotifs] = useState({ shopping: true, meals: true, reminders: true });
  const [copied, setCopied] = useState(false);

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '8px 20px 40px' }}>
      <h2 style={{ fontSize: 32, fontWeight: 800, fontFamily: FONTS.title, color: COLORS.text, letterSpacing: -0.5, marginBottom: 16 }}>Profil</h2>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 0 20px' }}>
        <Avatar initials="SP" color={color} size="lg" />
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
          <p onClick={() => { setNameInput(userName); setEditingName(true); }} style={{ fontSize: 22, fontWeight: 800, fontFamily: FONTS.title, color: COLORS.text, cursor: 'pointer' }}>{userName} ✎</p>
        )}
        <div style={{ background: COLORS.purpleLight, borderRadius: 999, padding: '5px 16px' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.purpleDark, fontFamily: FONTS.body }}>Admin · Les Martin</span>
        </div>
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, margin: '0 0 10px', fontFamily: FONTS.body }}>Couleur d'avatar</div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        {SWATCHES.map(c => (
          <div key={c} onClick={() => setColor(c)} style={{ width: 34, height: 34, borderRadius: '50%', background: c, cursor: 'pointer', border: `3px solid ${color === c ? COLORS.text : 'transparent'}` }} />
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
        <p style={{ fontSize: 32, fontWeight: 800, fontFamily: FONTS.title, color: COLORS.yellowDark, letterSpacing: 8 }}>MRTN42</p>
        <button onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ background: COLORS.text, color: '#fff', border: 'none', borderRadius: 12, padding: '11px 28px', fontSize: 14, fontWeight: 700, fontFamily: FONTS.body, cursor: 'pointer', marginTop: 14 }}>
          {copied ? '✓ Copié !' : 'Copier'}
        </button>
      </div>
    </div>
  );
}
