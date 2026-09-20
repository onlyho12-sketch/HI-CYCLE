import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useStreamingDemo — CSV 데이터를 시간 순서대로 스트리밍하는 시연용 훅
 *
 * 사용법:
 *   const { streamData, isStreaming, progress, start, stop, reset, speed } = useStreamingDemo(fullData);
 *
 * fullData: useHICycleData에서 받은 raw 배열
 * streamData: 현재까지 스트리밍된 데이터 (점진적으로 증가)
 */
export function useStreamingDemo(fullData, options = {}) {
  const {
    initialSpeed = 50,     // 초당 추가되는 데이터 행 수
    startIndex = 0,        // 시작 인덱스
    autoStart = false,     // 자동 시작 여부
  } = options;

  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [isStreaming, setIsStreaming]   = useState(false);
  const [speed, setSpeed]               = useState(initialSpeed);
  const intervalRef = useRef(null);

  const total = fullData.length;
  const progress = total > 0 ? currentIndex / total : 0;

  // 현재까지 스트리밍된 데이터
  const streamData = fullData.slice(0, currentIndex);
  const streamCurrent = streamData[streamData.length - 1] ?? null;

  const stop = useCallback(() => {
    setIsStreaming(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (currentIndex >= total) {
      setCurrentIndex(0); // 끝까지 갔으면 처음부터
    }
    setIsStreaming(true);
  }, [currentIndex, total]);

  const reset = useCallback(() => {
    stop();
    setCurrentIndex(startIndex);
  }, [stop, startIndex]);

  const changeSpeed = useCallback((newSpeed) => {
    setSpeed(Math.max(1, Math.min(500, newSpeed)));
  }, []);

  // 스트리밍 인터벌
  useEffect(() => {
    if (!isStreaming || total === 0) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => {
        const next = prev + speed;
        if (next >= total) {
          setIsStreaming(false);
          return total;
        }
        return next;
      });
    }, 1000); // 1초 간격

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isStreaming, speed, total]);

  // 자동 시작
  useEffect(() => {
    if (autoStart && total > 0 && !isStreaming) {
      start();
    }
  }, [autoStart, total]);

  return {
    streamData,
    streamCurrent,
    currentIndex,
    total,
    isStreaming,
    progress,
    speed,
    start,
    stop,
    reset,
    setSpeed: changeSpeed,
    setIndex: setCurrentIndex,
  };
}
