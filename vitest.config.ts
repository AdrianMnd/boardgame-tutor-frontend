import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({

    plugins: [react()],

    test: {

        globals: true,

        environment: "jsdom",

        setupFiles: ["./src/test/setup.ts"],

        exclude: [

            "**/node_modules/**",

            "**/dist/**",

            // Los tests E2E de Playwright viven aquí, con su
            // propia extensión .spec.ts — usan una API distinta
            // (la de Playwright, no la de Vitest) y se ejecutan
            // por separado con `npm run test:e2e`.
            "**/e2e/**"

        ]

    }

});
