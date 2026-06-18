import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComercioRegistro } from './comercio-registro';

describe('ComercioRegistro', () => {
  let component: ComercioRegistro;
  let fixture: ComponentFixture<ComercioRegistro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComercioRegistro],
    }).compileComponents();

    fixture = TestBed.createComponent(ComercioRegistro);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
