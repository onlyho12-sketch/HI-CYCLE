import React from 'react';
import { HF } from '../theme.jsx';
import { TopBar, TitleBlock, Section, TabBar } from '../components.jsx';

// B2B 랭킹 시스템 연동 데이터
const LEADERBOARD = [
  { rank: 1, name: '김동현 기사', site: '현장 A', ds: 98, badge: '에코 마스터', change: 'up' },
  { rank: 2, name: '이민수 기사', site: '현장 B', ds: 95, badge: '베테랑', change: 'up' },
  { rank: 3, name: '박정우 기사', site: '현장 A', ds: 91, badge: '안전제일', change: 'same' },
  { rank: 4, name: '최현우 기사', site: '현장 C', ds: 88, badge: '루키', change: 'down' },
  { rank: 5, name: '정지원 기사', site: '현장 A', ds: 85, badge: '스피드레이서', change: 'down' },
];

export default function Ranking() {
  return (
    <>
      <TopBar right={<div className="hf-pill" style={{ padding: '8px 12px', fontSize: 12 }}>내 프로필</div>} />

      <TitleBlock title="운전자 랭킹" subtitle="HD현대 에코 드라이빙 솔루션" />

      <Section title="이번 주 Driving Score (DS) 랭킹">
        <div className="hf-glass-soft" style={{ borderRadius: 24, overflow: 'hidden' }}>
          {LEADERBOARD.map((user, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
              background: 'transparent',
              borderBottom: i < LEADERBOARD.length - 1 ? `1px solid ${HF.divider}` : 'none'
            }}>
              <div style={{
                width: 24, fontSize: 15, fontWeight: 700, textAlign: 'center',
                color: user.rank <= 3 ? HF.green : HF.text40
              }}>
                {user.rank}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{user.name}</span>
                  <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 99, background: 'var(--hf-bg-deep)', color: HF.text70 }}>
                    {user.badge}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: HF.text50, marginTop: 4 }}>{user.site}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: HF.green }}>
                  {user.ds} <span style={{ fontSize: 10, color: HF.text50, fontWeight: 400 }}>점</span>
                </div>
                <div style={{ fontSize: 10, color: user.change === 'up' ? HF.green : user.change === 'down' ? HF.bad : HF.text40, marginTop: 2 }}>
                  {user.change === 'up' ? '▲' : user.change === 'down' ? '▼' : '-'}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11, color: HF.text50, marginTop: 12, textAlign: 'center', lineHeight: 1.4 }}>
          매주 월요일 정각에 랭킹이 초기화되며, 1~3위에게는 안전 운전 보상 크레딧이 지급됩니다.
        </div>
      </Section>

      <TabBar />
    </>
  );
}
