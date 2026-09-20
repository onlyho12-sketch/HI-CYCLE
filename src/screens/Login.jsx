import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HF } from '../theme.jsx';

// 임시 계정 (실제 서버 없을 때 사용)
const MOCK_USERS = [
  { id: 'HD-EX-2018', password: '1234' },
  { id: 'admin',      password: 'admin' },
];

export default function Login() {
  const navigate = useNavigate();
  const [userId,   setUserId]   = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [autoLogin, setAutoLogin] = useState(true);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  function handleLogin() {
    setError('');

    // 빈칸 체크
    if (!userId.trim()) {
      setError('장비 ID 또는 사번을 입력해주세요.');
      return;
    }
    if (!password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    // 실제 API 없으므로 setTimeout으로 비동기 흉내
    setTimeout(() => {
      const matched = MOCK_USERS.find(
        u => u.id === userId.trim() && u.password === password
      );
      if (matched) {
        navigate('/dashboard');
      } else {
        setError('아이디 또는 비밀번호가 올바르지 않습니다.');
        setLoading(false);
      }
    }, 600);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleLogin();
  }

  return (
    <div style={{ padding: '60px 28px 80px', display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: -1 }}>안녕하세요 👋</div>
      <div style={{ fontSize: 15, color: HF.text50, marginTop: 6 }}>장비 ID로 로그인하세요</div>

      <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* 장비 ID 입력 */}
        <div className="hf-glass-soft" style={{ borderRadius: 18, padding: '14px 16px' }}>
          <div style={{ fontSize: 11, color: HF.text40, fontWeight: 500, marginBottom: 4 }}>장비 ID / 사번</div>
          <input
            value={userId}
            onChange={e => { setUserId(e.target.value); setError(''); }}
            onKeyDown={handleKeyDown}
            placeholder="HD-EX-2018"
            style={{
              width: '100%', background: 'none', border: 'none', outline: 'none',
              fontSize: 16, fontWeight: 600, color: HF.text,
              fontFamily: HF.font,
            }}
          />
        </div>

        {/* 비밀번호 입력 */}
        <div className="hf-glass-soft" style={{ borderRadius: 18, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: HF.text40, fontWeight: 500, marginBottom: 4 }}>비밀번호</div>
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              onKeyDown={handleKeyDown}
              placeholder="비밀번호 입력"
              style={{
                width: '100%', background: 'none', border: 'none', outline: 'none',
                fontSize: 16, color: HF.text, letterSpacing: showPw ? 0 : 3,
                fontFamily: HF.font,
              }}
            />
          </div>
          <span style={{ fontSize: 18, color: HF.text40, cursor: 'pointer', paddingLeft: 12 }}
            onClick={() => setShowPw(v => !v)}>
            {showPw ? '🙈' : '👁'}
          </span>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div style={{
            padding: '10px 14px', borderRadius: 12,
            background: 'rgba(255,51,51,0.12)', border: `1px solid ${HF.bad}55`,
            fontSize: 13, color: HF.bad,
          }}>
            ⚠ {error}
          </div>
        )}

        {/* 자동로그인 / 비밀번호 찾기 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}
               onClick={() => setAutoLogin(v => !v)}>
            <div className={`hf-switch ${autoLogin ? 'on' : ''}`} style={{ width: 36, height: 22 }}></div>
            <span style={{ fontSize: 13, color: HF.text70 }}>자동 로그인</span>
          </div>
          <span style={{ fontSize: 13, color: HF.green, cursor: 'pointer' }}>비밀번호 찾기</span>
        </div>

        {/* 로그인 버튼 */}
        <button
          className="hf-btn hf-btn-primary"
          style={{ marginTop: 12, opacity: loading ? 0.6 : 1 }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
          <div style={{ flex: 1, height: 1, background: HF.text10 }}></div>
          <span style={{ fontSize: 11, color: HF.text40 }}>또는</span>
          <div style={{ flex: 1, height: 1, background: HF.text10 }}></div>
        </div>

        <button className="hf-btn" style={{ width: '100%' }}
          onClick={() => navigate('/dashboard')}>
          SSO 사내 계정으로 계속
        </button>
      </div>

      {/* 회원가입 링크 */}
      <div style={{ marginTop: 'auto', textAlign: 'center', paddingTop: 24 }}>
        <span style={{ fontSize: 13, color: HF.text50 }}>계정이 없으신가요? </span>
        <span style={{ fontSize: 13, color: HF.green, fontWeight: 600, cursor: 'pointer' }}
          onClick={() => navigate('/register')}>
          회원가입
        </span>
      </div>
    </div>
  );
}
