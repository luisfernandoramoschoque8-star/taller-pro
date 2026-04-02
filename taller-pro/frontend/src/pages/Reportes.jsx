import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function Reportes() {
	const [periodo, setPeriodo] = useState('mes');
	const [data, setData] = useState(null);

	const load = async (p = periodo) => {
		const { data } = await api.get('/reportes/resumen', { params: { periodo: p } });
		setData(data);
	};
	useEffect(() => { load('mes'); }, []);

	const exportPdf = async () => {
		if (!data) return;
		const doc = new jsPDF({ unit: 'pt', format: 'a4' });
		const pageW = doc.internal.pageSize.getWidth();

		// Logo (si existe en public)
		try {
			const img = await fetch('/logo-empresa.png').then(r => r.blob()).then(b => new Promise((res) => {
				const fr = new FileReader();
				fr.onload = () => res(fr.result);
				fr.readAsDataURL(b);
			}));
			doc.addImage(img, 'PNG', 40, 30, 120, 60);
		} catch (_) { /* si no existe, continuar */ }

		// Título
		doc.setFont('helvetica', 'bold');
		doc.setFontSize(18);
		doc.text('AUTO MOTORES - Reporte', 180, 60);
		doc.setFontSize(11);
		doc.setFont('helvetica', 'normal');
		doc.text(`Periodo: ${periodo === 'hoy' ? 'Hoy' : periodo === 'semana' ? 'Esta semana' : 'Este mes'}`, 180, 78);
		doc.text(new Date().toLocaleString(), 180, 94);

		// KPIs
		doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.text('Resumen', 40, 120);
		const kpiRows = [
			['Total Ventas', `Bs ${fmt(data?.kpis?.total_ventas)}`],
			['Servicios', `${fmt(data?.kpis?.servicios)}`],
			['Ingresos Netos', `Bs ${fmt(data?.kpis?.ingresos_netos)}`],
			['Stock Bajo', `${fmt(data?.kpis?.stock_bajo)}`],
		];
		// @ts-ignore
		doc.autoTable({ startY: 130, head: [['KPI', 'Valor']], body: kpiRows, styles: { fontSize: 10 } });

		// Ventas por día
		doc.setFont('helvetica', 'bold'); doc.text('Ventas por Día', 40, doc.lastAutoTable.finalY + 30);
		const vRows = (data?.ventas_por_dia || []).map(r => [
			new Date(r.fecha).toLocaleDateString('es-BO', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' }),
			`Bs ${Number(r.total || 0).toLocaleString('es-BO', { maximumFractionDigits: 0 })}`
		]);
		// @ts-ignore
		doc.autoTable({ startY: doc.lastAutoTable.finalY + 38, head: [['Fecha', 'Total']], body: vRows, styles: { fontSize: 10 } });

		// Servicios más solicitados
		doc.setFont('helvetica', 'bold'); doc.text('Servicios Más Solicitados', 40, doc.lastAutoTable.finalY + 30);
		const sRows = (data?.servicios_solicitados || []).map(r => [r.nombre, Number(r.cantidad || 0)]);
		// @ts-ignore
		doc.autoTable({ startY: doc.lastAutoTable.finalY + 38, head: [['Servicio', 'Cantidad']], body: sRows, styles: { fontSize: 10 } });

		// Resumen de Ingresos
		doc.setFont('helvetica', 'bold'); doc.text('Resumen de Ingresos', 40, doc.lastAutoTable.finalY + 30);
		const ir = data?.ingresos_resumen || {};
		const iRows = [
			['Servicios', `Bs ${fmt(ir?.servicios?.monto)}`, `${ir?.servicios?.porcentaje || 0}%`],
			['Productos', `Bs ${fmt(ir?.productos?.monto)}`, `${ir?.productos?.porcentaje || 0}%`],
		];
		// @ts-ignore
		doc.autoTable({ startY: doc.lastAutoTable.finalY + 38, head: [['Tipo', 'Monto', 'Porcentaje']], body: iRows, styles: { fontSize: 10 } });

		doc.save('reporte-auto-motores.pdf');
	};

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
				<div className="flex gap-2">
					<select
						className="border rounded-lg px-4 py-2 bg-white min-w-48"
						value={periodo}
						onChange={(e) => { setPeriodo(e.target.value); load(e.target.value); }}
					>
						<option value="hoy">Hoy</option>
						<option value="semana">Esta Semana</option>
						<option value="mes">Este Mes</option>
					</select>
					<button
						className="px-4 py-2 rounded-lg bg-primary text-white"
						onClick={exportPdf}
						disabled={!data}
						title="Descargar PDF"
					>
						Descargar PDF
					</button>
				</div>
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
	const w = 560; const h = 260; const padL = 46; const padR = 16; const padT = 16; const padB = 34;
	const points = rows.map((r, i) => {
		const x = padL + (i * ((w - padL - padR) / Math.max(1, rows.length - 1)));
		const y = h - padB - ((Number(r.total || 0) / Math.max(1, max)) * (h - padT - padB));
		return [x, y];
	});
	const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
	const [tip, setTip] = React.useState(null);

	// Ejes y rejilla estética
	const yTicks = 5;
	const yLabels = Array.from({ length: yTicks + 1 }, (_, i) => Math.round((i * max) / yTicks));

	return (
		<div className="relative">
			<svg viewBox={`0 0 ${w} ${h}`} className="w-full h-72 bg-white rounded">
				<rect x="0" y="0" width={w} height={h} fill="white" />

				{/* Rejilla horizontal y etiquetas Y */}
				{yLabels.map((val, i) => {
					const y = h - padB - (i * (h - padT - padB) / yTicks);
					return (
						<g key={i}>
							<line x1={padL} y1={y} x2={w - padR} y2={y} stroke="#e5e7eb" strokeDasharray="4 4" />
							<text x={padL - 8} y={y + 4} textAnchor="end" fontSize="12" fill="#6b7280">
								{Number(val).toLocaleString('es-BO', { maximumFractionDigits: 0 })}
							</text>
						</g>
					);
				})}

				{/* Eje X base */}
				<line x1={padL} y1={h - padB} x2={w - padR} y2={h - padB} stroke="#9ca3af" />

				{/* Rejilla vertical suave */}
				{points.map((p, i) => (
					<line key={`vx-${i}`} x1={p[0]} y1={padT} x2={p[0]} y2={h - padB} stroke="#eef2f7" />
				))}

				{/* Línea */}
				<path d={d} stroke="#1f64b2" strokeWidth="3" fill="none" />

				{/* Puntos interactivos */}
				{points.map((p, i) => (
					<circle
						key={i}
						cx={p[0]}
						cy={p[1]}
						r="5.5"
						fill="#1f64b2"
						stroke="#ffffff"
						strokeWidth="2"
						onMouseEnter={(e) => {
							const dateStr = new Date(rows[i].fecha).toLocaleDateString('es-BO', { weekday: 'short' });
							setTip({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, dia: dateStr, total: Number(rows[i].total || 0) });
						}}
						onMouseMove={(e) => setTip((t) => t ? ({ ...t, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }) : t)}
						onMouseLeave={() => setTip(null)}
					/>
				))}
			</svg>
			{tip && (
				<div
					className="absolute z-10 bg-white border border-gray-300 shadow-lg px-4 py-3 text-sm rounded-lg"
					style={{ left: tip.x + 14, top: tip.y - 14 }}
				>
					<div className="font-semibold mb-1">
						Día: {tip.dia.charAt(0).toUpperCase() + tip.dia.slice(1)}
					</div>
					<div className="text-blue-700">
						ventas : Bs {Number(tip.total).toLocaleString('es-BO', { maximumFractionDigits: 0 })}
					</div>
				</div>
			)}
			<div className="grid grid-cols-7 text-sm text-gray-600 mt-1">
				{['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map((lbl) => (
					<span key={lbl} className="text-center">{lbl}</span>
				))}
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

