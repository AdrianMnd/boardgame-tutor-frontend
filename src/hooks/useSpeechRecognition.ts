import {
    useCallback,
    useEffect,
    useRef,
    useState
} from "react";

/**
 * Tipos mínimos de la Web Speech API (no viene incluida en
 * los tipos estándar del DOM de TypeScript). Solo se declara
 * lo que realmente se usa.
 */
interface SpeechRecognitionResultLike {

    isFinal: boolean;

    0: { transcript: string };

}

interface SpeechRecognitionEventLike {

    resultIndex: number;

    results: ArrayLike<SpeechRecognitionResultLike>;

}

interface SpeechRecognitionLike {

    lang: string;

    continuous: boolean;

    interimResults: boolean;

    start: () => void;

    stop: () => void;

    onresult: ((event: SpeechRecognitionEventLike) => void) | null;

    onerror: (() => void) | null;

    onend: (() => void) | null;

}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {

    if (typeof window === "undefined") {

        return null;

    }

    const w = window as unknown as {

        SpeechRecognition?: SpeechRecognitionConstructor;

        webkitSpeechRecognition?: SpeechRecognitionConstructor;

    };

    return (

        w.SpeechRecognition

        ?? w.webkitSpeechRecognition

        ?? null

    );

}

interface UseSpeechRecognitionOptions {

    onResult: (transcript: string) => void;

    /**
     * Se llama cuando la grabación termina de verdad — al
     * pulsar el botón para parar, o cuando el navegador decide
     * cortar tras un silencio prolongado. No se llama en cada
     * pausa breve dentro de una misma grabación (para eso está
     * onResult, que sí se llama varias veces).
     */
    onEnd?: () => void;

    lang?: string;

}

/**
 * Dictado por voz usando la Web Speech API nativa del
 * navegador (Chrome, Edge, Safari). No usa ningún proveedor de
 * IA externo, no consume cuota, no necesita backend. En
 * navegadores sin soporte (ej. Firefox), `isSupported` es
 * `false` y el componente que lo use debe ocultar el botón.
 */
export function useSpeechRecognition({

    onResult,

    onEnd,

    lang = "es-ES"

}: UseSpeechRecognitionOptions) {

    const [isListening, setIsListening] =
        useState(false);

    const [isSupported] =

        useState(

            () => getSpeechRecognitionConstructor() !== null

        );

    const recognitionRef =
        useRef<SpeechRecognitionLike | null>(null);

    // Se guardan en refs para no tener que recrear el
    // reconocedor cada vez que cambien las funciones (ej.
    // porque el componente que lo usa se re-renderiza con una
    // pregunta distinta).
    const onResultRef =
        useRef(onResult);

    const onEndRef =
        useRef(onEnd);

    useEffect(() => {

        onResultRef.current = onResult;

    }, [onResult]);

    useEffect(() => {

        onEndRef.current = onEnd;

    }, [onEnd]);

    useEffect(() => {

        if (!isSupported) {

            return;

        }

        const Constructor =
            getSpeechRecognitionConstructor()!;

        const recognition =
            new Constructor();

        recognition.lang = lang;

        // true: la grabación no se corta sola tras una pausa
        // breve (que era el problema real) — sigue escuchando
        // hasta que se pulse el botón de parar, o hasta que el
        // propio navegador decida cortar tras un silencio
        // largo. Con esto, onresult puede llegar varias veces a
        // lo largo de una misma grabación, según se van
        // finalizando frases — por eso ya se acumulaba el
        // resultado en Chat.tsx en vez de sustituirlo.
        recognition.continuous = true;

        recognition.interimResults = false;

        recognition.onresult = event => {

            let transcript = "";

            for (

                let i = event.resultIndex;

                i < event.results.length;

                i++

            ) {

                const result = event.results[i];

                if (result.isFinal) {

                    transcript += result[0].transcript;

                }

            }

            if (transcript.trim()) {

                onResultRef.current(

                    transcript.trim()

                );

            }

        };

        recognition.onerror = () => {

            setIsListening(false);

        };

        recognition.onend = () => {

            setIsListening(false);

            onEndRef.current?.();

        };

        recognitionRef.current = recognition;

        return () => {

            recognition.onresult = null;

            recognition.onerror = null;

            recognition.onend = null;

            recognition.stop();

        };

    }, [isSupported, lang]);

    const start = useCallback(() => {

        if (

            !recognitionRef.current ||
            isListening

        ) {

            return;

        }

        try {

            recognitionRef.current.start();

            setIsListening(true);

        }
        catch {

            // El navegador rechazó iniciar (ej. ya había una
            // sesión activa) — se ignora, el usuario puede
            // volver a intentarlo.

        }

    }, [isListening]);

    const stop = useCallback(() => {

        recognitionRef.current?.stop();

        setIsListening(false);

    }, []);

    const toggle = useCallback(() => {

        if (isListening) {

            stop();

        }
        else {

            start();

        }

    }, [isListening, start, stop]);

    return {

        isSupported,

        isListening,

        start,

        stop,

        toggle

    };

}
