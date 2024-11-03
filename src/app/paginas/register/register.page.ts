import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/servicio/autentificacion.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  name: string = '';  

  constructor(private router: Router, private authService: AuthService) {}

  async onRegister() {  
    if (this.password !== this.confirmPassword) {
      alert('Las contraseñas no coinciden. Inténtalo de nuevo.');
      return;
    }

    try {
      // Intenta registrar al usuario con el nombre adicional
      const confirmacion = await this.authService.registrarUsuario(this.email, this.password, { name: this.name });
      if (confirmacion) {
        alert('Usuario registrado con éxito.');
        this.router.navigate(['/home']);
      }
    } catch (error: any) {
      alert(error.message);
      console.error('Error al intentar registrar:', error);
    }
  }
}
