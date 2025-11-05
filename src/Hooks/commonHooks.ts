import { useMutation } from '@tanstack/react-query';
import { postAll } from '../services/apiService';

interface SendOtpPayload {
	mobile: string;
}
interface VerifyOtpPayload {
	mobile: string;
	otp: string;
}

export const useSendOtp = () => {
	return useMutation({
		mutationFn: async (payload: SendOtpPayload) => {
			const response = await postAll('auth/send-otp', payload);
			return response;
			//return { success: true };
		},
	});
};

export const useVerifyOtp = () => {
	return useMutation({
		mutationFn: async (payload: VerifyOtpPayload) => {
			const response = await postAll('auth/verify-otp', payload);
			return response; // expected { success: true }
			//return { success: true };
		},
	});
};
