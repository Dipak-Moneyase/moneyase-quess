import React, {
	useEffect,
	forwardRef,
	useImperativeHandle,
	useRef,
	useState,
} from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { useForm, useFieldArray } from 'react-hook-form';
import { useAuth } from '../Hooks/AuthContext';
import { useSendOtp, useVerifyOtp } from '../Hooks/commonHooks';

interface Props {
	onChange: (data: Partial<any>) => void;
	defaultValues: Partial<any>;
	leadMode: string; // 'edit' | 'create'
}

export interface Step2Ref {
	submitForm: () => Promise<boolean>;
}

const Step2ApplicantDetails = forwardRef<Step2Ref, Props>(
	({ onChange, defaultValues, leadMode }, ref) => {
		const {
			register,
			handleSubmit,
			formState: { errors },
			watch,
			trigger,
			control,
			setValue,
			reset,
			setError,
		} = useForm<Partial<any>>({
			defaultValues: {
				consent: leadMode === 'edit',
				...defaultValues,
			},
			mode: 'onChange',
			shouldUnregister: false,
		});

		const maritalStatus = watch('maritalStatus');
		const consent = watch('consent');
		const otpValue = watch('otp');

		const { fields, append, remove } = useFieldArray({
			control,
			name: 'children',
		});

		const initializedRef = useRef(false);
		const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(''));
		const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

		// resend otp timer
		const [resendTimer, setResendTimer] = useState(0);
		const timerRef = useRef<any>(null);

		const startResendTimer = () => {
			setResendTimer(60);
			if (timerRef.current) clearInterval(timerRef.current);
			timerRef.current = setInterval(() => {
				setResendTimer((prev) => {
					if (prev <= 1) {
						clearInterval(timerRef.current!);
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
		};

		useEffect(() => {
			return () => {
				if (timerRef.current) clearInterval(timerRef.current);
			};
		}, []);

		// initialize form defaults and OTP digits
		useEffect(() => {
			if (
				!initializedRef.current &&
				defaultValues &&
				Object.keys(defaultValues).length > 0
			) {
				reset(defaultValues, { keepDirty: true, keepTouched: true });

				if (defaultValues.otp && typeof defaultValues.otp === 'string') {
					const digits = defaultValues.otp
						.split('')
						.slice(0, 6)
						.concat(Array(6).fill(''))
						.slice(0, 6);
					setOtpDigits(digits);
					setValue('otp', digits.join(''), { shouldValidate: false });
				}

				initializedRef.current = true;
			}
		}, [defaultValues, reset, setValue]);

		// sync form changes to parent
		useEffect(() => {
			const subscription = watch((values) => {
				if (values.maritalStatus === '0') {
					values.children = [];
				}
				onChange({ leadDetails: { ...values } });
			});
			return () => subscription.unsubscribe();
		}, [watch, onChange]);

		// OTP hooks
		const { mutate: sendOtp, isPending: sendingOtp } = useSendOtp();
		const { mutateAsync: verifyOtp, isPending: verifyingOtp } = useVerifyOtp();

		const sendOtpHandler = (mobile: string) => {
			sendOtp({ mobile });
			startResendTimer();
			setTimeout(() => inputRefs.current[0]?.focus(), 200);
		};

		// trigger OTP when consent is checked (only in create mode)
		useEffect(() => {
			if (leadMode === 'edit') return;

			const mobile = watch('mobile');
			const otp = watch('otp');

			if (consent) {
				if (mobile && /^[0-9]{10}$/.test(mobile)) {
					if (!otp || otp.length < 6) {
						sendOtpHandler(mobile);
					}
				} else {
					setError('mobile', { message: 'Enter valid mobile before consent' });
					setValue('consent', false);
				}
			} else {
				setOtpDigits(Array(6).fill(''));
				setValue('otp', '', { shouldValidate: false });
			}
		}, [consent, sendOtp, setError, setValue, watch, leadMode]);

		useImperativeHandle(ref, () => ({
			submitForm: async () => {
				if (maritalStatus === '0') {
					setValue('children', []);
				}

				const valid = await trigger();
				if (!valid) return false;

				// Skip OTP validation in edit mode
				if (leadMode !== 'edit' && consent) {
					if (!otpValue || otpValue.length < 6) {
						setError('otp', { message: 'OTP is required' });
						return false;
					}
					try {
						const result = await verifyOtp({
							mobile: watch('mobile'),
							otp: otpValue,
						});
						if (!result?.success) {
							setError('otp', {
								message: 'OTP has expired. Re-check consent or resend OTP.',
							});
							setOtpDigits(Array(6).fill(''));
							setValue('otp', '', { shouldValidate: false });
							return false;
						}
					} catch {
						setError('otp', { message: 'OTP verification failed' });
						return false;
					}
				}

				handleSubmit((data) =>
					onChange({
						leadDetails: {
							...data,
							consent: true,
							children: data.maritalStatus === '0' ? [] : data.children,
						},
					}),
				)();
				return true;
			},
		}));

		const onSubmit = () => {};

		// OTP input handlers
		const handleOtpChange = (value: string, index: number) => {
			if (!/^[0-9]?$/.test(value)) return;
			const newOtp = [...otpDigits];
			newOtp[index] = value;
			setOtpDigits(newOtp);
			setValue('otp', newOtp.join(''), { shouldValidate: true });
			if (value && index < 5) inputRefs.current[index + 1]?.focus();
		};

		const handleKeyDown = (
			e: React.KeyboardEvent<HTMLInputElement>,
			index: number,
		) => {
			const target = e.target as HTMLInputElement;
			if (e.key === 'Backspace') {
				if (!target.value && index > 0) inputRefs.current[index - 1]?.focus();
			} else if (e.key === 'ArrowLeft') {
				if (index > 0) inputRefs.current[index - 1]?.focus();
			} else if (e.key === 'ArrowRight') {
				if (index < 5) inputRefs.current[index + 1]?.focus();
			}
		};

		const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
			e.preventDefault();
			const paste = e.clipboardData.getData('Text').trim();
			const digits = paste.replace(/\D/g, '').slice(0, 6).split('');
			if (digits.length === 0) return;
			const newOtp = [...otpDigits];
			for (let i = 0; i < 6; i++) newOtp[i] = digits[i] ?? '';
			setOtpDigits(newOtp);
			setValue('otp', newOtp.join(''), { shouldValidate: true });
			const focusIndex = Math.min(digits.length, 5);
			setTimeout(() => inputRefs.current[focusIndex]?.focus(), 0);
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
			<Form onSubmit={handleSubmit(onSubmit)}>
				<Row>
					<Col>
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
					<Col>
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

				{/* Father/Husband Name */}
				<Row>
					<Col>
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

				{/* Email + Mobile */}
				<Row>
					<Col>
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
					<Col>
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

				{/* DOB + Gender */}
				<Row>
					<Col>
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

					<Col>
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

				{/* PAN + Aadhaar */}
				<Row>
					<Col>
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
					<Col>
						<Form.Group className='mb-3'>
							<Form.Label>Aadhaar (Last 4 digits) *</Form.Label>
							<Form.Control
								placeholder='1234'
								maxLength={4}
								{...register('aadhaarLast4', {
									required: 'Aadhaar last 4 digits required',
									pattern: {
										value: /^[0-9]{4}$/,
										message: 'Enter valid 4-digit Aadhaar',
									},
								})}
								isInvalid={!!errors.aadhaarLast4}
							/>
							<Form.Control.Feedback type='invalid'>
								{errors.aadhaarLast4?.message as string}
							</Form.Control.Feedback>
						</Form.Group>
					</Col>
				</Row>

				{/* Voter + Driving */}
				<Row>
					<Col>
						<Form.Group className='mb-3'>
							<Form.Label>Voter ID</Form.Label>
							<Form.Control
								placeholder='Enter Voter ID'
								{...register('voterId')}
							/>
						</Form.Group>
					</Col>
					<Col>
						<Form.Group className='mb-3'>
							<Form.Label>Driving License</Form.Label>
							<Form.Control
								placeholder='Enter Driving License'
								{...register('drivingLicense')}
							/>
						</Form.Group>
					</Col>
				</Row>

				{/* Pincode + Address */}
				<Row>
					<Col>
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

					<Col>
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
					<Col>
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
					<Col>
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
					<Col>
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
					<Col>
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
					<Col>
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

				{/* Children Details */}
				{String(maritalStatus) === '1' && (
					<div className='mb-3'>
						<h6>Children Details</h6>
						{fields.map((field, index) => (
							<div key={field.id} className='border p-3 mb-2 rounded'>
								<Row>
									<Col>
										<Form.Group>
											<Form.Label>Name</Form.Label>
											<Form.Control
												{...register(`children.${index}.name` as const)}
											/>
										</Form.Group>
									</Col>
									<Col>
										<Form.Group>
											<Form.Label>Son/Daughter</Form.Label>
											<Form.Select
												{...register(`children.${index}.relation` as const)}
											>
												<option value=''>Select</option>
												<option value='Son'>Son</option>
												<option value='Daughter'>Daughter</option>
											</Form.Select>
										</Form.Group>
									</Col>
									<Col>
										<Form.Group>
											<Form.Label>Age</Form.Label>
											<Form.Control
												type='number'
												{...register(`children.${index}.age` as const)}
											/>
										</Form.Group>
									</Col>
									<Col>
										<Form.Group>
											<Form.Label>Education</Form.Label>
											<Form.Control
												{...register(`children.${index}.education` as const)}
											/>
										</Form.Group>
									</Col>
									<Col>
										<Form.Group>
											<Form.Label>Occupation Name & Place</Form.Label>
											<Form.Control
												{...register(
													`children.${index}.occupationPlace` as const,
												)}
											/>
										</Form.Group>
									</Col>
									<Col xs='auto' className='d-flex align-items-end'>
										<Button
											variant='outline-danger'
											size='sm'
											onClick={() => remove(index)}
										>
											Remove
										</Button>
									</Col>
								</Row>
							</div>
						))}

						<Button
							variant='outline-primary'
							size='sm'
							onClick={() =>
								append({
									name: '',
									relation: '',
									age: '',
									education: '',
									occupationPlace: '',
								})
							}
						>
							+ Add Child
						</Button>
					</div>
				)}
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
								I give consent to verify KYC, and agree to the{' '}
								<a
									href='#'
									onClick={(e) => {
										e.preventDefault();
										openStaticHtmlInNewTab(
											'/assets/privacy-policy.html',
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
											'/assets/terms.html',
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

				{consent && leadMode !== 'edit' && (
					<Form.Group className='mt-3'>
						<Form.Label>Enter OTP *</Form.Label>
						<div className='d-flex gap-2' onPaste={handlePaste}>
							{otpDigits.map((digit, idx) => (
								<input
									key={idx}
									type='text'
									inputMode='numeric'
									pattern='[0-9]*'
									maxLength={1}
									value={digit}
									ref={(el) => (inputRefs.current[idx] = el)}
									onChange={(e) => handleOtpChange(e.target.value.trim(), idx)}
									onKeyDown={(e) => handleKeyDown(e, idx)}
									className='form-control text-center'
									style={{
										width: '48px',
										height: '48px',
										fontSize: '1.25rem',
										fontWeight: 500,
										borderRadius: '8px',
										border: '1px solid #ced4da',
										background: '#f8f9fa',
									}}
									aria-label={`OTP digit ${idx + 1}`}
								/>
							))}
						</div>

						<input
							type='hidden'
							{...register('otp', {
								required: consent
									? 'OTP is required when consent checked'
									: false,
								validate: (val: any) =>
									!consent || (val && val.length === 6) || 'Enter 6 digit OTP',
							})}
						/>

						<Form.Control.Feedback type='invalid' className='d-block'>
							{errors.otp?.message as string}
						</Form.Control.Feedback>

						{sendingOtp && <small className='text-info'>Sending OTP...</small>}
						{verifyingOtp && (
							<small className='text-info'>Validating OTP...</small>
						)}

						<div className='mt-2'>
							<Button
								variant='link'
								disabled={resendTimer > 0}
								onClick={() => {
									const mobile = watch('mobile');
									if (mobile && /^[0-9]{10}$/.test(mobile)) {
										sendOtpHandler(mobile);
									} else {
										setError('mobile', {
											message: 'Enter valid mobile before resending OTP',
										});
									}
								}}
							>
								{resendTimer > 0
									? `Resend OTP in ${resendTimer}s`
									: 'Resend OTP'}
							</Button>
						</div>
					</Form.Group>
				)}
				<button type='submit' style={{ display: 'none' }} />
			</Form>
		);
	},
);

export default Step2ApplicantDetails;
