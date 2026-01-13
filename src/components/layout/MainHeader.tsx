'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type MainHeaderProps = {
  showWelcome?: boolean;
  title?: string;
  showBackButton?: boolean;
};

export function MainHeader({
  showWelcome = false,
  title,
  showBackButton = false,
}: MainHeaderProps) {
  const auth = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogoutThisDevice = async () => {
    await auth.logout();
    router.push('/');
  };

  const handleLogoutAllDevices = async () => {
    await auth.logoutAll();
    router.push('/');
  };

  const handleCreditRecharge = () => {
    console.log('크레딧 충전');
  };

  const handleHelp = () => {
    router.push('/help');
  };

  return (
    <header className="border-b border-zinc-800 bg-zinc-900">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <button
                onClick={() => router.push('/main')}
                className="text-sm text-zinc-400 hover:text-zinc-50 transition-colors"
              >
                ← 메인으로
              </button>
            )}
            {showWelcome && (
              <h1 className="text-xl font-semibold">
                {auth.user?.username ?? auth.user?.email}님 환영합니다
              </h1>
            )}
            {title && <h1 className="text-xl font-semibold">{title}</h1>}
          </div>

          {/* 오른쪽: 드롭다운 메뉴 */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium hover:bg-zinc-700 transition-colors"
            >
              메뉴 ▾
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />

                <div className="absolute right-0 mt-2 w-64 rounded-lg bg-zinc-800 shadow-lg ring-1 ring-zinc-700 z-20">
                  <div className="py-1">
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
  );
}
