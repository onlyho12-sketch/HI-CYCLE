import React from 'react';
import { HF } from '../theme.jsx';

/**
 * ErrorBoundary — Unity WebGL / 차트 렌더링 에러 포착
 * React 클래스 컴포넌트 (hooks로는 에러 바운더리 구현 불가)
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[HI-CYCLE ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: 24, margin: 16, borderRadius: 20,
          background: 'rgba(255,51,51,0.08)',
          border: '1px solid rgba(255,51,51,0.3)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>⚠️</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--hf-text)', marginBottom: 4 }}>
            {this.props.fallbackTitle || '렌더링 오류 발생'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--hf-text-50)' }}>
            {this.state.error?.message || '컴포넌트를 표시할 수 없습니다'}
          </div>
          <button
            className="hf-pill"
            style={{ marginTop: 12, padding: '8px 16px', fontSize: 12 }}
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            다시 시도
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
