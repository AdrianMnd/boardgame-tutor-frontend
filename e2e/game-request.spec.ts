import { test, expect } from "@playwright/test";

import {
    resetMockServer,
    gotoApp,
    registerNewUser,
    uniqueEmail
} from "./helpers.js";

test.beforeEach(async ({ page }) => {

    await resetMockServer(page);

    await gotoApp(page);

});

test("sin sesión, el botón de solicitar juego muestra un aviso para iniciar sesión, no el formulario", async ({ page }) => {

    await page.locator(".header-game-request-button").click();

    await expect(page.locator(".header-game-request-hint")).toBeVisible();

    await expect(page.locator(".game-request-modal")).toHaveCount(0);

    await page.locator(".header-game-request-hint button").click();

    await expect(page.locator(".auth-modal")).toBeVisible();

});

test("con sesión, se puede enviar una solicitud de juego sin ningún PDF adjunto", async ({ page }) => {

    await registerNewUser(page, {

        displayName: "Fer",

        email: uniqueEmail("fer"),

        password: "contraseñaSegura123"

    });

    await page.locator(".header-game-request-button").click();

    await expect(page.locator(".game-request-modal")).toBeVisible();

    await page.locator('.game-request-modal input[type="text"]').fill("Azul");

    await page.locator(".game-request-modal .auth-submit").click();

    await expect(page.locator(".game-request-success")).toBeVisible();

});
