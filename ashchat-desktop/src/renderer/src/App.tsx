import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/react-query";
import { AppRoutes } from "./routes";
import { AuthContextProvider } from "./contexts/auth/authContext";

export function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthContextProvider>
                <AppRoutes />
            </AuthContextProvider>
        </QueryClientProvider>
    )
}