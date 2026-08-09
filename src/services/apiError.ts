export class ApiError extends Error {

    readonly status: number;

    readonly body: unknown;

    constructor(

        status: number,

        body: unknown

    ) {

        super(

            `HTTP ${status}`

        );

        this.name =

            "ApiError";

        this.status =

            status;

        this.body =

            body;

    }

}