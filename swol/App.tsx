import { GlobalNavigation } from "@/shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SupabaseProvider } from "./src/context/SupabaseProvider";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseProvider>
        <GlobalNavigation></GlobalNavigation>
      </SupabaseProvider>
    </QueryClientProvider>
  );
}
