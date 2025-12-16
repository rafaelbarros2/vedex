import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardCaixaComponent } from './dashboard-caixa.component';

describe('DashboardCaixaComponent', () => {
  let component: DashboardCaixaComponent;
  let fixture: ComponentFixture<DashboardCaixaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardCaixaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardCaixaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
