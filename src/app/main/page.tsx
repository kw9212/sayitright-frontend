'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function MainPage() {
  const auth = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (auth.status === 'loading') {
    return <div className="min-h-screen bg-zinc-950 text-zinc-50">로딩중...</div>;
  }

  if (auth.status === 'guest') {
    return <div className="min-h-screen bg-zinc-950 text-zinc-50">로그인이 필요합니다.</div>;
  }

  const handleLogoutThisDevice = async () => {
    await auth.logout();
    router.push('/');
  };

  const handleLogoutAllDevices = async () => {
    await auth.logoutAll();
    router.push('/');
  };

  const handleCreditRecharge = () => {
    // TODO: 크레딧 충전 페이지로 이동
    console.log('크레딧 충전');
  };

  const handleHelp = () => {
    // TODO: 도움말/FAQ 페이지로 이동
    router.push('/help');
  };

  const menuItems = [
    {
      title: '이메일 생성',
      description: '새로운 이메일을 작성하세요',
      icon: '✉️',
      route: '/main/email-compose',
    },
    {
      title: '템플릿',
      description: '저장된 템플릿을 관리하세요',
      icon: '📝',
      route: '/main/templates',
    },
    {
      title: '아카이브',
      description: '작성 히스토리를 확인하세요',
      icon: '📦',
      route: '/main/archive',
    },
    {
      title: '표현/용어 노트',
      description: '자주 쓰는 표현을 저장하세요',
      icon: '📚',
      route: '/main/notes',
    },
  ];

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      {/* 상단 헤더 */}
      <header className="border-b border-zinc-800 bg-zinc-900">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">
              {auth.user?.username ?? auth.user?.email}님 환영합니다
            </h1>

            {/* 드롭다운 메뉴 */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium hover:bg-zinc-700 transition-colors"
              >
                메뉴 ▾
              </button>

              {dropdownOpen && (
                <>
                  {/* 배경 클릭 시 닫기 */}
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />

                  {/* 드롭다운 내용 */}
                  <div className="absolute right-0 mt-2 w-64 rounded-lg bg-zinc-800 shadow-lg ring-1 ring-zinc-700 z-20">
                    <div className="py-1">
                      {/* 크레딧 잔액 표시 */}
                      <div className="px-4 py-3 border-b border-zinc-700">
                        <div className="text-xs text-zinc-400">크레딧 잔액</div>
                        <div className="text-lg font-semibold text-blue-400">
                          {auth.user?.creditBalance?.toLocaleString() ?? 0} 크레딧
                        </div>
                      </div>

                      <button
                        onClick={handleCreditRecharge}
                        className="block w-full px-4 py-2 text-left text-sm hover:bg-zinc-700 transition-colors"
                      >
                        💳 크레딧 충전
                      </button>

                      <div className="border-t border-zinc-700 my-1" />

                      <button
                        onClick={handleHelp}
                        className="block w-full px-4 py-2 text-left text-sm hover:bg-zinc-700 transition-colors"
                      >
                        ❓ 도움말 / FAQ
                      </button>

                      <div className="border-t border-zinc-700 my-1" />

                      <button
                        onClick={handleLogoutThisDevice}
                        className="block w-full px-4 py-2 text-left text-sm hover:bg-zinc-700 transition-colors"
                      >
                        🚪 이 기기에서만 로그아웃
                      </button>
                      <button
                        onClick={handleLogoutAllDevices}
                        className="block w-full px-4 py-2 text-left text-sm hover:bg-zinc-700 transition-colors text-red-400"
                      >
                        🚨 전체 기기에서 로그아웃
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[calc(100vh-120px)]">
          {menuItems.map((item) => (
            <button
              key={item.route}
              onClick={() => router.push(item.route)}
              className="group relative overflow-hidden rounded-2xl bg-zinc-900 p-8 text-left transition-all hover:bg-zinc-800 hover:scale-[1.02] border border-zinc-800 hover:border-zinc-700 flex flex-col items-center justify-center"
            >
              <div className="text-6xl mb-4">{item.icon}</div>
              <h2 className="text-2xl font-bold mb-2">{item.title}</h2>
              <p className="text-zinc-400 text-sm">{item.description}</p>

              {/* 호버 효과 */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all" />
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
