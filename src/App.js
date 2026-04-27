import React, { useState, useEffect } from 'react';
import { COLORS, FONTS } from './theme';
import HomeScreen from './screens/HomeScreen';
import ShoppingScreen from './screens/ShoppingScreen';
import { CalendarScreen, RemindersScreen, ProfileScreen } from './screens/index';
import { supabase } from './supabase';

const FAMILY_CODE = 'TCHN42';

const TABS = [
  { id: 'home',      label: 'Accueil',  Icon: HomeIcon },
  { id: 'shopping',  label: 'Courses',  Icon: ShoppingIcon },
  { id: 'calendar',  label: 'Repas',    Icon: CalendarIcon },
  { id: 'reminders', label: 'Rappels',  Icon: BellIcon },
  { id: 'profile',   label: 'Profil',   Icon: UserIcon },
];

function HomeIcon({ color }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
}
function ShoppingIcon({ color }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>;
}
function CalendarIcon({ color }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function BellIcon({ color }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>;
}
function UserIcon({ color }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}

function LoginScreen({ onLogin }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  function handleSubmit() {
    if (!name.trim()) { setError('Entre ton prénom !'); return; }
    if (code.trim().toUpperCase() !== FAMILY_CODE) { setError('Code famille incorrect ❌'); return; }
    onLogin(name.trim());
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', background: '#fff' }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🏠</div>
      <h1 style={{ fontSize: 28, fontWeight: 800, fontFamily: FONTS.title, color: COLORS.text, marginBottom: 6, textAlign: 'center' }}>Famille Tchenio-Gaubert</h1>
      <p style={{ fontSize: 14, fontFamily: FONTS.body, color: COLORS.textMuted, marginBottom: 40, textAlign: 'center' }}>Entre ton prénom et le code famille pour accéder à l'app</p>

      <input
        placeholder="Ton prénom"
        value={name}
        onChange={e => { setName(e.target.value); setError(''); }}
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: `2px solid ${COLORS.border}`, fontSize: 16, fontFamily: FONTS.body, outline: 'none', marginBottom: 12, boxSizing: 'border-box' }}
      />
      <input
        placeholder="Code famille (ex: TCHN42)"
        value={code}
        onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        style={{ width: '100%', padding: '14px 16px', borderRadius: 14, border: `2px solid ${error ? '#E53935' : COLORS.border}`, fontSize: 16, fontFamily: FONTS.body, fontWeight: 700, letterSpacing: 4, outline: 'none', marginBottom: 8, boxSizing: 'border-box' }}
      />
      {error && <p style={{ fontSize: 13, color: '#E53935', fontFamily: FONTS.body, marginBottom: 8, alignSelf: 'flex-start' }}>{error}</p>}

      <button onClick={handleSubmit} style={{ width: '100%', padding: '16px', borderRadius: 14, background: COLORS.purple, border: 'none', color: '#fff', fontSize: 16, fontWeight: 800, fontFamily: FONTS.body, cursor: 'pointer', marginTop: 8 }}>
        Entrer dans l'app →
      </button>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('userName'));
  const [userName, setUserName]   = useState(() => localStorage.getItem('userName') || '');
  const [userPhoto, setUserPhoto] = useState(() => localStorage.getItem('userPhoto') || null);
  const [userColor, setUserColor] = useState(() => localStorage.getItem('userColor') || '#FFD740');
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    if (!isLoggedIn) return;
    async function loadReminders() {
      const { data } = await supabase.from('reminders').select('*').order('created_at', { ascending: false });
      if (data) setReminders(data.map(r => {
        const dateObj = r.date ? new Date(r.date + 'T12:00:00') : null;
        const recurLabel = r.recurrence === 'hebdo' ? ' · Hebdo' : r.recurrence === 'annuel' ? ' · Annuel' : '';
        const meta = dateObj ? dateObj.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }) + recurLabel : '';
        return {
          id: r.id,
          title: r.title,
          meta,
          dateStr: dateObj ? dateObj.toDateString() : '',
          cat: r.cat || 'autre',
          recur: r.recurrence || 'none',
          members: r.created_by ? [r.created_by] : [],
          createdBy: r.created_by,
        };
      }));
    }
    loadReminders();
    const sub = supabase.channel('reminders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reminders' }, loadReminders)
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, [isLoggedIn]);

  function handleLogin(name) {
    setUserName(name);
    localStorage.setItem('userName', name);
    setIsLoggedIn(true);
  }

  function handleSetReminders(fn) {
    setReminders(prev => typeof fn === 'function' ? fn(prev) : fn);
  }

  function handleSetUserName(name) {
    setUserName(name);
    localStorage.setItem('userName', name);
  }
  function handleSetUserPhoto(photo) {
    setUserPhoto(photo);
    if (photo) localStorage.setItem('userPhoto', photo);
    else localStorage.removeItem('userPhoto');
  }
  function handleSetUserColor(color) {
    setUserColor(color);
    localStorage.setItem('userColor', color);
  }

  if (!isLoggedIn) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#fff' }}>
        <LoginScreen onLogin={handleLogin} />
      </div>
    );
  }

  const screens = {
    home:      <HomeScreen navigate={setActiveTab} userName={userName} userPhoto={userPhoto} userColor={userColor} reminders={reminders} />,
    shopping:  <ShoppingScreen userName={userName} userPhoto={userPhoto} userColor={userColor} />,
    calendar:  <CalendarScreen userName={userName} userPhoto={userPhoto} userColor={userColor} />,
    reminders: <RemindersScreen userName={userName} userPhoto={userPhoto} userColor={userColor} reminders={reminders} setReminders={handleSetReminders} />,
    profile:   <ProfileScreen userName={userName} setUserName={handleSetUserName} userPhoto={userPhoto} setUserPhoto={handleSetUserPhoto} userColor={userColor} setUserColor={handleSetUserColor} />,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#fff' }}>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {screens[activeTab]}
      </div>
      <div style={{ height: 80, background: '#fff', borderTop: `1px solid ${COLORS.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 4px 12px', flexShrink: 0 }}>
        {TABS.map(({ id, label, Icon }) => {
          const active = activeTab === id;
          const color = active ? COLORS.purpleDark : COLORS.textMuted;
          return (
            <button key={id} onClick={() => setActiveTab(id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 12px', borderRadius: 16, border: 'none', cursor: 'pointer', background: active ? COLORS.purpleLight : 'transparent' }}>
              <Icon color={color} />
              <span style={{ fontSize: 10, fontWeight: 700, color, fontFamily: FONTS.body }}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}