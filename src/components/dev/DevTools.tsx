'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getGuestUsage, setGuestUsage } from '@/lib/storage/guest-limits';
import { indexedDB } from '@/lib/storage/indexeddb';

/**
 * 개발 전용 도구
 * 프로덕션에서는 숨김 처리됨
 */
export function DevTools() {
  const [isOpen, setIsOpen] = useState(false);
  const [usage, setUsageState] = useState(getGuestUsage());

  // 프로덕션에서는 렌더링하지 않음
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const refreshUsage = () => {
    setUsageState(getGuestUsage());
  };

  const resetAllLimits = async () => {
    // LocalStorage 초기화
    setGuestUsage({
      templatesCount: 0,
      archivesCount: 0,
      notesCount: 0,
      dailyEmailCount: 0,
      lastEmailDate: '',
    });

    refreshUsage();
    alert('✅ 모든 게스트 한도가 초기화되었습니다.');
  };

  const clearIndexedDB = async () => {
    try {
      await indexedDB.clear('templates');
      await indexedDB.clear('archives');
      await indexedDB.clear('notes');
      alert('✅ IndexedDB가 초기화되었습니다.');
    } catch (error) {
      console.error('IndexedDB 초기화 실패:', error);
      alert('❌ IndexedDB 초기화 실패');
    }
  };

  const resetEverything = async () => {
    if (!confirm('⚠️ 모든 게스트 데이터를 삭제하시겠습니까?')) {
      return;
    }

    await resetAllLimits();
    await clearIndexedDB();
    window.location.reload();
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg"
          title="개발자 도구 열기"
        >
          🛠️ DEV
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-zinc-900 border border-zinc-700 rounded-lg p-4 shadow-xl w-80">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white">🛠️ 개발자 도구</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-zinc-400 hover:text-white text-xl leading-none"
        >
          ×
        </button>
      </div>

      <div className="space-y-3">
        {/* 현재 상태 */}
        <div className="bg-zinc-800 rounded p-3 text-xs">
          <div className="text-zinc-400 mb-2 font-semibold">게스트 사용 현황</div>
          <div className="space-y-1 text-zinc-300">
            <div>템플릿: {usage.templatesCount} / 1</div>
            <div>아카이브: {usage.archivesCount} / 10</div>
            <div>노트: {usage.notesCount} / 5</div>
            <div>오늘 이메일: {usage.dailyEmailCount} / 3</div>
            <div>마지막 날짜: {usage.lastEmailDate || '없음'}</div>
          </div>
          <button onClick={refreshUsage} className="mt-2 text-blue-400 hover:text-blue-300 text-xs">
            🔄 새로고침
          </button>
        </div>

        {/* 액션 버튼들 */}
        <div className="space-y-2">
          <Button
            onClick={resetAllLimits}
            variant="outline"
            className="w-full text-amber-50 text-xs bg-yellow-900/20 hover:bg-yellow-900/30 border-yellow-700"
          >
            🔄 한도 카운트 리셋
          </Button>

          <Button
            onClick={clearIndexedDB}
            variant="outline"
            className="w-full text-amber-50 text-xs bg-orange-900/20 hover:bg-orange-900/30 border-orange-700"
          >
            🗑️ IndexedDB 초기화
          </Button>

          <Button
            onClick={resetEverything}
            variant="outline"
            className="w-full text-amber-50 text-xs bg-red-900/20 hover:bg-red-900/30 border-red-700"
          >
            💣 모두 초기화 + 새로고침
          </Button>
        </div>

        <div className="text-xs text-zinc-500 border-t border-zinc-700 pt-2">
          💡 프로덕션에서는 자동으로 숨겨집니다
        </div>
      </div>
    </div>
  );
}
