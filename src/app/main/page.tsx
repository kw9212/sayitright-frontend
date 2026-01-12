'use client';

import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import { MainHeader } from '@/components/layout/MainHeader';

export default function MainPage() {
  const auth = useAuth();
  const router = useRouter();

  if (auth.status === 'loading') {
    return <div className="min-h-screen bg-zinc-950 text-zinc-50">로딩중...</div>;
  }

  if (auth.status === 'guest') {
    return <div className="min-h-screen bg-zinc-950 text-zinc-50">로그인이 필요합니다.</div>;
  }

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
      <MainHeader showWelcome={true} />

      {/* 메인 콘텐츠 */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[calc(100vh-120px)]">
          {menuItems.map((item) => (
            <button
              key={item.route}
              onClick={() => router.push(item.route)}
              className="group relative overflow-hidden rounded-2xl
               bg-zinc-900 p-8 text-left transition-all 
               hover:bg-zinc-800 hover:scale-[1.02] border border-zinc-800 
               hover:border-zinc-700 flex flex-col items-center justify-center"
            >
              <div className="text-6xl mb-4">{item.icon}</div>
              <h2 className="text-2xl font-bold mb-2">{item.title}</h2>
              <p className="text-zinc-400 text-sm">{item.description}</p>

              {/* 호버 효과 */}
              <div
                className="absolute inset-0 bg-gradient-to-br 
                from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 
                group-hover:to-purple-500/5  transition-all 
                dark:from-blue-500/0 dark:to-purple-500/0 
                dark:group-hover:from-blue-500/5 
                dark:group-hover:to-purple-500/5"
              />
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
