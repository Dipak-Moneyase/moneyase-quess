// src/routes/routes.tsx
import React, { useMemo } from 'react';
import { Routes, Route, useSearchParams, useNavigate } from 'react-router-dom';

import OtpVerificationPage from '../components/OtpVerificationPage';
import LoanApplication from '../components/loanApplication';
import StatusPage from '../components/StatusPage';
import KycInitiated from '../components/KycInitiated';
import DigiLockerCallback from '../pages/DigiLockerCallback';

// Wrapper for OTP page (kept exactly same logic)
const OtpFromParams: React.FC = () => {
	const [search] = useSearchParams();
	const navigate = useNavigate();

	const { name, mobile, customerId } = useMemo(() => {
		const rawName = search.get('name') ?? '';
		const rawMobile = search.get('mobile') ?? '';
		const rawCustomerId = search.get('customerId') ?? '';
		const cleanMobile = rawMobile.replace(/\D/g, '').slice(-10);
		return {
			name: rawName || 'Guest',
			mobile: cleanMobile || '',
			customerId: rawCustomerId || 'UNKNOWN',
		};
	}, [search]);

	const handleOtpVerified = () => {
		navigate(
			`/loanApplication?customerId=${customerId}&name=${name}&mobile=${mobile}`,
		);
	};

	return (
		<OtpVerificationPage
			name={name}
			mobile={mobile}
			customerId={customerId}
			onVerified={handleOtpVerified}
		/>
	);
};

const AppRoutes = () => {
	return (
		<Routes>
			<Route path='/' element={<OtpFromParams />} />
			<Route path='/loanApplication' element={<LoanApplication />} />
			<Route path='/status' element={<StatusPage />} />
			<Route path='/kycInitiated' element={<KycInitiated />} />
			<Route path='/digilocker/callback' element={<DigiLockerCallback />} />
		</Routes>
	);
};

export default AppRoutes;
