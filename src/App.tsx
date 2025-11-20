import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/routes';
import ScrollToTop from './components/ScrollToTop';

const App: React.FC = () => {
	return (
		<Router>
			<ScrollToTop />
			<AppRoutes />
		</Router>
	);
};

export default App;
