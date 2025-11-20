import React from 'react';
import StatusPage from '../components/StatusPage';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<div style={{ margin: 0, padding: 0 }}>
			<div style={{ marginBottom: '0', paddingBottom: '0' }}>
				<StatusPage />
			</div>

			<div style={{ marginTop: '0', paddingTop: '5px' }}>{children}</div>
		</div>
	);
};

export default MainLayout;
