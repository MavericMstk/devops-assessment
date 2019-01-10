import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedModule } from '../shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule} from '@angular/router/testing';
import { MockAssessmentService } from '../stub/MockAssessmentService';
import { ViewAssessmentComponent } from './view-assessment.component';
import { RecommendationComponent } from '../recommendation/recommendation.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('ViewAssessmentComponent', () => {
  let comp: ViewAssessmentComponent;
  let fixture: ComponentFixture<ViewAssessmentComponent>;

  beforeEach(async(() => {

    // const stubAssessmentService = new MockAssessmentService({});

    TestBed.configureTestingModule({
      declarations: [ ViewAssessmentComponent, RecommendationComponent ],
      providers: [
        { provide: MockAssessmentService },
      ],
      imports: [SharedModule, HttpClientModule, RouterTestingModule, ReactiveFormsModule],
    })
    .compileComponents();

    // fixture = TestBed.createComponent(ListAssessmentComponent);
    // comp = fixture.componentInstance;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAssessmentComponent);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(comp).toBeTruthy();
  });
});
