import { test, expect } from "@playwright/test";

import { resetMockServer, gotoApp } from "./helpers.js";

test.beforeEach(async ({ page }) => {

    await resetMockServer(page);

    await gotoApp(page);

});

test("preguntar algo en el chat muestra la respuesta en streaming y sus fuentes", async ({ page }) => {

    await page.locator(".game-card", { hasText: "Catan" }).click();

    await page.locator(".chat-input textarea").fill("¿Cómo se gana?");

    await page.locator(".chat-send-button").click();

    await expect(page.locator(".message.user")).toContainText("¿Cómo se gana?");

    await expect(

        page.locator(".message.assistant").last()

    ).toContainText(

        "Se gana llegando primero al objetivo de puntos de la partida.",

        { timeout: 10_000 }

    );

    await page.locator(".sources summary").click();

    await expect(page.locator(".sources")).toContainText("Página 4");

});

test("\"Nueva conversación\" limpia los mensajes de la pantalla", async ({ page }) => {

    await page.locator(".game-card", { hasText: "Catan" }).click();

    await page.locator(".chat-input textarea").fill("¿Cómo se gana?");

    await page.locator(".chat-send-button").click();

    await expect(page.locator(".message.user")).toBeVisible();

    await page.locator("button", { hasText: "Nueva conversación" }).click();

    await expect(page.locator(".message.user")).toHaveCount(0);

});
