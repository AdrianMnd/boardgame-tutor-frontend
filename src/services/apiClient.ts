import { ApiError }
    from "./apiError";

const API_URL =

    import.meta.env.VITE_API_URL
    ?? "http://localhost:3000";

export class ApiClient {

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

                    ...(init.headers ?? {})

                }

            }

        );

    const contentType =

        response.headers.get(

            "content-type"

        );

    const body: unknown =

        contentType?.includes(

            "application/json"

        )

            ? await response.json()

            : await response.text();

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