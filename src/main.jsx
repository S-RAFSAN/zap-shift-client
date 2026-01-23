import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from "react-router";
import { router } from './router/router.jsx';
import 'aos/dist/aos.css';
import Aos from 'aos';
import AuthProvider from './contexts/AuthContext/AuthProvider.jsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Initialize AOS with error handling
try {
  Aos.init();
} catch (error) {
  console.warn('AOS initialization failed:', error);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Add global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

const root = document.getElementById('root');
if (!root) {
  console.error('Root element not found!');
  document.body.innerHTML = '<div style="padding: 20px; text-align: center;"><h1>Error: Root element not found</h1></div>';
} else {
  try {
    console.log('Starting app render...');
    createRoot(root).render(
      <StrictMode>
        <div className='font-urbanist'>
          <QueryClientProvider client={queryClient}>
            <AuthProvider> 
              <RouterProvider router={router} />
            </AuthProvider>
          </QueryClientProvider>
        </div>
      </StrictMode>
    );
    console.log('App rendered successfully');
  } catch (error) {
    console.error('Failed to render app:', error);
    root.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: Arial;">
        <h1>Application Error</h1>
        <p>${error.message}</p>
        <pre style="text-align: left; background: #f5f5f5; padding: 10px; overflow: auto;">${error.stack}</pre>
      </div>
    `;
  }
}
