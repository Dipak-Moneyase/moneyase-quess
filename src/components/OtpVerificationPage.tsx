import React, { useEffect, useState, useRef } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useSendOtp, useVerifyOtp } from '../Hooks/commonHooks';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/moneyimg/logo-sm.png';

interface OtpVerificationProps {
	name: string;
	mobile: string;
	customerId: string;
}

const OtpVerificationPage: React.FC<OtpVerificationProps> = ({
	name,
	mobile,
	customerId,
}) => {
	const navigate = useNavigate();

	// Hooks
	const { mutate: sendOtp, isPending: sendingOtp } = useSendOtp();
	const { mutateAsync: verifyOtp, isPending: verifyingOtp } = useVerifyOtp();

	// OTP state
	const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(''));
	const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
	const [resendTimer, setResendTimer] = useState(0);
	const timerRef = useRef<NodeJS.Timeout | null>(null);

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
		// send OTP as soon as user lands
		sendOtpHandler(mobile);
		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, []);

	const sendOtpHandler = (mobile: string) => {
		if (mobile && /^[0-9]{10}$/.test(mobile)) {
			sendOtp({ mobile });
			startResendTimer();
			setTimeout(() => inputRefs.current[0]?.focus(), 200);
		} else {
			alert('Invalid mobile number');
		}
	};

	const handleOtpChange = (value: string, index: number) => {
		if (!/^[0-9]?$/.test(value)) return;
		const newOtp = [...otpDigits];
		newOtp[index] = value;
		setOtpDigits(newOtp);
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
		for (let i = 0; i < 6; i++) {
			newOtp[i] = digits[i] ?? '';
		}
		setOtpDigits(newOtp);
		setTimeout(() => {
			const focusIndex = Math.min(digits.length, 5);
			inputRefs.current[focusIndex]?.focus();
		}, 0);
	};

	const handleVerify = async () => {
		const otpValue = otpDigits.join('');
		if (otpValue.length < 6) {
			alert('Please enter full 6-digit OTP');
			return;
		}
		try {
			const result = await verifyOtp({ mobile, otp: otpValue });
			if (result?.success) {
				alert('OTP Verified Successfully!');
				navigate('/loanApplication', {
					state: { name, mobile, customerId },
				});
			} else {
				alert('Invalid or expired OTP');
				setOtpDigits(Array(6).fill(''));
			}
		} catch {
			alert('OTP verification failed. Please try again.');
		}
	};

	return (
		<div
			className='d-flex align-items-center justify-content-center vh-100'
			style={{
				background: 'linear-gradient(135deg, #74ABE2, #5563DE)',
				fontFamily: 'Poppins, sans-serif',
			}}
		>
			<div
				className='bg-white p-5 text-center rounded-4 shadow-lg'
				style={{ width: '400px', maxWidth: '90%' }}
			>
				<img
					src={logo}
					alt='Company Logo'
					style={{ width: '80px', marginBottom: '1rem' }}
				/>
				<h4 className='fw-bold mb-3'>Hi {name}, 👋</h4>
				<p className='text-muted mb-1'>
					<b>Mobile:</b> {mobile}
				</p>
				<p className='text-muted mb-4'>
					<b>Customer ID:</b> {customerId}
				</p>

				<Form.Group>
					<Form.Label className='fw-semibold mb-2'>Enter OTP</Form.Label>
					<div
						className='d-flex justify-content-center gap-2'
						onPaste={handlePaste}
					>
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
									fontWeight: 600,
									borderRadius: '10px',
									border: '1px solid #ccc',
									background: '#f8f9fa',
									boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
								}}
							/>
						))}
					</div>
				</Form.Group>

				<div className='mt-3'>
					<Button
						variant='primary'
						className='w-100 rounded-pill'
						onClick={handleVerify}
						disabled={verifyingOtp}
					>
						{verifyingOtp ? 'Verifying...' : 'Verify OTP'}
					</Button>
				</div>

				<div className='mt-3'>
					<Button
						variant='link'
						disabled={resendTimer > 0 || sendingOtp}
						onClick={() => sendOtpHandler(mobile)}
						className='text-decoration-none'
					>
						{resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default OtpVerificationPage;
