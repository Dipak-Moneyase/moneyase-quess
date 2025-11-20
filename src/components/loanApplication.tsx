import React, { useEffect, useState } from 'react';
import Step2ApplicantDetails from './Step2ApplicantDetails';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCreateApplicant } from '../Hooks/applicationHooks';

const LoanApplication = () => {
	const [formData, setFormData] = useState<any>({});
	const [search] = useSearchParams();
	const navigate = useNavigate();

	const applicantId = search.get('applicantid') ?? '';
	const fullName = search.get('name') ?? '';
	const mobile = search.get('mobile') ?? '';

	const [firstName, lastName] = fullName.split(' ');

	const { mutateAsync: createApplicant } = useCreateApplicant();

	const [prefill, setPrefill] = useState<any>(null);

	useEffect(() => {
		const init = async () => {
			try {
				const payload = {
					firstName: firstName || '',
					lastName: lastName || '',
					contactNo: mobile,
					applicantId: applicantId,
				};

				console.log('Sending create-applicant:', payload);

				const response = await createApplicant(payload);

				console.log('Create Applicant Response:', response);

				// Save token globally
				if (response?.token) {
					localStorage.setItem('authToken', response.token);
				}

				// Pre-fill data
				if (response?.data) {
					setPrefill(response.data);
				}
			} catch (error) {
				console.error('Create Applicant Failed:', error);
			}
		};

		init();
	}, []);

	// Prepare defaultValues for form
	const defaultValues = prefill
		? {
				firstName: prefill.firstName || '',
				lastName: prefill.lastName || '',
				fatherHusbandName: prefill.fatherName || '',
				email: prefill.emailId || '',
				mobile: prefill.contactNo,
				dob: prefill.dob || '',
				gender: prefill.gender === 'Male' ? '1' : '2',
				pinCode: prefill.pincode || '',
				addressLine1: prefill.city || '',
				addressLine2: prefill.state || '',
				maritalStatus: prefill.maritalStatus === 'Single' ? '0' : '1',
				panNumber: prefill.pan || '',
				consent: true,
		  }
		: {};

	const handleChange = (data: any) => {
		setFormData(data);
	};

	const handleFormSubmit = (data: any) => {
		console.log('Final Form Data:', data);
		navigate('/kycInitiated');
	};

	return (
		<div className='container'>
			{!prefill ? (
				<p className='text-center mt-5'>Loading applicant data…</p>
			) : (
				<Step2ApplicantDetails
					onChange={handleChange}
					defaultValues={defaultValues}
					leadMode='edit'
					onSubmitSuccess={handleFormSubmit}
				/>
			)}
		</div>
	);
};

export default LoanApplication;
