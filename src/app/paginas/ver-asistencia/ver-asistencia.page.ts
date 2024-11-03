import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/servicio/autentificacion.service';

@Component({
  selector: 'app-ver-asistencia',
  templateUrl: './ver-asistencia.page.html',
  styleUrls: ['./ver-asistencia.page.scss'],
})
export class VerAsistenciaPage implements OnInit {
  asistencia: Array<{ seccion: string; code: string; fecha: string; asistencia: boolean }> = [];

  constructor(private authService: AuthService) {}

  async ngOnInit() {
    this.asistencia = await this.authService.obtenerAsistencia();
  }

  // Función para formatear la fecha de YYYYMMDD a una fecha legible
  formatearFecha(fecha: string): string {
    const año = parseInt(fecha.slice(0, 4), 10);
    const mes = parseInt(fecha.slice(4, 6), 10) - 1; 
    const día = parseInt(fecha.slice(6, 8), 10);
    
    const date = new Date(año, mes, día);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}
