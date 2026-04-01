import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const token = localStorage.getItem('tp_token');
		if (!token) {
			setLoading(false);
			return;
		}
		api.get('/me')
			.then((res) => setUser(res.data))
			.catch(() => {
				localStorage.removeItem('tp_token');
			})
			.finally(() => setLoading(false));
	}, []);

	const login = async (email, password) => {
		const { data } = await api.post('/auth/login', { email, password, device_name: 'web' });
		localStorage.setItem('tp_token', data.token);
		setUser(data.user);
		return data.user;
	};

	const logout = async () => {
		try {
			await api.post('/logout');
		} catch (_) {}
		localStorage.removeItem('tp_token');
		setUser(null);
	};

	const value = useMemo(() => ({ user, login, logout, loading }), [user, loading]);
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

