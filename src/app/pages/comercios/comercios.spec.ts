import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Comercios } from './comercios';

describe('Comercios', () => {
  let component: Comercios;
  let fixture: ComponentFixture<Comercios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Comercios],
    }).compileComponents();

    fixture = TestBed.createComponent(Comercios);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
