import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedModule } from '../shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule} from '@angular/router/testing';
import { MockAssessmentService } from '../stub/MockAssessmentService';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let comp: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async(() => {

    // const stubAssessmentService = new MockAssessmentService({});

    TestBed.configureTestingModule({
      declarations: [ DashboardComponent ],
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
    fixture = TestBed.createComponent(DashboardComponent);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(comp).toBeTruthy();
  });
});
