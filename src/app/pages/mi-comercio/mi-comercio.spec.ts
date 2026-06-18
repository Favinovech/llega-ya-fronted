import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiComercio } from './mi-comercio';

describe('MiComercio', () => {
  let component: MiComercio;
  let fixture: ComponentFixture<MiComercio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiComercio],
    }).compileComponents();

    fixture = TestBed.createComponent(MiComercio);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
