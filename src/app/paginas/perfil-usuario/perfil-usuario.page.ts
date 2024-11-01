import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, AnimationController, Animation } from '@ionic/angular'; // Importa AnimationController y Animation
import { AuthService } from 'src/app/servicio/autentificacion.service';

@Component({
  selector: 'app-perfil-usuario',
  templateUrl: './perfil-usuario.page.html',
  styleUrls: ['./perfil-usuario.page.scss'],
})
export class PerfilUsuarioPage {
  @ViewChild('container', { static: true }) container!: ElementRef; // Referencia al contenedor de la página

  usuario: any; 
  imagenPerfil: string = ''; 

  constructor(
    private navCtrl: NavController,
    private authService: AuthService,
    private animationCtrl: AnimationController // Injecta AnimationController
  ) {}

  ngOnInit() {
    this.cargarUsuario(); 
  }

  cargarUsuario() {
    this.usuario = this.authService.obtenerUsuarioAutenticado();
    if (this.usuario) {
      this.imagenPerfil = this.usuario.img || 'assets/imagenes/default-profile.png'; 
    }
  }

  verAsistencia() {
    this.playTransitionAnimation(() => {
      this.navCtrl.navigateForward('/ver-asistencia', { animated: false }); // Navega sin la animación predeterminada
    });
  }

  Registrar() {
    this.playTransitionAnimation(() => {
      this.navCtrl.navigateForward('/escanear-qr', { animated: false }); // Navega sin la animación predeterminada
    });
  }

  cerrarSesion() {
    this.playTransitionAnimation(() => {
      this.authService.cerrarSesion();
      this.navCtrl.navigateRoot('/login', { animated: false }); // Navega sin la animación predeterminada
    });
  }

  // Método para reproducir la animación personalizada
  playTransitionAnimation(callback: () => void) {
    const animation: Animation = this.animationCtrl
      .create()
      .addElement(this.container.nativeElement) // Usa el contenedor de la página
      .duration(500) // Duración de la animación
      .easing('ease-in-out') // Curva de animación
      .keyframes([
        { offset: 0, opacity: '1', transform: 'translateX(0)' },
        { offset: 1, opacity: '0', transform: 'translateX(-100%)' },
      ]);

    animation.play().then(() => {
      callback(); // Ejecuta la función de navegación después de que termine la animación
    });
  }
  volver() {
    this.navCtrl.back(); // Utiliza NavController para regresar a la página anterior
  }
}
