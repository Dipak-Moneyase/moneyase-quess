type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

const BASE_URL =
	import.meta.env.VITE_API_BASE_URL ?? 'https://devapi.moneyase.in/api/';

let logoutFn: (() => void) | null = null;
export const registerLogout = (fn: () => void) => {
	logoutFn = fn;
};

async function request<T>(
	path: string,
	method: HttpMethod,
	body?: any,
	opts?: { skipAuth?: boolean; headers?: Record<string, string> },
): Promise<T> {
	const url = `${BASE_URL}${path}`;

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...opts?.headers,
	};

	if (!opts?.skipAuth) {
		const token =
			sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
		if (token) headers['Authorization'] = `Bearer ${token}`;
	}

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

	const res = await fetch(url, {
		method,
		headers,
		body: body === undefined ? undefined : JSON.stringify(body),
		signal: controller.signal,
	}).finally(() => clearTimeout(timeout));

	if (res.status === 401) {
		console.warn('⚠️ 401 → triggering logout');
		if (logoutFn) logoutFn();
		throw new Error('Session expired. Please login again.');
	}

	if (res.status === 204) {
		return undefined as unknown as T;
	}

	let data: any = null;
	try {
		const text = await res.text();
		data = text ? JSON.parse(text) : null;
	} catch {
		console.warn('Non-JSON response from', url);
	}

	if (!res.ok) {
		const message =
			(data && (data.message || data.error)) ||
			res.statusText ||
			'Request failed';

		throw {
			name: 'HttpError',
			message,
			status: res.status,
			response: data,
		};
	}

	return data as T;
}

export async function getAll<T = any>(
	path: string,
	opts?: { skipAuth?: boolean },
) {
	return request<T>(path, 'GET', undefined, opts);
}

export async function postAll<T = any, B = any>(
	path: string,
	body?: B,
	opts?: { skipAuth?: boolean },
) {
	return request<T>(path, 'POST', body, opts);
}

export async function putAll<T = any, B = any>(
	path: string,
	body?: B,
	opts?: { skipAuth?: boolean },
) {
	return request<T>(path, 'PUT', body, opts);
}

export async function deleteAll<T = any>(
	path: string,
	opts?: { skipAuth?: boolean },
) {
	return request<T>(path, 'DELETE', undefined, opts);
}
