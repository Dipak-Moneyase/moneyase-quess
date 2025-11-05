import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OtpVerificationPage from './components/OtpVerificationPage';
import LoanApplication from './components/loanApplication';

const App = () => {
	return (
		<Router>
			<Routes>
				{/* Landing Page */}
				<Route
					path='/'
					element={
						<OtpVerificationPage
							name='Rahul Anand'
							mobile='8340244810'
							customerId='CUST12345'
						/>
					}
				/>

				{/* Loan Application Page */}
				<Route path='/loanApplication' element={<LoanApplication />} />
			</Routes>
		</Router>
	);
};

export default App;
