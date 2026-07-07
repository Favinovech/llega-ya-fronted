import { Component, OnInit, DestroyRef, inject, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { timeout, retry } from 'rxjs';
import { PagoService, PagoDistribucion } from '../../services/pago.service';

@Component({
  selector: 'app-pagos-comisiones',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './pagos-comisiones.html',
  styleUrl: './pagos-comisiones.scss'
})
export class PagosComisiones implements OnInit {
  private destroyRef = inject(DestroyRef);
  pagos: PagoDistribucion[] = [];
  cargando = true;
  errorMsg = '';

  desde = '';
  hasta = '';

  constructor(private pagoSvc: PagoService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarPagos();
  }

  cargarPagos() {
    this.cargando = true;
    this.errorMsg = '';
    this.pagoSvc.listar(this.desde || undefined, this.hasta || undefined).pipe(
      timeout(20000),
      retry({ count: 2, delay: 1500 }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (data) => {
        this.pagos = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMsg = 'No se pudieron cargar los pagos.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  aplicarFiltros() {
    if (this.desde && this.hasta && this.desde > this.hasta) {
      this.errorMsg = 'La fecha "desde" no puede ser posterior a "hasta".';
      return;
    }
    this.cargarPagos();
  }

  limpiarFiltros() {
    this.desde = '';
    this.hasta = '';
    this.cargarPagos();
  }

  get totalDistribuido(): number {
    return this.pagos.reduce((acc, p) => acc + Number(p.monto_total), 0);
  }

  get totalComision(): number {
    return this.pagos.reduce((acc, p) => acc + Number(p.comision_plataforma), 0);
  }

  exportarCsv() {
    if (!this.pagos.length) return;

    const encabezados = [
      'ID', 'Pedido', 'Fecha', 'Método', 'Negocio', 'Repartidor',
      'Monto total', 'Comisión plataforma', 'Monto comercio', 'Monto repartidor'
    ];
    const filas = this.pagos.map(p => [
      p.id, p.pedido, p.fecha, p.metodo,
      p.negocio_nombre ?? '', p.repartidor_nombre ?? '',
      p.monto_total, p.comision_plataforma, p.monto_comercio, p.monto_repartidor
    ]);
    const csv = [encabezados, ...filas]
      .map(fila => fila.map(valor => `"${String(valor).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    // BOM al inicio para que Excel detecte UTF-8 correctamente.
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pagos-comisiones_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
