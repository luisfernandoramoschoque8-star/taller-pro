<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClienteController;
use App\Http\Controllers\ServicioController;
use App\Http\Controllers\OrdenServicioController;
use App\Http\Controllers\VentaController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\InventarioController;
use App\Http\Controllers\CajaController;
use App\Http\Controllers\ReporteController;
use App\Http\Controllers\DashboardController;

Route::prefix('auth')->group(function () {
	Route::post('login', [AuthController::class, 'login']);
});

Route::middleware(['auth:sanctum'])->group(function () {
	Route::get('me', [AuthController::class, 'me']);
	Route::post('logout', [AuthController::class, 'logout']);
	Route::get('dashboard', [DashboardController::class, 'index']);

	// Clientes - Admin y Empleado
	Route::middleware('rol:admin,empleado')->group(function () {
		Route::get('clientes', [ClienteController::class, 'index']);
		Route::post('clientes', [ClienteController::class, 'store']);
		Route::get('clientes/{cliente}', [ClienteController::class, 'show']);
		Route::put('clientes/{cliente}', [ClienteController::class, 'update']);
		Route::delete('clientes/{cliente}', [ClienteController::class, 'destroy']);
		Route::post('clientes/{cliente}/toggle', [ClienteController::class, 'toggle']);
	});

	// Servicios
	// Admin: gestión total; Empleado: solo index/show
	Route::get('servicios', [ServicioController::class, 'index'])->middleware('rol:admin,empleado');
	Route::get('servicios/{servicio}', [ServicioController::class, 'show'])->middleware('rol:admin,empleado');
	Route::post('servicios', [ServicioController::class, 'store'])->middleware('rol:admin');
	Route::put('servicios/{servicio}', [ServicioController::class, 'update'])->middleware('rol:admin');
	Route::post('servicios/{servicio}/toggle', [ServicioController::class, 'toggle'])->middleware('rol:admin');
	Route::delete('servicios/{servicio}', [ServicioController::class, 'destroy'])->middleware('rol:admin');

	// Órdenes de Servicio - listado y KPIs (Admin y Empleado)
	Route::middleware('rol:admin,empleado')->group(function () {
		Route::get('ordenes-servicio/resumen', [OrdenServicioController::class, 'resumen']);
		Route::get('ordenes-servicio', [OrdenServicioController::class, 'index']);
		Route::post('ordenes-servicio', [OrdenServicioController::class, 'store']);

		// listas auxiliares
		Route::get('clientes/all', [ClienteController::class, 'all']);
		Route::get('servicios/all', [ServicioController::class, 'all']);
		Route::get('productos/all', [ProductoController::class, 'all']);
		Route::get('productos', [ProductoController::class, 'index']);

		// Ventas
		Route::get('ventas/hoy', [VentaController::class, 'index']);
		Route::post('ventas', [VentaController::class, 'store']);
		Route::post('ventas/{venta}/anular', [VentaController::class, 'anular']);
	});

	// Inventario (Admin + Almacenero)
	Route::middleware('rol:admin,almacenero')->group(function () {
		Route::get('inventario', [InventarioController::class, 'index']);
		Route::get('inventario/categorias', [InventarioController::class, 'categorias']);
		Route::post('inventario/productos', [InventarioController::class, 'storeProducto']);
		Route::post('inventario/productos/{producto}/aumentar-stock', [InventarioController::class, 'aumentarStock']);
	});

	// Caja (solo Admin)
	Route::middleware('rol:admin')->group(function () {
		Route::get('caja/estado', [CajaController::class, 'estado']);
		Route::post('caja/abrir', [CajaController::class, 'abrir']);
		Route::post('caja/cerrar', [CajaController::class, 'cerrar']);
	});

	// Reportes (Admin todo, Almacenero puede ver stock/reportes)
	Route::middleware('rol:admin,almacenero')->group(function () {
		Route::get('reportes/resumen', [ReporteController::class, 'resumen']);
	});
});

