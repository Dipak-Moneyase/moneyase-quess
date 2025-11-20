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
		const isEdit = leadMode === 'edit';

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
				consent: isEdit,
				addressCustom: '',
				...defaultValues,
			},
			mode: 'onChange',
			shouldUnregister: false,
		});

		const initializedRef = useRef(false);

		// initialize form defaults
		useEffect(() => {
			if (!initializedRef.current && defaultValues) {
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

		// open static docs
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
								<Form.Label>First Name *</Form.Label>
								<Form.Control
									disabled={isEdit}
									{...register('firstName', { required: false })}
									isInvalid={!!errors.firstName}
								/>
							</Form.Group>
						</Col>

						<Col xs={12} md={6}>
							<Form.Group className='mb-3'>
								<Form.Label>Last Name *</Form.Label>
								<Form.Control
									disabled={isEdit}
									{...register('lastName', { required: false })}
									isInvalid={!!errors.lastName}
								/>
							</Form.Group>
						</Col>
					</Row>

					{/* Father/Husband */}
					<Row>
						<Col xs={12}>
							<Form.Group className='mb-3'>
								<Form.Label>Father/Husband Name *</Form.Label>
								<Form.Control
									disabled={isEdit}
									{...register('fatherHusbandName', { required: false })}
									isInvalid={!!errors.fatherHusbandName}
								/>
							</Form.Group>
						</Col>
					</Row>

					{/* Email + Mobile */}
					<Row>
						<Col xs={12} md={6}>
							<Form.Group className='mb-3'>
								<Form.Label>Email *</Form.Label>
								<Form.Control
									type='email'
									disabled={isEdit}
									{...register('email', { required: false })}
									isInvalid={!!errors.email}
								/>
							</Form.Group>
						</Col>

						<Col xs={12} md={6}>
							<Form.Group className='mb-3'>
								<Form.Label>Mobile *</Form.Label>
								<Form.Control
									disabled={isEdit}
									{...register('mobile', { required: false })}
									isInvalid={!!errors.mobile}
								/>
							</Form.Group>
						</Col>
					</Row>

					{/* DOB + Gender */}
					<Row>
						<Col xs={12} md={6}>
							<Form.Group className='mb-3'>
								<Form.Label>Date of Birth *</Form.Label>
								<Form.Control
									type='date'
									disabled={isEdit}
									{...register('dob', { required: false })}
									isInvalid={!!errors.dob}
								/>
							</Form.Group>
						</Col>

						<Col xs={12} md={6}>
							<Form.Group className='mb-3'>
								<Form.Label>Gender *</Form.Label>
								<Form.Select
									disabled={isEdit}
									{...register('gender', { required: false })}
								>
									<option value=''>Select</option>
									<option value='1'>Male</option>
									<option value='2'>Female</option>
									<option value='3'>Other</option>
								</Form.Select>
							</Form.Group>
						</Col>
					</Row>

					{/* PAN + Aadhaar */}
					<Row>
						<Col xs={12} md={6}>
							<Form.Group className='mb-3'>
								<Form.Label>PAN *</Form.Label>
								<Form.Control
									disabled={isEdit}
									{...register('panNumber', { required: false })}
									isInvalid={!!errors.panNumber}
								/>
							</Form.Group>
						</Col>

						<Col xs={12} md={6}>
							<Form.Group className='mb-3'>
								<Form.Label>Aadhaar *</Form.Label>
								<Form.Control
									disabled={isEdit}
									{...register('aadhaarNumber', { required: false })}
									isInvalid={!!errors.aadhaarNumber}
								/>
							</Form.Group>
						</Col>
					</Row>

					{/* Voter + DL */}
					<Row>
						<Col xs={12} md={6}>
							<Form.Group className='mb-3'>
								<Form.Label>Voter ID</Form.Label>
								<Form.Control disabled={isEdit} {...register('voterId')} />
							</Form.Group>
						</Col>

						<Col xs={12} md={6}>
							<Form.Group className='mb-3'>
								<Form.Label>Driving License</Form.Label>
								<Form.Control
									disabled={isEdit}
									{...register('drivingLicense')}
								/>
							</Form.Group>
						</Col>
					</Row>

					{/* Address */}
					<Row>
						<Col xs={12} md={6}>
							<Form.Group className='mb-3'>
								<Form.Label>Pincode *</Form.Label>
								<Form.Control
									disabled={isEdit}
									{...register('pinCode', { required: false })}
									isInvalid={!!errors.pinCode}
								/>
							</Form.Group>
						</Col>

						<Col xs={12} md={6}>
							<Form.Group className='mb-3'>
								<Form.Label>Residence Type *</Form.Label>
								<Form.Select
									disabled={isEdit}
									{...register('residenceType', { required: false })}
								>
									<option value=''>Select</option>
									<option value='0'>Owned</option>
									<option value='1'>Rented</option>
								</Form.Select>
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
								<Form.Label>Address Line 1 *</Form.Label>
								<Form.Control
									disabled={isEdit}
									{...register('addressLine1', { required: false })}
								/>
							</Form.Group>
						</Col>

						<Col xs={12} md={6}>
							<Form.Group className='mb-3'>
								<Form.Label>Address Line 2</Form.Label>
								<Form.Control disabled={isEdit} {...register('addressLine2')} />
							</Form.Group>
						</Col>
					</Row>

					{/* ⭐ NEW FIELD — Editable Custom Address */}
					<Row>
						<Col xs={12}>
							<Form.Group className='mb-3'>
								<Form.Label>Address (Custom)</Form.Label>
								<Form.Control
									placeholder='Enter your custom address'
									{...register('addressCustom')}
								/>
							</Form.Group>
						</Col>
					</Row>

					{/* Marital */}
					<Row>
						<Col xs={12} md={6}>
							<Form.Group className='mb-3'>
								<Form.Label>Marital Status *</Form.Label>
								<Form.Select
									disabled={isEdit}
									{...register('maritalStatus', { required: false })}
								>
									<option value=''>Select</option>
									<option value='0'>Single</option>
									<option value='1'>Married</option>
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
									disabled={isEdit}
									{...register('employmentType', { required: false })}
								>
									<option value=''>Select Employment Type</option>
									<option value='0'>Salaried</option>
									<option value='1'>Self Employed</option>
								</Form.Select>
							</Form.Group>
						</Col>
					</Row>

					{/* Consent (Editable) */}
					<Form.Group className='mt-3'>
						<Form.Check
							type='checkbox'
							disabled={false}
							defaultChecked={isEdit}
							{...register('consent', { required: false })}
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

					{/* Submit */}
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
