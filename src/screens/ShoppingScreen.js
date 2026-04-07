import React, { useState } from 'react';
import { COLORS, FONTS } from '../theme';
import { Avatar, Card, Modal, Input, PrimaryButton } from '../components';

const FAMILY = {
  Sophie: { initials: 'SP', color: COLORS.sophieColor },
  Marc:   { initials: 'MA', color: COLORS.marcColor   },
  Lucie:  { initials: 'LU', color: COLORS.lucieColor  },
  Thomas: { initials: 'TH', color: COLORS.thomasColor },
};

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10, 0, 0, 0);
  return d.getTime();
}

function relativeDate(ts) {
  const now = new Date();
  const then = new Date(ts);
  const todayStart = new Date(now); todayStart.setHours(0,0,0,0);
  const thenStart  = new Date(then); thenStart.setHours(0,0,0,0);
  const diff = Math.round((todayStart - thenStart) / 86400000);
  if (diff === 0) return "aujourd'hui";
  if (diff === 1) return 'hier';
  return `il y a ${diff} jours`;
}

const INITIAL = [
  { id:1, name:"Huile d'olive",   by:'Sophie', addedAt: daysAgo(2), done:false },
  { id:2, name:'Pâtes (x3)',      by:'Marc',   addedAt: daysAgo(1), done:false },
  { id:3, name:'Yaourt grec',     by:'Lucie',  addedAt: daysAgo(0), done:false },
  { id:4, name:'Pain au levain',  by:'Thomas', addedAt: daysAgo(0), done:false },
  { id:5, name:"Lait d'amande",   by:'Sophie', addedAt: daysAgo(0), done:false },
  { id:6, name:'Parmesan',        by:'Marc',   addedAt: daysAgo(3), done:false },
  { id:7, name:'Tomates cerises', by:'Lucie',  addedAt: daysAgo(1), done:false },
  { id:8, name:"Jus d'orange",    by:'Thomas', addedAt: daysAgo(0), done:false },
];

export default function ShoppingScreen({ userName = 'Sophie', userPhoto, userColor = COLORS.sophieColor }) {
  const [items, setItems] = useState(INITIAL);
  const [filter, setFilter] = useState('buy');
  const [modal, setModal] = useState(false);
  const [newName, setNewName] = useState('');

  const toggle = id => setItems(prev => prev.map(it => it.id === id ? { ...it, done: !it.done } : it));
  const addItem = () => {
    if (!newName.trim()) return;
    setItems(prev => [...prev, { id: Date.now(), name: newName.trim(), by: userName, addedAt: Date.now(), done: false }]);
    setNewName(''); setModal(false);
  };

  const visible = items.filter(it => filter === 'buy' ? !it.done : it.done);
  const remaining = items.filter(it => !it.done).length;

  function getAvatar(by) {
    if (by === userName) return { initials: userName.charAt(0).toUpperCase(), color: userColor, photo: userPhoto };
    const f = FAMILY[by];
    return f ? { initials: f.initials, color: f.color, photo: null } : { initials: by.charAt(0), color: '#ccc', photo: null };
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div style={{ overflowY: 'auto', flex: 1, padding: '8px 20px 100px' }}>
        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, fontFamily: FONTS.title, color: COLORS.text, letterSpacing: -0.5 }}>Courses</h2>
          <p style={{ fontSize: 13, color: COLORS.textMuted, fontFamily: FONTS.body, marginTop: 4 }}>{remaining} articles restants</p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {[['buy', 'À acheter'], ['done', 'Achetés']].map(([f, l]) => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '8px 18px', borderRadius: 999, fontSize: 13, fontWeight: 700,
              fontFamily: FONTS.body, cursor: 'pointer', border: `2px solid ${filter === f ? COLORS.text : COLORS.border}`,
              background: filter === f ? COLORS.text : 'transparent', color: filter === f ? '#fff' : COLORS.textMuted,
            }}>{l}</button>
          ))}
        </div>

        {/* List */}
        <Card style={{ padding: '4px 16px' }}>
          {visible.length === 0 ? (
            <p style={{ textAlign: 'center', padding: 20, color: COLORS.textMuted, fontFamily: FONTS.body }}>
              {filter === 'buy' ? 'Tout est acheté !' : 'Rien encore acheté.'}
            </p>
          ) : visible.map((item, idx) => {
            const av = getAvatar(item.by);
            return (
              <div key={item.id} onClick={() => toggle(item.id)} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', cursor: 'pointer',
                borderBottom: idx < visible.length - 1 ? `1px solid ${COLORS.border}` : 'none',
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 13, border: `2px solid ${item.done ? COLORS.greenMid : COLORS.border}`,
                  background: item.done ? COLORS.greenMid : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {item.done && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, fontFamily: FONTS.body, color: item.done ? COLORS.textMuted : COLORS.text, textDecoration: item.done ? 'line-through' : 'none' }}>
                    {item.name}
                  </p>
                  <p style={{ fontSize: 11, fontFamily: FONTS.body, color: COLORS.textMuted, marginTop: 2 }}>{relativeDate(item.addedAt)}</p>
                </div>
                <Avatar initials={av.initials} color={av.color} size="xs" photo={av.photo} />
              </div>
            );
          })}
        </Card>
      </div>

      {/* FAB */}
      <button onClick={() => setModal(true)} style={{
        position: 'absolute', bottom: 24, right: 20, width: 52, height: 52,
        borderRadius: 26, background: COLORS.purple, border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 4px 16px ${COLORS.purple}66`,
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>

      {/* Modal */}
      <Modal visible={modal} onClose={() => setModal(false)} title="Ajouter un article">
        <Input placeholder="Ex : Beurre, 2 paquets…" value={newName} onChange={setNewName} />
        <PrimaryButton label="Ajouter à la liste" onClick={addItem} />
      </Modal>
    </div>
  );
}
