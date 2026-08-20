import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "boardgame-tutor-voice-output";

/**
 * Convierte el markdown de una respuesta a texto plano razonable
 * para leer en voz alta — no es un parser de markdown completo,
 * solo limpia lo más habitual en las respuestas de esta app
 * (negrita, cursiva, encabezados, listas, enlaces) para que no
 * se lean símbolos sueltos como "asterisco asterisco".
 */
function stripMarkdownForSpeech(

    text: string

): string {

    return text

        .replace(/^#{1,6}\s+/gm, "")
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/\*(.+?)\*/g, "$1")
        .replace(/`(.+?)`/g, "$1")
        .replace(/^[-*+]\s+/gm, "")
        .replace(/^\d+\.\s+/gm, "")
        .replace(/\[(.+?)\]\(.+?\)/g, "$1")
        .trim();

}

function readStoredPreference(): boolean {

    try {

        return localStorage.getItem(STORAGE_KEY) === "true";

    }
    catch {

        return false;

    }

}

/**
 * Web Speech API nativa del navegador (speechSynthesis) — igual
 * que el dictado de entrada, no hay ningún backend ni coste
 * adicional de por medio. La preferencia de activar/desactivar
 * es local a este dispositivo, igual que el tema.
 */
export function useTextToSpeech() {

    const isSupported =

        typeof window !== "undefined" &&
        "speechSynthesis" in window;

    const [isEnabled, setIsEnabled] =

        useState<boolean>(

            () => isSupported && readStoredPreference()

        );

    const [isSpeaking, setIsSpeaking] =
        useState(false);

    useEffect(() => {

        return () => {

            if (isSupported) {

                window.speechSynthesis.cancel();

            }

        };

    }, [isSupported]);

    const toggle = useCallback(() => {

        setIsEnabled(previous => {

            const next = !previous;

            try {

                localStorage.setItem(STORAGE_KEY, String(next));

            }
            catch {

                // Sin localStorage disponible, la preferencia
                // simplemente no persiste entre visitas — el
                // conmutador de esta sesión sigue funcionando.

            }

            if (!next) {

                window.speechSynthesis.cancel();

            }

            return next;

        });

    }, []);

    const speak = useCallback(

        (text: string) => {

            if (!isSupported || !text.trim()) {

                return;

            }

            window.speechSynthesis.cancel();

            const utterance =

                new SpeechSynthesisUtterance(

                    stripMarkdownForSpeech(text)

                );

            utterance.lang = "es-ES";

            utterance.onstart = () => setIsSpeaking(true);

            utterance.onend = () => setIsSpeaking(false);

            utterance.onerror = () => setIsSpeaking(false);

            window.speechSynthesis.speak(utterance);

        },

        [isSupported]

    );

    const stop = useCallback(() => {

        if (isSupported) {

            window.speechSynthesis.cancel();

            setIsSpeaking(false);

        }

    }, [isSupported]);

    return {

        isSupported,

        isEnabled,

        isSpeaking,

        toggle,

        speak,

        stop

    };

}
