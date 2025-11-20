import { useMutation } from '@tanstack/react-query';
import { postAll } from '../services/apiService';

interface CreateApplicantPayload {
	firstName: string;
	lastName: string;
	contactNo: string;
	applicantId: string;
}

export const useCreateApplicant = () => {
	return useMutation({
		mutationFn: async (payload: CreateApplicantPayload) => {
			const response = await postAll('quess/create-applicant', payload);
			return response; // contains { success, data, token }
		},
	});
};
