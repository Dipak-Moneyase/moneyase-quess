import React, { useState } from 'react';
import Step2ApplicantDetails from './Step2ApplicantDetails';
import { useNavigate } from 'react-router-dom';
import HeaderLogo from './header';

const LoanApplication = () => {
	const [formData, setFormData] = useState<any>({});
	const navigate = useNavigate();

	const defaultValues = {
		firstName: 'John',
		lastName: 'Doe',
		fatherHusbandName: 'Richard Doe',
		email: 'john.doe@example.com',
		mobile: '9876543210',
		dob: '1990-05-15',
		gender: '1',
		panNumber: 'ABCDE1234F',
		aadhaarLast4: '1234',
		voterId: 'XYZ1234567',
		drivingLicense: 'MH12AB1234',
		residenceType: '0',
		pinCode: '400001',
		addressLine1: '123, Example Street',
		addressLine2: 'Andheri West',
		maritalStatus: '1',
		dependents: '2',
		employmentType: '0',
		children: [
			{
				name: 'Aarav Doe',
				relation: 'Son',
				age: '5',
				education: 'Kindergarten',
				occupationPlace: '',
			},
			{
				name: 'Sara Doe',
				relation: 'Daughter',
				age: '3',
				education: 'Playgroup',
				occupationPlace: '',
			},
		],
		consent: true,
		otp: '123456',
	};

	const handleChange = (data: any) => {
		setFormData(data);
	};

	const handleFormSubmit = (data: any) => {
		//alert('Form submitted successfully!');
		console.log('✅ Final Data:', data);
		navigate('/kycInitiated');
	};

	return (
		<div className='container'>
			{/*<h2 className='mb-4 text-center'>Loan Application 🏦</h2>*/}
			<Step2ApplicantDetails
				onChange={handleChange}
				defaultValues={defaultValues}
				leadMode='edit'
				onSubmitSuccess={handleFormSubmit}
			/>
		</div>
	);
};

export default LoanApplication;
