import { test, expect } from "@playwright/test";
import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(
  new URL("../../../packages/ui/package.json", import.meta.url),
);
const AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const summaries = [
  "full",
  "minimal",
  "unassigned",
  "unassigned-no-label",
  "price-only",
  "zero-price",
  "renewal-only",
  "features-only",
  "actions-only",
];
const ids = [
  ...summaries.map((fixture) => `plan-card--summary-${fixture}`),
  "plan-definition-card--compact",
  "plan-definition-card--full",
];

for (const theme of ["dark", "light", "high_contrast"]) {
  for (const id of ids) {
    test(`${id} / ${theme}: axe and optional regions`, async ({ page }) => {
      await page.goto(`/preview.html?kind=block&id=${id}&theme=${theme}`);
      const card = page.locator("#root .rounded-xl").first();
      await expect(card).toBeVisible();
      await page.evaluate(() => document.fonts.ready);

      if (id.startsWith("plan-definition-card")) {
        await expect(
          card.getByRole("heading", { name: "Workspace" }),
        ).toBeVisible();
        await expect(
          card.getByText("workspace", { exact: true }),
        ).toBeVisible();
        await expect(card.getByText("Active", { exact: true })).toBeVisible();
        await expect(
          card.getByRole("list", { name: "Capabilities" }),
        ).toBeVisible();
        await expect(card.getByText("Enabled", { exact: true })).toBeVisible();
        await expect(card.getByText("Disabled", { exact: true })).toBeVisible();
        await expect(
          card.getByText("January 1, 2027", { exact: true }),
        ).toBeVisible();
        await expect(
          card.getByText(/Billed|Renews|Upgrade|Monthly|Annual|€|\$/),
        ).toHaveCount(0);
        const edit = card.getByRole("button", { name: "Edit", exact: true });
        const view = card.getByRole("link", {
          name: "View tenants",
          exact: true,
        });
        const activations = [];
        page.on("dialog", async (dialog) => {
          activations.push(dialog.message());
          await dialog.accept();
        });
        await page.keyboard.press("Tab");
        await expect(edit).toBeFocused();
        await page.keyboard.press("Enter");
        await page.keyboard.press("Space");
        await expect.poll(() => activations).toEqual(["Edit", "Edit"]);
        await page.keyboard.press("Tab");
        await expect(view).toBeFocused();
        await page.keyboard.press("Enter");
        await expect(page).toHaveURL(/#tenants$/);
      } else {
        const fixture = id.slice("plan-card--summary-".length);
        if (fixture === "unassigned-no-label") {
          await expect(card.getByRole("heading")).toHaveCount(0);
          await expect(card).toHaveText("");
        } else if (fixture === "unassigned") {
          await expect(
            card.getByRole("heading", { name: "No plan assigned" }),
          ).toBeVisible();
          await expect(card).toHaveText("No plan assigned");
        } else {
          await expect(
            card.getByRole("heading", { name: "Fixture Plan" }),
          ).toBeVisible();
          await expect(card.getByText("Active", { exact: true })).toBeVisible();
        }
        await expect(card.getByText(/Scale|\$/)).toHaveCount(0);
        const price = ["full", "price-only", "zero-price"].includes(fixture);
        await expect(
          card.getByText(fixture === "zero-price" ? "€0" : "€10", {
            exact: true,
          }),
        ).toHaveCount(price ? 1 : 0);
        const renewal = ["full", "renewal-only"].includes(fixture);
        await expect(
          card.getByText("Renews January 1, 2027", { exact: true }),
        ).toHaveCount(renewal ? 1 : 0);
        await expect(card.getByRole("list")).toHaveCount(
          ["full", "features-only"].includes(fixture) ? 1 : 0,
        );
        if (fixture === "full") {
          const monthly = card.getByRole("button", {
            name: "Monthly",
            exact: true,
          });
          const annual = card.getByRole("button", {
            name: "Annual",
            exact: true,
          });
          await expect(monthly).toHaveAttribute("aria-pressed", "true");
          await page.keyboard.press("Tab");
          await expect(monthly).toBeFocused();
          await page.keyboard.press("ArrowRight");
          await expect(annual).toBeFocused();
          await page.keyboard.press("Space");
          await expect(annual).toHaveAttribute("aria-pressed", "true");
          await expect(card.getByText("€100", { exact: true })).toBeVisible();
          await expect(card.getByText("€1,200", { exact: true })).toHaveCount(
            0,
          );
          await page.keyboard.press("Tab");
          await expect(
            card.getByRole("button", { name: "Upgrade", exact: true }),
          ).toBeFocused();
          await page.keyboard.press("Tab");
          await expect(
            card.getByRole("button", { name: "Manage", exact: true }),
          ).toBeFocused();
        } else {
          await expect(
            card.getByRole("group", { name: "Billing cycle" }),
          ).toHaveCount(0);
          await expect(card.locator("[aria-pressed]")).toHaveCount(0);
          await expect(card.getByText(/Billed/)).toHaveCount(0);
          if (fixture === "actions-only") {
            await page.keyboard.press("Tab");
            await expect(
              card.getByRole("button", { name: "Manage" }),
            ).toBeFocused();
          } else {
            await expect(card.getByRole("button")).toHaveCount(0);
            await page.keyboard.press("Tab");
            expect(
              await card.evaluate((element) =>
                element.contains(document.activeElement),
              ),
            ).toBe(false);
          }
        }
      }
      await page.addScriptTag({ content: AXE });
      const violations = await page.evaluate(async () => {
        // eslint-disable-next-line no-undef
        const result = await axe.run(document.querySelector("#root"), {
          runOnly: {
            type: "tag",
            values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"],
          },
        });
        return result.violations.map(
          (violation) => `${violation.id}: ${violation.help}`,
        );
      });
      expect(violations).toEqual([]);
    });
  }
}
