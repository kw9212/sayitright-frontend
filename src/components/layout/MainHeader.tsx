'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { tokenStore } from '@/lib/auth/token';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ProfileEditModal } from './ProfileEditModal';
import { UpgradeToPremiumModal } from './UpgradeToPremiumModal';
import { DowngradeToFreeModal } from './DowngradeToFreeModal';
import { toast } from 'sonner';

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
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [downgradeModalOpen, setDowngradeModalOpen] = useState(false);

  const isPremium = auth.user?.tier === 'premium';

  const handleLogoutThisDevice = async () => {
    await auth.logout();
    router.push('/');
  };

  const handleLogoutAllDevices = async () => {
    await auth.logoutAll();
    router.push('/');
  };

  const handleProfileEdit = () => {
    setDropdownOpen(false);
    setProfileModalOpen(true);
  };

  const handleUpgradeToPremium = () => {
    setDropdownOpen(false);
    setUpgradeModalOpen(true);
  };

  const handleConfirmUpgrade = async () => {
    try {
      const token = tokenStore.getAccessToken();
      const response = await fetch('/api/users/me/tier', {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: 'include',
        body: JSON.stringify({ tier: 'premium' }),
      });

      if (!response.ok) {
        throw new Error('Tier 업데이트 실패');
      }

      await auth.refreshUser();
      toast.success('프리미엄 회원으로 전환되었습니다! 🎉');
      setUpgradeModalOpen(false);
    } catch (error) {
      toast.error('회원 전환 중 오류가 발생했습니다.');
      console.error('Upgrade error:', error);
    }
  };

  const handleDowngradeToFree = () => {
    setDropdownOpen(false);
    setDowngradeModalOpen(true);
  };

  const handleConfirmDowngrade = async () => {
    try {
      const token = tokenStore.getAccessToken();
      const response = await fetch('/api/users/me/tier', {
        method: 'PUT',
        headers: {
          'content-type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: 'include',
        body: JSON.stringify({ tier: 'free' }),
      });

      if (!response.ok) {
        throw new Error('Tier 업데이트 실패');
      }

      await auth.refreshUser();
      toast.success('일반 회원으로 전환되었습니다.');
      setDowngradeModalOpen(false);
    } catch (error) {
      toast.error('회원 전환 중 오류가 발생했습니다.');
      console.error('Downgrade error:', error);
    }
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
                {auth.status === 'guest'
                  ? '🎭 게스트님 환영합니다'
                  : `${auth.user?.username ?? auth.user?.email}님 환영합니다`}
              </h1>
            )}
            {title && <h1 className="text-xl font-semibold">{title}</h1>}
          </div>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="rounded-lg bg-zinc-800 px-4 py-2 text-sm 
                font-medium hover:bg-zinc-700 transition-colors"
            >
              메뉴 ▾
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />

                <div
                  className="absolute right-0 mt-2 w-64 rounded-lg 
                    bg-zinc-800 shadow-lg ring-1 ring-zinc-700 z-20"
                >
                  <div className="py-1">
                    {auth.status === 'guest' ? (
                      <>
                        <button
                          onClick={() => router.push('/auth?tab=signup')}
                          className="block w-full px-4 py-2 text-left text-sm 
                            hover:bg-zinc-700 transition-colors text-emerald-300"
                        >
                          ✨ 회원가입하기
                        </button>
                        <button
                          onClick={() => router.push('/auth?tab=login')}
                          className="block w-full px-4 py-2 text-left text-sm 
                            hover:bg-zinc-700 transition-colors text-blue-300"
                        >
                          🔐 로그인하기
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleProfileEdit}
                          className="block w-full px-4 py-2 text-left text-sm 
                            hover:bg-zinc-700 transition-colors"
                        >
                          👤 프로필 변경
                        </button>

                        {isPremium ? (
                          <button
                            onClick={handleDowngradeToFree}
                            className="block w-full px-4 py-2 text-left text-sm 
                              hover:bg-zinc-700 transition-colors text-gray-300"
                          >
                            ⬇️ 일반 회원으로 전환
                          </button>
                        ) : (
                          <button
                            onClick={handleUpgradeToPremium}
                            className="block w-full px-4 py-2 text-left text-sm 
                              hover:bg-zinc-700 transition-colors text-purple-300"
                          >
                            ✨ 구독 회원으로 전환
                          </button>
                        )}
                      </>
                    )}

                    <div className="border-t border-zinc-700 my-1" />

                    <button
                      onClick={handleHelp}
                      className="block w-full px-4 py-2 text-left text-sm 
                        hover:bg-zinc-700 transition-colors"
                    >
                      ❓ 도움말 / FAQ
                    </button>

                    {auth.status === 'authenticated' && (
                      <>
                        <div className="border-t border-zinc-700 my-1" />

                        <button
                          onClick={handleLogoutThisDevice}
                          className="block w-full px-4 py-2 text-left text-sm 
                            hover:bg-zinc-700 transition-colors"
                        >
                          🚪 이 기기에서만 로그아웃
                        </button>
                        <button
                          onClick={handleLogoutAllDevices}
                          className="block w-full px-4 py-2 text-left text-sm 
                            hover:bg-zinc-700 transition-colors text-red-400"
                        >
                          🚨 전체 기기에서 로그아웃
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <ProfileEditModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        currentUsername={auth.user?.username}
      />

      <UpgradeToPremiumModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        onConfirm={handleConfirmUpgrade}
      />

      <DowngradeToFreeModal
        isOpen={downgradeModalOpen}
        onClose={() => setDowngradeModalOpen(false)}
        onConfirm={handleConfirmDowngrade}
      />
    </header>
  );
}
