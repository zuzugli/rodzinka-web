import React, { useState } from 'react';
import { COLORS, FONTS } from './theme';
import HomeScreen from './screens/HomeScreen';
import ShoppingScreen from './screens/ShoppingScreen';
import { CalendarScreen, RemindersScreen, ProfileScreen } from './screens/index';

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

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [userName, setUserName]   = useState(() => localStorage.getItem('userName')  || 'Sophie');
  const [userPhoto, setUserPhoto] = useState(() => localStorage.getItem('userPhoto') || null);
  const [userColor, setUserColor] = useState(() => localStorage.getItem('userColor') || '#FFD740');
  const [reminders, setReminders] = useState(() => { try { const s = localStorage.getItem('reminders'); return s ? JSON.parse(s) : []; } catch { return []; } });

  function handleSetReminders(fn) {
    setReminders(prev => {
      const next = typeof fn === 'function' ? fn(prev) : fn;
      localStorage.setItem('reminders', JSON.stringify(next));
      return next;
    });
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
