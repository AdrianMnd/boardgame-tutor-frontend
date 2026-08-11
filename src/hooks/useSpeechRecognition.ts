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

    // Se guarda en un ref para no tener que recrear el
    // reconocedor cada vez que cambie la referencia de la
    // función (ej. porque el componente que lo usa se
    // re-renderiza).
    const onResultRef =
        useRef(onResult);

    useEffect(() => {

        onResultRef.current = onResult;

    }, [onResult]);

    useEffect(() => {

        if (!isSupported) {

            return;

        }

        const Constructor =
            getSpeechRecognitionConstructor()!;

        const recognition =
            new Constructor();

        recognition.lang = lang;

        recognition.continuous = false;

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
