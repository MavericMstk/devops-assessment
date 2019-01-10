import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedModule } from '../shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule} from '@angular/router/testing';
import { MockAssessmentService } from '../stub/MockAssessmentService';
import { NewAssessmentComponent } from './new-assessment.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

describe('NewAssessmentComponent', () => {
  let comp: NewAssessmentComponent;
  let fixture: ComponentFixture<NewAssessmentComponent>;

  beforeEach(async(() => {

    // const stubAssessmentService = new MockAssessmentService({});

    TestBed.configureTestingModule({
      declarations: [ NewAssessmentComponent ],
      providers: [
        { provide: MockAssessmentService },
      ],
      imports: [SharedModule, HttpClientModule, RouterTestingModule, ReactiveFormsModule, BrowserModule],
    })
    .compileComponents();

    // fixture = TestBed.createComponent(ListAssessmentComponent);
    // comp = fixture.componentInstance;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewAssessmentComponent);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', (done) => {
  //   expect(comp).toBeTruthy();
  // });
});
