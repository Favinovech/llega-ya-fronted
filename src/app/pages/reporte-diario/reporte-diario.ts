import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReporteService, ReporteDiario } from '../../services/reporte.service';

@Component({
  selector: 'app-reporte-diario',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './reporte-diario.html',
  styleUrl: './reporte-diario.scss'
})
export class ReporteDiarioPage implements OnInit {
  reporte: ReporteDiario | null = null;
  cargando = true;
  errorMsg = '';
  fecha = new Date().toISOString().slice(0, 10);

  constructor(private reporteSvc: ReporteService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarReporte();
  }

  cargarReporte() {
    this.cargando = true;
    this.errorMsg = '';
    this.reporteSvc.diario(this.fecha).subscribe({
      next: (data) => {
        this.reporte = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMsg = 'No se pudo cargar el reporte del día seleccionado.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }
}
