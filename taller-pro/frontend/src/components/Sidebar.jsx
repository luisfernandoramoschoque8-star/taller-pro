import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Item = ({ to, icon, label }) => {
	const { pathname } = useLocation();
	const active = pathname === to;
	return (
		<Link
			className={`flex items-center gap-3 px-4 py-3 rounded transition ${active ? 'bg-blue-900/60' : 'hover:bg-blue-900/40'}`}
			to={to}
		>
			<span aria-hidden="true">{icon}</span>
			<span>{label}</span>
		</Link>
	);
};

export default function Sidebar() {
	const { user, logout } = useAuth();
	const role = user?.rol;
	return (
		<aside className="w-64 h-screen fixed left-0 top-0 bg-primary text-white p-4 flex flex-col">
			<div className="mb-6">
				<div className="font-extrabold text-2xl tracking-wide">AUTO MOTORES</div>
				{user && (
					<div className="mt-2 text-sm text-blue-100">
						<div className="font-semibold">{user.nombre}</div>
						<div className="opacity-80 capitalize">{role}</div>
					</div>
				)}
			</div>
			<nav className="space-y-1 flex-1">
				<Item to="/" icon="🏠" label="Dashboard" />
				{(role === 'admin' || role === 'empleado') && (
					<>
						<Item to="/clientes" icon="👤" label="Clientes" />
						<Item to="/servicios" icon="🔧" label="Servicios" />
						<Item to="/ventas" icon="🧾" label="Ventas" />
					</>
				)}
				{(role === 'admin' || role === 'almacenero') && <Item to="/inventario" icon="📦" label="Inventario" />}
				{role === 'admin' && <Item to="/caja" icon="💰" label="Caja" />}
				{role === 'admin' && <Item to="/usuarios" icon="👥" label="Usuarios/Roles" />}
				<Item to="/reportes" icon="📊" label="Reportes" />
			</nav>
			<button
				onClick={logout}
				className="mt-6 inline-flex items-center gap-3 px-4 py-3 rounded bg-blue-900/40 hover:bg-blue-900/60 transition"
			>
				<span>🚪</span>
				<span>Cerrar sesión</span>
			</button>
		</aside>
	);
}

