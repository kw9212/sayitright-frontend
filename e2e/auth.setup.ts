/**
 * 인증 상태 설정 (Global Setup)
 *
 * 모든 E2E 테스트 실행 전에 한 번만 실행되어 인증 상태를 저장합니다.
 * 이렇게 하면 각 테스트마다 로그인할 필요가 없어 실행 속도가 빨라집니다.
 */

import { test as setup, expect } from '@playwright/test';
import { TEST_USERS } from './fixtures/test-users';

const authFile = 'playwright/.auth/user.json';

setup('authenticate as basic user', async ({ page }) => {
  console.log('🔐 Setting up authentication...');

  // 1. 로그인 페이지로 이동
  await page.goto('/login');

  // 2. 로그인 폼 입력
  await page.fill('input[name="email"]', TEST_USERS.basic.email);
  await page.fill('input[type="password"]', TEST_USERS.basic.password);

  // 3. 로그인 버튼 클릭
  await page.click('button[type="submit"]');

  // 4. 로그인 성공 확인 (메인 페이지로 리다이렉트)
  await expect(page).toHaveURL('/main', { timeout: 10000 });

  // 5. 로그인 상태가 제대로 설정되었는지 확인
  // (예: 사용자 정보가 표시되는지 체크)
  await expect(page.locator('text=용어 노트')).toBeVisible({ timeout: 5000 });

  // 6. 인증 상태 저장 (쿠키, localStorage, sessionStorage 포함)
  await page.context().storageState({ path: authFile });

  console.log('✅ Authentication setup complete!');
});

// 프리미엄 사용자 인증 (필요 시 사용)
// setup('authenticate as premium user', async ({ page }) => {
//   await page.goto('/login');
//   await page.fill('input[name="email"]', TEST_USERS.premium.email);
//   await page.fill('input[type="password"]', TEST_USERS.premium.password);
//   await page.click('button[type="submit"]');
//   await expect(page).toHaveURL('/main');
//   await page.context().storageState({ path: 'playwright/.auth/premium-user.json' });
// });
