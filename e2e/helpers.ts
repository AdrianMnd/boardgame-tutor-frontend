import { expect, type Page } from "@playwright/test";

/**
 * Limpia todo el estado del backend simulado — se llama en
 * beforeEach de cada archivo de test, para que ningún test
 * dependa de lo que haya dejado el anterior (los tests corren
 * en serie, pero sobre el MISMO proceso del servidor simulado,
 * así que su estado en memoria sí se acumularía sin esto).
 */
export async function resetMockServer(

    page: Page

): Promise<void> {

    await page.request.post("http://127.0.0.1:4001/__reset");

}

/**
 * Genera un email distinto en cada llamada — evita que dos
 * tests que registran una cuenta choquen entre sí por email
 * duplicado, sin depender de resetMockServer si no hace falta.
 */
export function uniqueEmail(

    prefix: string

): string {

    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`;

}

/**
 * La primera vez que se visita la app aparece el modal
 * obligatorio de elección de tema — hay que resolverlo antes de
 * poder interactuar con cualquier otra cosa.
 */
export async function dismissThemeChoice(

    page: Page

): Promise<void> {

    const themeModal = page.locator(".theme-choice-modal");

    if (await themeModal.isVisible().catch(() => false)) {

        await page.locator(".theme-choice-option").first().click();

    }

}

export async function gotoApp(

    page: Page

): Promise<void> {

    await page.goto("/");

    await page.locator(".game-card").first().waitFor();

    await dismissThemeChoice(page);

}

interface RegisterOptions {

    displayName: string;

    email: string;

    password: string;

}

/**
 * Abre el modal de autenticación, cambia a la pestaña de
 * registro, y envía el formulario — deja al usuario con sesión
 * iniciada al terminar.
 */
export async function registerNewUser(

    page: Page,

    options: RegisterOptions

): Promise<void> {

    await page.locator(".header-login-button").click();

    await page.locator(".auth-tab", { hasText: "Crear cuenta" }).click();

    await page.locator('.auth-field input[type="text"]').fill(options.displayName);

    await page.locator('.auth-field input[type="email"]').fill(options.email);

    await page.locator('.auth-field input[type="password"]').fill(options.password);

    await page.locator(".auth-submit").click();

    await expect(page.locator(".profile-avatar").first()).toBeVisible();

}
