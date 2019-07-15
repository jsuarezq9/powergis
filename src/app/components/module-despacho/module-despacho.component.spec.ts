import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuleDespachoComponent } from './module-despacho.component';

describe('ModuleDespachoComponent', () => {
  let component: ModuleDespachoComponent;
  let fixture: ComponentFixture<ModuleDespachoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModuleDespachoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModuleDespachoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
