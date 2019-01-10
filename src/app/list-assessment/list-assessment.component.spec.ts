import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListAssessmentComponent } from './list-assessment.component';
import { SharedModule } from '../shared/shared.module';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule} from '@angular/router/testing';
import { MockAssessmentService } from '../stub/MockAssessmentService';
import { FormGroup, FormArray, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { Component } from '@angular/core';

describe('ListAssessmentComponent', () => {
  let comp: ListAssessmentComponent;
  let fixture: ComponentFixture<ListAssessmentComponent>;

  beforeEach(async(() => {

    // const stubAssessmentService = new MockAssessmentService({});

    TestBed.configureTestingModule({
      declarations: [ ListAssessmentComponent ],
      providers: [
        { provide: MockAssessmentService },
      ],
      imports: [SharedModule, HttpClientModule, RouterTestingModule, BrowserModule, FormsModule, ReactiveFormsModule]
    })
    .compileComponents();

    // fixture = TestBed.createComponent(ListAssessmentComponent);
    // comp = fixture.componentInstance;
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListAssessmentComponent);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(comp).toBeTruthy();
  });
});
