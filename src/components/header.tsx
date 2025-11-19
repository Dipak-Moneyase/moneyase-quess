import logo from '../assets/moneyimg/logo-light.png';

const HeaderLogo = () => {
	return (
		<div>
			<img
				src={logo}
				alt='Company Logo'
				style={{
					width: '40%',
					marginBottom: '1rem',
					marginLeft: '30%',
				}}
			/>
		</div>
	);
};

export default HeaderLogo;
