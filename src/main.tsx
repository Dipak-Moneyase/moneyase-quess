import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import { AuthProvider } from './Hooks/AuthContext'; // ✅ add this import
import 'bootstrap/dist/css/bootstrap.min.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				{' '}
				{/* ✅ wrap here */}
				<App />
			</AuthProvider>
		</QueryClientProvider>
	</React.StrictMode>,
);
