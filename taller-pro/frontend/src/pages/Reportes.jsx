import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

export default function Reportes() {
	const [periodo, setPeriodo] = useState('mes');
	const [data, setData] = useState(null);

	const load = async (p = periodo) => {
		const { data } = await api.get('/reportes/resumen', { params: { periodo: p } });
		setData(data);
	};
	useEffect(() => { load('mes'); }, []);

	const ventasMax = useMemo(() => {
		const arr = data?.ventas_por_dia || [];
		const max = Math.max(...arr.map((x) => Number(x.total || 0)), 1);
		return max;
	}, [data]);

	return (
		<div className="p-2 md:p-4">
			<div className="flex justify-between items-start mb-4">
				<div>
					<h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Reportes</h1>
					<p className="text-gray-500 mt-1">Análisis y estadísticas del negocio</p>
				</div>
				<select
					className="border rounded-lg px-4 py-2 bg-white min-w-48"
					value={periodo}
					onChange={(e) => { setPeriodo(e.target.value); load(e.target.value); }}
				>
					<option value="hoy">Hoy</option>
					<option value="semana">Esta Semana</option>
					<option value="mes">Este Mes</option>
				</select>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
				<Card title="Total Ventas" value={`Bs ${fmt(data?.kpis?.total_ventas)}`} icon="$" iconBg="bg-emerald-500" />
				<Card title="Servicios" value={fmt(data?.kpis?.servicios)} icon="🔧" iconBg="bg-blue-500" />
				<Card title="Ingresos Netos" value={`Bs ${fmt(data?.kpis?.ingresos_netos)}`} icon="↗" iconBg="bg-violet-500" />
				<Card title="Stock Bajo" value={fmt(data?.kpis?.stock_bajo)} icon="⚠" iconBg="bg-red-500" />
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
				<div className="bg-white rounded-xl ring-1 ring-gray-100 p-4">
					<h3 className="font-bold mb-1">Ventas por Día</h3>
					<p className="text-gray-500 text-sm mb-4">Última semana</p>
					<LineChartLike rows={data?.ventas_por_dia || []} max={ventasMax} />
				</div>
				<div className="bg-white rounded-xl ring-1 ring-gray-100 p-4">
					<h3 className="font-bold mb-1">Servicios Más Solicitados</h3>
					<p className="text-gray-500 text-sm mb-4">Distribución del período seleccionado</p>
					<PieLike rows={data?.servicios_solicitados || []} />
				</div>
			</div>

			<div className="bg-white rounded-xl ring-1 ring-gray-100 p-4 mb-6">
				<h3 className="font-bold text-xl- mb-1">Productos con Stock Bajo</h3>
				<p className="text-gray-500 text-sm mb-4">Productos que necesitan reabastecimiento urgente</p>
				<div className="overflow-hidden rounded-lg ring-1 ring-gray-200">
					<table className="min-w-full">
						<thead className="bg-gray-50 text-left text-gray-600">
							<tr className="text-sm">
								<th className="px-4 py-2">Producto</th>
								<th className="px-4 py-2">Categoría</th>
								<th className="px-4 py-2">Stock Actual</th>
								<th className="px-4 py-2">Stock Mínimo</th>
								<th className="px-4 py-2">Estado</th>
							</tr>
						</thead>
						<tbody className="text-sm">
							{(data?.stock_bajo_rows || []).map((r, idx) => (
								<tr key={idx} className="border-t">
									<td className="px-4 py-2">{r.producto}</td>
									<td className="px-4 py-2">{r.categoria}</td>
									<td className="px-4 py-2">{r.stock}</td>
									<td className="px-4 py-2">{r.stock_minimo}</td>
									<td className="px-4 py-2">
										<span className={`px-2 py-0.5 rounded-full text-xs ${r.estado === 'crítico' ? 'bg-rose-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
											{r.estado === 'crítico' ? 'Crítico' : 'Bajo'}
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			<div className="bg-white rounded-xl ring-1 ring-gray-100 p-4">
				<h3 className="font-bold mb-1">Resumen de Ingresos</h3>
				<p className="text-gray-500 text-sm mb-3">Desglose por tipo de venta</p>
				<div className="space-y-3">
					<ItemResume
						title="Servicios"
						sub="Mano de obra"
						monto={data?.ingresos_resumen?.servicios?.monto || 0}
						pct={data?.ingresos_resumen?.servicios?.porcentaje || 0}
						bg="bg-blue-50"
						color="text-blue-700"
					/>
					<ItemResume
						title="Productos"
						sub="Venta de repuestos"
						monto={data?.ingresos_resumen?.productos?.monto || 0}
						pct={data?.ingresos_resumen?.productos?.porcentaje || 0}
						bg="bg-emerald-50"
						color="text-emerald-700"
					/>
				</div>
			</div>
		</div>
	);
}

function Card({ title, value, icon, iconBg = 'bg-blue-500' }) {
	return (
		<div className="bg-white rounded-xl ring-1 ring-gray-100 p-4 flex items-center justify-between">
			<div>
				<div className="text-gray-500">{title}</div>
				<div className="font-extrabold mt-1 text-4xl-">{value}</div>
			</div>
			<div className={`w-14 h-14 rounded-xl ${iconBg} text-white flex items-center justify-center text-3xl- font-bold`}>
				{icon}
			</div>
		</div>
	);
}
function ItemResume({ title, sub, monto, pct, bg, color }) {
	return (
		<div className={`rounded-xl p-4 ${bg} flex items-center justify-between`}>
			<div><div className="font-semibold">{title}</div><div className="text-sm text-gray-500">{sub}</div></div>
			<div className="text-right">
				<div className={`text-3xl- font-extrabold ${color}`}>Bs {fmt(monto)}</div>
				<div className="text-gray-500 text-sm">{pct}%</div>
			</div>
		</div>
	);
}
function fmt(n) { return Number(n || 0).toLocaleString('es-BO', { maximumFractionDigits: 0 }); }
function pieColor(i) { return ['#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'][i % 5]; }

function LineChartLike({ rows, max }) {
	if (!rows.length) return <div className="text-sm text-gray-500">Sin datos</div>;
	const w = 520; const h = 220; const pad = 24;
	const points = rows.map((r, i) => {
		const x = pad + (i * ((w - pad * 2) / Math.max(1, rows.length - 1)));
		const y = h - pad - ((Number(r.total || 0) / Math.max(1, max)) * (h - pad * 2));
		return [x, y];
	});
	const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
	return (
		<div>
			<svg viewBox={`0 0 ${w} ${h}`} className="w-full h-64 bg-white rounded">
				<rect x="0" y="0" width={w} height={h} fill="white" />
				{[0.25, 0.5, 0.75].map((r, i) => (
					<line key={i} x1={pad} y1={h - pad - r * (h - pad * 2)} x2={w - pad} y2={h - pad - r * (h - pad * 2)} stroke="#e5e7eb" strokeDasharray="4 4" />
				))}
				<polyline points={`${pad},${h - pad} ${w - pad},${h - pad}`} stroke="#9ca3af" fill="none" />
				<path d={d} stroke="#1f64b2" strokeWidth="3" fill="none" />
				{points.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="4" fill="#1f64b2" />)}
			</svg>
			<div className="grid grid-cols-7 text-sm text-gray-500 mt-1">
				{rows.map((r) => <span key={r.fecha}>{new Date(r.fecha).toLocaleDateString('es-BO', { weekday: 'short' })}</span>)}
			</div>
		</div>
	);
}

function PieLike({ rows }) {
	if (!rows.length) return <div className="text-sm text-gray-500">Sin datos</div>;
	const total = rows.reduce((a, b) => a + Number(b.cantidad || 0), 0) || 1;
	let start = 0;
	const cx = 180, cy = 120, r = 70;
	const arcs = rows.slice(0, 5).map((row, i) => {
		const val = Number(row.cantidad || 0);
		const angle = (val / total) * Math.PI * 2;
		const end = start + angle;
		const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
		const x2 = cx + r * Math.cos(end), y2 = cy + r * Math.sin(end);
		const large = angle > Math.PI ? 1 : 0;
		const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
		const out = { d, color: pieColor(i), name: row.nombre, pct: Math.round((val / total) * 100) };
		start = end;
		return out;
	});
	return (
		<div className="grid grid-cols-2 gap-2 items-center">
			<svg viewBox="0 0 360 240" className="w-full h-56">
				{arcs.map((a, i) => <path key={i} d={a.d} fill={a.color} stroke="#fff" strokeWidth="1" />)}
			</svg>
			<div className="space-y-2 text-sm">
				{arcs.map((a, i) => <div key={i} className="text-blue-600">{a.name}: {a.pct}%</div>)}
			</div>
		</div>
	);
}

