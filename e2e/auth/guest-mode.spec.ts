/**
 * 게스트 모드 E2E 테스트
 *
 * 이 테스트는 인증 없이 게스트로 시작하는 플로우를 테스트합니다.
 * playwright.config.ts의 'chromium-guest' 프로젝트에서 실행됩니다.
 */

import { test, expect } from '@playwright/test';

test.describe('게스트 모드', () => {
  // 인증 없이 시작
  test.use({ storageState: { cookies: [], origins: [] } });

  test('게스트로 시작하기', async ({ page }) => {
    // 1. 인트로 페이지로 이동
    await page.goto('/intro');

    // 2. "게스트로 시작" 버튼 찾기
    const guestButton = page
      .locator('button:has-text("게스트"), button:has-text("둘러보기")')
      .first();
    await expect(guestButton).toBeVisible({ timeout: 5000 });

    // 3. 게스트 모드로 시작
    await guestButton.click();

    // 4. 메인 페이지로 이동 확인
    await expect(page).toHaveURL('/main', { timeout: 10000 });

    // 5. 게스트 모드 표시 확인 (예: "게스트 모드" 배지)
    // await expect(page.locator('text=/게스트|Guest/i')).toBeVisible();
  });

  test('게스트 모드에서 용어 노트 접근', async ({ page }) => {
    // 게스트로 시작
    await page.goto('/intro');
    const guestButton = page
      .locator('button:has-text("게스트"), button:has-text("둘러보기")')
      .first();
    if (await guestButton.isVisible()) {
      await guestButton.click();
    } else {
      // 이미 메인 페이지에 있을 수 있음
      await page.goto('/main');
    }

    // 용어 노트로 이동
    await page.goto('/main/notes');

    // 페이지가 로드되는지 확인
    await expect(page.locator('text=용어 노트')).toBeVisible({ timeout: 10000 });
  });

  test.skip('게스트 모드 제한 확인 (아카이브 3개)', async ({ page }) => {
    // 이 테스트는 실제 데이터 생성이 필요하므로 skip
    // 실제 백엔드가 준비되면 활성화

    await page.goto('/intro');
    const guestButton = page.locator('button:has-text("게스트")').first();
    if (await guestButton.isVisible()) {
      await guestButton.click();
    }

    // 아카이브 3개 생성 시도
    for (let i = 0; i < 4; i++) {
      await page.goto('/main/email-compose');
      await page.fill('[name="content"]', `테스트 이메일 ${i + 1}`);
      await page.click('button:has-text("생성")');

      if (i < 3) {
        // 처음 3개는 성공
        await expect(page.locator('text=/생성되었습니다|성공/i')).toBeVisible({ timeout: 5000 });
      } else {
        // 4번째는 제한 모달 표시
        await expect(page.locator('text=/게스트 모드 제한|제한에 도달/i')).toBeVisible({
          timeout: 5000,
        });
      }
    }
  });
});
