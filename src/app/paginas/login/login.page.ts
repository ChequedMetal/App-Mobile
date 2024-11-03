import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/servicio/autentificacion.service'; 

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  email: string = '';
  password: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  async onLogin() {
    try {
      const confirmacion = await this.authService.iniciarSesion(this.email, this.password);
      if (confirmacion) {
        this.router.navigate(['/perfil-usuario']);
      } else {
        alert('Credenciales incorrectas, por favor intenta de nuevo.');
      }
    } catch (error: any) {
      alert(error.message);
      console.error('Error al intentar iniciar sesión:', error);
    }
  }
}
