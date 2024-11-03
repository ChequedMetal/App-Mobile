import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PassRecoveryPageRoutingModule } from './pass-recovery-routing.module';

import { PassRecoveryPage } from './pass-recovery.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PassRecoveryPageRoutingModule
  ],
  declarations: [PassRecoveryPage]
})
export class PassRecoveryPageModule {}
