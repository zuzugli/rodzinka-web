import React, { useState } from 'react';
import { COLORS, FONTS } from './theme';
import HomeScreen from './screens/HomeScreen';
import ShoppingScreen from './screens/ShoppingScreen';
import { CalendarScreen, RemindersScreen, ProfileScreen } from './screens/index';

const TABS = [
  { id: 'home',      label: 'Accueil', emoji: '🏠' },
  { id: 'shopping',  label: 'Courses', emoji: '🛒' },
  { id: 'calendar',  label: 'Repas',   emoji: '🍽️' },
  { id: 'reminders', label: 'Rappels', emoji: '⏰' },
  { id: 'profile',   label: 'Profil',  emoji: '👤' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const screens = {
    home:      <HomeScreen navigate={setActiveTab} />,
    shopping:  <ShoppingScreen />,
    calendar:  <CalendarScreen />,
    reminders: <RemindersScreen />,
    profile:   <ProfileScreen />,
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: COLORS.background, maxHeight: '100vh' }}>
      <div style={{ height: 44, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0 }}>
        <span style={{ fontSize: 15, fontWeight: 800, fontFamily: FONTS.body, color: COLORS.text }}>9:41</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none"><rect x="0" y="4" width="3" height="8" rx="1" fill={COLORS.text}/><rect x="4.5" y="2.5" width="3" height="9.5" rx="1" fill={COLORS.text}/><rect x="9" y="0.5" width="3" height="11.5" rx="1" fill={COLORS.text}/></svg>
          <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke={COLORS.text} strokeOpacity="0.3"/><rect x="2" y="2" width="16" height="8" rx="2" fill={COLORS.text}/></svg>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {screens[activeTab]}
      </div>
      <div style={{ margin: '0 16px 16px', background: COLORS.card, borderRadius: 28, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '10px 4px', flexShrink: 0 }}>
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '6px 14px', borderRadius: 20, border: 'none', background: active ? COLORS.pink : 'transparent', transition: 'all 0.2s' }}>
              <span style={{ fontSize: active ? 22 : 20 }}>{tab.emoji}</span>
              <span style={{ fontSize: 9, fontWeight: 800, fontFamily: FONTS.body, color: active ? '#fff' : COLORS.textMuted }}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}