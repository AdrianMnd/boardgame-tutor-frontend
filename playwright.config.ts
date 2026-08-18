import { defineConfig, devices } from "@playwright/test";

/**
 * Los tests corren en serie (fullyParallel:false, workers:1) a
 * propósito — el backend simulado (e2e/mock-server) guarda su
 * estado en memoria, compartido entre todos los tests del
 * proceso. En paralelo, dos tests registrando usuarios a la vez
 * podrían pisarse entre sí de formas difíciles de reproducir.
 * Con un único proceso en serie, el comportamiento es
 * determinista, a cambio de tardar algo más en total — un buen
 * cambio para una suite de este tamaño.
 */
export default defineConfig({

    testDir: "./e2e",

    fullyParallel: false,

    workers: 1,

    retries: 0,

    reporter: "html",

    use: {

        baseURL: "http://127.0.0.1:4173",

        trace: "retain-on-failure",

        screenshot: "only-on-failure",

        launchOptions: {

            executablePath:
                process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined

        }

    },

    projects: [

        {

            name: "chromium",

            use: { ...devices["Desktop Chrome"] }

        }

    ],

    webServer: [

        {

            command: "node e2e/mock-server/server.cjs",

            port: 4001,

            reuseExistingServer: false,

            stdout: "pipe"

        },

        {

            command:
                "VITE_API_URL=http://127.0.0.1:4001 npm run build && VITE_API_URL=http://127.0.0.1:4001 npm run preview -- --port 4173",

            port: 4173,

            reuseExistingServer: false,

            timeout: 120_000,

            stdout: "pipe"

        }

    ]

});
