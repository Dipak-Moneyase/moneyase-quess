import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const DigiLockerCallback: React.FC = () => {
	const [search] = useSearchParams();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);

	const TOKEN = 'YOUR_TOKEN';

	useEffect(() => {
		const clientId = search.get('client_id');

		if (!clientId) {
			alert('Invalid DigiLocker callback!');
			navigate('/kycInitiated');
			return;
		}

		const fetchAadhaarXml = async () => {
			try {
				const res = await fetch(
					`https://sandbox.surepass.app/api/v1/digilocker/download-aadhaar/${clientId}`,
					{
						method: 'GET',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${TOKEN}`,
						},
					},
				);

				const json = await res.json();
				console.log('Aadhaar XML:', json);

				// Save to backend
				await fetch('/api/kyc/saveAadhaarXml', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(json.data),
				});

				// Redirect to your loan page or dashboard
				navigate('/status', { state: json.data });
			} catch (error) {
				console.error(error);
				alert('Failed to fetch Aadhaar XML');
				navigate('/kycInitiated');
			} finally {
				setLoading(false);
			}
		};

		fetchAadhaarXml();
	}, [search, navigate]);

	return (
		<div style={{ padding: 40, textAlign: 'center' }}>
			<h2>DigiLocker Verification</h2>
			{loading ? <p>Fetching Aadhaar XML… ⏳</p> : <p>Redirecting…</p>}
		</div>
	);
};

export default DigiLockerCallback;
