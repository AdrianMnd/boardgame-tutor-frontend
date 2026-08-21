import { StrictMode } from "react"
import { createRoot } from "react-dom/client";

import {
    QueryClient,
    QueryClientProvider
} from "@tanstack/react-query";

import App from "./App";

import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";

import { initSentry } from "./config/sentry";

import "./styles/global.css";

initSentry();


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

        <ErrorBoundary>

            <QueryClientProvider
                client={queryClient}
            >

                <App />

            </QueryClientProvider>

        </ErrorBoundary>

    </StrictMode>

);