import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api';

export default function Dashboard() {
	const { user } = useAuth();
	const [data, setData] = useState(null);

	useEffect(() => {
		api.get('/dashboard').then((r) => setData(r.data));
	}, []);

	const topMax = useMemo(() => {
		const rows = data?.top_servicios || [];
		return Math.max(...rows.map((r) => Number(r.cantidad || 0)), 1);
	}, [data]);

	return (
		<div className="p-2 md:p-4">
			<h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
			<p className="text-gray-600 mb-5">Bienvenido, <span className="font-semibold">{user?.nombre}</span></p>

			<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
				<Kpi title="Total Clientes" value={fmt(data?.kpis?.total_clientes)} icon="👥" color="bg-blue-500" />
				<Kpi title="Servicios Hoy" value={fmt(data?.kpis?.servicios_hoy)} icon="🔧" color="bg-emerald-500" />
				<Kpi title="Ventas del Mes" value={`Bs ${fmt(data?.kpis?.ventas_mes)}`} icon="$" color="bg-violet-500" />
				<Kpi title="Stock Bajo" value={fmt(data?.kpis?.stock_bajo)} icon="⚠" color="bg-red-500" />
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
				<div className="bg-white rounded-xl ring-1 ring-gray-100 p-4">
					<h3 className="font-bold mb-1">Servicios Recientes</h3>
					<p className="text-gray-500 text-sm mb-3">Estado de los servicios más recientes</p>
					<TableServicios rows={data?.servicios_recientes || []} />
				</div>
				<div className="bg-white rounded-xl ring-1 ring-gray-100 p-4">
					<h3 className="font-bold mb-1">Últimas Ventas</h3>
					<p className="text-gray-500 text-sm mb-3">Ventas registradas recientemente</p>
					<TableVentas rows={data?.ultimas_ventas || []} />
				</div>
			</div>

			<div className="bg-white rounded-xl ring-1 ring-gray-100 p-4">
				<h3 className="font-bold mb-1">Servicios Más Solicitados</h3>
				<p className="text-gray-500 text-sm mb-3">Top 5 de servicios del último mes</p>
				<div className="space-y-3">
					{(data?.top_servicios || []).map((r, i) => (
						<div key={i} className="flex items-center gap-3">
							<div className="w-40 text-sm text-gray-700">{r.nombre}</div>
							<div className="flex-1 h-8 bg-gray-100 rounded">
								<div className="h-8 bg-blue-700 rounded" style={{ width: `${(Number(r.cantidad || 0) / topMax) * 100}%` }} />
							</div>
							<div className="w-10 text-right font-semibold">{r.cantidad}</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

function Kpi({ title, value, icon, color }) {
	return (
		<div className="bg-white rounded-xl ring-1 ring-gray-100 p-4 flex items-center justify-between">
			<div>
				<div className="text-gray-500">{title}</div>
				<div className="mt-1 font-extrabold text-4xl-">{value}</div>
			</div>
			<div className={`w-14 h-14 rounded-xl ${color} text-white flex items-center justify-center font-bold`}>{icon}</div>
		</div>
	);
}

function TableServicios({ rows }) {
	return (
		<div className="overflow-hidden rounded-lg ring-1 ring-gray-200">
			<table className="min-w-full">
				<thead className="bg-gray-50 text-left text-gray-600">
					<tr className="text-sm">
						<th className="px-4 py-2">ID</th>
						<th className="px-4 py-2">Cliente</th>
						<th className="px-4 py-2">Servicio</th>
						<th className="px-4 py-2">Estado</th>
					</tr>
				</thead>
				<tbody className="text-sm">
					{rows.map((r, i) => (
						<tr key={i} className="border-t">
							<td className="px-4 py-2">{r.id}</td>
							<td className="px-4 py-2">{r.cliente}</td>
							<td className="px-4 py-2">{r.servicio}</td>
							<td className="px-4 py-2"><EstadoBadge estado={r.estado} /></td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function TableVentas({ rows }) {
	return (
		<div className="overflow-hidden rounded-lg ring-1 ring-gray-200">
			<table className="min-w-full">
				<thead className="bg-gray-50 text-left text-gray-600">
					<tr className="text-sm">
						<th className="px-4 py-2">ID</th>
						<th className="px-4 py-2">Cliente</th>
						<th className="px-4 py-2">Total</th>
						<th className="px-4 py-2">Fecha</th>
					</tr>
				</thead>
				<tbody className="text-sm">
					{rows.map((r, i) => (
						<tr key={i} className="border-t">
							<td className="px-4 py-2">{r.id}</td>
							<td className="px-4 py-2">{r.cliente}</td>
							<td className="px-4 py-2 font-semibold">Bs {fmt(r.total)}</td>
							<td className="px-4 py-2 text-gray-500">{r.fecha}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function EstadoBadge({ estado }) {
	const e = String(estado || '').toLowerCase();
	const map = {
		completado: 'bg-gray-900 text-white',
		en_proceso: 'bg-gray-200 text-gray-800',
		pendiente: 'bg-rose-600 text-white',
	};
	const label = e === 'en_proceso' ? 'En Proceso' : (e.charAt(0).toUpperCase() + e.slice(1));
	return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[e] || 'bg-gray-200 text-gray-700'}`}>{label}</span>;
}

function fmt(n) { return Number(n || 0).toLocaleString('es-BO', { maximumFractionDigits: 0 }); }

