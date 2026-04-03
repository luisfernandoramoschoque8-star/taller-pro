import axios from 'axios';

const api = axios.create({
	baseURL:
		import.meta.env.VITE_API_URL ||
		'https://taller-pro-production.up.railway.app/api',
	withCredentials: false,
});

api.interceptors.request.use((config) => {
	const token = localStorage.getItem('tp_token');
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

api.interceptors.response.use(
	(res) => res,
	(error) => {
		if (error?.response?.status === 401) {
			localStorage.removeItem('tp_token');
			window.location.href = '/login';
		}
		return Promise.reject(error);
	}
);

export default api;

