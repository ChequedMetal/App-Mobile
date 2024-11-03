import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/servicio/autentificacion.service';
import QrScanner from 'qr-scanner';

@Component({
  selector: 'app-escanear-qr',
  templateUrl: './escanear-qr.page.html',
  styleUrls: ['./escanear-qr.page.scss'],
})
export class EscanearQrPage implements OnInit {
  qrUsuario: string | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit() {}

  //Con esta se debería escanear el qr, me avisai si te funcionó
  async startScan() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = async (event: any) => {
      const file = event.target.files[0];
      if (file) {
        try {
          
          const resultado = await QrScanner.scanImage(file);
          if (resultado) {
            this.qrUsuario = resultado; 

            
            try {
              const qrData = JSON.parse(resultado);
              const { seccion, code, fecha, asistencia } = qrData;

              if (seccion && code && fecha && typeof asistencia === "boolean") {
                await this.authService.registrarDatosQR(seccion, code, fecha, asistencia);
                console.log('Datos del QR registrados con éxito');
                alert('Datos registrados exitosamente');
              } else {
                console.error('El contenido del QR no contiene los datos esperados');
                alert('El QR no contiene los datos necesarios.');
              }
            } catch (e) {
              console.warn('El QR no contiene datos JSON válidos, pero se ha leído con éxito.');
            }
          }
        } catch (error) {
          console.error('Error al procesar la imagen o el contenido no es válido:', error);
          alert('Error al procesar el QR. Verifica el contenido.');
        }
      }
    };
    fileInput.click(); 
  }
}
