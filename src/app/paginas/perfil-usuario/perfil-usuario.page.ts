import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, AnimationController, Animation } from '@ionic/angular';
import { AuthService } from 'src/app/servicio/autentificacion.service';

@Component({
  selector: 'app-perfil-usuario',
  templateUrl: './perfil-usuario.page.html',
  styleUrls: ['./perfil-usuario.page.scss'],
})
export class PerfilUsuarioPage {
  @ViewChild('container', { static: true }) container!: ElementRef;

  usuario: any;
  imagenPerfil: string = 'assets/imagenes/default-profile.png';

  constructor(
    private navCtrl: NavController,
    private authService: AuthService,
    private animationCtrl: AnimationController
  ) {}

  
  ionViewWillEnter() {
    this.cargarUsuario(); 
  }

  cargarUsuario() {
    
    this.usuario = this.authService.obtenerUsuarioAutenticado();
    if (this.usuario) {
      
      this.imagenPerfil = this.usuario.img || this.authService.defaultProfileImageUrl;
      console.log('URL de imagen de perfil:', this.imagenPerfil); 
    } else {
      console.warn('No se encontró el usuario autenticado.');
      this.imagenPerfil = 'assets/imagenes/default-profile.png';
    }
  }

  
  verAsistencia() { this.playTransitionAnimation(() => this.navCtrl.navigateForward('/ver-asistencia', { animated: false })); }
  Registrar() { this.playTransitionAnimation(() => this.navCtrl.navigateForward('/escanear-qr', { animated: false })); }
  cerrarSesion() { this.playTransitionAnimation(() => { this.authService.cerrarSesion(); this.navCtrl.navigateRoot('/login', { animated: false }); }); }

  playTransitionAnimation(callback: () => void) {
    if (!this.container) { callback(); return; }
    const animation: Animation = this.animationCtrl.create()
      .addElement(this.container.nativeElement)
      .duration(500)
      .easing('ease-in-out')
      .keyframes([{ offset: 0, opacity: '1', transform: 'translateX(0)' }, { offset: 1, opacity: '0', transform: 'translateX(-100%)' }]);
    animation.play().then(() => callback()).catch(error => { console.error('Error en la animación:', error); callback(); });
  }

  volver() {
    this.navCtrl.back();
  }
}
