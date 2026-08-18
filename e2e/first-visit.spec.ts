import { test, expect } from "@playwright/test";

import { resetMockServer, gotoApp } from "./helpers.js";

test.beforeEach(async ({ page }) => {

    await resetMockServer(page);

});

test("la primera visita muestra el modal de elección de tema, y no vuelve a preguntar tras recargar", async ({ page }) => {

    await page.goto("/");

    await expect(page.locator(".theme-choice-modal")).toBeVisible();

    await page.locator(".theme-choice-option", { hasText: "Oscuro" }).click();

    await expect(page.locator(".theme-choice-modal")).toBeHidden();

    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await page.reload();

    await expect(page.locator(".theme-choice-modal")).toBeHidden();

});

test("muestra la lista de juegos y la pantalla de bienvenida", async ({ page }) => {

    await gotoApp(page);

    await expect(page.locator(".game-card")).toHaveCount(2);

    await expect(page.getByText("Bienvenido a BoardGame Tutor")).toBeVisible();

});

test("seleccionar un juego abre el chat con su nombre en la cabecera", async ({ page }) => {

    await gotoApp(page);

    await page.locator(".game-card", { hasText: "Catan" }).click();

    await expect(page.locator(".chat-title h2")).toHaveText("Catan");

});
