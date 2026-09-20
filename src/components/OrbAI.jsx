import React, { useState, useEffect, useRef } from 'react';
import { HF } from '../theme.jsx';
import { useHICycleData } from '../hooks/useHICycleData';
import { Icon } from './Icon.jsx';

/**
 * OrbAI — 장비 상태를 인지하는 AI 정비 어시스턴트
 */
export function OrbAI({ onClose }) {
  const { current, gradeDStartIndex } = useHICycleData();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  // 초기 웰컴 메시지
  useEffect(() => {
    let msg = '안녕하세요! 저는 HI-CYCLE 전담 정비 어시스턴트 AI입니다. 장비에 대해 무엇이든 물어보세요.';
    if (current?.stableGrade === 'D') {
      msg = `현재 유압실린더 등급이 D(위험)입니다. 압력이 ${current.pressure.toFixed(1)}bar로 비정상적입니다. 즉시 점검 방법을 안내해 드릴까요?`;
    } else if (current?.iso6 > 16) {
      msg = `현재 오염도(ISO)가 ${current.iso6.toFixed(1)}로 다소 높습니다. 필터 점검이나 유압유 교체가 필요할 수 있어요.`;
    }

    setMessages([
      { id: Date.now(), sender: 'ai', text: msg }
    ]);
  }, [current]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // 모의 응답 로직
    setTimeout(() => {
      let aiText = '';
      const query = userMsg.text.toLowerCase();

      if (query.includes('압력') || query.includes('경고')) {
        aiText = `현재 유압실린더의 압력은 ${current?.pressure?.toFixed(1) ?? '--'}bar 입니다. 정상 범위 내에 있지만, 최근 변동 폭이 커지고 있어 주시하고 있습니다.`;
      } else if (query.includes('회수') || query.includes('바이백') || query.includes('크레딧') || query.includes('얼마')) {
        aiText = `현재 등급(${current?.stableGrade ?? 'A'})을 기준으로 지금 부품을 회수하면 약 14만 2천원의 바이백 크레딧을 받으실 수 있습니다. 마켓에서 새 부품을 구매할 때 즉시 사용 가능합니다. 회수 신청을 도와드릴까요?`;
      } else if (query.includes('진동') || query.includes('떨림')) {
        aiText = `현재 진동은 ${current?.vibration?.toFixed(2) ?? '--'}mm/s 입니다. 7mm/s를 초과하면 베어링 마모를 의심해야 하니 모니터링을 유지해 주세요.`;
      } else if (query.includes('온도') || query.includes('뜨거')) {
        aiText = `현재 오일 온도는 ${current?.temp?.toFixed(1) ?? '--'}°C 입니다. 90°C 이상 올라가면 냉각 시스템을 반드시 점검해야 합니다.`;
      } else if (query.includes('안녕') || query.includes('반가워')) {
        aiText = '네, 반갑습니다! 언제든 편하게 물어보세요. 현장에서 발생하는 에러 코드 분석이나 데이터 해석을 도와드릴 수 있습니다.';
      } else if (query.includes('고장') || query.includes('수리') || query.includes('문제')) {
        aiText = `현재 장비의 종합 열화지수(HI)는 ${((current?.HI ?? 0) * 100).toFixed(1)}%로 산출되었습니다. 당장 운행을 멈출 수준의 고장은 아니지만, 다음 정기 점검 시 유압 시스템 전반을 체크하시길 권장합니다.`;
      } else {
        // Fallback (기본 응답)
        aiText = `현재 질문하신 내용에 대해 분석해 보았습니다. 현재 장비의 주요 센서(압력 ${current?.pressure?.toFixed(1) ?? '--'}bar, 온도 ${current?.temp?.toFixed(1) ?? '--'}°C) 상으로는 연관된 즉각적인 위험 징후가 발견되지 않았습니다. 더 정밀한 분석을 위해 HD현대 KONECT 원격 진단을 연결해 드릴까요?`;
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: aiText }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="info-modal-overlay" style={{ zIndex: 1000 }} onClick={onClose} role="dialog" aria-label="AI 정비 어시스턴트">
      <div className="info-modal" style={{ height: 'min(80dvh, 640px)', maxHeight: '90dvh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        {/* 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: `1px solid ${HF.divider}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#eaf8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: HF.green, border: '1px solid rgba(0,168,89,0.1)' }}>
              <Icon name="bot" size={20} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Hi Ai</div>
              <div style={{ fontSize: 11, color: HF.green }}>● 온라인</div>
            </div>
          </div>
          <button className="hf-pill" style={{ padding: '6px 10px' }} onClick={onClose} aria-label="닫기"><Icon name="close" size={14} /></button>
        </div>

        {/* 메시지 리스트 */}
        <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map(m => (
            <div key={m.id} style={{ display: 'flex', justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '75%', padding: '12px 16px', borderRadius: 20,
                background: m.sender === 'user' ? HF.green : 'var(--hf-text-10)',
                color: m.sender === 'user' ? '#fff' : HF.text,
                borderBottomRightRadius: m.sender === 'user' ? 4 : 20,
                borderBottomLeftRadius: m.sender === 'ai' ? 4 : 20,
                fontSize: 14, lineHeight: 1.5,
              }}>
                {m.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ background: 'var(--hf-text-10)', padding: '12px 16px', borderRadius: 20, borderBottomLeftRadius: 4, display: 'flex', gap: 4 }}>
                <span className="typing-dot" style={{ animationDelay: '0s' }}>●</span>
                <span className="typing-dot" style={{ animationDelay: '0.2s' }}>●</span>
                <span className="typing-dot" style={{ animationDelay: '0.4s' }}>●</span>
              </div>
            </div>
          )}
        </div>

        {/* 입력창 */}
        <div style={{ padding: '12px 16px', borderTop: `1px solid ${HF.divider}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="궁금한 점을 물어보세요..."
              style={{
                flex: 1, background: 'var(--hf-text-10)', border: '1px solid var(--hf-soft-bd)', borderRadius: 99,
                padding: '12px 20px', fontSize: 14, color: HF.text,
              }}
            />
            <button
              style={{
                width: 44, height: 44, borderRadius: '50%', border: 'none',
                background: input.trim() ? HF.green : 'var(--hf-text-10)',
                color: input.trim() ? '#fff' : HF.text40,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                transition: 'background 0.2s, transform 0.1s', cursor: 'pointer',
                transform: input.trim() ? 'scale(1.05)' : 'scale(1)'
              }}
              onClick={handleSend}
            >
              <Icon name="send" size={18} />
            </button>
          </div>
        </div>
      </div>
      <style>{`
        .typing-dot { font-size: 10px; color: var(--hf-text-40); animation: pulse 1s infinite alternate; }
      `}</style>
    </div>
  );
}
