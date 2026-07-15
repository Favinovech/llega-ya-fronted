import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PrediccionService, PrediccionDemanda, PuntoDemanda } from '../../services/prediccion.service';

interface PuntoChart extends PuntoDemanda {
  x: number;
  y: number;
  esPrediccion: boolean;
}

@Component({
  selector: 'app-prediccion-demanda',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './prediccion-demanda.html',
  styleUrl: './prediccion-demanda.scss'
})
export class PrediccionDemandaPage implements OnInit {
  datos: PrediccionDemanda | null = null;
  cargando = true;
  errorMsg = '';

  diasHistorico  = 14;
  diasPrediccion = 7;

  mostrarTabla = false;
  hoverPunto: PuntoChart | null = null;

  private readonly chartW = 600;
  private readonly chartH = 220;
  private readonly chartPad = 30;

  constructor(private prediccionSvc: PrediccionService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarPrediccion();
  }

  cargarPrediccion() {
    this.cargando = true;
    this.errorMsg = '';
    this.prediccionSvc.obtener(this.diasHistorico, this.diasPrediccion).subscribe({
      next: (data) => {
        this.datos = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMsg = 'No se pudo cargar la predicción de demanda.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleTabla() {
    this.mostrarTabla = !this.mostrarTabla;
  }

  // ── Geometría del gráfico ─────────────────────────

  private get puntosCombinados(): PuntoDemanda[] {
    const historico  = this.datos?.historico ?? [];
    const prediccion = this.datos?.prediccion ?? [];
    return [...historico, ...prediccion];
  }

  get maxPedidos(): number {
    return Math.max(1, ...this.puntosCombinados.map(p => p.pedidos));
  }

  private xEn(i: number, total: number): number {
    if (total <= 1) return this.chartW / 2;
    return this.chartPad + i * ((this.chartW - 2 * this.chartPad) / (total - 1));
  }

  private yEn(valor: number): number {
    const max = this.maxPedidos;
    return this.chartH - this.chartPad - (max > 0 ? (valor / max) * (this.chartH - 2 * this.chartPad) : 0);
  }

  get totalPuntos(): number {
    return this.puntosCombinados.length;
  }

  get puntosHistoricoChart(): PuntoChart[] {
    const historico = this.datos?.historico ?? [];
    return historico.map((p, i) => ({
      ...p, esPrediccion: false,
      x: this.xEn(i, this.totalPuntos), y: this.yEn(p.pedidos)
    }));
  }

  get puntosPrediccionChart(): PuntoChart[] {
    const historico  = this.datos?.historico ?? [];
    const prediccion = this.datos?.prediccion ?? [];
    if (!prediccion.length) return [];
    // Empieza en el último punto histórico para que la línea de predicción
    // quede visualmente conectada a la línea histórica.
    const offset = Math.max(0, historico.length - 1);
    const puntos = historico.length ? [historico[historico.length - 1], ...prediccion] : prediccion;
    return puntos.map((p, i) => ({
      ...p, esPrediccion: true,
      x: this.xEn(offset + i, this.totalPuntos), y: this.yEn(p.pedidos)
    }));
  }

  get lineaHistoricoPath(): string {
    return this.puntosHistoricoChart.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  }

  get lineaPrediccionPath(): string {
    return this.puntosPrediccionChart.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  }

  get xLineaHoy(): number {
    const historico = this.datos?.historico ?? [];
    return this.xEn(Math.max(0, historico.length - 1), this.totalPuntos);
  }

  mostrarTooltip(p: PuntoChart) {
    this.hoverPunto = p;
  }

  ocultarTooltip() {
    this.hoverPunto = null;
  }
}
