import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from 'react-bootstrap';
import HeaderLogo from './header';

const StatusPage: React.FC = () => {
	const [search] = useSearchParams();

	const { name, customerId, status } = useMemo(() => {
		return {
			name: search.get('name') ?? 'User',
			customerId: search.get('customerId') ?? 'UNKNOWN',
			status: search.get('status') ?? 'Pending',
		};
	}, [search]);

	return (
		<div>
			<HeaderLogo />
			<Card
				className='shadow-lg p-4 mb-4 rounded-4 text-center'
				style={{
					background: 'linear-gradient(135deg, #f0f7ff, #ffffff)',
					border: '1px solid #e0e7ff',
				}}
			>
				<h3 className='fw-bold text-primary mb-2'>👋 Hi {name}!</h3>
				<h5 className='text-secondary mb-3'>
					Your loan application status is:
				</h5>
				<h4
					className='fw-bold'
					style={{
						color:
							status.toLowerCase() === 'loanapplied'
								? '#007bff'
								: status.toLowerCase().includes('pending')
								? '#ffc107'
								: '#28a745',
					}}
				>
					{status}
				</h4>
				<p className='text-muted mb-0'>Customer ID: {customerId}</p>
			</Card>

			{/* External App Embed */}
			<div className='text-center mb-3'>
				<h6 className='text-muted'>Continue your journey below 👇</h6>
			</div>
		</div>
	);
};

export default StatusPage;
