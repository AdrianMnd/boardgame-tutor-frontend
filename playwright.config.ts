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

            url: "http://127.0.0.1:4001/api/games",

            reuseExistingServer: false,

            stdout: "pipe"

        },

        {

            // Sin "VITE_API_URL=... comando" en el propio texto
            // del comando — esa sintaxis es de bash/Unix y no
            // funciona en cmd.exe de Windows. El campo `env` de
            // Playwright hace lo mismo pero de forma
            // multiplataforma.
            //
            // "--host 127.0.0.1" es igual de importante: sin él,
            // `vite preview` escucha en lo que el sistema
            // resuelva para "localhost" — que en algunos Windows
            // es la interfaz IPv6 (::1), distinta de 127.0.0.1
            // (IPv4). Playwright conecta explícitamente a
            // 127.0.0.1 (ver baseURL/url abajo), así que el
            // servidor tiene que escuchar ahí de forma
            // explícita, no dar por hecho que "localhost" es lo
            // mismo.
            command:
                "npm run build && npm run preview -- --port 4173 --host 127.0.0.1",

            env: {

                VITE_API_URL: "http://127.0.0.1:4001"

            },

            url: "http://127.0.0.1:4173",

            reuseExistingServer: false,

            timeout: 120_000,

            stdout: "pipe"

        }

    ]

});
