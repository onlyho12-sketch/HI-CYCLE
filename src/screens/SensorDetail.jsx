import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LineChart as RLineChart, Line, XAxis, YAxis, Tooltip,
  ReferenceLine, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { HF } from '../theme.jsx';
import { BackBar, Section, TabBar, ProgressBar } from '../components.jsx';
import { useHICycleData } from '../hooks/useHICycleData';

// "건전성 지수" → "HI 점수"
const SENSOR_META = {
  HI:        { label: 'HI 점수',    unit: '',     color: '#00E600', fi: null },
  pressure:  { label: '압력',        unit: 'bar',  color: '#4FC3F7', fi: null },
  iso6:      { label: '오염도',      unit: 'ISO',  color: '#FFD54F', fi: 'FI_contam' },
  drain:     { label: '드레인 유량', unit: 'L/m',  color: '#81C784', fi: 'FI_drain' },
  temp:      { label: '온도',        unit: '°C',   color: '#FF8A65', fi: 'FI_temp' },
  vibration: { label: '진동',        unit: 'mm/s', color: '#CE93D8', fi: 'FI_vibration' },
};

const FI_WEIGHT = {
  FI_contam:    0.330,
  FI_drain:     0.275,
  FI_pressure:  0.165,
  FI_temp:      0.161,
  FI_vibration: 0.069,
};

function downsample(arr, maxPoints = 200) {
  if (arr.length <= maxPoints) return arr;
  const step = Math.ceil(arr.length / maxPoints);
  return arr.filter((_, i) => i % step === 0);
}

