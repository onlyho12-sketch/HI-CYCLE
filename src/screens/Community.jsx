import React, { useState } from 'react';
import { HF } from '../theme.jsx';
import { TopBar, TitleBlock, Section, TabBar } from '../components.jsx';

const LEADERBOARD = [
  { rank: 1, name: '김동현 기사', site: '현장 A', ds: 98, badge: '에코 마스터', change: 'up' },
  { rank: 2, name: '이민수 기사', site: '현장 B', ds: 95, badge: '베테랑', change: 'up' },
  { rank: 3, name: '박기사 (나)', site: '현장 A', ds: 91, badge: '안전제일', change: 'same' },
  { rank: 4, name: '최현우 기사', site: '현장 C', ds: 88, badge: '루키', change: 'down' },
  { rank: 5, name: '정지원 기사', site: '현장 A', ds: 85, badge: '스피드레이서', change: 'down' },
];

const POSTS = [
  { id: 1, author: '김동현 기사', time: '2시간 전', content: '오늘 현장 A 먼지가 많네요. 에어필터 점검 꼭 하세요!', likes: 12, comments: 3 },
  { id: 2, author: '최현우 기사', time: '5시간 전', content: '유압실린더 회수 보냈는데 10만 크레딧 받았습니다 😆 이걸로 오일 갈아야겠네요.', likes: 24, comments: 8 },
  { id: 3, author: 'HD현대 관리자', time: '1일 전', content: '[공지] 이번 주말 폭우가 예상됩니다. 장비 덮개 확인 부탁드립니다.', likes: 45, comments: 1 },
];

export default function Community() {
  const [tab, setTab] = useState('ranking'); // 'ranking' | 'feed'

  return (
    <>
      <TopBar right={<div className="hf-pill" style={{ padding: '8px 12px', fontSize: 12 }}>내 프로필</div>} />
      <TitleBlock title="커뮤니티" subtitle="HD현대 운전자 네트워크" />

      {/* 커뮤니티 탭 */}
      <div style={{ padding: '0 24px', display: 'flex', gap: 8 }}>
        {[
          { id: 'ranking', label: '🏆 에코 랭킹' },
          { id: 'feed', label: '💬 현장 피드' },
        ].map(t => (
          <div key={t.id}
            className={`hf-pill ${t.id === tab ? 'hf-pill-on' : ''}`}
            style={{ padding: '10px 16px', fontSize: 13, flex: 1, textAlign: 'center', justifyContent: 'center' }}
            onClick={() => setTab(t.id)}
            role="tab" aria-selected={t.id === tab}
          >{t.label}</div>
        ))}
      </div>

      {tab === 'ranking' ? (
        <Section title="이번 주 Driving Score (DS) 랭킹">
          <div className="hf-glass-soft" style={{ borderRadius: 24, overflow: 'hidden' }}>
            {LEADERBOARD.map((user, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                background: user.name.includes('(나)') ? 'rgba(0, 255, 68, 0.08)' : 'transparent',
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
                  <div style={{ fontSize: 18, fontWeight: 700, color: HF.green }}>{user.ds} <span style={{ fontSize: 10, color: HF.text50, fontWeight: 400 }}>점</span></div>
                  <div style={{ fontSize: 10, color: user.change === 'up' ? HF.green : user.change === 'down' ? HF.bad : HF.text40, marginTop: 2 }}>
                    {user.change === 'up' ? '▲' : user.change === 'down' ? '▼' : '-'}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: HF.text50, marginTop: 12, textAlign: 'center' }}>
            매주 월요일 정각에 랭킹이 초기화되며, 1~3위에게는 추가 크레딧이 지급됩니다.
          </div>
        </Section>
      ) : (
        <Section title="최근 소식">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {POSTS.map(post => (
              <div key={post.id} className="fleet-card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--hf-bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                      {post.author.includes('관리자') ? '👑' : '👷'}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: post.author.includes('관리자') ? HF.green : HF.text }}>
                        {post.author}
                      </div>
                      <div style={{ fontSize: 10, color: HF.text40 }}>{post.time}</div>
                    </div>
                  </div>
                  <button style={{ background: 'none', border: 'none', color: HF.text40 }}>⋮</button>
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.5, color: HF.text70, marginBottom: 16 }}>
                  {post.content}
                </div>
                <div style={{ display: 'flex', gap: 16, borderTop: `1px solid ${HF.divider}`, paddingTop: 12 }}>
                  <div style={{ fontSize: 12, color: HF.text50, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span>👍</span> {post.likes}
                  </div>
                  <div style={{ fontSize: 12, color: HF.text50, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span>💬</span> {post.comments}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* 글쓰기 플로팅 버튼 */}
          <div style={{
            position: 'fixed', bottom: 90, right: 24, zIndex: 50,
            width: 56, height: 56, borderRadius: '50%', cursor: 'pointer',
            background: HF.text, color: 'var(--hf-bg)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, transition: 'transform 0.2s'
          }} aria-label="새 글 작성">
            ✏️
          </div>
        </Section>
      )}

      <TabBar />
    </>
  );
}
