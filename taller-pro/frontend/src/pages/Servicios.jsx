import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function Servicios() {
	const [kpi, setKpi] = useState({ pendientes: 0, en_proceso: 0, completados_hoy: 0 });
	const [search, setSearch] = useState('');
	const [estadoFilter, setEstadoFilter] = useState('todos');
	const [data, setData] = useState({ data: [] });
	const [loading, setLoading] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
	const [saving, setSaving] = useState(false);
	const [modalError, setModalError] = useState('');
	const [changingId, setChangingId] = useState(null);
	const [clientes, setClientes] = useState([]);
	const [servicios, setServicios] = useState([]);
	const [form, setForm] = useState({
		cliente_id: '',
		vehiculo: '',
		servicio_id: '',
		mecanico: '',
		fecha: '',
		total: '',
	});

	const load = async (page = 1) => {
		setLoading(true);
		try {
			const [res1, res2] = await Promise.all([
				api.get('/ordenes-servicio/resumen'),
				api.get('/ordenes-servicio', {
					params: {
						q: search,
						page,
						estado: estadoFilter === 'todos' ? undefined : estadoFilter,
					},
				}),
			]);
			setKpi(res1.data);
			setData(res2.data);
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => { load(1); }, [estadoFilter]);
	const openModal = async () => {
		setModalOpen(true);
		setModalError('');
		const [c, s] = await Promise.allSettled([api.get('/clientes/all'), api.get('/servicios/all')]);
		let clientesList = [];
		if (c.status === 'fulfilled' && Array.isArray(c.value.data)) {
			clientesList = c.value.data;
		} else {
			// Fallback: obtener primera página del index
			try {
				const alt = await api.get('/clientes', { params: { page: 1 } });
				clientesList = alt.data?.data ?? [];
			} catch (_) {
				clientesList = [];
			}
		}
		setClientes(clientesList);
		let serviciosList = s.status === 'fulfilled' ? (Array.isArray(s.value.data) ? s.value.data : []) : [];
		// #region agent log
		fetch('http://127.0.0.1:7244/ingest/d83e80e1-f048-4e4b-9029-647de430b165',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/pages/Servicios.jsx:openModal',message:'API servicios/all result',data:{fulfilled:s.status==='fulfilled',count:Array.isArray(serviciosList)?serviciosList.length:-1,ids:(Array.isArray(serviciosList)?serviciosList.slice(0,8).map(x=>x.id):[])},timestamp:Date.now(),runId:'pre-fix',hypothesisId:'H1'})}).catch(()=>{});
		// #endregion
		if (serviciosList.length === 0) {
			// Fallback robusto: recorrer todas las páginas del índice hasta completar
			let page = 1;
			const acumulado = [];
			const perPageFallback = 10;
			while (true) {
				try {
					const altS = await api.get('/servicios', { params: { page } });
					const pageData = altS.data?.data ?? [];
					acumulado.push(...pageData);
					// criterio de corte: si llega menos de perPage, asumimos última página
					const perPage = altS.data?.per_page ?? perPageFallback;
					const isLast = pageData.length < perPage;
					// #region agent log
					fetch('http://127.0.0.1:7244/ingest/d83e80e1-f048-4e4b-9029-647de430b165',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/pages/Servicios.jsx:openModal',message:'Fallback pagina servicios',data:{page,count:pageData.length,total:acumulado.length,perPage,isLast},timestamp:Date.now(),runId:'pre-fix',hypothesisId:'H2_pages'})}).catch(()=>{});
					// #endregion
					if (isLast) break;
					page += 1;
				} catch (_) {
					break;
				}
			}
			serviciosList = acumulado;
			// #region agent log
			fetch('http://127.0.0.1:7244/ingest/d83e80e1-f048-4e4b-9029-647de430b165',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/pages/Servicios.jsx:openModal',message:'Fallback servicios (todas las paginas) total',data:{count:Array.isArray(serviciosList)?serviciosList.length:-1},timestamp:Date.now(),runId:'pre-fix',hypothesisId:'H2_total'})}).catch(()=>{});
			// #endregion
		}
		// Mostrar servicios activos, unificados por nombre (normalizado) y quedándonos con el más reciente (id mayor)
		const activos = serviciosList.filter((s) => s?.activo);
		const byName = new Map();
		for (const s of activos) {
			const key = String(s.nombre || '').trim().toLowerCase();
			if (!key) continue;
			const prev = byName.get(key);
			if (!prev || Number(s.id) > Number(prev.id)) byName.set(key, s);
		}
		const uniques = Array.from(byName.values()).sort((a, b) => String(a.nombre).localeCompare(String(b.nombre)));
		// #region agent log
		fetch('http://127.0.0.1:7244/ingest/d83e80e1-f048-4e4b-9029-647de430b165',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/pages/Servicios.jsx:openModal',message:'Servicios unicos por nombre',data:{count:uniques.length,nombres:uniques.map(x=>x.nombre)},timestamp:Date.now(),runId:'pre-fix',hypothesisId:'H4_frontend_dedup'})}).catch(()=>{});
		// #endregion
		setServicios(uniques);
	};
	const closeModal = () => {
		setModalOpen(false);
		setModalError('');
	};

	useEffect(() => {
		const selected = servicios.find((x) => String(x.id) === String(form.servicio_id));
		if (selected) {
			setForm((f) => ({ ...f, total: selected.precio }));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form.servicio_id]);

	const save = async (e) => {
		e?.preventDefault();
		setSaving(true);
		setModalError('');
		try {
			const payload = { ...form };
			payload.cliente_id = payload.cliente_id ? Number(payload.cliente_id) : null;
			payload.servicio_id = payload.servicio_id ? Number(payload.servicio_id) : null;
			// Normaliza decimal con coma -> punto
			if (payload.total !== '' && payload.total !== null && payload.total !== undefined) {
				payload.total = Number(String(payload.total).replace(',', '.'));
			} else {
				delete payload.total;
			}
			if (!payload.fecha) delete payload.fecha;
			await api.post('/ordenes-servicio', payload);
			setModalOpen(false);
			setForm({ cliente_id: '', vehiculo: '', servicio_id: '', mecanico: '', fecha: '', total: '' });
			load(1);
		} catch (err) {
			setModalError(err?.response?.data?.message || 'No se pudo crear el servicio');
		} finally {
			setSaving(false);
		}
	};

	const badge = (estado) => {
		const map = {
			completado: 'bg-gray-900 text-white',
			en_proceso: 'bg-gray-200 text-gray-800',
			pendiente: 'bg-rose-500/15 text-rose-700',
		};
		const text = { completado: 'Completado', en_proceso: 'En Proceso', pendiente: 'Pendiente' }[estado] || estado;
		return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${map[estado]}`}>{text}</span>;
	};

	const cambiarEstado = async (id, estado) => {
		setChangingId(id);
		try {
			await api.patch(`/ordenes-servicio/${id}/estado`, { estado });
			await load(1);
		} finally {
			setChangingId(null);
		}
	};

	return (
		<div className="p-2 md:p-4">
			<div className="flex items-center justify-between mb-5">
				<div>
					<h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Servicios</h1>
					<p className="text-sm text-gray-500 mt-1">Gestión de servicios automotrices</p>
				</div>
				<button className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg shadow-sm" onClick={openModal}>
					<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2h6z"/></svg>
					Nuevo Servicio
				</button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
				<CardKpi
					title="Pendientes"
					value={kpi.pendientes}
					tone="danger"
					active={estadoFilter === 'pendiente'}
					onClick={() => setEstadoFilter(estadoFilter === 'pendiente' ? 'todos' : 'pendiente')}
				/>
				<CardKpi
					title="En Proceso"
					value={kpi.en_proceso}
					tone="warning"
					active={estadoFilter === 'en_proceso'}
					onClick={() => setEstadoFilter(estadoFilter === 'en_proceso' ? 'todos' : 'en_proceso')}
				/>
				<CardKpi
					title="Completados Hoy"
					value={kpi.completados_hoy}
					tone="success"
					active={estadoFilter === 'completado'}
					onClick={() => setEstadoFilter(estadoFilter === 'completado' ? 'todos' : 'completado')}
				/>
			</div>
			{estadoFilter !== 'todos' && (
				<div className="mb-3 text-sm text-gray-600">
					Filtro activo: <span className="font-semibold">{estadoFilter === 'en_proceso' ? 'En Proceso' : estadoFilter.charAt(0).toUpperCase() + estadoFilter.slice(1)}</span>
					<button className="ml-3 text-primary underline" onClick={() => setEstadoFilter('todos')}>Ver todos</button>
				</div>
			)}

			<div className="mb-4">
				<div className="relative max-w-3xl">
					<span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L19 20.5 20.5 19l-5-5zM4 9.5A5.5 5.5 0 1114.5 9.5 5.5 5.5 0 014 9.5z"/></svg>
					</span>
					<input
						className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 shadow-sm"
						placeholder="Buscar por código, cliente o vehículo"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						onKeyDown={(e) => e.key === 'Enter' && load(1)}
					/>
				</div>
			</div>

			<div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
				<table className="min-w-full">
					<thead className="bg-gray-50/80 text-left text-gray-600">
						<tr className="text-sm">
							<th className="px-5 py-3 font-semibold">ID</th>
							<th className="px-5 py-3 font-semibold">Cliente</th>
							<th className="px-5 py-3 font-semibold">Vehículo</th>
							<th className="px-5 py-3 font-semibold">Servicio</th>
							<th className="px-5 py-3 font-semibold">Mecánico</th>
							<th className="px-5 py-3 font-semibold">Fecha</th>
							<th className="px-5 py-3 font-semibold">Estado</th>
							<th className="px-5 py-3 font-semibold">Total</th>
						</tr>
					</thead>
					<tbody className="text-sm">
						{loading && <tr><td className="px-5 py-4" colSpan={8}>Cargando...</td></tr>}
						{!loading && data.data.map((r) => (
							<tr key={r.id} className="border-t hover:bg-gray-50/60">
								<td className="px-5 py-4">{r.codigo}</td>
								<td className="px-5 py-4">{r.cliente?.nombre || '-'}</td>
								<td className="px-5 py-4">{r.vehiculo || '-'}</td>
								<td className="px-5 py-4">{r.servicio?.nombre || '-'}</td>
								<td className="px-5 py-4">{r.mecanico || 'No asignado'}</td>
								<td className="px-5 py-4">
									{r.fecha ? new Date(r.fecha).toISOString().slice(0, 10) : '-'}
								</td>
								<td className="px-5 py-4">
									<div className="flex items-center gap-2">
										{badge(r.estado)}
										<select
											className="border rounded-lg px-2 py-1 text-xs bg-white"
											value={r.estado}
											disabled={changingId === r.id}
											onChange={(e) => cambiarEstado(r.id, e.target.value)}
										>
											<option value="pendiente">Pendiente</option>
											<option value="en_proceso">En Proceso</option>
											<option value="completado">Completado</option>
										</select>
									</div>
								</td>
								<td className="px-5 py-4">Bs {Number(r.total).toFixed(0)}</td>
							</tr>
						))}
						{!loading && data.data.length === 0 && <tr><td className="px-5 py-4" colSpan={8}>Sin resultados</td></tr>}
					</tbody>
				</table>
			</div>
			<NuevoServicioModal
				open={modalOpen}
				onClose={closeModal}
				clientes={clientes}
				servicios={servicios}
				form={form}
				setForm={setForm}
				onSave={save}
				saving={saving}
				error={modalError}
			/>
		</div>
	);
}

function CardKpi({ title, value, tone, onClick, active }) {
	const map = {
		danger: { bg: 'bg-rose-500/15', iconBg: 'bg-rose-600', icon: 'M12 8v8m-4-4h8' },
		warning: { bg: 'bg-amber-500/15', iconBg: 'bg-amber-500', icon: 'M12 8v4l3 3' },
		success: { bg: 'bg-emerald-500/15', iconBg: 'bg-emerald-500', icon: 'M5 13l4 4L19 7' },
	}[tone] || { bg: 'bg-gray-100', iconBg: 'bg-gray-400', icon: '' };

	return (
		<button type="button" onClick={onClick} className={`w-full text-left rounded-xl ${map.bg} p-4 ring-1 ${active ? 'ring-primary' : 'ring-black/5'} transition`}>
			<p className="text-sm text-gray-600 mb-1">{title}</p>
			<div className="flex items-center justify-between">
				<div className="text-3xl font-extrabold text-gray-900">{value}</div>
				<div className={`p-3 rounded-xl text-white ${map.iconBg}`}>
					<span className="text-xl">✓</span>
				</div>
			</div>
		</button>
	);
}

// Modal
// Simple dialog using native <dialog> not required; we render conditionally
// For compatibility we use a fixed overlay
export function NuevoServicioModal({ open, onClose, clientes, servicios, form, setForm, onSave, saving, error }) {
	if (!open) return null;
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
			<div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-bold">Nuevo Servicio</h3>
					<button className="text-gray-500 hover:text-gray-700" onClick={onClose}>✕</button>
				</div>
				<form onSubmit={onSave} className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm text-gray-600 mb-1">Cliente (opcional)</label>
							<select className="w-full border rounded-lg px-3 py-2" value={form.cliente_id} onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}>
								<option value="">Sin cliente</option>
								{clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
							</select>
						</div>
						<div>
							<label className="block text-sm text-gray-600 mb-1">Vehículo</label>
							<input className="w-full border rounded-lg px-3 py-2" value={form.vehiculo} onChange={(e) => setForm({ ...form, vehiculo: e.target.value })} placeholder="Ej: Toyota Corolla 2018" />
						</div>
						<div>
							<label className="block text-sm text-gray-600 mb-1">Servicio</label>
							<select className="w-full border rounded-lg px-3 py-2" value={form.servicio_id} onChange={(e) => setForm({ ...form, servicio_id: e.target.value })} required>
								<option value="">Selecciona...</option>
								{servicios.map((s) => <option key={s.id} value={s.id}>{s.nombre} - Bs {Number(s.precio).toFixed(2)}</option>)}
							</select>
						</div>
						<div>
							<label className="block text-sm text-gray-600 mb-1">Mecánico</label>
							<input className="w-full border rounded-lg px-3 py-2" value={form.mecanico} onChange={(e) => setForm({ ...form, mecanico: e.target.value })} placeholder="Nombre del mecánico" />
						</div>
						<div>
							<label className="block text-sm text-gray-600 mb-1">Fecha</label>
							<input type="datetime-local" className="w-full border rounded-lg px-3 py-2" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
						</div>
						<div>
							<label className="block text-sm text-gray-600 mb-1">Total (Bs)</label>
							<input type="number" step="0.01" className="w-full border rounded-lg px-3 py-2" value={form.total} onChange={(e) => setForm({ ...form, total: e.target.value })} />
						</div>
					</div>
					<div className="flex justify-end gap-2">
						<button type="button" className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50" onClick={onClose}>Cancelar</button>
						<button className="px-4 py-2 rounded-lg bg-primary hover:bg-blue-700 text-white" disabled={saving}>{saving ? 'Guardando...' : 'Crear Servicio'}</button>
					</div>
					{error && <p className="text-sm text-red-600">{error}</p>}
				</form>
			</div>
		</div>
	);
}