export default function SensorDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialSensor = location.state?.sensor ?? 'HI';
  const [activeSensor, setActiveSensor] = useState(initialSensor);
  const { data, loading, error, gradeDStartIndex } = useHICycleData();

  const meta = SENSOR_META[activeSensor];

  // HI 탭일 때는 HI_score(하강) 사용, 나머지는 원시값
  const chartData = useMemo(() => {
    if (!data.length) return [];
    if (activeSensor === 'HI') {
      return downsample(data.map(r => ({ time: r.time, value: r.HI_score ?? r.HI * 100 })));
    }
    return downsample(data.map(r => ({ time: r.time, value: r[activeSensor] })));
  }, [data, activeSensor]);

  const stats = useMemo(() => {
    if (!data.length) return { min: '--', max: '--', avg: '--', last: '--' };
    const vals = chartData.map(r => r.value);
    if (!vals.length) return { min: '--', max: '--', avg: '--', last: '--' };
    return {
      min:  Math.min(...vals).toFixed(activeSensor === 'HI' ? 1 : 3),
      max:  Math.max(...vals).toFixed(activeSensor === 'HI' ? 1 : 3),
      avg:  (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(activeSensor === 'HI' ? 1 : 3),
      last: vals[vals.length - 1].toFixed(activeSensor === 'HI' ? 1 : 3),
    };
  }, [chartData, activeSensor]);

  // 열화 기여도 (FMEA) — HI 탭일 때만
  const fmeaContribs = useMemo(() => {
    if (!data.length) return [];
    const last = data[data.length - 1];
    return Object.entries(FI_WEIGHT).map(([key, w]) => ({
      label: SENSOR_META[{
        FI_contam: 'iso6', FI_drain: 'drain',
        FI_pressure: 'pressure', FI_temp: 'temp', FI_vibration: 'vibration',
      }[key]]?.label ?? key,
      value: Math.round((last[key] ?? 0) * w * 100),
    })).sort((a, b) => b.value - a.value);
  }, [data]);

  const gradeDTime = gradeDStartIndex >= 0 ? data[gradeDStartIndex]?.time : null;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: HF.bg }}>
      <div style={{ width: 32, height: 32, border: `3px solid ${HF.text10}`, borderTop: `3px solid ${HF.green}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );
  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: HF.bg }}>
      <div style={{ color: HF.bad }}>{error}</div>
    </div>
  );

  return (
    <>
      <BackBar sub="센서 데이터" label="센서 상세 분석" />

      {/* 센서 탭 */}
      <div style={{ padding: '12px 20px 0', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {Object.entries(SENSOR_META).map(([key, m]) => (
          <div key={key}
            className={`hf-pill ${activeSensor === key ? 'hf-pill-on' : ''}`}
            style={{ whiteSpace: 'nowrap',
              borderColor: activeSensor === key ? m.color : undefined,
              color:        activeSensor === key ? m.color : undefined }}
            onClick={() => setActiveSensor(key)}>
            {m.label}
          </div>
        ))}
      </div>

      {/* 통계 카드 4개 */}
      <Section>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {[
            { label: '현재', value: stats.last },
            { label: '최소', value: stats.min },
            { label: '평균', value: stats.avg },
            { label: '최대', value: stats.max },
          ].map(s => (
            <div key={s.label} className="hf-glass-soft" style={{ borderRadius: 14, padding: '10px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: HF.text50 }}>{s.label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: meta.color, marginTop: 4, letterSpacing: -0.3 }}>{s.value}</div>
              <div style={{ fontSize: 9, color: HF.text40, marginTop: 2 }}>{meta.unit}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* 메인 시계열 차트 */}
      <Section title={`${meta.label} 시계열`}>
        <div className="hf-glass" style={{ borderRadius: 24, padding: '16px 8px 12px' }}>
          <ResponsiveContainer width="100%" height={200}>
            <RLineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid stroke={HF.text10} strokeDasharray="3 3" />
              <XAxis dataKey="time" tickFormatter={v => `${v}h`}
                tick={{ fontSize: 10, fill: HF.text40 }} />
              <YAxis tick={{ fontSize: 10, fill: HF.text40 }}
                domain={activeSensor === 'HI' ? [0, 100] : ['auto', 'auto']} />
              <Tooltip
                formatter={v => [Number(v).toFixed(activeSensor === 'HI' ? 1 : 3), meta.label]}
                labelFormatter={t => `${t}h`}
                contentStyle={{ background: 'var(--hf-bg-deep)', border: `1px solid ${HF.glassBd}`, borderRadius: 10, fontSize: 12 }}
              />
              {gradeDTime && (
                <ReferenceLine x={gradeDTime} stroke={HF.bad} strokeDasharray="4 2"
                  label={{ value: '등급D', fill: HF.bad, fontSize: 10, position: 'insideTopRight' }} />
              )}
              <Line type="monotone" dataKey="value" stroke={meta.color} strokeWidth={2}
                dot={false} activeDot={{ r: 4, fill: meta.color }} />
            </RLineChart>
          </ResponsiveContainer>
        </div>
      </Section>

      {/* 열화 기여도 — HI 탭일 때만 표시 (FI 차트 제거) */}
      {activeSensor === 'HI' && (
        <Section title="열화 요인 · FMEA RPN">
          <div className="hf-glass-soft" style={{ borderRadius: 22, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {fmeaContribs.map(x => (
              <ProgressBar key={x.label} value={x.value} max={100}
                label={x.label} valueLabel={`${x.value}%`} />
            ))}
          </div>
        </Section>
      )}

      {/* grade 범례 (HI 탭) */}
      {activeSensor === 'HI' && (
        <Section>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              { g: 'A', c: HF.green, range: 'HI > 75' },
              { g: 'B', c: HF.warn,  range: '50 ~ 75' },
              { g: 'C', c: HF.warn,  range: '25 ~ 50' },
              { g: 'D', c: HF.bad,   range: '< 25' },
            ].map(({ g, c, range }) => (
              <div key={g} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: c, boxShadow: `0 0 8px ${c}` }} />
                <span style={{ fontSize: 11, color: HF.text50 }}>등급 {g}: {range}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      <div style={{ padding: '0 24px 8px' }}>
        <button className="hf-btn hf-btn-primary" style={{ width: '100%' }}
          onClick={() => setActiveSensor('HI')}>HI 점수 보기</button>
      </div>

      <TabBar />
    </>
  );
}
