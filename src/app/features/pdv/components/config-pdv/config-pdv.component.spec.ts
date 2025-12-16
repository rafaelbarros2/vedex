import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigPdvComponent } from './config-pdv.component';

describe('ConfigPdvComponent', () => {
  let component: ConfigPdvComponent;
  let fixture: ComponentFixture<ConfigPdvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigPdvComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigPdvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
