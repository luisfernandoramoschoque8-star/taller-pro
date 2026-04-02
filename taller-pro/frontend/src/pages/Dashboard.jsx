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
				<BarChartLike rows={data?.top_servicios || []} max={topMax} />
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

function BarChartLike({ rows, max }) {
	if (!rows.length) return <div className="text-sm text-gray-500">Sin datos</div>;
	const [tip, setTip] = useState(null);
	const w = 980;
	const h = 320;
	const left = 54;
	const right = 24;
	const top = 18;
	const bottom = 54;
	const plotW = w - left - right;
	const plotH = h - top - bottom;
	const step = plotW / rows.length;
	const barW = Math.min(140, step * 0.8);
	const ticks = [0, 15, 30, 45, 60];
	const scaleMax = Math.max(60, Math.ceil((max || 1) / 15) * 15);

	return (
		<div className="w-full overflow-x-auto relative">
			<svg viewBox={`0 0 ${w} ${h}`} className="w-full h-80">
				<rect x="0" y="0" width={w} height={h} fill="white" />
				{ticks.map((t) => {
					const y = top + plotH - (t / scaleMax) * plotH;
					return (
						<g key={t}>
							<line x1={left} y1={y} x2={w - right} y2={y} stroke="#d1d5db" strokeDasharray="4 4" />
							<text x={left - 8} y={y + 4} textAnchor="end" fontSize="12" fill="#6b7280">{t}</text>
						</g>
					);
				})}
				<line x1={left} y1={top} x2={left} y2={top + plotH} stroke="#6b7280" />
				<line x1={left} y1={top + plotH} x2={w - right} y2={top + plotH} stroke="#6b7280" />

				{rows.map((r, i) => {
					const v = Number(r.cantidad || 0);
					const x = left + i * step + (step - barW) / 2;
					const bh = (v / scaleMax) * plotH;
					const y = top + plotH - bh;
					return (
						<g key={i}>
							<rect
								x={x}
								y={y}
								width={barW}
								height={bh}
								fill="#1f64b2"
								onMouseEnter={(e) => {
									setTip({
										x: e.nativeEvent.offsetX,
										y: e.nativeEvent.offsetY,
										name: r.nombre,
										value: v,
									});
								}}
								onMouseMove={(e) => {
									setTip((prev) => prev ? ({
										...prev,
										x: e.nativeEvent.offsetX,
										y: e.nativeEvent.offsetY,
									}) : prev);
								}}
								onMouseLeave={() => setTip(null)}
							/>
							<text x={x + barW / 2} y={h - 20} textAnchor="middle" fontSize="11" fill="#4b5563">
								{r.nombre}
							</text>
						</g>
					);
				})}
			</svg>
			{tip && (
				<div
					className="absolute z-10 bg-white border border-gray-300 shadow px-4 py-3 text-sm"
					style={{ left: tip.x + 16, top: tip.y - 30 }}
				>
					<div className="text-gray-900 mb-1">{tip.name}</div>
					<div className="text-blue-700">cantidad : {tip.value}</div>
				</div>
			)}
		</div>
	);
}

