import { ApiError }
    from "./apiError";

export const API_URL =

    import.meta.env.VITE_API_URL
    ?? "http://localhost:3000";

if (

    typeof window !== "undefined" &&

    /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname) === false &&

    /^https?:\/\/(localhost|127\.0\.0\.1)/.test(API_URL)

) {

    // La app está desplegada en un dominio real pero sigue
    // apuntando a localhost — esto solo puede pasar si falta
    // configurar VITE_API_URL en el hosting (ej. Vercel:
    // Settings → Environment Variables) antes de compilar.
    console.error(

        "[Config] VITE_API_URL no está configurada (o apunta a localhost) " +

        "en este despliegue. Las peticiones a la API y las imágenes de " +

        "portada van a fallar. Configura VITE_API_URL con la URL pública " +

        "de tu backend y vuelve a desplegar."

    );

}

export class ApiClient {

    private token: string | null = null;

    /**
     * Se llama desde useAuth al iniciar/cerrar sesión — a
     * partir de ahí, todas las peticiones (favoritos,
     * categorías, /me...) llevan el token automáticamente, sin
     * tener que pasarlo a mano en cada llamada.
     */
    setToken(

        token: string | null

    ): void {

        this.token = token;

    }

    async get<T>(

        endpoint: string

    ): Promise<T> {

        return this.request<T>(

            endpoint,

            {

                method: "GET"

            }

        );

    }

    async post<T>(

        endpoint: string,

        body: unknown,

        signal?: AbortSignal

    ): Promise<T> {

        return this.request<T>(

            endpoint,

            {

                method: "POST",

                body:

                    JSON.stringify(body),

                signal

            }

        );

    }

    async put<T>(

        endpoint: string,

        body: unknown

    ): Promise<T> {

        return this.request<T>(

            endpoint,

            {

                method: "PUT",

                body:

                    JSON.stringify(

                        body

                    )

            }

        );

    }

    async patch<T>(

        endpoint: string,

        body: unknown

    ): Promise<T> {

        return this.request<T>(

            endpoint,

            {

                method: "PATCH",

                body:

                    JSON.stringify(

                        body

                    )

            }

        );

    }

    async delete<T>(

        endpoint: string

    ): Promise<T> {

        return this.request<T>(

            endpoint,

            {

                method: "DELETE"

            }

        );

    }

    private async request<T>(

    endpoint: string,

    init: RequestInit

): Promise<T> {

    const response =

        await fetch(

            `${API_URL}${endpoint}`,

            {

                ...init,

                headers: {

                    "Content-Type":

                        "application/json",

                    ...(

                        this.token

                            ? { "Authorization": `Bearer ${this.token}` }

                            : {}

                    ),

                    ...(init.headers ?? {})

                }

            }

        );

    const contentType =

        response.headers.get(

            "content-type"

        );

    // Se lee siempre como texto primero — un 204 (o cualquier
    // respuesta sin cuerpo) puede llegar con
    // "Content-Type: application/json" puesto igualmente, y
    // llamar a response.json() directamente sobre un cuerpo
    // vacío lanza "Unexpected end of JSON input".
    const rawText =
        await response.text();

    const body: unknown =

        rawText.length === 0

            ? undefined

            : contentType?.includes("application/json")

                ? JSON.parse(rawText)

                : rawText;

    if (

        !response.ok

    ) {

        throw new ApiError(

            response.status,

            body

        );

    }

    return body as T;

}
}

export const apiClient =

    new ApiClient();