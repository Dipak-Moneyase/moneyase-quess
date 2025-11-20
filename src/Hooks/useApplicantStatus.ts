import { useMutation } from '@tanstack/react-query';
import { postAll } from '../services/apiService';

interface StatusPayload {
	applicantId: string;
}

export const useApplicantStatus = () => {
	return useMutation({
		mutationFn: async (payload: StatusPayload) => {
			const response = await postAll('applicant/status', payload);
			return response; // expected { stage: "KYC_PENDING", ... }
		},
	});
};
