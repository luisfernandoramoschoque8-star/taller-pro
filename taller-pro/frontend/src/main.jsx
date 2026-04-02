import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Sidebar from './components/Sidebar.jsx';
import Clientes from './pages/Clientes.jsx';
import Servicios from './pages/Servicios.jsx';
import Ventas from './pages/Ventas.jsx';
import Inventario from './pages/Inventario.jsx';
import Caja from './pages/Caja.jsx';
import Reportes from './pages/Reportes.jsx';
import Usuarios from './pages/Usuarios.jsx';

const App = () => (
	<AuthProvider>
		<BrowserRouter>
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route
					path="/"
					element={
						<ProtectedRoute>
							<div className="flex">
								<Sidebar />
								<div className="flex-1 ml-64 min-h-screen bg-gray-50 p-6">
									<Dashboard />
								</div>
							</div>
						</ProtectedRoute>
					}
				/>
				<Route
					path="/clientes"
					element={
						<ProtectedRoute allow={['admin', 'empleado']}>
							<div className="flex">
								<Sidebar />
								<div className="flex-1 ml-64 min-h-screen bg-gray-50 p-6">
									<Clientes />
								</div>
							</div>
						</ProtectedRoute>
					}
				/>
				<Route path="*" element={<Navigate to="/" replace />} />
				<Route
					path="/servicios"
					element={
						<ProtectedRoute allow={['admin', 'empleado']}>
							<div className="flex">
								<Sidebar />
								<div className="flex-1 ml-64 min-h-screen bg-gray-50 p-6">
                                    <Servicios />
                                </div>
							</div>
						</ProtectedRoute>
					}
				/>
				<Route
					path="/ventas"
					element={
						<ProtectedRoute allow={['admin', 'empleado']}>
							<div className="flex">
								<Sidebar />
								<div className="flex-1 ml-64 min-h-screen bg-gray-50 p-6">
									<Ventas />
								</div>
							</div>
						</ProtectedRoute>
					}
				/>
				<Route
					path="/inventario"
					element={
						<ProtectedRoute allow={['admin', 'almacenero']}>
							<div className="flex">
								<Sidebar />
								<div className="flex-1 ml-64 min-h-screen bg-gray-50 p-6">
									<Inventario />
								</div>
							</div>
						</ProtectedRoute>
					}
				/>
				<Route
					path="/caja"
					element={
						<ProtectedRoute allow={['admin']}>
							<div className="flex">
								<Sidebar />
								<div className="flex-1 ml-64 min-h-screen bg-gray-50 p-6">
									<Caja />
								</div>
							</div>
						</ProtectedRoute>
					}
				/>
				<Route
					path="/usuarios"
					element={
						<ProtectedRoute allow={['admin']}>
							<div className="flex">
								<Sidebar />
								<div className="flex-1 ml-64 min-h-screen bg-gray-50 p-6">
									<Usuarios />
								</div>
							</div>
						</ProtectedRoute>
					}
				/>
				<Route
					path="/reportes"
					element={
						<ProtectedRoute allow={['admin', 'almacenero']}>
							<div className="flex">
								<Sidebar />
								<div className="flex-1 ml-64 min-h-screen bg-gray-50 p-6">
									<Reportes />
								</div>
							</div>
						</ProtectedRoute>
					}
				/>
			</Routes>
		</BrowserRouter>
	</AuthProvider>
);

createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);

