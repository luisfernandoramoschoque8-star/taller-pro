import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function Usuarios() {
	const [rows, setRows] = useState([]);
	const [roles, setRoles] = useState([]);
	const [savingId, setSavingId] = useState(null);
	const [form, setForm] = useState({ nombre: '', email: '', password: '', rol_id: '' });
	const [creating, setCreating] = useState(false);

	const load = async () => {
		const { data } = await api.get('/usuarios');
		setRows(data.users || []);
		setRoles(data.roles || []);
	};
	useEffect(() => { load(); }, []);

	const update = async (u, patch) => {
		setSavingId(u.id);
		try {
			await api.put(`/usuarios/${u.id}/rol`, patch);
			await load();
		} finally {
			setSavingId(null);
		}
	};

	const createUser = async (e) => {
		e.preventDefault();
		setCreating(true);
		try {
			await api.post('/usuarios', {
				...form,
				rol_id: Number(form.rol_id),
				activo: true,
			});
			setForm({ nombre: '', email: '', password: '', rol_id: '' });
			await load();
		} finally {
			setCreating(false);
		}
	};

	const remove = async (u) => {
		if (!confirm(`¿Eliminar al usuario ${u.nombre}?`)) return;
		await api.delete(`/usuarios/${u.id}`);
		await load();
	};

	const resetPwd = async (u) => {
		const pwd = prompt(`Nueva contraseña para ${u.nombre}:`, '');
		if (!pwd) return;
		await api.put(`/usuarios/${u.id}/password`, { password: pwd });
		alert('Contraseña actualizada.');
	};

	return (
		<div className="p-2 md:p-4">
			<div className="flex items-center justify-between mb-5">
				<div>
					<h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Usuarios y Roles</h1>
					<p className="text-sm text-gray-500 mt-1">Asigna o cambia el rol de usuarios</p>
				</div>
			</div>

			<div className="bg-white rounded-xl ring-1 ring-gray-100 p-4 mb-5">
				<h2 className="font-semibold mb-3">Crear usuario</h2>
				<form onSubmit={createUser} className="grid grid-cols-1 md:grid-cols-5 gap-3">
					<input className="border rounded-lg px-3 py-2" placeholder="Nombre completo" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
					<input type="email" className="border rounded-lg px-3 py-2" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
					<input type="password" className="border rounded-lg px-3 py-2" placeholder="Contraseña" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
					<select className="border rounded-lg px-3 py-2" value={form.rol_id} onChange={(e) => setForm({ ...form, rol_id: e.target.value })} required>
						<option value="">Selecciona rol</option>
						{roles.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
					</select>
					<button className="px-4 py-2 rounded-lg bg-primary text-white" disabled={creating}>{creating ? 'Creando...' : 'Crear'}</button>
				</form>
			</div>

			<div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
				<table className="min-w-full">
					<thead className="bg-gray-50/80 text-left text-gray-600">
						<tr className="text-sm">
							<th className="px-5 py-3 font-semibold">ID</th>
							<th className="px-5 py-3 font-semibold">Nombre</th>
							<th className="px-5 py-3 font-semibold">Email</th>
							<th className="px-5 py-3 font-semibold">Rol</th>
							<th className="px-5 py-3 font-semibold">Activo</th>
							<th className="px-5 py-3 font-semibold text-right">Acciones</th>
						</tr>
					</thead>
					<tbody className="text-sm">
						{rows.map((u) => (
							<tr key={u.id} className="border-t">
								<td className="px-5 py-3">{u.id}</td>
								<td className="px-5 py-3">{u.nombre}</td>
								<td className="px-5 py-3">{u.email}</td>
								<td className="px-5 py-3">
									<select
										className="border rounded-lg px-3 py-2 bg-white"
										value={u.rol_id || ''}
										onChange={(e) => update(u, { rol_id: Number(e.target.value) })}
										disabled={savingId === u.id}
									>
										<option value="">Sin rol</option>
										{roles.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
									</select>
								</td>
								<td className="px-5 py-3">
									<label className="inline-flex items-center gap-2">
										<input
											type="checkbox"
											checked={!!u.activo}
											onChange={(e) => update(u, { rol_id: u.rol_id || null, activo: e.target.checked })}
											disabled={savingId === u.id}
										/>
										<span>{u.activo ? 'Sí' : 'No'}</span>
									</label>
								</td>
								<td className="px-5 py-3 text-right">
									<div className="inline-flex items-center gap-2">
										{savingId === u.id ? <span className="text-gray-500">Guardando...</span> : null}
										<button className="px-3 py-1.5 rounded-lg border text-blue-700 border-blue-200 hover:bg-blue-50" onClick={() => resetPwd(u)}>Reiniciar clave</button>
										<button className="px-3 py-1.5 rounded-lg border text-red-700 border-red-200 hover:bg-red-50" onClick={() => remove(u)}>Eliminar</button>
									</div>
								</td>
							</tr>
						))}
						{rows.length === 0 && <tr><td className="px-5 py-4" colSpan={6}>Sin usuarios</td></tr>}
					</tbody>
				</table>
			</div>
		</div>
	);
}

