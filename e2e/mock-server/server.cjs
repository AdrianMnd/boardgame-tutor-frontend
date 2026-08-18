/**
 * Backend simulado para los tests E2E — no toca ningún servicio
 * externo (sin Postgres, sin B2, sin Gemini, sin Resend). Guarda
 * todo en memoria, por eso los tests corren en serie con un solo
 * proceso (ver playwright.config.ts): con estado compartido en
 * memoria, ejecutar en paralelo arriesgaría que dos tests se
 * pisaran entre sí de formas difíciles de reproducir.
 *
 * No es un mock exhaustivo del backend real — cubre lo necesario
 * para ejercitar los flujos de usuario probados en e2e/*.spec.ts,
 * no cada validación fina que ya cubren los tests unitarios del
 * backend.
 */

const http = require("http");
const crypto = require("crypto");

const PORT = 4001;

const games = [

    {

        id: "catan",

        name: "Catan",

        language: "es",

        version: "1.0",

        minPlayers: 3,

        maxPlayers: 4,

        year: 1995,

        createdAt: "2020-01-01T00:00:00.000Z",

        coverUrl: "",

        documents: [{ id: "rulebook", name: "Reglamento" }]

    },

    {

        id: "wingspan",

        name: "Wingspan",

        language: "es",

        version: "1.0",

        minPlayers: 1,

        maxPlayers: 5,

        year: 2019,

        createdAt: "2020-01-01T00:00:00.000Z",

        coverUrl: "",

        documents: [{ id: "rulebook", name: "Reglamento" }]

    }

];

let users = [];

let favoritesByUser = {};

let categoriesByUser = {};

let conversationsByUser = {};

let nextMessageId = 1;

function readJsonBody(request) {

    return new Promise(resolve => {

        let data = "";

        request.on("data", chunk => { data += chunk; });

        request.on("end", () => {

            try {

                resolve(data ? JSON.parse(data) : {});

            }
            catch {

                resolve({});

            }

        });

    });

}

function tokenFor(userId) {

    return `mock-token-${userId}`;

}

function userIdFromRequest(request) {

    const header = request.headers["authorization"] || "";

    const match = header.match(/^Bearer mock-token-(.+)$/);

    return match ? match[1] : null;

}

function toPublicUser(user) {

    return {

        id: user.id,

        email: user.email,

        displayName: user.displayName

    };

}

function sendJson(response, status, body) {

    response.statusCode = status;

    response.setHeader("Content-Type", "application/json");

    response.end(JSON.stringify(body));

}

function requireAuth(request, response) {

    const userId = userIdFromRequest(request);

    const user = users.find(candidate => candidate.id === userId);

    if (!user) {

        sendJson(response, 401, { message: "No autenticado." });

        return null;

    }

    return user;

}

