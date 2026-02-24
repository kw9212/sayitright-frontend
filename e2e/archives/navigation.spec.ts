/**
 * 아카이브 네비게이션 테스트
 *
 * 이 테스트는 auth.setup.ts에서 저장한 인증 상태를 재사용합니다.
 * 따라서 로그인 과정 없이 바로 테스트를 시작할 수 있습니다.
 */

import { test, expect } from '@playwright/test';

test.describe('아카이브 페이지 네비게이션', () => {
  // 이 describe 블록의 모든 테스트는 인증된 상태로 시작
  // (playwright.config.ts의 storageState 설정)

  test('메인 페이지에서 아카이브로 이동', async ({ page }) => {
    // 1. 메인 페이지로 이동 (이미 로그인된 상태)
    await page.goto('/main');

    // 2. 아카이브 링크 클릭
    await page.click('a[href="/main/archives"], button:has-text("아카이브")');

    // 3. 아카이브 페이지로 이동 확인
    await expect(page).toHaveURL('/main/archives');

    // 4. 아카이브 페이지 제목 확인
    await expect(page.locator('h1, header').filter({ hasText: '아카이브' })).toBeVisible();
  });

  test('아카이브 목록이 표시된다', async ({ page }) => {
    await page.goto('/main/archives');

    // 로딩 완료 대기
    await page.waitForLoadState('networkidle');

    // "총 N개의 아카이브" 텍스트 확인
    await expect(page.locator('text=/총 \\d+개의 아카이브/')).toBeVisible({ timeout: 10000 });
  });

  test('아카이브 필터가 동작한다', async ({ page }) => {
    await page.goto('/main/archives');

    // 필터 버튼 찾기 (예: "필터" 또는 "고급 필터")
    const filterButton = page.locator('button:has-text("필터"), button:has-text("고급")').first();

    if (await filterButton.isVisible()) {
      await filterButton.click();

      // 필터 옵션이 표시되는지 확인
      await expect(page.locator('select, [role="combobox"]').first()).toBeVisible();
    }
  });
});
