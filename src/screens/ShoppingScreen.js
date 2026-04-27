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

export default function ShoppingScreen({ userName = 'Sophie', userPhoto, userColor = COLORS.sophieColor, memberId }) {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('buy');
  const [modal, setModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger les articles
  async function loadItems() {
    const { data } = await supabase
      .from('shopping_items')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setItems(data);
    setLoading(false);
  }

  useEffect(() => {
    loadItems();

    // Temps réel — tout le monde voit les changements instantanément
    const sub = supabase
      .channel('shopping')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shopping_items' }, () => loadItems())
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

  if (loading) return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontFamily: FONTS.body, color: COLORS.textMuted }}>Chargement...</span>
    </div>
  );

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '8px 20px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, fontFamily: FONTS.title, color: COLORS.text, letterSpacing: -0.5 }}>Courses</h2>
        <button onClick={() => setModal(true)} style={{ width: 36, height: 36, borderRadius: '50%', background: COLORS.purple, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['buy', 'À acheter'], ['done', 'Achetés']].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} style={{ flex: 1, padding: '10px 0', borderRadius: 12, border: `2px solid ${filter === k ? COLORS.purple : COLORS.border}`, background: filter === k ? COLORS.purpleLight : COLORS.surface, color: filter === k ? COLORS.purpleDark : COLORS.textMuted, fontSize: 13, fontWeight: 700, fontFamily: FONTS.body, cursor: 'pointer' }}>{l}</button>
        ))}
      </div>

      {visible.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: COLORS.textMuted, fontFamily: FONTS.body }}>
          {filter === 'buy' ? 'La liste est vide 🎉' : 'Rien acheté encore'}
        </div>
      )}

      {visible.map(it => {
        const member = FAMILY[it.added_by] || { initials: (it.added_by || '?').charAt(0), color: COLORS.purple };
        return (
          <Card key={it.id} onClick={() => toggle(it.id, it.checked)} style={{ marginBottom: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', opacity: it.checked ? 0.6 : 1 }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${it.checked ? COLORS.green : COLORS.border}`, background: it.checked ? COLORS.green : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {it.checked && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 15, fontWeight: 700, fontFamily: FONTS.body, color: COLORS.text, textDecoration: it.checked ? 'line-through' : 'none' }}>{it.name}</p>
              <p style={{ fontSize: 12, color: COLORS.textMuted, fontFamily: FONTS.body }}>{it.added_by} · {relativeDate(it.created_at)}</p>
            </div>
            <Avatar initials={member.initials} color={member.color} size="sm" />
            <button onClick={e => deleteItem(e, it.id)} style={{ background: confirmDelete === it.id ? COLORS.red : COLORS.surface, border: 'none', borderRadius: 8, padding: '4px 8px', cursor: 'pointer', fontSize: 12, color: confirmDelete === it.id ? '#fff' : COLORS.textMuted, fontWeight: 700, fontFamily: FONTS.body }}>
              {confirmDelete === it.id ? 'Confirmer' : '✕'}
            </button>
          </Card>
        );
      })}

      <Modal visible={modal} onClose={() => setModal(false)} title="Ajouter un article">
        <Input placeholder="Nom de l'article" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addItem()} autoFocus />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '12px 0' }}>
          <span style={{ fontFamily: FONTS.body, fontSize: 14, color: COLORS.text }}>Quantité</span>
          <button onClick={() => setNewQty(q => Math.max(1, q - 1))} style={{ width: 30, height: 30, borderRadius: '50%', border: `2px solid ${COLORS.border}`, background: 'transparent', cursor: 'pointer', fontSize: 18 }}>-</button>
          <span style={{ fontFamily: FONTS.body, fontWeight: 700, fontSize: 16 }}>{newQty}</span>
          <button onClick={() => setNewQty(q => q + 1)} style={{ width: 30, height: 30, borderRadius: '50%', border: `2px solid ${COLORS.border}`, background: 'transparent', cursor: 'pointer', fontSize: 18 }}>+</button>
        </div>
        <PrimaryButton label="Ajouter" onClick={addItem} />
      </Modal>
    </div>
  );
}