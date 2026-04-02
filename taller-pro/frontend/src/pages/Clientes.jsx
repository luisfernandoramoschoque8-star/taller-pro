import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';

export default function Clientes() {
	const { user } = useAuth();
	const [search, setSearch] = useState('');
	const [data, setData] = useState({ data: [], links: [], meta: {} });
	const [loading, setLoading] = useState(false);
	const [form, setForm] = useState({ nombre: '', telefono: '', email: '', direccion: '', ci: '' });
	const [editing, setEditing] = useState(null);
	const [saving, setSaving] = useState(false);

	const canEdit = useMemo(() => ['admin', 'empleado'].includes(user?.rol), [user]);

	const load = async (page = 1) => {
		setLoading(true);
		try {
			const { data } = await api.get('/clientes', { params: { q: search, page } });
			setData(data);
		} catch (err) {
			// Si hay un error al obtener datos, dejamos el estado en limpio
			setData({ data: [], links: [], meta: {} });
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => { load(1); }, []);

	const handleSubmit = (e) => {
		e.preventDefault();
		load(1);
	};

	const openModal = (c) => {
		setEditing(c?.id || null);
		setForm(c || { nombre: '', telefono: '', email: '', direccion: '', ci: '' });
		document.getElementById('modalCliente').showModal();
	};

	const save = async (e) => {
		e.preventDefault();
		setSaving(true);
		try {
			if (editing) await api.put(`/clientes/${editing}`, form);
			else await api.post('/clientes', form);
			document.getElementById('modalCliente').close();
			load(1);
		} finally {
			setSaving(false);
		}
	};

	const remove = async (c) => {
		if (!confirm('¿Eliminar cliente?')) return;
		await api.delete(`/clientes/${c.id}`);
		load(1);
	};

	return (
		<div className="p-2 md:p-4">
			<div className="flex items-center justify-between mb-5">
				<div>
					<h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Clientes</h1>
					<p className="text-sm text-gray-500 mt-1">Gestión de clientes del taller</p>
				</div>
				{canEdit && (
					<button
						className="inline-flex items-center gap-2 bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm"
						onClick={() => openModal(null)}
					>
						<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2h6z"/></svg>
						Nuevo Cliente
					</button>
				)}
			</div>
			<form onSubmit={handleSubmit} className="mb-4">
				<div className="relative max-w-3xl">
					<span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L19 20.5 20.5 19l-5-5zM4 9.5A5.5 5.5 0 1114.5 9.5 5.5 5.5 0 014 9.5z"/></svg>
					</span>
					<input
						className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 shadow-sm"
						placeholder="Buscar por nombre o CI"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>
			</form>
			<div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
				<table className="min-w-full">
					<thead className="bg-gray-50/80 text-left text-gray-600">
						<tr className="text-sm">
							<th className="px-5 py-3 font-semibold">Nombre</th>
							<th className="px-5 py-3 font-semibold">CI</th>
							<th className="px-5 py-3 font-semibold">Teléfono</th>
							<th className="px-5 py-3 font-semibold">Email</th>
							{canEdit && <th className="px-5 py-3 font-semibold text-right">Acciones</th>}
						</tr>
					</thead>
					<tbody className="text-sm">
						{loading && (
							<tr><td className="px-5 py-4" colSpan={canEdit ? 5 : 4}>Cargando...</td></tr>
						)}
						{!loading && data.data.map((c) => (
							<tr key={c.id} className="border-t hover:bg-gray-50/60">
								<td className="px-5 py-4">{c.nombre}</td>
								<td className="px-5 py-4">{c.ci || '-'}</td>
								<td className="px-5 py-4">{c.telefono || '-'}</td>
								<td className="px-5 py-4">{c.email || '-'}</td>
								{canEdit && (
									<td className="px-5 py-4">
										<div className="flex justify-end gap-2">
											<button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50" onClick={() => openModal(c)}>
												<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
												Editar
											</button>
											<button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50" onClick={() => remove(c)}>
												<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
												Eliminar
											</button>
										</div>
									</td>
								)}
							</tr>
						))}
						{!loading && data.data.length === 0 && (
							<tr><td className="px-5 py-4" colSpan={canEdit ? 5 : 4}>Sin resultados</td></tr>
						)}
					</tbody>
				</table>
			</div>

			<dialog id="modalCliente" className="rounded-2xl p-0 w-full max-w-2xl backdrop:bg-black/40">
				<div className="bg-white rounded-2xl shadow-xl p-7">
					<div className="flex items-start justify-between mb-1">
						<h3 className="text-4xl- font-bold text-gray-900">{editing ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
						<button type="button" className="text-gray-500 hover:text-gray-700 text-2xl-" onClick={() => document.getElementById('modalCliente').close()}>✕</button>
					</div>
					<p className="text-gray-500 mb-5">{editing ? 'Actualiza los datos del cliente' : 'Ingresa los datos del nuevo cliente'}</p>

					<form onSubmit={save} className="space-y-4">
						<div>
							<label className="block font-semibold mb-1">Nombre Completo</label>
							<input className="w-full border rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
						</div>
						<div>
							<label className="block font-semibold mb-1">Cédula de Identidad</label>
							<input className="w-full border rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30" value={form.ci || ''} onChange={(e) => setForm({ ...form, ci: e.target.value })} />
						</div>
						<div>
							<label className="block font-semibold mb-1">Teléfono</label>
							<input className="w-full border rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30" value={form.telefono || ''} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
						</div>
						<div>
							<label className="block font-semibold mb-1">Email</label>
							<input type="email" className="w-full border rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
						</div>
						<div>
							<label className="block font-semibold mb-1">Dirección</label>
							<input className="w-full border rounded-xl px-4 py-3 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30" value={form.direccion || ''} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
						</div>
						<div className="flex justify-end gap-2 pt-2">
							<button type="button" className="px-6 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50" onClick={() => document.getElementById('modalCliente').close()}>Cancelar</button>
							<button className="px-6 py-2.5 rounded-xl bg-primary hover:bg-blue-700 text-white shadow-sm" disabled={saving}>{saving ? 'Guardando...' : (editing ? 'Guardar Cliente' : 'Crear Cliente')}</button>
						</div>
					</form>
				</div>
			</dialog>
		</div>
	);
}
