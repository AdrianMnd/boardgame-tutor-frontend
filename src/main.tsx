import { StrictMode } from "react"
import { createRoot } from "react-dom/client";

import {
    QueryClient,
    QueryClientProvider
} from "@tanstack/react-query";

import App from "./App";

import {
    ConversationProvider
} from "./contexts/ConversationContext";

import "./styles/global.css";


const queryClient =
    new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 10,
                refetchOnWindowFocus: false,
                refetchOnReconnect: false
            }
        }
    });



createRoot(
    document.getElementById("root")!
)
.render(

    <StrictMode>

        <QueryClientProvider
            client={queryClient}
        >

            <ConversationProvider>

                <App />

            </ConversationProvider>

        </QueryClientProvider>

    </StrictMode>

);