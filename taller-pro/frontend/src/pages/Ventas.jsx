import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function Ventas() {
	const [clientes, setClientes] = useState([]);
	const [productos, setProductos] = useState([]);
	const [ventasHoy, setVentasHoy] = useState([]);

	const [clienteId, setClienteId] = useState('');
	const [itemId, setItemId] = useState('');
	const [cantidad, setCantidad] = useState(1);
	const [error, setError] = useState('');

	useEffect(() => {
		Promise.allSettled([
			api.get('/clientes/all'),
			api.get('/ventas/hoy'),
		]).then(async ([c, v]) => {
			// Clientes con fallback a index paginado
			let clientesData = (c.status === 'fulfilled' && Array.isArray(c.value.data)) ? c.value.data : [];
			if (clientesData.length === 0) {
				try {
					const alt = await api.get('/clientes', { params: { page: 1 } });
					clientesData = alt.data?.data ?? [];
				} catch (_) { /* ignore */ }
			}
			setClientes(clientesData);

			// Ventas del día
			const ventasData = (v.status === 'fulfilled') ? (v.value.data || []) : [];
			setVentasHoy(ventasData);
		});
		// productos: para esta demo, se toma del endpoint paginado si existe
		api.get('/productos/all')
			.then((r) => {
				const list = r.data || [];
				setProductos(Array.isArray(list) ? list : []);
			})
			.catch(() => setProductos([]));
	}, []);

	const addItem = async () => {
		setError('');
		if (!clienteId) {
			setError('Selecciona un cliente. Es obligatorio.');
			return;
		}
		if (!itemId || cantidad <= 0) {
			setError('Selecciona un producto y una cantidad válida.');
			return;
		}
		const payload = {
			cliente_id: Number(clienteId),
			items: [{ tipo: 'producto', id: Number(itemId), cantidad: Number(cantidad) }],
			descuento: 0,
		};
		try {
			const { data } = await api.post('/ventas', payload);
			setItemId('');
			setCantidad(1);
			const v = await api.get('/ventas/hoy');
			setVentasHoy(v.data || []);
			alert('Venta registrada. Total: Bs ' + Number(data.total).toFixed(2));
		} catch (e) {
			setError(e?.response?.data?.message || 'No se pudo registrar la venta.');
		}
	};

	return (
		<div className="p-2 md:p-4">
			<h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-5">Ventas</h1>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-4">
					<h2 className="font-semibold text-gray-800 mb-3">Nueva Venta</h2>
					<div className="mb-4">
						<label className="block text-sm text-gray-600 mb-1">Cliente</label>
						<select className="w-full border rounded-lg px-3 py-2" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
							<option value="">Selecciona un cliente</option>
							{clientes.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
						</select>
					</div>
					<div className="bg-gray-50 rounded-lg p-3 mb-3">
						<p className="font-medium text-gray-800 mb-2">Agregar Producto</p>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
							<div>
								<label className="block text-sm text-gray-600 mb-1">Seleccionar Producto</label>
								<select className="w-full border rounded-lg px-3 py-2" value={itemId} onChange={(e) => setItemId(e.target.value)}>
									<option value="">Selecciona...</option>
									{productos.map((p) => (
										<option key={p.id} value={p.id}>
											{p.nombre} - Bs {Number(p.precio_venta || 0).toFixed(0)}
										</option>
									))}
								</select>
								{productos.length === 0 && (
									<p className="text-xs text-amber-600 mt-1">No hay productos cargados.</p>
								)}
							</div>
							<div className="flex gap-2">
								<div className="flex-1">
									<label className="block text-sm text-gray-600 mb-1">Cantidad</label>
									<input type="number" min="1" className="w-full border rounded-lg px-3 py-2" value={cantidad} onChange={(e) => setCantidad(Number(e.target.value))} />
								</div>
								<button className="self-end px-4 py-2 rounded-lg bg-primary text-white" onClick={addItem}>+ Agregar</button>
							</div>
						</div>
					</div>
					{error && <p className="text-sm text-red-600 mt-2">{error}</p>}
				</div>

				<div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-4">
					<h2 className="font-semibold text-gray-800 mb-3">Ventas del Día</h2>
					<div className="overflow-hidden rounded-lg ring-1 ring-gray-200">
						<table className="min-w-full">
							<thead className="bg-gray-50 text-left text-gray-600">
								<tr className="text-sm">
									<th className="px-4 py-2">ID</th>
									<th className="px-4 py-2">Cliente</th>
									<th className="px-4 py-2">Total</th>
									<th className="px-4 py-2">Estado</th>
								</tr>
							</thead>
							<tbody className="text-sm">
								{ventasHoy.map((v) => (
									<tr key={v.id} className="border-t">
										<td className="px-4 py-2">{v.id}</td>
										<td className="px-4 py-2">{v.cliente}</td>
										<td className="px-4 py-2">Bs {Number(v.total).toFixed(2)}</td>
										<td className="px-4 py-2">
											<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-900 text-white">
												{v.estado === 'pagado' ? 'Completado' : v.estado}
											</span>
										</td>
									</tr>
								))}
								{ventasHoy.length === 0 && <tr><td className="px-4 py-3" colSpan={4}>Sin ventas</td></tr>}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
}

