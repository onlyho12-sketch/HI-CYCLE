import React, { createContext, useContext, useEffect, useState } from 'react';

/* ───────────────────────────────────────────────────────────────────────────
 * Design tokens. Static values stay as plain hex; dynamic (theme-varying)
 * values resolve through CSS custom properties so a single `<html data-theme>`
 * flip switches the entire app.
 * ─────────────────────────────────────────────────────────────────────────── */
export const HF = {
  // STATIC brand
  green:    '#00A859', // Brighter UI Green
  greenHi:  '#00D16B',
  greenLo:  '#006633', // Original HD Hyundai Green for text contrast
  warn:     '#F2994A',
  bad:      '#EB5757',
  font:     "'Pretendard Variable', Pretendard, -apple-system, system-ui, sans-serif",
  mono:     "'JetBrains Mono', ui-monospace, monospace",

  // STATIC gradients (green-based, work on either bg)
  gradGreen:     'linear-gradient(135deg, #008C4A 0%, #006633 100%)',
  gradGreenSoft: 'linear-gradient(135deg, rgba(0,102,51,0.2) 0%, rgba(0,102,51,0.05) 100%)',

  // DYNAMIC (resolved via CSS variables; switched by [data-theme] on <html>)
  bg:         'var(--hf-bg)',
  bgDeep:     'var(--hf-bg-deep)',
  text:       'var(--hf-text)',
  text90:     'var(--hf-text-90)',
  text70:     'var(--hf-text-70)',
  text50:     'var(--hf-text-50)',
  text40:     'var(--hf-text-40)',
  text25:     'var(--hf-text-25)',
  text10:     'var(--hf-text-10)',
  glass:      'var(--hf-glass)',
  glassBd:    'var(--hf-glass-bd)',
  greenDim:   'var(--hf-green-dim)',
  greenBd:    'var(--hf-green-bd)',
  gradText:   'var(--hf-grad-text)',
  heroText:   'var(--hf-hero-text)',
  heroShadow: 'var(--hf-hero-shadow)',
  divider:    'var(--hf-divider)',
  softBg:     'var(--hf-soft-bg)',
  softBd:     'var(--hf-soft-bd)',
};

/* ───────────────────────────────────────────────────────────────────────────
 * Theme context — light/dark 전역 테마.
 * <html data-theme="..."> 한 곳만 바꾸면 앱 전체(탭바 포함)가 전환됩니다.
 * 선택값은 localStorage 에 저장되어 새로고침/화면 이동 후에도 유지됩니다.
 * ─────────────────────────────────────────────────────────────────────────── */
const ThemeCtx = createContext({ theme: 'light', setTheme: () => {}, toggle: () => {} });
export const useTheme = () => useContext(ThemeCtx);

function getInitialTheme() {
  try {
    const saved = localStorage.getItem('hf-theme');
    if (saved === 'dark' || saved === 'light') return saved;
  } catch { /* localStorage 사용 불가 환경 */ }
  return 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);

  // 테마가 바뀔 때마다 html 속성 + 저장
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
    try { localStorage.setItem('hf-theme', theme); } catch { /* noop */ }
  }, [theme]);

  const setTheme = (t) => setThemeState(t === 'dark' ? 'dark' : 'light');
  const toggle   = () => setThemeState(t => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeCtx.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeCtx.Provider>
  );
}
