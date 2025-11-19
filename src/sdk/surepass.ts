export const initializeDigiLocker = async ({
	token,
	logo,
}: {
	token: string;
	logo: string;
}) => {
	const res = await fetch(
		//'https://sandbox.surepass.app/api/v1/digilocker/initialize',
		'https://kyc-api.surepass.app/api/v1/digilocker/initialize',
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				data: {
					signup_flow: true,
					//logo_url: logo,
					skip_main_screen: false,
				},
			}),
		},
	);

	if (!res.ok) {
		throw new Error(`Surepass Init Failed: ${res.status}`);
	}

	return res.json();
};
