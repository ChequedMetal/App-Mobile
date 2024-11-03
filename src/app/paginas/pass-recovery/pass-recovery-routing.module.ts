import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PassRecoveryPage } from './pass-recovery.page';

const routes: Routes = [
  {
    path: '',
    component: PassRecoveryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PassRecoveryPageRoutingModule {}
