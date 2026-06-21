import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepartidorHome } from './repartidor-home';

describe('RepartidorHome', () => {
  let component: RepartidorHome;
  let fixture: ComponentFixture<RepartidorHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepartidorHome],
    }).compileComponents();

    fixture = TestBed.createComponent(RepartidorHome);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
