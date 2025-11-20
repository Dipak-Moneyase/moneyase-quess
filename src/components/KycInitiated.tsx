import React, { useState } from 'react';
import { initializeDigiLocker } from '../sdk/surepass';
import LOGO from '../assets/moneyimg/logo-sm.png';

const KycInitiated: React.FC = () => {
	const [loading, setLoading] = useState<string | null>(null);

	const TOKEN =
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc1ODI4NDEwNywianRpIjoiOGJlMzdiM2ItMzMwNS00MjNlLTkyMTctMzRhNjAwZDgzNjEyIiwidHlwZSI6ImFjY2VzcyIsImlkZW50aXR5IjoiZGV2Lm1vbmV5YXNlQHN1cmVwYXNzLmlvIiwibmJmIjoxNzU4Mjg0MTA3LCJleHAiOjIzODkwMDQxMDcsImVtYWlsIjoibW9uZXlhc2VAc3VyZXBhc3MuaW8iLCJ0ZW5hbnRfaWQiOiJtYWluIiwidXNlcl9jbGFpbXMiOnsic2NvcGVzIjpbInVzZXIiXX19.2nveeT8ijY0qSQ38bWSm-koZuPpZtHS7EW2gAe3XXrU';

	const startDigiLocker = async () => {
		try {
			setLoading('digilocker');

			const response = await initializeDigiLocker({
				token: TOKEN,
				logo: LOGO,
			});

			const url = response?.data?.url;
			if (!url) return alert('DigiLocker start failed');

			window.location.href = url;
		} catch (error) {
			alert('Error starting DigiLocker.');
		} finally {
			setLoading(null);
		}
	};

	const startAadhaarKyc = () => {
		alert('Aadhaar KYC coming soon!');
	};

	const startPanKyc = () => {
		alert('PAN Verification coming soon!');
	};

	const startCkyc = () => {
		alert('CKYC Fetch coming soon!');
	};

	return (
		<div
			style={{
				maxHeight: '100vh',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				padding: '10px',
				marginTop: '0px',
				//background: 'linear-gradient(135deg, #4b79ff, #8e44ff)',
				//color: '#fff',
			}}
		>
			<div
				style={{
					width: '100%',
					maxWidth: '550px',
					background: 'rgba(255,255,255,0.12)',
					backdropFilter: 'blur(10px)',
					padding: '35px',
					borderRadius: '20px',
					boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
					animation: 'fadeIn 0.6s ease-out',
				}}
			>
				<div style={{ textAlign: 'center' }}>
					<img
						src={LOGO}
						alt='logo'
						style={{
							width: 80,
							marginBottom: 15,
							filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.3))',
						}}
					/>
					<h2 style={{ fontWeight: 700, marginBottom: 5 }}>KYC Required 🔐</h2>
					<p style={{ opacity: 0.9 }}>
						Please choose a method below to complete your KYC process.
					</p>
				</div>

				<div style={{ marginTop: 20 }}>
					<KycCard
						title='Verify with DigiLocker'
						desc='Fastest & fully digital KYC verification.'
						icon='📁'
						loading={loading === 'digilocker'}
						onClick={startDigiLocker}
					/>

					<KycCard
						title='Verify with Aadhaar OTP'
						desc='Complete eKYC using Aadhaar & OTP.'
						icon='🔑'
						onClick={startAadhaarKyc}
					/>

					<KycCard
						title='Verify with PAN'
						desc='Instant verification using PAN number.'
						icon='🪪'
						onClick={startPanKyc}
					/>

					{/* CKYC */}
					{/*<KycCard
						title='Fetch CKYC Record'
						desc='Fetch existing CKYC record using DOB + ID.'
						icon='📄'
						onClick={startCkyc}
					/>*/}
				</div>

				<style>
					{`
						@keyframes fadeIn {
							from { opacity: 0; transform: translateY(20px); }
							to { opacity: 1; transform: translateY(0); }
						}
					`}
				</style>
			</div>
		</div>
	);
};

export default KycInitiated;

interface CardProps {
	title: string;
	desc: string;
	icon: string;
	loading?: boolean;
	onClick: () => void;
}

const KycCard = ({ title, desc, icon, loading, onClick }: CardProps) => {
	return (
		<div
			onClick={!loading ? onClick : undefined}
			style={{
				background: 'rgba(255,255,255,0.18)',
				padding: '18px 20px',
				borderRadius: '14px',
				marginBottom: '15px',
				cursor: loading ? 'not-allowed' : 'pointer',
				transition: '0.3s',
				display: 'flex',
				alignItems: 'center',
				gap: '15px',
				boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
			}}
			onMouseEnter={(e) => {
				e.currentTarget.style.transform = 'scale(1.02)';
				e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.transform = 'scale(1)';
				e.currentTarget.style.background = 'rgba(255,255,255,0.18)';
			}}
		>
			<div style={{ fontSize: '2rem' }}>{icon}</div>

			<div style={{ flexGrow: 1 }}>
				<h4 style={{ margin: 0, fontWeight: 600 }}>{title}</h4>
				<p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem' }}>{desc}</p>
			</div>

			{loading && <div style={{ fontSize: '1rem', fontWeight: 600 }}>⏳</div>}
		</div>
	);
};
