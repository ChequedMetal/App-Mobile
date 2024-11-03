import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PassRecoveryPage } from './pass-recovery.page';

describe('PassRecoveryPage', () => {
  let component: PassRecoveryPage;
  let fixture: ComponentFixture<PassRecoveryPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PassRecoveryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
