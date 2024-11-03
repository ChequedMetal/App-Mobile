import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',  // Puedes ajustar esta redirección según el estado de autenticación
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule),
    // Puedes añadir AuthGuard aquí si deseas proteger también la página principal
  },
  {
    path: 'login',
    loadChildren: () => import('./paginas/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./paginas/register/register.module').then(m => m.RegisterPageModule)
  },
  {
    path: 'perfil-usuario',
    loadChildren: () => import('./paginas/perfil-usuario/perfil-usuario.module').then(m => m.PerfilUsuarioPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'ver-asistencia',
    loadChildren: () => import('./paginas/ver-asistencia/ver-asistencia.module').then(m => m.VerAsistenciaPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'escanear-qr',
    loadChildren: () => import('./paginas/escanear-qr/escanear-qr.module').then(m => m.EscanearQrPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'editar-perfil',
    loadChildren: () => import('./paginas/editar-perfil/editar-perfil.module').then(m => m.EditarPerfilPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'pass-recovery',
    loadChildren: () => import('./paginas/pass-recovery/pass-recovery.module').then(m => m.PassRecoveryPageModule)
  },
  {
    path: '**',
    redirectTo: 'home' // Redirección predeterminada para rutas no válidas
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
