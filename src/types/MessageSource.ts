export interface MessageSource {

    id: string;

    gameId: string;

    // Opcionales por la misma razón que en Game.documents — el
    // backend actual siempre los manda, pero el código nunca
    // debe asumir que están presentes.
    documentId?: string;

    documentName?: string;

    page: number;

    score: number;

    text: string;

}