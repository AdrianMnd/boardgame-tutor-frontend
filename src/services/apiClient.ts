const API_URL =
    "http://localhost:3000";

export class ApiClient {

    async get<T>(

        endpoint: string

    ): Promise<T> {

        const response =

            await fetch(

                `${API_URL}${endpoint}`

            );

        if (!response.ok) {

            throw new Error(

                `HTTP ${response.status}`

            );

        }

        return response.json();

    }

    async post<T>(

        endpoint: string,

        body: unknown

    ): Promise<T> {

        const response =

            await fetch(

                `${API_URL}${endpoint}`,

                {

                    method: "POST",

                    headers: {

                        "Content-Type":

                            "application/json"

                    },

                    body:

                        JSON.stringify(body)

                }

            );

        if (!response.ok) {

            throw new Error(

                `HTTP ${response.status}`

            );

        }

        return response.json();

    }

}

export const apiClient =
    new ApiClient();