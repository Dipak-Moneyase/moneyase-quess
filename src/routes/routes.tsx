import React, { useMemo } from 'react';
import { Routes, Route, useSearchParams, useNavigate } from 'react-router-dom';

import OtpVerificationPage from '../components/OtpVerificationPage';
import LoanApplication from '../components/loanApplication';
import KycInitiated from '../components/KycInitiated';
import DigiLockerCallback from '../pages/DigiLockerCallback';
import MainLayout from '../Layouts/MainLayout';
import { useApplicantStatus } from '../Hooks/useApplicantStatus';

const OtpFromParams: React.FC = () => {
	const [search] = useSearchParams();
	const navigate = useNavigate();
	const { mutateAsync: getStatus } = useApplicantStatus();

	const { name, mobile, customerId } = useMemo(() => {
		const rawName = search.get('name') ?? '';
		const rawMobile = search.get('mobile') ?? '';
		const rawCustomerId = search.get('applicantid') ?? '';
		const cleanMobile = rawMobile.replace(/\D/g, '').slice(-10);
		return {
			name: rawName || 'Guest',
			mobile: cleanMobile || '',
			customerId: rawCustomerId || 'UNKNOWN',
		};
	}, [search]);

	const handleOtpVerified = async () => {
		try {
			const statusResponse = await getStatus({ applicantId: customerId });

			const stage = statusResponse?.stage;
			console.log('Current Stage:', stage);

			switch (stage) {
				case 'APPLICATION_PENDING':
					navigate(
						`/loanApplication?applicantid=${customerId}&name=${name}&mobile=${mobile}`,
					);
					break;

				case 'KYC_PENDING':
					navigate('/kycInitiated');
					break;

				case 'KYC_COMPLETED':
					navigate('/status');
					break;

				default:
					navigate(
						`/loanApplication?applicantid=${customerId}&name=${name}&mobile=${mobile}`,
					);
			}
		} catch (error) {
			console.error('Status check failed:', error);

			navigate(
				`/loanApplication?applicantid=${customerId}&name=${name}&mobile=${mobile}`,
			);
		}
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

			<Route
				path='/loanApplication'
				element={
					<MainLayout>
						<LoanApplication />
					</MainLayout>
				}
			/>

			<Route
				path='/kycInitiated'
				element={
					<MainLayout>
						<KycInitiated />
					</MainLayout>
				}
			/>

			<Route
				path='/digilocker/callback'
				element={
					<MainLayout>
						<DigiLockerCallback />
					</MainLayout>
				}
			/>
		</Routes>
	);
};

export default AppRoutes;