const server = http.createServer(async (request, response) => {

    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Headers", "*");
    response.setHeader("Access-Control-Allow-Methods", "*");

    if (request.method === "OPTIONS") {

        response.end();

        return;

    }

    const url = new URL(request.url, `http://localhost:${PORT}`);

    const path = url.pathname;

    if (path === "/__reset" && request.method === "POST") {

        users = [];
        favoritesByUser = {};
        categoriesByUser = {};
        conversationsByUser = {};

        response.statusCode = 204;

        response.end();

        return;

    }

    if (path === "/api/games" && request.method === "GET") {

        sendJson(response, 200, games);

        return;

    }

    if (path === "/api/auth/register" && request.method === "POST") {

        const body = await readJsonBody(request);

        if (users.some(user => user.email === body.email)) {

            sendJson(response, 409, { message: "Ya hay una cuenta con ese email." });

            return;

        }

        const user = {

            id: crypto.randomUUID(),

            email: body.email,

            displayName: body.displayName,

            password: body.password

        };

        users.push(user);

        favoritesByUser[user.id] = new Set();

        categoriesByUser[user.id] = [];

        sendJson(response, 201, { token: tokenFor(user.id), user: toPublicUser(user) });

        return;

    }

    if (path === "/api/auth/login" && request.method === "POST") {

        const body = await readJsonBody(request);

        const user = users.find(

            candidate =>
                candidate.email === body.email &&
                candidate.password === body.password

        );

        if (!user) {

            sendJson(response, 401, { message: "Email o contraseña incorrectos." });

            return;

        }

        sendJson(response, 200, { token: tokenFor(user.id), user: toPublicUser(user) });

        return;

    }

    if (path === "/api/auth/me" && request.method === "GET") {

        const user = requireAuth(request, response);

        if (!user) {

            return;

        }

        sendJson(response, 200, toPublicUser(user));

        return;

    }

    if (path === "/api/auth/me" && request.method === "PATCH") {

        const user = requireAuth(request, response);

        if (!user) {

            return;

        }

        const body = await readJsonBody(request);

        user.displayName = body.displayName;

        sendJson(response, 200, toPublicUser(user));

        return;

    }

    if (path === "/api/favorites" && request.method === "GET") {

        const user = requireAuth(request, response);

        if (!user) {

            return;

        }

        sendJson(response, 200, { gameIds: [...(favoritesByUser[user.id] || [])] });

        return;

    }

    const favoriteMatch = path.match(/^\/api\/favorites\/([^/]+)$/);

    if (favoriteMatch) {

        const user = requireAuth(request, response);

        if (!user) {

            return;

        }

        favoritesByUser[user.id] = favoritesByUser[user.id] || new Set();

        if (request.method === "POST") {

            favoritesByUser[user.id].add(favoriteMatch[1]);

            response.statusCode = 204;

            response.end();

            return;

        }

        if (request.method === "DELETE") {

            favoritesByUser[user.id].delete(favoriteMatch[1]);

            response.statusCode = 204;

            response.end();

            return;

        }

    }

    if (path === "/api/categories" && request.method === "GET") {

        const user = requireAuth(request, response);

        if (!user) {

            return;

        }

        sendJson(response, 200, categoriesByUser[user.id] || []);

        return;

    }

    if (path === "/api/categories" && request.method === "POST") {

        const user = requireAuth(request, response);

        if (!user) {

            return;

        }

        const body = await readJsonBody(request);

        const category = { id: crypto.randomUUID(), name: body.name, gameIds: [] };

        categoriesByUser[user.id] = categoriesByUser[user.id] || [];

        categoriesByUser[user.id].push(category);

        sendJson(response, 201, category);

        return;

    }

    const categoryDeleteMatch = path.match(/^\/api\/categories\/([^/]+)$/);

    if (categoryDeleteMatch && request.method === "DELETE") {

        const user = requireAuth(request, response);

        if (!user) {

            return;

        }

        categoriesByUser[user.id] =
            (categoriesByUser[user.id] || []).filter(

                category => category.id !== categoryDeleteMatch[1]

            );

        response.statusCode = 204;

        response.end();

        return;

    }

    const categoryGameMatch =
        path.match(/^\/api\/categories\/([^/]+)\/games\/([^/]+)$/);

    if (categoryGameMatch) {

        const user = requireAuth(request, response);

        if (!user) {

            return;

        }

        const [, categoryId, gameId] = categoryGameMatch;

        const category =
            (categoriesByUser[user.id] || []).find(item => item.id === categoryId);

        if (category) {

            if (request.method === "POST") {

                category.gameIds.push(gameId);

            }
            else if (request.method === "DELETE") {

                category.gameIds =
                    category.gameIds.filter(id => id !== gameId);

            }

        }

        response.statusCode = 204;

        response.end();

        return;

    }

    const conversationMatch = path.match(/^\/api\/conversations\/([^/]+)(\/messages)?$/);

    if (conversationMatch) {

        const user = requireAuth(request, response);

        if (!user) {

            return;

        }

        const gameId = conversationMatch[1];

        const key = `${user.id}:${gameId}`;

        conversationsByUser[key] = conversationsByUser[key] || [];

        if (request.method === "GET") {

            sendJson(response, 200, conversationsByUser[key]);

            return;

        }

        if (request.method === "POST" && conversationMatch[2]) {

            const body = await readJsonBody(request);

            const message = {

                id: `msg-${nextMessageId++}`,

                role: body.role,

                content: body.content,

                sources: body.sources,

                createdAt: new Date().toISOString()

            };

            conversationsByUser[key].push(message);

            sendJson(response, 201, message);

            return;

        }

        if (request.method === "DELETE") {

            conversationsByUser[key] = [];

            response.statusCode = 204;

            response.end();

            return;

        }

    }

    if (path === "/api/chat/stream" && request.method === "POST") {

        const body = await readJsonBody(request);

        response.setHeader("Content-Type", "text/event-stream");

        response.setHeader("Cache-Control", "no-cache");

        const sources = [

            {

                id: "1",

                gameId: body.gameId,

                documentId: "rulebook",

                documentName: "Reglamento",

                page: 4,

                score: 0.82,

                text: "El juego termina cuando un jugador alcanza el objetivo de la partida."

            }

        ];

        response.write(`event: sources\ndata: ${JSON.stringify(sources)}\n\n`);

        const answer = "Se gana llegando primero al objetivo de puntos de la partida.";

        for (const word of answer.split(" ")) {

            response.write(`event: chunk\ndata: ${JSON.stringify({ text: word + " " })}\n\n`);

        }

        response.write("event: done\ndata: {}\n\n");

        response.end();

        return;

    }

    if (path === "/api/game-requests" && request.method === "POST") {

        const user = requireAuth(request, response);

        if (!user) {

            return;

        }

        response.statusCode = 204;

        response.end();

        return;

    }

    sendJson(response, 404, { message: "No encontrado." });

});

server.listen(PORT, "127.0.0.1", () => {

    console.log(`[e2e mock-server] escuchando en http://127.0.0.1:${PORT}`);

});
