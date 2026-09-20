import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HF } from '../theme.jsx';
import { Waveform, Grade } from '../components.jsx';

export default function Onboard() {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', padding: '20px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 13, color: HF.text50, cursor: 'pointer' }} onClick={() => navigate('/login')}>건너뛰기</span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 32, padding: '40px 0' }}>
        <div style={{ position: 'relative', width: 220, height: 220 }}>
          <div className="hf-glass" style={{ position: 'absolute', inset: '15% 18% 18% 12%', borderRadius: 24, padding: 16 }}>
            <div style={{ fontSize: 11, color: HF.text50 }}>HI Score</div>
            <div style={{ fontSize: 46, fontWeight: 700, letterSpacing: -2, marginTop: 4, color: HF.green, textShadow: `0 0 20px ${HF.green}80` }}>82</div>
            <Waveform width={150} height={36} bars={28} seed={3} peak={0.7} />
          </div>
          <div className="hf-glass-hi" style={{ position: 'absolute', top: -10, right: 0, borderRadius: 16, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Grade grade="A" size={24} />
            <span style={{ fontSize: 12, fontWeight: 600 }}>유압펌프 A</span>
          </div>
          <div className="hf-glass" style={{ position: 'absolute', bottom: -8, left: 4, borderRadius: 14, padding: '6px 10px', fontSize: 11, color: HF.text70 }}>
            ⚡ RUL 1,840h
          </div>
        </div>
        <div style={{ textAlign: 'center', maxWidth: 280 }}>
          <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.8, lineHeight: 1.25 }}>
            부품 한 개 한 개의<br/>두번째 인생을 시작해요
          </div>
          <div style={{ fontSize: 14, color: HF.text50, marginTop: 14, lineHeight: 1.5 }}>
            센서 데이터로 운전 습관과 부품 상태를<br/>실시간으로 추적하고, 회수까지 한 번에.
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center', marginBottom: 20 }}>
        <div className="hf-pageind"><i className="on"></i><i></i><i></i></div>
        <button className="hf-btn hf-btn-primary" style={{ width: '100%' }} onClick={() => navigate('/login')}>시작하기</button>
      </div>
    </div>
  );
}
