import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService, ToastMessage } from '../../services/toast';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.scss'
})
export class ToastComponent implements OnInit, OnDestroy {
  mensaje: ToastMessage | null = null;
  private suscripcion!: Subscription;

  constructor(
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Nos conectamos al "canal de radio" apenas cargue el componente
    this.suscripcion = this.toastService.toastAccion.subscribe((msg) => {
      this.mensaje = msg;
      this.cdr.detectChanges();

      // Lo ocultamos automáticamente después de 3 segundos
      setTimeout(() => {
        this.mensaje = null;
        this.cdr.detectChanges();
      }, 3000);
    });
  }

  ngOnDestroy() {
    // Buena práctica: desconectarnos de la radio si el componente se destruye
    if (this.suscripcion) {
      this.suscripcion.unsubscribe();
    }
  }
}