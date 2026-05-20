import { test, expect } from "@playwright/test";

test("TxTrace: landing page renders the hero", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "TxTrace" })).toBeVisible();
});

test("TxTrace: app page renders the demo console", async ({ page }) => {
  await page.goto("/app");
  await expect(page).toHaveTitle(/TxTrace/);
});
