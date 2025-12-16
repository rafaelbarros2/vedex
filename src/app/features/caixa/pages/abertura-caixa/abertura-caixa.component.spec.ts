import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AberturaCaixaComponent } from './abertura-caixa.component';

describe('AberturaCaixaComponent', () => {
  let component: AberturaCaixaComponent;
  let fixture: ComponentFixture<AberturaCaixaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AberturaCaixaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AberturaCaixaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
