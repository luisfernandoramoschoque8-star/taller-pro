import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
	const { login } = useAuth();
	const [email, setEmail] = useState('admin@tallerpro.com');
	const [password, setPassword] = useState('admin123');
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		try {
			await login(email, password);
			window.location.href = '/';
		} catch (err) {
			setError(err?.response?.data?.message || 'Error al iniciar sesión');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<div className="bg-white rounded-xl shadow-xl w-full max-w-md p-8">
				<div className="flex items-center justify-center gap-3 mb-6">
					<div className="bg-blue-100 text-primary rounded-lg p-2">
						<span className="text-2xl">🔧</span>
					</div>
					<h1 className="text-3xl font-bold text-primary">TallerPro</h1>
				</div>
				<h2 className="text-center text-gray-700 font-semibold">Iniciar Sesión</h2>
				<p className="text-center text-sm text-gray-500 mb-6">
					Ingresa tus credenciales para acceder al sistema
				</p>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
						<input
							type="email"
							className="w-full border rounded-lg px-3 py-2 focus:outline-primary bg-gray-50"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="usuario@tallerpro.com"
							required
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
						<input
							type="password"
							className="w-full border rounded-lg px-3 py-2 focus:outline-primary bg-gray-50"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="********"
							required
						/>
					</div>
					<button
						type="submit"
						disabled={loading}
						className="w-full bg-primary hover:bg-blue-700 transition text-white rounded-lg py-2 font-semibold"
					>
						{loading ? 'Ingresando...' : 'Iniciar Sesión'}
					</button>
					{error && <p className="text-red-600 text-sm">{error}</p>}
				</form>
				<div className="mt-6 text-xs text-gray-500">
					<p className="font-semibold mb-1">Usuarios de prueba:</p>
					<p>Admin: admin@tallerpro.com / admin123</p>
					<p>Empleado: empleado@tallerpro.com / emp123</p>
					<p>Almacenero: almacen@tallerpro.com / alm123</p>
				</div>
			</div>
		</div>
	);
}

