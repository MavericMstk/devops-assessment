import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedModule } from '../shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule} from '@angular/router/testing';
import { MockAssessmentService } from '../stub/MockAssessmentService';
import { ExportAssessmentComponent } from './export-assessment.component';

describe('ExportAssessmentComponent', () => {
  let comp: ExportAssessmentComponent;
  let fixture: ComponentFixture<ExportAssessmentComponent>;

  beforeEach(async(() => {

    // const stubAssessmentService = new MockAssessmentService({});

    TestBed.configureTestingModule({
      declarations: [ ExportAssessmentComponent ],
      providers: [
        { provide: MockAssessmentService },
      ],
      imports: [SharedModule, HttpClientModule, RouterTestingModule],
    })
    .compileComponents();

    // fixture = TestBed.createComponent(ListAssessmentComponent);
    // comp = fixture.componentInstance;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportAssessmentComponent);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(comp).toBeTruthy();
  });
});
