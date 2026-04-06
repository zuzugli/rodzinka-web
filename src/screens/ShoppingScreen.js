import React, { useState } from 'react';
import { COLORS, FONTS } from '../theme';
import { Card, Tag, Modal, Input, PrimaryButton } from '../components';

const INITIAL = [
  { id:1, name:"Huile d'olive",   by:'Sophie', color:COLORS.sophieColor, time:'il y a 2 jours', cat:'épicerie',    catBg:COLORS.purpleLight, catC:COLORS.purpleDark, done:false },
  { id:2, name:'Pâtes (x3)',      by:'Marc',   color:COLORS.marcColor,   time:'hier',            cat:'épicerie',    catBg:COLORS.orange,      catC:COLORS.orangeDark, done:false },
  { id:3, name:'Yaourt grec',     by:'Lucie',  color:COLORS.lucieColor,  time:"aujourd'hui",     cat:'frais',       catBg:COLORS.green,       catC:COLORS.greenDark,  done:false },
  { id:4, name:'Pain au levain',  by:'Thomas', color:COLORS.thomasColor, time:"aujourd'hui",     cat:'boulangerie', catBg:COLORS.yellow,      catC:COLORS.yellowDark, done:false },
  { id:5, name:"Lait d'amande",   by:'Sophie', color:COLORS.sophieColor, time:"aujourd'hui",     cat:'frais',       catBg:COLORS.blue,        catC:COLORS.blueDark,   done:false },
  { id:6, name:'Parmesan',        by:'Marc',   color:COLORS.marcColor,   time:'3 jours',         cat:'frais',       catBg:COLORS.green,       catC:COLORS.greenDark,  done:false },
  { id:7, name:'Tomates cerises', by:'Lucie',  color:COLORS.lucieColor,  time:'hier',            cat:'légumes',     catBg:COLORS.green,       catC:COLORS.greenDark,  done:false },
  { id:8, name:"Jus d'orange",    by:'Thomas', color:COLORS.thomasColor, time:"aujourd'hui",     cat:'boissons',    catBg:COLORS.yellow,      catC:COLORS.yellowDark, done:false },
];

export default function ShoppingScreen() {
  const [items, setItems] = useState(INITIAL);
  const [filter, setFilter] = useState('buy');
  const [modal, setModal] = useState(false);
  const [newName, setNewName] = useState('');

  const toggle = id => setItems(prev => prev.map(it => it.id === id ? { ...it, done: !it.done } : it));
  const addItem = () => {
    if (!newName.trim()) return;
    setItems(prev => [...prev, { id: Date.now(), name: newName.trim(), by: 'Sophie', color: COLORS.sophieColor, time: "à l'instant", cat: 'épicerie', catBg: COLORS.purpleLight, catC: COLORS.purpleDark, done: false }]);
    setNewName(''); setModal(false);
  };

  const visible = items.filter(it => filter === 'buy' ? !it.done : it.done);
  const remaining = items.filter(it => !it.done).length;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div style={{ overflowY: 'auto', flex: 1, padding: '8px 20px 100px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 32, fontWeight: 800, fontFamily: FONTS.title, color: COLORS.text, letterSpacing: -0.5 }}>Courses</h2>
            <p style={{ fontSize: 13, color: COLORS.textMuted, fontFamily: FONTS.body, marginTop: 4 }}>{remaining} articles restants</p>
          </div>
          <div style={{ background: COLORS.purpleLight, borderRadius: 14, padding: '8px 14px', marginTop: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.purpleDark, fontFamily: FONTS.body }}>Partagé</span>
          </div>
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
          ) : visible.map((item, idx) => (
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 4, background: item.color }} />
                  <span style={{ fontSize: 12, fontFamily: FONTS.body, color: COLORS.textMuted }}>{item.by} · {item.time}</span>
                </div>
              </div>
              <Tag label={item.cat} bg={item.catBg} color={item.catC} />
            </div>
          ))}
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
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          {[['frais', COLORS.green, COLORS.greenDark], ['épicerie', COLORS.purpleLight, COLORS.purpleDark], ['boulangerie', COLORS.yellow, COLORS.yellowDark]].map(([l, bg, c]) => (
            <button key={l} style={{ flex: 1, padding: 9, borderRadius: 12, border: 'none', background: bg, color: c, fontSize: 12, fontWeight: 700, fontFamily: FONTS.body, cursor: 'pointer' }}>{l}</button>
          ))}
        </div>
        <PrimaryButton label="Ajouter à la liste" onClick={addItem} />
      </Modal>
    </div>
  );
}
