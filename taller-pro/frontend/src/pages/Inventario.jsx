import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function Inventario() {
	const [data, setData] = useState({ stock_bajo: 0, productos: [] });
	const [categorias, setCategorias] = useState([]);
	const [error, setError] = useState('');
	const [openAdd, setOpenAdd] = useState(false);
	const [openStock, setOpenStock] = useState(false);
	const [selected, setSelected] = useState(null);

	const [newForm, setNewForm] = useState({
		nombre: '', categoria_id: '', stock: '', stock_minimo: '', precio_venta: '', descripcion: '',
	});
	const [stockForm, setStockForm] = useState({ cantidad: '', motivo: '' });

	const load = async () => {
		setError('');
		try {
			const [inv, cats] = await Promise.all([api.get('/inventario'), api.get('/inventario/categorias')]);
			setData(inv.data);
			setCategorias(cats.data || []);
		} catch (e) {
			setError(e?.response?.data?.message || 'No se pudo cargar inventario');
		}
	};
	useEffect(() => { load(); }, []);

	const crearProducto = async (e) => {
		e.preventDefault();
		await api.post('/inventario/productos', {
			...newForm,
			categoria_id: newForm.categoria_id || null,
			stock: Number(newForm.stock || 0),
			stock_minimo: Number(newForm.stock_minimo || 0),
			precio_venta: Number(newForm.precio_venta || 0),
		});
		setOpenAdd(false);
		setNewForm({ nombre: '', categoria_id: '', stock: '', stock_minimo: '', precio_venta: '', descripcion: '' });
		load();
	};

	const abrirStock = (p) => {
		setSelected(p);
		setStockForm({ cantidad: '', motivo: '' });
		setOpenStock(true);
	};
	const aumentarStock = async (e) => {
		e.preventDefault();
		await api.post(`/inventario/productos/${selected.id}/aumentar-stock`, {
			cantidad: Number(stockForm.cantidad || 0),
			motivo: stockForm.motivo,
		});
		setOpenStock(false);
		load();
	};

	return (
		<div className="p-2 md:p-4">
			<div className="flex items-start justify-between mb-4">
				<div>
					<h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Inventario</h1>
					<p className="text-gray-500 mt-1">Gestión de productos y stock</p>
				</div>
				<button className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg shadow-sm" onClick={() => setOpenAdd(true)}>
					<span>+</span> Agregar Producto
				</button>
			</div>

			<div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
				Hay {data.stock_bajo} producto(s) con stock bajo
			</div>

			<div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-4">
				<h2 className="font-semibold text-3xl- text-gray-900 mb-3">Lista de Productos</h2>
				<div className="overflow-hidden rounded-lg ring-1 ring-gray-200">
					<table className="min-w-full">
						<thead className="bg-gray-50 text-left text-gray-600">
							<tr className="text-sm">
								<th className="px-4 py-3">Producto</th>
								<th className="px-4 py-3">Categoría</th>
								<th className="px-4 py-3">Stock Actual</th>
								<th className="px-4 py-3">Stock Mínimo</th>
								<th className="px-4 py-3">Precio Venta</th>
								<th className="px-4 py-3 text-right">Acciones</th>
							</tr>
						</thead>
						<tbody className="text-sm">
							{data.productos.map((p) => (
								<tr key={p.id} className="border-t hover:bg-gray-50">
									<td className="px-4 py-3">{p.nombre}</td>
									<td className="px-4 py-3">{p.categoria}</td>
									<td className="px-4 py-3">
										{p.stock}
										{p.bajo && <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-rose-600 text-white">Bajo</span>}
									</td>
									<td className="px-4 py-3">{p.stock_minimo}</td>
									<td className="px-4 py-3">Bs {Number(p.precio_venta).toFixed(2)}</td>
									<td className="px-4 py-3 text-right">
										<button className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50" onClick={() => abrirStock(p)}>Aumentar Stock</button>
									</td>
								</tr>
							))}
							{data.productos.length === 0 && <tr><td className="px-4 py-3" colSpan={6}>Sin productos</td></tr>}
						</tbody>
					</table>
				</div>
			</div>
			{error && <p className="mt-3 text-red-600 text-sm">{error}</p>}

			{openAdd && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25">
					<div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
						<div className="flex justify-between items-center mb-3">
							<h3 className="text-3xl- font-bold">Agregar Producto</h3>
							<button onClick={() => setOpenAdd(false)}>✕</button>
						</div>
						<form onSubmit={crearProducto} className="space-y-3">
							<input className="w-full border rounded-lg px-3 py-2" placeholder="Nombre del Producto" value={newForm.nombre} onChange={(e) => setNewForm({ ...newForm, nombre: e.target.value })} required />
							<select className="w-full border rounded-lg px-3 py-2" value={newForm.categoria_id} onChange={(e) => setNewForm({ ...newForm, categoria_id: e.target.value })}>
								<option value="">Selecciona categoría</option>
								{categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
							</select>
							<div className="grid grid-cols-2 gap-3">
								<input type="number" className="w-full border rounded-lg px-3 py-2" placeholder="Stock Actual" value={newForm.stock} onChange={(e) => setNewForm({ ...newForm, stock: e.target.value })} required />
								<input type="number" className="w-full border rounded-lg px-3 py-2" placeholder="Stock Mínimo" value={newForm.stock_minimo} onChange={(e) => setNewForm({ ...newForm, stock_minimo: e.target.value })} required />
							</div>
							<input type="number" step="0.01" className="w-full border rounded-lg px-3 py-2" placeholder="Precio de Venta (Bs)" value={newForm.precio_venta} onChange={(e) => setNewForm({ ...newForm, precio_venta: e.target.value })} required />
							<div className="flex justify-end gap-2 pt-2">
								<button type="button" className="px-4 py-2 rounded-lg border" onClick={() => setOpenAdd(false)}>Cancelar</button>
								<button className="px-4 py-2 rounded-lg bg-primary text-white">Agregar</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{openStock && selected && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25">
					<div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
						<div className="flex justify-between items-center mb-3">
							<h3 className="font-bold">Aumentar Stock</h3>
							<button onClick={() => setOpenStock(false)}>✕</button>
						</div>
						<p className="text-sm text-gray-600 mb-3">{selected.nombre}</p>
						<form onSubmit={aumentarStock} className="space-y-3">
							<input type="number" min="1" className="w-full border rounded-lg px-3 py-2" placeholder="Cantidad" value={stockForm.cantidad} onChange={(e) => setStockForm({ ...stockForm, cantidad: e.target.value })} required />
							<input className="w-full border rounded-lg px-3 py-2" placeholder="Motivo" value={stockForm.motivo} onChange={(e) => setStockForm({ ...stockForm, motivo: e.target.value })} required />
							<div className="flex justify-end gap-2 pt-1">
								<button type="button" className="px-4 py-2 rounded-lg border" onClick={() => setOpenStock(false)}>Cancelar</button>
								<button className="px-4 py-2 rounded-lg bg-primary text-white">Guardar</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}

