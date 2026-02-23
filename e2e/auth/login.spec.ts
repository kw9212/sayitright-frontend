/**
 * 로그인 플로우 E2E 테스트
 * 로그인 플로우 테스트인만큼, 인증 상태를 재사용하지 않고 직접 로그인 과정을 테스트합니다.
 */

import { test, expect } from '@playwright/test';
import { TEST_USERS } from '../fixtures/test-users';

test.describe('로그인 플로우', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('정상적인 로그인 플로우', async ({ page }) => {
    // 1. 로그인 페이지로 이동
    await page.goto('/login');

    // 2. 페이지 제목 확인
    await expect(page).toHaveTitle(/SayItRight/);

    // 3. 로그인 폼이 표시되는지 확인
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();

    // 4. 이메일 입력
    await page.fill('input[name="email"]', TEST_USERS.basic.email);

    // 5. 비밀번호 입력
    await page.fill('input[type="password"]', TEST_USERS.basic.password);

    // 6. 로그인 버튼 클릭
    await page.click('button[type="submit"]');

    // 7. 로그인 성공 후 메인 페이지로 리다이렉트 확인
    await expect(page).toHaveURL('/main', { timeout: 10000 });

    // 8. 메인 페이지 요소 확인
    await expect(page.locator('text=용어 노트')).toBeVisible();
  });

  test('잘못된 비밀번호로 로그인 시도', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', TEST_USERS.basic.email);
    await page.fill('input[type="password"]', 'wrong-password');
    await page.click('button[type="submit"]');

    // 에러 메시지 표시 확인
    await expect(
      page.locator('text=/이메일 또는 비밀번호가 올바르지 않습니다|로그인에 실패했습니다/i'),
    ).toBeVisible({ timeout: 5000 });

    // URL이 여전히 로그인 페이지인지 확인
    await expect(page).toHaveURL('/login');
  });

  test('빈 폼으로 로그인 시도', async ({ page }) => {
    await page.goto('/login');

    // 아무것도 입력하지 않고 제출
    await page.click('button[type="submit"]');

    // 유효성 검증 메시지 또는 여전히 로그인 페이지에 있는지 확인
    await expect(page).toHaveURL('/login');
  });
});
