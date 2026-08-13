export interface Game {

    id: string;

    name: string;

    language: string;

    version: string;

    minPlayers: number;

    maxPlayers: number;

    year: number;

    coverUrl?: string;

    // Opcional a propósito, aunque el backend actual siempre lo
    // manda — así, si alguna vez el backend desplegado se queda
    // desincronizado con el frontend (por ejemplo, aplicando
    // una entrega antigua sin darse cuenta) y este campo no
    // llega, la app degrada con normalidad en vez de romperse
    // por completo. Ver App.tsx/Chat.tsx: siempre se usa con
    // `?? []`, nunca se asume que existe.
    documents?: {

        id: string;

        name: string;

    }[];

}