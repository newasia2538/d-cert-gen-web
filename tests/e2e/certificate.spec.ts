import { expect, test } from "@playwright/test";

test("creates certificate from typed details", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Full name").fill("Mina Srisawat");
  await page.getByLabel("Date of birth", { exact: true }).fill("12/04/1948");
  await page.getByLabel("Date of passing", { exact: true }).fill("10/10/2024");
  await page.getByLabel("A short message").fill("Loved always, remembered forever.");
  await page.getByRole("button", { name: /Create certificate/ }).click();

  await expect(page.getByText("ready to share")).toBeVisible();
  await expect(page.getByAltText("Remembrance certificate for Mina Srisawat")).toBeVisible();
  await expect(page.getByRole("button", { name: "Save image" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Copy link" })).toBeEnabled();
  await expect(page.getByRole("link", { name: "Open link" })).toHaveCount(0);
});

test("switches between English and Thai and opens social share menu", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Keep their memory close." })).toBeVisible();
  await page.getByRole("button", { name: "TH", exact: true }).click();
  await expect(page.getByRole("heading", { name: "เก็บความทรงจำของเขาไว้ใกล้หัวใจ" })).toBeVisible();
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Keep their memory close." })).toBeVisible();

  await page.getByLabel("Full name").fill("Mina Srisawat");
  await page.getByLabel("Date of birth", { exact: true }).fill("12/04/1948");
  await page.getByLabel("Date of passing", { exact: true }).fill("10/10/2024");
  await page.getByRole("button", { name: /Create certificate/ }).click();
  await page.getByRole("button", { name: "Share", exact: true }).click();
  await expect(page.getByRole("menuitem", { name: "Facebook" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "X" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Instagram" })).toBeVisible();
});

test("supports native date pickers and image upload", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Full name").fill("Mina Srisawat");
  await page.getByLabel("Date of birth date picker", { exact: true }).fill("1948-04-12");
  await page.getByLabel("Date of passing date picker", { exact: true }).fill("2024-10-10");
  await page.locator("#photo").setInputFiles({
    name: "portrait.png",
    mimeType: "image/png",
    buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64"),
  });
  await expect(page.getByText("Photo added.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Create certificate/ }).click();
  await expect(page.getByText("ready to share", { exact: true })).toBeVisible();
});

test("shows validation error for missing details", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Create certificate/ }).click();
  await expect(page.locator("p.error-message")).toHaveText("Add both dates to continue.");
});
