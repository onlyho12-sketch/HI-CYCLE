import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HF } from '../theme.jsx';
import { BackBar, Section, TabBar } from '../components.jsx';

const NOTIFICATIONS = [
  { id: 1, type: 'danger', title: '등급 D 진입 — 유압실린더', desc: 'HD HX300L #2018 유압실린더 HI 82% 도달. 즉시 점검 필요.', time: '10분 전', read: false, action: '/twin' },
  { id: 2, type: 'warn',  title: 'RUL 임계값 도달', desc: '유압실린더 잔여수명 340h 이하. 회수 일정을 계획하세요.', time: '32분 전', read: false, action: '/rul' },
  { id: 3, type: 'info',  title: '오염도 경고', desc: 'ISO 오염도 16.2 — 목표치(16) 초과. 유압유 교체 권장.', time: '1시간 전', read: false, action: '/sensor' },
  { id: 4, type: 'success', title: '회수 완료 — REQ-0417', desc: '유압 호스 회수 완료. 크레딧 +18,000원 지급.', time: '어제', read: true, action: '/credit' },
  { id: 5, type: 'success', title: '크레딧 지급', desc: 'REQ-0416 필터 6EA 회수 크레딧 +12,000원 적립.', time: '5/18', read: true, action: '/credit' },
  { id: 6, type: 'info',  title: '정기 점검 알림', desc: 'HD HX300L #2018 다음 정기 점검까지 200h 남았습니다.', time: '5/15', read: true, action: '/dashboard' },
  { id: 7, type: 'info',  title: 'KONECT 연동 완료', desc: '장비 데이터가 HD현대 KONECT 플랫폼에 동기화되었습니다.', time: '5/10', read: true, action: '/konect' },
];

const TYPE_CONFIG = {
  danger:  { icon: '🚨', color: HF.bad },
  warn:    { icon: '⚠️', color: '#F2994A' },
  info:    { icon: 'ℹ️', color: '#4FC3F7' },
  success: { icon: '✅', color: HF.green },
};

export default function NotificationPanel() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [filter, setFilter] = useState('전체');

  const unreadCount = notifications.filter(n => !n.read).length;
  const filtered = filter === '전체' ? notifications
    : filter === '안읽음' ? notifications.filter(n => !n.read)
    : notifications.filter(n => n.type === filter);

  function markAsRead(id) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  return (
    <>
      <BackBar sub={`${unreadCount}건 미확인`} label="알림"
        action={
          unreadCount > 0 && (
            <button className="hf-pill" style={{ padding: '8px 12px', fontSize: 11 }}
              onClick={markAllRead} aria-label="모두 읽음">
              모두 읽음
            </button>
          )
        }
      />

      {/* 필터 */}
      <div style={{ padding: '10px 20px 0', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {['전체', '안읽음', 'danger', 'warn', 'info', 'success'].map(f => {
          const labels = { '전체': '전체', '안읽음': `안읽음(${unreadCount})`, danger: '긴급', warn: '주의', info: '정보', success: '완료' };
          return (
            <div key={f}
              className={`hf-pill ${f === filter ? 'hf-pill-on' : ''}`}
              style={{ padding: '6px 12px', fontSize: 11, whiteSpace: 'nowrap' }}
              onClick={() => setFilter(f)}
              role="tab" aria-selected={f === filter}
            >{labels[f]}</div>
          );
        })}
      </div>

      {/* 알림 목록 */}
      <Section>
        <div className="hf-glass-soft" style={{ borderRadius: 22, overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <div className="flex-col-center" style={{ padding: 40 }}>
              <div style={{ fontSize: 28 }}>🔔</div>
              <div style={{ fontSize: 13, color: HF.text50, marginTop: 8 }}>알림이 없습니다</div>
            </div>
          ) : (
            filtered.map((n, i) => {
              const cfg = TYPE_CONFIG[n.type];
              return (
                <div key={n.id}
                  className={`notif-item ${!n.read ? 'unread' : ''}`}
                  style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${HF.divider}` : 'none' }}
                  onClick={() => { markAsRead(n.id); navigate(n.action); }}
                  role="button" aria-label={n.title}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 12,
                    background: `${cfg.color}15`, border: `1px solid ${cfg.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, flexShrink: 0,
                  }}>{cfg.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: n.read ? 400 : 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {n.title}
                      </span>
                      {!n.read && <span style={{ width: 6, height: 6, borderRadius: 99, background: cfg.color, flexShrink: 0 }} />}
                    </div>
                    <div style={{ fontSize: 11, color: HF.text50, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {n.desc}
                    </div>
                    <div style={{ fontSize: 10, color: HF.text40, marginTop: 3 }}>{n.time}</div>
                  </div>
                  <span style={{ color: HF.text40, fontSize: 14 }}>›</span>
                </div>
              );
            })
          )}
        </div>
      </Section>

      <TabBar />
    </>
  );
}
