import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children, allow = [] }) {
	const { user, loading } = useAuth();

	if (loading) return null;
	if (!user) return <Navigate to="/login" replace />;
	if (allow.length && !allow.includes(user.rol)) return <Navigate to="/login" replace />;

	return children;
}

