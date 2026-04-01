import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function Caja() {
	const [estado, setEstado] = useState({ abierta: false });
	const [openApertura, setOpenApertura] = useState(false);
	const [openCierre, setOpenCierre] = useState(false);
	const [montoInicial, setMontoInicial] = useState('');
	const [error, setError] = useState('');

	const load = async () => {
		try {
			const { data } = await api.get('/caja/estado');
			setEstado(data);
		} catch (e) {
			setError(e?.response?.data?.message || 'No se pudo cargar caja');
		}
	};
	useEffect(() => { load(); }, []);

	const abrirCaja = async (e) => {
		e.preventDefault();
		await api.post('/caja/abrir', { monto_inicial: Number(montoInicial || 0) });
		setOpenApertura(false);
		setMontoInicial('');
		load();
	};
	const cerrarCaja = async () => {
		setError('');
		try {
			await api.post('/caja/cerrar');
			setOpenCierre(false);
			load();
		} catch (e) {
			setError(e?.response?.data?.message || 'No se pudo cerrar la caja');
		}
	};

	const c = estado.caja || {};
	const movs = estado.movimientos || [];

	return (
		<div className="p-2 md:p-4">
			<div className="flex items-start justify-between mb-4">
				<div>
					<h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Caja</h1>
					<p className="text-gray-500 mt-1">Control de caja diaria</p>
				</div>
				{!estado.abierta ? (
					<button className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg" onClick={() => setOpenApertura(true)}>
						Abrir Caja
					</button>
				) : (
					<button className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg" onClick={() => setOpenCierre(true)}>
						Cerrar Caja
					</button>
				)}
			</div>

			{!estado.abierta ? (
				<div className="rounded-xl border border-amber-200 bg-amber-50 p-10 text-center text-amber-800">
					<div className="text-4xl mb-2">💼</div>
					<div className="text-4xl- font-bold mb-1">Caja Cerrada</div>
					<div>Abre la caja para comenzar las operaciones del día</div>
				</div>
			) : (
				<>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
						<Kpi title="Monto Inicial" value={`Bs ${Number(c.monto_inicial || 0).toFixed(2)}`} />
						<Kpi title="Ingresos" value={`Bs ${Number(c.ingresos || 0).toFixed(2)}`} color="text-emerald-600" />
						<Kpi title="Egresos" value={`Bs ${Number(c.egresos || 0).toFixed(2)}`} color="text-red-600" />
						<Kpi title="Total en Caja" value={`Bs ${Number(c.total_caja || 0).toFixed(2)}`} color="text-blue-700" />
					</div>

					<div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-4">
						<h2 className="font-semibold text-gray-900 mb-3">Movimientos del Día</h2>
						<div className="overflow-hidden rounded-lg ring-1 ring-gray-200">
							<table className="min-w-full">
								<thead className="bg-gray-50 text-left text-gray-600">
									<tr className="text-sm">
										<th className="px-4 py-3">Hora</th>
										<th className="px-4 py-3">Tipo</th>
										<th className="px-4 py-3">Concepto</th>
										<th className="px-4 py-3 text-right">Monto</th>
									</tr>
								</thead>
								<tbody className="text-sm">
									{movs.map((m, i) => (
										<tr key={i} className="border-t">
											<td className="px-4 py-3">{m.hora}</td>
											<td className="px-4 py-3">
												<span className={`px-2 py-0.5 rounded-full text-xs ${m.tipo === 'ingreso' ? 'bg-gray-900 text-white' : 'bg-rose-600 text-white'}`}>
													{m.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}
												</span>
											</td>
											<td className="px-4 py-3">{m.concepto}</td>
											<td className={`px-4 py-3 text-right font-semibold ${m.tipo === 'ingreso' ? 'text-emerald-600' : 'text-red-600'}`}>
												{m.tipo === 'ingreso' ? '+' : '-'} Bs {Number(m.monto).toFixed(2)}
											</td>
										</tr>
									))}
									{movs.length === 0 && <tr><td className="px-4 py-3" colSpan={4}>Sin movimientos</td></tr>}
								</tbody>
							</table>
						</div>
					</div>
				</>
			)}

			{openApertura && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
					<div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6">
						<div className="flex items-center justify-between mb-2">
							<h3 className="text-xl font-bold">Apertura de Caja</h3>
							<button onClick={() => setOpenApertura(false)}>✕</button>
						</div>
						<p className="text-gray-500 mb-3">Ingresa el monto inicial para abrir la caja</p>
						<form onSubmit={abrirCaja} className="space-y-4">
							<div>
								<label className="block text-sm font-semibold mb-1">Monto Inicial (Bs)</label>
								<input type="number" step="0.01" min="0" className="w-full border rounded-lg px-3 py-2" value={montoInicial} onChange={(e) => setMontoInicial(e.target.value)} required />
							</div>
							<div className="flex justify-end gap-2">
								<button type="button" className="px-4 py-2 rounded-lg border" onClick={() => setOpenApertura(false)}>Cancelar</button>
								<button className="px-4 py-2 rounded-lg bg-emerald-500 text-white">Abrir Caja</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{openCierre && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
					<div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6">
						<div className="flex items-center justify-between mb-2">
							<h3 className="text-xl font-bold">Cierre de Caja</h3>
							<button onClick={() => setOpenCierre(false)}>✕</button>
						</div>
						<p className="text-gray-500 mb-4">Resumen del día</p>
						<div className="bg-gray-50 rounded-lg p-4 text-lg">
							<div className="flex justify-between mb-2"><span>Monto Inicial:</span><strong>Bs {Number(c.monto_inicial || 0).toFixed(2)}</strong></div>
							<div className="flex justify-between mb-2 text-emerald-600"><span>Total Ingresos:</span><strong>+ Bs {Number(c.ingresos || 0).toFixed(2)}</strong></div>
							<div className="flex justify-between mb-2 text-red-600"><span>Total Egresos:</span><strong>- Bs {Number(c.egresos || 0).toFixed(2)}</strong></div>
							<hr className="my-2" />
							<div className="flex justify-between text-2xl font-bold text-blue-700"><span>Total en Caja:</span><span>Bs {Number(c.total_caja || 0).toFixed(2)}</span></div>
						</div>
						<div className="flex justify-end gap-2 mt-4">
							<button className="px-4 py-2 rounded-lg border" onClick={() => setOpenCierre(false)}>Cancelar</button>
							<button className="px-4 py-2 rounded-lg bg-red-600 text-white" onClick={cerrarCaja}>Confirmar Cierre</button>
						</div>
					</div>
				</div>
			)}
			{error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
		</div>
	);
}

function Kpi({ title, value, color = 'text-gray-900' }) {
	return (
		<div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-4">
			<div className="text-gray-500 mb-1">{title}</div>
			<div className={`text-4xl- font-extrabold ${color}`}>{value}</div>
		</div>
	);
}

