import React, { useRef, useState } from 'react';
import Step2ApplicantDetails, { type Step2Ref } from './Step2ApplicantDetails';

const LoanApplication = () => {
	const step2Ref = useRef<Step2Ref>(null);
	const [formData, setFormData] = useState<any>({});

	// Dummy prefilled data
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
		console.log('Form changed:', data);
		setFormData(data);
	};

	const handleSubmit = async () => {
		const success = await step2Ref.current?.submitForm();
		if (success) {
			alert('Form submitted successfully!');
			console.log('Final Data:', formData);
		}
	};

	return (
		<div className='container mt-5'>
			<h2 className='mb-4'>Loan Application</h2>
			<Step2ApplicantDetails
				ref={step2Ref}
				onChange={handleChange}
				defaultValues={defaultValues}
				leadMode='edit' // 'edit' mode skips OTP flow
			/>
			<div className='mt-4 text-end'>
				<button className='btn btn-primary' onClick={handleSubmit}>
					Submit Application
				</button>
			</div>
		</div>
	);
};

export default LoanApplication;
