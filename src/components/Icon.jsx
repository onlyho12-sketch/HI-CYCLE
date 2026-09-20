import React from 'react';

/* ───────────────────────────────────────────────────────────────────────────
 * Icon — 화면 전반의 이모지를 대체하는 라인 스타일 SVG 아이콘 세트.
 * TabBar 아이콘과 동일한 스타일(stroke=currentColor, viewBox 0 0 24 24)로 통일.
 * 사용:  <Icon name="bell" size={18} />   color 는 currentColor 를 따름.
 * ─────────────────────────────────────────────────────────────────────────── */

const PATHS = {
  // chrome / actions
  bell: <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></>,
  moon: <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />,
  sun: <><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></>,
  gear: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></>,
  close: <path d="M18 6L6 18M6 6l12 12" />,
  send: <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />,
  swap: <path d="M7 4L3 8l4 4M3 8h13M17 20l4-4-4-4M21 16H8" />,
  chevronRight: <path d="M9 18l6-6-6-6" />,
  play: <path d="M5 3l14 9-14 9V3z" />,

  // domain
  formula: <path d="M18 7V4H6l6 8-6 8h12v-3" />,
  cube: <><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" /></>,
  alert: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><path d="M12 9v4M12 17h.01" /></>,
  snow: <path d="M12 2v20M2 12h20M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" />,
  tree: <><path d="M12 22v-4" /><path d="M12 2L6.5 10H9l-3.5 5H18l-3.5-5H17z" /></>,
  log: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" /></>,
  bot: <><rect x="4" y="8" width="16" height="12" rx="3" /><path d="M12 8V4M8 4h8" /><circle cx="9" cy="14" r="1" /><circle cx="15" cy="14" r="1" /></>,
  truck: <><rect x="1" y="6" width="13" height="10" rx="1" /><path d="M14 9h4l3 3v4h-7z" /><circle cx="5.5" cy="18" r="2" /><circle cx="17.5" cy="18" r="2" /></>,
  globe: <><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></>,
  ruler: <><path d="M3 8l13 13 5-5L8 3z" /><path d="M8.5 7l1.5 1.5M6 9.5L7.5 11M11 9.5l1.5 1.5M8.5 12l1.5 1.5M13.5 12l1.5 1.5" /></>,
  phone: <><rect x="5" y="2" width="14" height="20" rx="2" /><path d="M12 18h.01" /></>,
  recycle: <><path d="M23 4v6h-6M1 20v-6h6" /><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" /></>,
  drum: <><ellipse cx="12" cy="5" rx="7" ry="3" /><path d="M5 5v14c0 1.66 3.13 3 7 3s7-1.34 7-3V5" /><path d="M5 12c0 1.66 3.13 3 7 3s7-1.34 7-3" /></>,
  filter: <path d="M9.59 4.59A2 2 0 1111 8H2M12.59 19.41A2 2 0 1014 16H2M17.73 7.73A2.5 2.5 0 1119.5 12H2" />,
  hardhat: <><path d="M2 18a10 10 0 0120 0z" /><path d="M10 7a2 2 0 014 0v3M6 10V7.5M18 10V7.5M2 18h20" /></>,
  users: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></>,
  clock: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
  wrench: <path d="M14.7 6.3a4 4 0 00-5.4 5.3L3 18l3 3 6.4-6.3a4 4 0 005.3-5.4l-2.8 2.8-2.4-.6-.6-2.4 2.8-2.8z" />,
};

export function Icon({ name, size = 18, strokeWidth = 1.8, style, className, ...rest }) {
  const path = PATHS[name];
  if (!path) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ display: 'block', flexShrink: 0, ...style }}
      aria-hidden="true"
      {...rest}
    >
      {path}
    </svg>
  );
}

export default Icon;
