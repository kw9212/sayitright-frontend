'use client';

import { MainHeader } from '@/components/layout/MainHeader';
import { useState } from 'react';

type FaqItem = {
  question: string;
  answer: React.ReactNode;
};

type FaqSection = {
  title: string;
  icon: string;
  items: FaqItem[];
};

function AccordionItem({ question, answer }: FaqItem) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 
          text-left hover:bg-zinc-800/60 transition-colors"
      >
        <span className="font-medium text-zinc-100 pr-4">{question}</span>
        <span
          className={`text-zinc-400 text-lg shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        >
          ▾
        </span>
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1 text-sm text-zinc-300 leading-relaxed border-t border-zinc-800 bg-zinc-900/50">
          {answer}
        </div>
      )}
    </div>
  );
}

const FAQ_SECTIONS: FaqSection[] = [
  {
    title: '시작하기',
    icon: '🚀',
    items: [
      {
        question: 'SayItRight는 어떤 서비스인가요?',
        answer: (
          <p>
            SayItRight는 상황에 맞는 비즈니스 이메일을 AI가 자동으로 작성해주는 서비스입니다.
            수신자와의 관계, 이메일 목적, 원하는 톤 등을 설정하면 적절한 표현의 이메일 초안을 즉시
            생성해 드립니다.
          </p>
        ),
      },
      {
        question: '로그인 없이도 사용할 수 있나요?',
        answer: (
          <div className="space-y-2">
            <p>
              네, 게스트 모드로 로그인 없이 사용하실 수 있습니다. 다만 아래와 같이 제한이 있습니다.
            </p>
            <ul className="mt-2 space-y-1 list-none">
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">•</span>
                이메일 생성: 하루 최대 <strong className="text-white">3회</strong>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">•</span>
                템플릿 저장: 최대 <strong className="text-white">1개</strong>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">•</span>
                아카이브 저장: 최대 <strong className="text-white">10개</strong>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">•</span>
                표현/용어 노트: 최대 <strong className="text-white">5개</strong>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">•</span>
                입력 글자 제한: <strong className="text-white">150자</strong>
              </li>
            </ul>
            <p className="mt-3 text-zinc-400 text-xs">
              ※ 게스트 데이터는 브라우저(IndexedDB)에 저장되므로, 브라우저 데이터를 삭제하면
              사라집니다.
            </p>
          </div>
        ),
      },
      {
        question: '이메일은 어떻게 생성하나요?',
        answer: (
          <ol className="space-y-3 list-none">
            <li className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
                1
              </span>
              <span>
                <strong className="text-white">필터 설정</strong> — 수신자와의{' '}
                <strong className="text-zinc-200">관계</strong>(교수님, 상사, 동료 등)와 이메일의{' '}
                <strong className="text-zinc-200">목적</strong>(요청, 감사, 문의 등)을 선택합니다.
                목록에 없으면 &ldquo;직접 입력&rdquo;을 고를 수 있습니다.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
                2
              </span>
              <span>
                <strong className="text-white">내용 작성</strong> — 전달하고 싶은 내용을 자유롭게
                메모 형식으로 작성합니다. 문장이 아닌 키워드 형태로 작성해도 됩니다.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
                3
              </span>
              <span>
                <strong className="text-white">이메일 생성</strong> 버튼을 누르면 잠시 후 완성된
                이메일이 오른쪽에 표시됩니다.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
                4
              </span>
              <span>
                <strong className="text-white">복사</strong>하거나{' '}
                <strong className="text-white">템플릿으로 저장</strong>해서 활용하세요.
              </span>
            </li>
          </ol>
        ),
      },
    ],
  },
  {
    title: '기능 안내',
    icon: '⚙️',
    items: [
      {
        question: '고급 기능(Advanced Mode)이란 무엇인가요?',
        answer: (
          <div className="space-y-2">
            <p>
              이메일 생성 화면에서 <strong className="text-white">고급 기능 활성화</strong> 버튼을
              누르면, 기본 필터(관계, 목적) 외에 추가 옵션을 설정할 수 있습니다.
            </p>
            <ul className="mt-2 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">•</span>
                <div>
                  <strong className="text-zinc-200">톤</strong> — 격식있는, 공손한, 캐주얼, 친근한
                  중 선택 (직접 입력도 가능)
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">•</span>
                <div>
                  <strong className="text-zinc-200">길이</strong> — 짧게(간결), 보통, 길게(상세)
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-400">•</span>
                <div>
                  <strong className="text-zinc-200">개선 피드백</strong> — 생성된 이메일과 함께 표현
                  선택 이유나 개선 방향을 코멘트로 제공합니다
                </div>
              </li>
            </ul>
          </div>
        ),
      },
      {
        question: '템플릿(Template)은 무엇인가요?',
        answer: (
          <p>
            자주 쓰는 이메일 형식을 저장해두는 기능입니다. 이메일 생성 후{' '}
            <strong className="text-white">템플릿으로 저장</strong> 버튼을 누르면 제목을 붙여 저장할
            수 있습니다. 저장된 템플릿은 메인 메뉴의{' '}
            <strong className="text-zinc-200">템플릿</strong> 페이지에서 확인하고 관리할 수
            있습니다.
          </p>
        ),
      },
      {
        question: '아카이브(Archive)는 무엇인가요?',
        answer: (
          <p>
            생성된 이메일의 기록을 보관하는 곳입니다. 이메일을 생성하면 자동으로 아카이브에
            저장됩니다. 메인 메뉴의 <strong className="text-zinc-200">아카이브</strong> 페이지에서
            과거에 생성했던 이메일들을 다시 확인할 수 있습니다.
          </p>
        ),
      },
      {
        question: '표현/용어 노트는 어떻게 사용하나요?',
        answer: (
          <p>
            자주 사용하는 표현, 문구, 어휘를 메모처럼 저장해두는 개인 노트 기능입니다. 업무 중 자주
            쓰는 영어 표현이나 비즈니스 용어를 저장해 두면 이메일 작성 시 참고할 수 있습니다. 메인
            메뉴의 <strong className="text-zinc-200">표현/용어 노트</strong>에서 확인하고 관리할 수
            있습니다.
          </p>
        ),
      },
      {
        question: '한국어와 영어 이메일 모두 생성할 수 있나요?',
        answer: (
          <p>
            네, 이메일 생성 화면에서 <strong className="text-zinc-200">언어 선택</strong> 버튼으로{' '}
            <strong className="text-white">한국어</strong>와{' '}
            <strong className="text-white">English</strong> 중 선택할 수 있습니다. 언어에 따라 표현
            방식과 예상 출력 길이가 다르게 적용됩니다.
          </p>
        ),
      },
    ],
  },
  {
    title: '회원 등급 및 제한',
    icon: '👤',
    items: [
      {
        question: '일반 회원과 프리미엄 회원의 차이는 무엇인가요?',
        answer: (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left py-2 pr-4 text-zinc-400 font-medium">항목</th>
                  <th className="text-center py-2 px-4 text-zinc-300 font-medium">게스트</th>
                  <th className="text-center py-2 px-4 text-zinc-300 font-medium">일반 회원</th>
                  <th className="text-center py-2 pl-4 text-purple-300 font-medium">프리미엄</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                <tr>
                  <td className="py-2 pr-4 text-zinc-400">입력 글자 제한</td>
                  <td className="text-center py-2 px-4">150자</td>
                  <td className="text-center py-2 px-4">300자</td>
                  <td className="text-center py-2 pl-4 text-purple-300">600자</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-zinc-400">일일 이메일 생성</td>
                  <td className="text-center py-2 px-4">3회</td>
                  <td className="text-center py-2 px-4">제한 없음</td>
                  <td className="text-center py-2 pl-4 text-purple-300">제한 없음</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-zinc-400">템플릿 저장</td>
                  <td className="text-center py-2 px-4">1개</td>
                  <td className="text-center py-2 px-4">제한 없음</td>
                  <td className="text-center py-2 pl-4 text-purple-300">제한 없음</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-zinc-400">아카이브</td>
                  <td className="text-center py-2 px-4">10개</td>
                  <td className="text-center py-2 px-4">제한 없음</td>
                  <td className="text-center py-2 pl-4 text-purple-300">제한 없음</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-zinc-400">노트</td>
                  <td className="text-center py-2 px-4">5개</td>
                  <td className="text-center py-2 px-4">제한 없음</td>
                  <td className="text-center py-2 pl-4 text-purple-300">제한 없음</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-zinc-400">데이터 저장</td>
                  <td className="text-center py-2 px-4 text-zinc-500">브라우저 한정</td>
                  <td className="text-center py-2 px-4">클라우드</td>
                  <td className="text-center py-2 pl-4 text-purple-300">클라우드</td>
                </tr>
              </tbody>
            </table>
          </div>
        ),
      },
      {
        question: '입력 글자 수 제한을 초과하면 어떻게 되나요?',
        answer: (
          <p>
            입력창 상단의 진행 바가 빨간색으로 바뀌고 &ldquo;제한 초과&rdquo; 안내가 표시됩니다.
            제한을 초과한 상태에서는 이메일 생성 버튼이 비활성화됩니다. 내용을 줄이거나, 고급 기능의
            길이 설정을 변경하여 제한을 늘릴 수 있습니다.
          </p>
        ),
      },
      {
        question: '구독(프리미엄) 전환은 어떻게 하나요?',
        answer: (
          <p>
            로그인 후 우측 상단 <strong className="text-white">메뉴 ▾</strong> 를 누르고{' '}
            <strong className="text-purple-300">✨ 구독 회원으로 전환</strong>을 선택하면 됩니다.
            반대로 일반 회원으로 되돌리려면 같은 메뉴에서{' '}
            <strong className="text-zinc-300">⬇️ 일반 회원으로 전환</strong>을 누르세요.
          </p>
        ),
      },
    ],
  },
  {
    title: '데이터 및 계정',
    icon: '💾',
    items: [
      {
        question: '게스트로 저장한 데이터는 어디에 보관되나요?',
        answer: (
          <p>
            게스트 모드의 데이터(템플릿, 아카이브, 노트)는 현재 사용 중인 기기의{' '}
            <strong className="text-white">브라우저 저장소(IndexedDB)</strong>에만 보관됩니다.
            브라우저 캐시나 사이트 데이터를 삭제하면 모두 사라지며, 다른 기기나 브라우저에서는 볼 수
            없습니다. 중요한 데이터는 회원가입 후 클라우드에 저장하는 것을 권장합니다.
          </p>
        ),
      },
      {
        question: '비밀번호 또는 사용자 이름을 변경하고 싶어요.',
        answer: (
          <p>
            우측 상단 <strong className="text-white">메뉴 ▾</strong> →{' '}
            <strong className="text-white">👤 프로필 변경</strong>을 선택하면 사용자 이름을 변경할
            수 있습니다.
          </p>
        ),
      },
      {
        question: '다른 기기에서 로그아웃하고 싶어요.',
        answer: (
          <p>
            메뉴에서 <strong className="text-white">🚨 전체 기기에서 로그아웃</strong>을 선택하면
            현재 로그인된 모든 기기에서 세션이 종료됩니다. 현재 기기에서만 로그아웃하려면{' '}
            <strong className="text-white">🚪 이 기기에서만 로그아웃</strong>을 선택하세요.
          </p>
        ),
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <MainHeader title="도움말 / FAQ" showBackButton={true} />

      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8 text-center">
          <div className="text-4xl mb-3">❓</div>
          <h2 className="text-2xl font-bold mb-2">무엇을 도와드릴까요?</h2>
          <p className="text-zinc-400 text-sm">자주 묻는 질문과 사용 가이드를 확인해보세요</p>
        </div>

        <div className="space-y-10">
          {FAQ_SECTIONS.map((section) => (
            <section key={section.title}>
              <h3 className="flex items-center gap-2 text-base font-semibold text-zinc-300 mb-3 px-1">
                <span>{section.icon}</span>
                <span>{section.title}</span>
              </h3>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <AccordionItem
                    key={item.question}
                    question={item.question}
                    answer={item.answer}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-xl bg-zinc-900 border border-zinc-800 p-6 text-center">
          <p className="text-zinc-400 text-sm">원하는 답변을 찾지 못하셨나요?</p>
          <p className="text-zinc-500 text-xs mt-1">
            서비스 이용 중 문제가 발생했다면 페이지를 새로고침하거나 다시 시도해주세요.
          </p>
          <p className="text-zinc-500 text-xs mt-3">
            추가됐으면 하는 기능이나 발견하신 버그가 있다면 언제든{' '}
            <a
              href="mailto:kwsong.dev@gmail.com"
              className="text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-2"
            >
              kwsong.dev@gmail.com
            </a>
            으로 보내주세요.
          </p>
        </div>
      </div>
    </main>
  );
}
