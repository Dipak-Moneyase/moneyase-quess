import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/routes';
import HeaderLogo from './components/header';

const App: React.FC = () => {
	return (
		<Router>
			<HeaderLogo />
			<AppRoutes />
		</Router>
	);
};

export default App;
