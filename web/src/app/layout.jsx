import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import Navigation from "@/components/Navigation";

// Create QueryClient inside component to avoid SSR issues
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes (replaces cacheTime)
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

export default function RootLayout({children}) {
  const [queryClient] = useState(() => createQueryClient());
  
  return (
    <QueryClientProvider client={queryClient}>
      <Navigation />
      {children}
    </QueryClientProvider>
  );
}