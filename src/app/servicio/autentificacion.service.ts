import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { arrayUnion } from 'firebase/firestore';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: { uid: string; [key: string]: any } | null = null;

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router
  ) {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.currentUser = user;
      } else {
        this.currentUser = null;
      }
    });
  }
  get usuarioActual() {
    return this.currentUser;
  }
  // Iniciar sesión con correo y contraseña
  async iniciarSesion(email: string, password: string): Promise<boolean> {
    try {
      const userCredential = await this.afAuth.signInWithEmailAndPassword(email, password);
      const uid = userCredential.user?.uid;

      if (!uid) {
        throw new Error('No se pudo obtener el UID del usuario.');
      }

      const userDoc = await this.firestore.collection('users').doc(uid).get().toPromise();

      if (userDoc && userDoc.exists) {
        const userData = userDoc.data();
        this.currentUser = { uid, ...(userData ? userData : {}) };
        localStorage.setItem('user', JSON.stringify(this.currentUser));
        return true;
      } else {
        throw new Error('No se encontró el usuario en Firestore.');
      }
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      throw new Error(this.getFirebaseErrorMessage(error));
    }
  }
  

  // Método para registrar un nuevo usuario con datos adicionales
  async registrarUsuario(email: string, password: string, extraData: any): Promise<boolean> {
    try {
      const userCredential = await this.afAuth.createUserWithEmailAndPassword(email, password);
      
      if (userCredential.user) {
        const uid = userCredential.user.uid;
  
        const newUser = {
          email,                     // Almacena el correo del usuario en Firestore
          img: extraData.img || '',  // Imagen opcional del usuario
          qrCode: email,             // Usar el correo como identificador para el código QR
          attendance: extraData.attendance || [{
            clase: "",               // Nombre de la clase inicial (puede estar vacío)
            fecha: new Date(),       // Fecha de registro actual
            email: email,            // Correo del usuario
            img: extraData.img || '' // Imagen del usuario, si está disponible
          }]
        };
  
        // Guardar en Firestore usando el UID como ID del documento
        await this.firestore.collection('users').doc(uid).set(newUser);
  
        // Actualizar el usuario actual y guardar en localStorage
        this.currentUser = { uid, ...newUser };
        localStorage.setItem('user', JSON.stringify(this.currentUser));
        
        return true;  // Registro exitoso
      } else {
        throw new Error('Error al crear el usuario.');
      }
    } catch (error) {
      // Asume que capturarás y manejarás el error de otra forma en la llamada a esta función
      console.error('Error al registrar usuario:', error);
      throw error;  // Dejar que el error se propague para que sea capturado externamente
    }
  }
  obtenerUsuarioAutenticado() {
    if (!this.currentUser) {
      const userData = localStorage.getItem('user');
      this.currentUser = userData ? JSON.parse(userData) : null;
    }
    return this.currentUser;
  }
  
  

  async registrarDatosQR(seccion: string, code: string, fecha: string, asistencia: boolean) {
    if (!this.currentUser) {
      console.warn('No hay usuario autenticado. Redirigiendo al login...');
      this.router.navigate(['/login']);
      return;
    }
    try {
      // Obtener los registros actuales de Firestore para este usuario
      const userDoc = await this.firestore.collection('users').doc(this.currentUser.uid).get().toPromise();
      const userData = userDoc?.data() as { qrRecords?: Array<{ seccion: string; code: string; fecha: string; asistencia: boolean }> } || {};
      const qrRecords = userData.qrRecords ?? [];
  
      // Verificar si ya existe un registro con los mismos datos
      const existeRegistro = qrRecords.some((record) => 
        record.seccion === seccion && record.code === code && record.fecha === fecha
      );
  
      if (existeRegistro) {
        console.log('Este registro ya existe. No se guardarán datos duplicados.');
        alert('Ya has registrado esta asistencia.');
      } else {
        // Si no existe, agregar el nuevo registro
        const qrRecord = { seccion, code, fecha, asistencia };
        await this.firestore.collection('users').doc(this.currentUser.uid).update({
          qrRecords: arrayUnion(qrRecord)
        });
        console.log('Datos del QR registrados en Firestore:', qrRecord);
        alert('Datos registrados exitosamente');
      }
    } catch (error) {
      console.error('Error al registrar los datos del QR en Firestore:', error);
    }
  }

  async obtenerAsistencia(): Promise<Array<{ seccion: string; code: string; fecha: string; asistencia: boolean }>> {
    if (!this.currentUser) {
      console.warn('No hay usuario autenticado. Redirigiendo al login...');
      this.router.navigate(['/login']);
      return [];
    }
  
    try {
      const userDoc = await this.firestore.collection('users').doc(this.currentUser.uid).get().toPromise();
      const userData = userDoc?.data() as { qrRecords?: Array<{ seccion: string; code: string; fecha: string; asistencia: boolean }> } || {};
      return userData.qrRecords || []; // Retorna los registros de asistencia o un array vacío si no hay registros
    } catch (error) {
      console.error('Error al obtener los datos de asistencia:', error);
      return [];
    }
  }  

  async enviarRecuperacionPassword(email: string): Promise<void> {
    try {
      await this.afAuth.sendPasswordResetEmail(email);
      console.log('Correo de recuperación enviado exitosamente');
    } catch (error) {
      console.error('Error al enviar el correo de recuperación:', error);
      throw new Error('No se pudo enviar el correo de recuperación. Verifica que el correo esté registrado.');
    }
  }

  // Cerrar sesión del usuario
  async cerrarSesion(): Promise<void> {
    await this.afAuth.signOut();
    this.currentUser = null;
    localStorage.removeItem('user');
    this.router.navigate(['/home']);
  }

  // Manejo de errores específicos de Firebase
  private getFirebaseErrorMessage(error: any): string {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'El correo electrónico ya está en uso. Prueba con otro.';
      case 'auth/invalid-email':
        return 'El correo electrónico no es válido.';
      case 'auth/weak-password':
        return 'La contraseña es muy débil. Prueba con una más segura.';
      case 'auth/user-not-found':
        return 'El usuario no existe. Verifica tus datos.';
      case 'auth/wrong-password':
        return 'La contraseña es incorrecta. Inténtalo de nuevo.';
      default:
        return 'Ocurrió un error. Inténtalo de nuevo.';
    }
  }
}
