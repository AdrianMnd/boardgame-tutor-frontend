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

    const favoriteButton =

        page.locator(".game-card", { hasText: "Catan" })

            .locator(".favorite-button");

    await favoriteButton.click();

    // Espera a que React confirme el cambio (clase "active" en
    // el propio botón) antes de cambiar de pestaña — sin esto,
    // cambiar de pestaña justo después del clic es una carrera:
    // a veces gana el re-render, a veces gana el cambio de
    // pestaña, y el test se vuelve intermitente.
    await expect(favoriteButton).toHaveClass(/active/);

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
    // para poder ver las tarjetas de juego y asignarle una. Se
    // espera a que la propia pestaña "Todos" confirme el cambio
    // (clase "active") antes de seguir — mismo motivo que en el
    // resto de esperas de este archivo: sin esto, interactuar
    // con las tarjetas justo después del clic es una carrera.
    const allTab = page.locator(".sidebar-tab", { hasText: "Todos" });

    await allTab.click();

    await expect(allTab).toHaveClass(/active/);

    await page.locator(".game-card", { hasText: "Wingspan" })

        .locator(".category-picker-button").click();

    const categoryOption =

        page.locator(".category-picker-menu")

            .locator(".category-picker-item", { hasText: "Mis favoritos de mesa" });

    await categoryOption.click();

    // Igual que con el botón de favorito: espera a que React
    // confirme la asignación (aria-checked="true") antes de
    // cerrar el menú y cambiar de pestaña.
    await expect(categoryOption).toHaveAttribute("aria-checked", "true");

    await page.keyboard.press("Escape");

    await page.locator(".sidebar-tab", { hasText: "Mis favoritos de mesa" }).click();

    await expect(page.locator(".game-card")).toHaveCount(1);

    await expect(page.locator(".game-card")).toContainText("Wingspan");

});

test("solo puede haber un selector de categoría abierto a la vez", async ({ page }) => {

    await page.locator(".sidebar-tab-add").click();

    await page.locator(".sidebar-tab-new-input").fill("test");

    await page.keyboard.press("Enter");

    const allTab = page.locator(".sidebar-tab", { hasText: "Todos" });

    await allTab.click();

    await expect(allTab).toHaveClass(/active/);

    const cards = page.locator(".game-card");

    await cards.nth(0).locator(".category-picker-button").click();

    await cards.nth(1).locator(".category-picker-button").click();

    await expect(page.locator(".category-picker-menu")).toHaveCount(1);

});
