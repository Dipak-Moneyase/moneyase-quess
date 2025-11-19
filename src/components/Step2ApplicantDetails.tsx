import React, {
	useEffect,
	forwardRef,
	useImperativeHandle,
	useRef,
} from 'react';
import { Form, Row, Col, Button, Card } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

interface Props {
	onChange: (data: Partial<any>) => void;
	defaultValues: Partial<any>;
	leadMode: string; // 'edit' | 'create'
	onSubmitSuccess: any;
}

export interface Step2Ref {
	submitForm: () => Promise<boolean>;
}

const Step2ApplicantDetails = forwardRef<Step2Ref, Props>(
	({ onChange, defaultValues, leadMode, onSubmitSuccess }, ref) => {
		const {
			register,
			handleSubmit,
			formState: { errors },
			watch,
			trigger,
			setValue,
			reset,
		} = useForm<Partial<any>>({
			defaultValues: {
				consent: leadMode === 'edit',
				...defaultValues,
			},
			mode: 'onChange',
			shouldUnregister: false,
		});

		const initializedRef = useRef(false);

		// initialize form defaults
		useEffect(() => {
			if (
				!initializedRef.current &&
				defaultValues &&
				Object.keys(defaultValues).length > 0
			) {
				reset(defaultValues, { keepDirty: true, keepTouched: true });
				initializedRef.current = true;
			}
		}, [defaultValues, reset]);

		// sync form changes to parent
		useEffect(() => {
			const subscription = watch((values) => {
				onChange({ leadDetails: { ...values } });
			});
			return () => subscription.unsubscribe();
		}, [watch, onChange]);

		useImperativeHandle(ref, () => ({
			submitForm: async () => {
				const valid = await trigger();
				if (!valid) return false;

				handleSubmit((data) =>
					onChange({
						leadDetails: {
							...data,
							consent: true,
						},
					}),
				)();
				return true;
			},
		}));

		const onSubmit = async (data: any) => {
			const valid = await trigger();
			if (!valid) return;

			onSubmitSuccess?.(data);
		};

		const openStaticHtmlInNewTab = async (path: string, title = 'Policy') => {
			try {
				const res = await fetch(path, { cache: 'no-store' });
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const html = await res.text();
				const blob = new Blob([html], { type: 'text/html' });
				const url = URL.createObjectURL(blob);
				window.open(url, '_blank', 'noopener,noreferrer');
				setTimeout(() => URL.revokeObjectURL(url), 60_000);
			} catch (err) {
				console.error('Unable to open policy file', err);
				alert(`Unable to load ${title}. Please try again later.`);
			}
		};

		return (
			<Card
				className='shadow-lg p-4 mt-3 rounded-4'
				style={{
					background: 'linear-gradient(145deg, #f8faff, #ffffff)',
					border: '1px solid #dee3f0',
					boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
					transition: 'transform 0.2s ease, box-shadow 0.2s ease',
				}}
				onMouseEnter={(e) => {
					e.currentTarget.style.transform = 'scale(1.01)';
					e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
				}}
				onMouseLeave={(e) => {
					e.currentTarget.style.transform = 'scale(1)';
					e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
				}}
			>
				<Card.Header
					className='text-center text-white fw-bold rounded-3 mb-4'
					style={{
						background: 'linear-gradient(90deg, #007bff, #6610f2)',
						fontSize: '1.3rem',
						padding: '0.75rem',
						letterSpacing: '0.5px',
					}}
				>
					👤 Applicant Details
				</Card.Header>

				<Form onSubmit={handleSubmit(onSubmit)}>
					{/* ===== First + Last Name ===== */}
					<Row>
						<Col xs={12} md={6}>
							<Form.Group className='mb-3'>
								<Form.Label>First Name (as per Aadhaar) *</Form.Label>
								<Form.Control
									placeholder='Enter First Name'
									{...register('firstName', {
										required: 'First Name is required',
										minLength: { value: 2, message: 'Minimum 2 characters' },
									})}
									isInvalid={!!errors.firstName}
								/>
								<Form.Control.Feedback type='invalid'>
									{errors.firstName?.message as string}
								</Form.Control.Feedback>
							</Form.Group>
						</Col>
						<Col xs={12} md={6}>
							<Form.Group className='mb-3'>
								<Form.Label>Last Name *</Form.Label>
								<Form.Control
									placeholder='Enter Last Name'
									{...register('lastName', {
										required: 'Last Name is required',
										minLength: { value: 2, message: 'Minimum 2 characters' },
									})}
									isInvalid={!!errors.lastName}
								/>
								<Form.Control.Feedback type='invalid'>
									{errors.lastName?.message as string}
								</Form.Control.Feedback>
							</Form.Group>
						</Col>
					</Row>

					{/* ===== Father/Husband Name ===== */}
					<Row>
						<Col xs={12}>
							<Form.Group className='mb-3'>
								<Form.Label>Father/Husband Name *</Form.Label>
								<Form.Control
									placeholder='Enter Father/Husband Name'
									{...register('fatherHusbandName', {
										required: 'Father/Husband Name is required',
									})}
									isInvalid={!!errors.fatherHusbandName}
								/>
								<Form.Control.Feedback type='invalid'>
									{errors.fatherHusbandName?.message as string}
								</Form.Control.Feedback>
							</Form.Group>
						</Col>
					</Row>

					{/* ===== Email + Mobile ===== */}
					<Row>
						<Col xs={12} md={6}>
							<Form.Group className='mb-3'>
								<Form.Label>Email (For Communication) *</Form.Label>
								<Form.Control
									type='email'
									placeholder='Enter Email'
									{...register('email', {
										required: 'Email is required',
										pattern: {
											value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
											message: 'Enter a valid email',
										},
									})}
									isInvalid={!!errors.email}
								/>
								<Form.Control.Feedback type='invalid'>
									{errors.email?.message as string}
								</Form.Control.Feedback>
							</Form.Group>
						</Col>
						<Col xs={12} md={6}>
							<Form.Group className='mb-3'>
								<Form.Label>Mobile (Aadhaar Linked) *</Form.Label>
								<Form.Control
									placeholder='Enter Mobile'
									disabled={leadMode === 'edit'}
									{...register('mobile', {
										required: 'Mobile is required',
										pattern: {
											value: /^[0-9]{10}$/,
											message: 'Enter valid 10-digit mobile number',
										},
									})}
									isInvalid={!!errors.mobile}
								/>
								<Form.Control.Feedback type='invalid'>
									{errors.mobile?.message as string}
								</Form.Control.Feedback>
							</Form.Group>
						</Col>
					</Row>

					{/* ===== DOB + Gender ===== */}
					<Row>
						<Col xs={12} md={6}>
							<Form.Group className='mb-3'>
								<Form.Label>Date of Birth *</Form.Label>
								<Form.Control
									type='date'
									max={new Date().toISOString().split('T')[0]}
									{...register('dob', {
										required: 'DOB is required',
										validate: (value) => {
											const today = new Date();
											const selected = new Date(value);
											return selected <= today || 'DOB cannot be a future date';
										},
									})}
									isInvalid={!!errors.dob}
								/>
								<Form.Control.Feedback type='invalid'>
									{errors.dob?.message as string}
								</Form.Control.Feedback>
							</Form.Group>
						</Col>

						<Col xs={12} md={6}>
							<Form.Group className='mb-3'>
								<Form.Label>Gender *</Form.Label>
								<Form.Select
									{...register('gender', { required: 'Gender is required' })}
									isInvalid={!!errors.gender}
								>
									<option value=''>Select Gender</option>
									<option value='1'>Male</option>
									<option value='2'>Female</option>
									<option value='3'>Other</option>
								</Form.Select>
								<Form.Control.Feedback type='invalid'>
									{errors.gender?.message as string}
								</Form.Control.Feedback>
							</Form.Group>
						</Col>
					</Row>

					{/* ===== PAN + Aadhaar ===== */}
					<Row>
						<Col xs={12} md={6}>
							<Form.Group className='mb-3'>
								<Form.Label>PAN Number *</Form.Label>
								<Form.Control
									placeholder='Enter PAN Number'
									{...register('panNumber', {
										required: 'PAN is required',
										pattern: {
											value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
											message: 'Enter valid PAN number',
										},
									})}
									onChange={(e) => {
										const upper = e.target.value.toUpperCase();
										e.target.value = upper;
										setValue('panNumber', upper, { shouldValidate: true });
									}}
									isInvalid={!!errors.panNumber}
								/>
								<Form.Control.Feedback type='invalid'>
									{errors.panNumber?.message as string}
								</Form.Control.Feedback>
							</Form.Group>
						</Col>

						<Col xs={12} md={6}>
							<Form.Group className='mb-3'>
								<Form.Label>Aadhaar Number *</Form.Label>
								<Form.Control
									placeholder='123412341234'
									maxLength={12}
									{...register('aadhaarNumber', {
										required: 'Aadhaar number is required',
										pattern: {
											value: /^[2-9]{1}[0-9]{11}$/,
											message: 'Enter a valid 12-digit Aadhaar number',
										},
										validate: (value) =>
											value.length === 12 ||
											'Aadhaar must be exactly 12 digits',
									})}
									isInvalid={!!errors.aadhaarNumber}
								/>
								<Form.Control.Feedback type='invalid'>
									{errors.aadhaarNumber?.message as string}
								</Form.Control.Feedback>
							</Form.Group>
						</Col>
					</Row>

					{/* ===== Voter + Driving ===== */}
					<Row>
						<Col xs={12} md={6}>
							<Form.Group className='mb-3'>
								<Form.Label>Voter ID</Form.Label>
								<Form.Control
									placeholder='Enter Voter ID'
									{...register('voterId')}
								/>
							</Form.Group>
						</Col>

						<Col xs={12} md={6}>
							<Form.Group className='mb-3'>
								<Form.Label>Driving License</Form.Label>
								<Form.Control
									placeholder='Enter Driving License'
									{...register('drivingLicense')}
								/>
							</Form.Group>
						</Col>
					</Row>

					{/* ===== Address ===== */}
					<Row>
						<Col xs={12} md={6}>
							<Form.Group className='mb-3'>
								<Form.Label>Residence Type *</Form.Label>
								<Form.Select
									{...register('residenceType', {
										required: 'Residence Type is required',
									})}
									isInvalid={!!errors.residenceType}
								>
									<option value=''>Select</option>
									<option value='0'>Owned</option>
									<option value='1'>Rented</option>
								</Form.Select>
								<Form.Control.Feedback type='invalid'>
									{errors.residenceType?.message as string}
								</Form.Control.Feedback>
							</Form.Group>
						</Col>

						<Col xs={12} md={6}>
							<Form.Group className='mb-3'>
								<Form.Label>Residence Pincode *</Form.Label>
								<Form.Control
									placeholder='Enter Pincode'
									{...register('pinCode', {
										required: 'Pincode is required',
										pattern: {
											value: /^[0-9]{6}$/,
											message: 'Enter valid 6-digit pincode',
										},
									})}
									isInvalid={!!errors.pinCode}
								/>
								<Form.Control.Feedback type='invalid'>
									{errors.pinCode?.message as string}
								</Form.Control.Feedback>
							</Form.Group>
						</Col>
					</Row>

					<Row>
						<Col xs={12} md={6}>
							<Form.Group className='mb-3'>
								<Form.Label>Residence Address Line 1 *</Form.Label>
								<Form.Control
									placeholder='Enter Address Line 1'
									{...register('addressLine1', {
										required: 'Address is required',
									})}
									isInvalid={!!errors.addressLine1}
								/>
								<Form.Control.Feedback type='invalid'>
									{errors.addressLine1?.message as string}
								</Form.Control.Feedback>
							</Form.Group>
						</Col>

						<Col xs={12} md={6}>
							<Form.Group className='mb-3'>
								<Form.Label>Residence Address Line 2</Form.Label>
								<Form.Control
									placeholder='Enter Address Line 2'
									{...register('addressLine2')}
								/>
							</Form.Group>
						</Col>
					</Row>

					{/* Marital + Dependents */}
					<Row>
						<Col xs={12} md={6}>
							<Form.Group className='mb-3'>
								<Form.Label>Marital Status *</Form.Label>
								<Form.Select
									{...register('maritalStatus', {
										required: 'Marital Status is required',
									})}
									isInvalid={!!errors.maritalStatus}
								>
									<option value=''>Select</option>
									<option value='0'>Single</option>
									<option value='1'>Married</option>
								</Form.Select>
							</Form.Group>
						</Col>

						<Col xs={12} md={6}>
							<Form.Group className='mb-3'>
								<Form.Label>Number of Dependents *</Form.Label>
								<Form.Select
									{...register('dependents', {
										required: 'Dependents is required',
									})}
									isInvalid={!!errors.dependents}
								>
									{Array.from({ length: 11 }).map((_, i) => (
										<option key={i} value={i}>
											{i}
										</option>
									))}
								</Form.Select>
							</Form.Group>
						</Col>
					</Row>

					{/* Employment Type */}
					<Row>
						<Col xs={12}>
							<Form.Group className='mb-3'>
								<Form.Label>Occupation detail *</Form.Label>
								<Form.Select
									{...register('employmentType', {
										required: 'Employment Type is required',
									})}
									isInvalid={!!errors.employmentType}
								>
									<option value=''>Select Employment Type</option>
									<option value='0'>Salaried</option>
									<option value='1'>Self Employed</option>
								</Form.Select>
								<Form.Control.Feedback type='invalid'>
									{errors.employmentType?.message as string}
								</Form.Control.Feedback>
							</Form.Group>
						</Col>
					</Row>

					{/* Consent */}
					<Form.Group className='mt-3'>
						<Form.Check
							type='checkbox'
							disabled={leadMode === 'edit'}
							defaultChecked={leadMode === 'edit'}
							{...register('consent', {
								required: leadMode !== 'edit' ? 'Consent is required' : false,
							})}
							label={
								<span style={{ fontSize: '0.8rem' }}>
									Consent to conducting a credit bureau check, verify my KYC
									details through Digilocker, UIDAI, or CKYCR, and processing my
									information in accordance with the{' '}
									<a
										href='#'
										onClick={(e) => {
											e.preventDefault();
											openStaticHtmlInNewTab(
												'/privacy-policy.html',
												"company's policies",
											);
										}}
									>
										company's policies
									</a>{' '}
									and{' '}
									<a
										href='#'
										onClick={(e) => {
											e.preventDefault();
											openStaticHtmlInNewTab(
												'/terms.html',
												'Terms & Conditions',
											);
										}}
									>
										Terms & Conditions
									</a>
									.
								</span>
							}
							isInvalid={leadMode !== 'edit' && !!errors.consent}
						/>
						{leadMode !== 'edit' && (
							<Form.Control.Feedback type='invalid'>
								{errors.consent?.message as string}
							</Form.Control.Feedback>
						)}
					</Form.Group>

					<div className='text-center mt-4'>
						<Button
							type='submit'
							variant='primary'
							className='px-4 py-2 rounded-3 shadow-sm'
							style={{ fontWeight: 600 }}
						>
							Submit Application 🚀
						</Button>
					</div>
				</Form>
			</Card>
		);
	},
);

export default Step2ApplicantDetails;
