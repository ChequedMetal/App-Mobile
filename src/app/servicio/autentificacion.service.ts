import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { arrayUnion } from 'firebase/firestore';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: { uid: string; [key: string]: any } | null = null;
  private currentUserSubject = new BehaviorSubject<any>(null); // BehaviorSubject para el estado del usuario
  public defaultProfileImageUrl: string = 'https://firebasestorage.googleapis.com/v0/b/appasistencia-f0092.appspot.com/o/generica2.png?alt=media&token=b7f37f30-9267-4df5-ae3b-1d6b57fdb979';

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router
  ) {
    const userData = localStorage.getItem('user');
    this.currentUser = userData ? JSON.parse(userData) : null;
    this.currentUserSubject.next(this.currentUser);

    // Escuchar cambios de estado de autenticación
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.currentUser = user;
        localStorage.setItem('user', JSON.stringify(this.currentUser));
        this.currentUserSubject.next(this.currentUser); // Emitir nuevo estado cuando el usuario cambie
      } else {
        this.currentUser = null;
        localStorage.removeItem('user');
        this.currentUserSubject.next(null); // Emitir null si no hay usuario autenticado
      }
    });
  }

  // Getter para obtener el usuario actual como un observable
  get usuarioActual(): Observable<any> {
    return this.currentUserSubject.asObservable(); // Devuelve el observable del usuario para suscripción
  }

  // Verifica si el usuario está autenticado
  isAuthenticated(): boolean {
    return this.currentUser !== null || localStorage.getItem('user') !== null;
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
        this.currentUserSubject.next(this.currentUser); // Emitir estado del usuario autenticado
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
  
        // Usar la imagen por defecto si no se proporciona una personalizada
        const newUser = {
          email,
          img: extraData.img || this.defaultProfileImageUrl, // Usa la imagen por defecto si no se proporciona
          qrCode: email,
          attendance: extraData.attendance || [{
            clase: "",
            fecha: new Date(),
            email: email,
            img: extraData.img || this.defaultProfileImageUrl // Imagen predeterminada en el registro de asistencia
          }]
        };
  
        await this.firestore.collection('users').doc(uid).set(newUser);
  
        this.currentUser = { uid, ...newUser };
        localStorage.setItem('user', JSON.stringify(this.currentUser));
        this.currentUserSubject.next(this.currentUser); // Emitir estado del nuevo usuario registrado
        return true;
      } else {
        throw new Error('Error al crear el usuario.');
      }
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      throw error;
    }
  }

  // Recupera el usuario autenticado desde memoria o localStorage
  obtenerUsuarioAutenticado() {
    if (!this.currentUser) {
      const userData = localStorage.getItem('user');
      this.currentUser = userData ? JSON.parse(userData) : null;
      this.currentUserSubject.next(this.currentUser); // Emitir estado del usuario al obtenerlo
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
      const userDoc = await this.firestore.collection('users').doc(this.currentUser.uid).get().toPromise();
      const userData = userDoc?.data() as { qrRecords?: Array<{ seccion: string; code: string; fecha: string; asistencia: boolean }> } || {};
      const qrRecords = userData.qrRecords ?? [];
  
      const existeRegistro = qrRecords.some((record) => 
        record.seccion === seccion && record.code === code && record.fecha === fecha
      );
  
      if (existeRegistro) {
        console.log('Este registro ya existe. No se guardarán datos duplicados.');
        alert('Ya has registrado esta asistencia.');
      } else {
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
      return userData.qrRecords || [];
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
    this.currentUserSubject.next(null); // Emitir null para reflejar el deslogueo
    this.router.navigate(['/home']);
  }

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
