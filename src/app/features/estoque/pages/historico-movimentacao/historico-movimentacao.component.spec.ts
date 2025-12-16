import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoricoMovimentacaoComponent } from './historico-movimentacao.component';

describe('HistoricoMovimentacaoComponent', () => {
  let component: HistoricoMovimentacaoComponent;
  let fixture: ComponentFixture<HistoricoMovimentacaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoricoMovimentacaoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoricoMovimentacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
