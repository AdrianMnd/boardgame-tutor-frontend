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

    await registerNewUser(page, {

        displayName: "Elena",

        email: uniqueEmail("elena"),

        password: "contraseñaSegura123"

    });

});

test("marcar un juego como favorito lo añade a la pestaña Favoritos", async ({ page }) => {

    await page.locator(".game-card", { hasText: "Catan" })

        .locator(".favorite-button").click();

    await page.locator(".sidebar-tab", { hasText: "Favoritos" }).click();

    await expect(page.locator(".game-card")).toHaveCount(1);

    await expect(page.locator(".game-card")).toContainText("Catan");

});

test("crear una categoría personalizada y asignarle un juego la filtra correctamente", async ({ page }) => {

    await page.locator(".sidebar-tab-add").click();

    await page.locator(".sidebar-tab-new-input").fill("Mis favoritos de mesa");

    await page.keyboard.press("Enter");

    await expect(

        page.locator(".sidebar-tab", { hasText: "Mis favoritos de mesa" })

    ).toBeVisible();

    // Al crear la categoría, la app cambia automáticamente a esa
    // pestaña (que empieza vacía) — hay que volver a "Todos"
    // para poder ver las tarjetas de juego y asignarle una.
    await page.locator(".sidebar-tab", { hasText: "Todos" }).click();

    await page.locator(".game-card", { hasText: "Wingspan" })

        .locator(".category-picker-button").click();

    await page.locator(".category-picker-menu")

        .locator(".category-picker-item", { hasText: "Mis favoritos de mesa" }).click();

    await page.keyboard.press("Escape");

    await page.locator(".sidebar-tab", { hasText: "Mis favoritos de mesa" }).click();

    await expect(page.locator(".game-card")).toHaveCount(1);

    await expect(page.locator(".game-card")).toContainText("Wingspan");

});

test("solo puede haber un selector de categoría abierto a la vez", async ({ page }) => {

    await page.locator(".sidebar-tab-add").click();

    await page.locator(".sidebar-tab-new-input").fill("test");

    await page.keyboard.press("Enter");

    await page.locator(".sidebar-tab", { hasText: "Todos" }).click();

    const cards = page.locator(".game-card");

    await cards.nth(0).locator(".category-picker-button").click();

    await cards.nth(1).locator(".category-picker-button").click();

    await expect(page.locator(".category-picker-menu")).toHaveCount(1);

});
