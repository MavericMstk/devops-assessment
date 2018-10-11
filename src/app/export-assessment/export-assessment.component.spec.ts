import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportAssessmentComponent } from './export-assessment.component';

describe('ExportAssessmentComponent', () => {
  let component: ExportAssessmentComponent;
  let fixture: ComponentFixture<ExportAssessmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportAssessmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
