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

test("registro completo: crea la cuenta, muestra el perfil, cierra sesión, e inicia sesión de nuevo", async ({ page }) => {

    const email = uniqueEmail("ana");

    await registerNewUser(page, {

        displayName: "Ana",

        email,

        password: "contraseñaSegura123"

    });

    await page.locator(".profile-button").click();

    await expect(page.locator(".profile-menu-name")).toHaveText("Ana");

    await expect(page.locator(".profile-menu-email")).toHaveText(email);

    await page.locator(".profile-menu-logout").click();

    await expect(page.locator(".header-login-button")).toBeVisible();

    await expect(page.locator(".profile-avatar")).toHaveCount(0);

    await page.locator(".header-login-button").click();

    await page.locator('.auth-field input[type="email"]').fill(email);

    await page.locator('.auth-field input[type="password"]').fill("contraseñaSegura123");

    await page.locator(".auth-submit").click();

    await expect(page.locator(".profile-avatar").first()).toBeVisible();

});

test("el modal de autenticación vuelve a \"Iniciar sesión\" al reabrirse tras haberse usado para registrarse", async ({ page }) => {

    const email = uniqueEmail("bea");

    await registerNewUser(page, {

        displayName: "Bea",

        email,

        password: "contraseñaSegura123"

    });

    await page.locator(".profile-button").click();

    await page.locator(".profile-menu-logout").click();

    await page.locator(".header-login-button").click();

    await expect(

        page.locator(".auth-tab.active")

    ).toHaveText("Iniciar sesión");

});

test("editar el nombre desde el perfil se refleja al instante en el menú", async ({ page }) => {

    await registerNewUser(page, {

        displayName: "Carlos",

        email: uniqueEmail("carlos"),

        password: "contraseñaSegura123"

    });

    await page.locator(".profile-button").click();

    await page.locator(".profile-menu-edit").click();

    const nameInput = page.locator(".edit-profile-modal .auth-field input[type=\"text\"]");

    await nameInput.fill("Carlos García");

    await page.locator(".edit-profile-modal form").first()

        .locator(".auth-submit").click();

    await expect(page.locator(".edit-profile-modal .auth-submit").first()).toHaveText("Guardado");

    await page.locator(".auth-close-button").click();

    await page.locator(".profile-button").click();

    await expect(page.locator(".profile-menu-name")).toHaveText("Carlos García");

});

test("login con contraseña incorrecta muestra un error y no inicia sesión", async ({ page }) => {

    const email = uniqueEmail("dana");

    await registerNewUser(page, {

        displayName: "Dana",

        email,

        password: "contraseñaSegura123"

    });

    await page.locator(".profile-button").click();

    await page.locator(".profile-menu-logout").click();

    await page.locator(".header-login-button").click();

    await page.locator('.auth-field input[type="email"]').fill(email);

    await page.locator('.auth-field input[type="password"]').fill("contraseñaIncorrecta");

    await page.locator(".auth-submit").click();

    await expect(page.locator(".auth-error")).toBeVisible();

    await expect(page.locator(".profile-avatar")).toHaveCount(0);

});
