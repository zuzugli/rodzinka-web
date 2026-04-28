import React, { useState, useEffect } from 'react';
import { COLORS, FONTS } from '../theme';
import { Avatar, Card, Modal, Input, PrimaryButton } from '../components';
import { supabase } from '../supabase';

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

export default function ShoppingScreen({ userName = 'Sophie', userPhoto, userColor = COLORS.sophieColor }) {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('buy');
  const [modal, setModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(null);

  async function loadItems() {
    const { data } = await supabase
      .from('shopping_items')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setItems(data);
  }

  useEffect(() => {
    loadItems();
    const sub = supabase.channel('shopping')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shopping_items' }, loadItems)
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, []);

  const toggle = async (id, current) => {
    await supabase.from('shopping_items').update({ checked: !current }).eq('id', id);
  };

  const deleteItem = async (e, id) => {
    e.stopPropagation();
    if (confirmDelete === id) {
      await supabase.from('shopping_items').delete().eq('id', id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 2500);
    }
  };

  const addItem = async () => {
    if (!newName.trim()) return;
    const name = newQty > 1 ? `${newName.trim()} (x${newQty})` : newName.trim();
    await supabase.from('shopping_items').insert({
      name,
      added_by: userName,
      checked: false,
    });
    setNewName(''); setNewQty(1); setModal(false);
  };

  const visible = items.filter(it => filter === 'buy' ? !it.checked : it.checked);
  const remaining = items.filter(it => !it.checked).length;

  function getAvatar(by) {
    if (by === userName) return { initials: userName.charAt(0).toUpperCase(), color: userColor, photo: userPhoto };
    const f = FAMILY[by];
    return f ? { initials: f.initials, color: f.color, photo: null } : { initials: by.charAt(0), color: '#ccc', photo: null };
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div style={{ overflowY: 'auto', flex: 1, padding: '8px 20px 100px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, fontFamily: FONTS.title, color: COLORS.text, letterSpacing: -0.5 }}>Courses</h2>
            <p style={{ fontSize: 13, color: COLORS.textMuted, fontFamily: FONTS.body, marginTop: 4 }}>{remaining} article{remaining !== 1 ? 's' : ''} restant{remaining !== 1 ? 's' : ''}</p>
          </div>
          <img src="/littlemisstidy.png" alt="mascotte" style={{ width: 100, height: 100, objectFit: 'contain' }} />
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
            const av = getAvatar(item.added_by);
            return (
              <div key={item.id} onClick={() => toggle(item.id, item.checked)} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', cursor: 'pointer',
                borderBottom: idx < visible.length - 1 ? `1px solid ${COLORS.border}` : 'none',
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 13, border: `2px solid ${item.checked ? COLORS.greenMid : COLORS.border}`,
                  background: item.checked ? COLORS.greenMid : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {item.checked && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, fontFamily: FONTS.body, color: item.checked ? COLORS.textMuted : COLORS.text, textDecoration: item.checked ? 'line-through' : 'none' }}>
                    {item.name}
                  </p>
                  <p style={{ fontSize: 11, fontFamily: FONTS.body, color: COLORS.textMuted, marginTop: 2 }}>{relativeDate(item.created_at)}</p>
                </div>
                <Avatar initials={av.initials} color={av.color} size="sm" photo={av.photo} />
                <button onClick={e => deleteItem(e, item.id)} style={{
                  background: confirmDelete === item.id ? '#E53935' : 'transparent',
                  border: 'none', cursor: 'pointer', padding: '4px 6px', borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {confirmDelete === item.id
                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={COLORS.textMuted} strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  }
                </button>
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
      <Modal visible={modal} onClose={() => { setModal(false); setNewName(''); setNewQty(1); }} title="Ajouter un article">
        <Input placeholder="Nom de l'article (ex : Beurre)" value={newName} onChange={setNewName} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, fontFamily: FONTS.body, color: COLORS.textMuted }}>Quantité</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={() => setNewQty(q => Math.max(1, q - 1))} style={{ width: 36, height: 36, borderRadius: 12, border: `2px solid ${COLORS.border}`, background: '#fff', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONTS.body, color: COLORS.text }}>−</button>
            <span style={{ fontSize: 18, fontWeight: 800, fontFamily: FONTS.title, color: COLORS.text, minWidth: 24, textAlign: 'center' }}>{newQty}</span>
            <button onClick={() => setNewQty(q => q + 1)} style={{ width: 36, height: 36, borderRadius: 12, border: `2px solid ${COLORS.border}`, background: '#fff', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONTS.body, color: COLORS.text }}>+</button>
          </div>
        </div>
        <PrimaryButton label="Ajouter à la liste" onClick={addItem} />
      </Modal>
    </div>
  );
}