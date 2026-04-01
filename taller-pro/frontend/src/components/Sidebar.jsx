import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Item = ({ to, children }) => (
	<Link className="block px-4 py-3 rounded hover:bg-blue-900/40" to={to}>
		{children}
	</Link>
);

export default function Sidebar() {
	const { user } = useAuth();
	const role = user?.rol;
	return (
		<aside className="w-64 min-h-screen bg-primary text-white p-4">
			<div className="font-bold text-xl mb-6">TallerPro</div>
			<nav className="space-y-1">
				<Item to="/">Dashboard</Item>
				{(role === 'admin' || role === 'empleado') && (
					<>
						<Item to="/clientes">Clientes</Item>
						<Item to="/servicios">Servicios</Item>
						<Item to="/ventas">Ventas</Item>
					</>
				)}
				{(role === 'admin' || role === 'almacenero') && <Item to="/inventario">Inventario</Item>}
				{role === 'admin' && <Item to="/caja">Caja</Item>}
				<Item to="/reportes">Reportes</Item>
			</nav>
		</aside>
	);
}

