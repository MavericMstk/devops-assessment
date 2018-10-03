import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AssessmentService } from 'src/app/shared/services/assessment.service';
import { Subscription } from 'rxjs';
import { Assessment } from '../shared/interfaces/assessment';
import { FormBuilder, Validators, FormControl, FormArray, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-recommendation',
  templateUrl: './recommendation.component.html',
  styleUrls: ['./recommendation.component.css']
})
export class RecommendationComponent implements OnInit, OnDestroy {

  assessmentToken: string;
  assessmentData: Assessment;

  subAssDetails: Subscription;
  subSave: Subscription;

  formRecommendation: FormGroup;

  constructor(private route: ActivatedRoute, private router: Router, private srvAssessment: AssessmentService, private fb: FormBuilder) { }

  ngOnInit() {

    this.formRecommendation = this.fb.group({
      assessmentToken: [''],
      recommendations: this.fb.array([this.createRecommendation(), this.createRecommendation()]),
    });

    const assessmentToken = this.route.snapshot.paramMap.get('assessmentToken');
    if (assessmentToken) {
      this.assessmentToken = assessmentToken;
      this.formRecommendation.get('assessmentToken').setValue(assessmentToken);

      this.subAssDetails = this.srvAssessment.assessmentDetails.subscribe(assessmentDetails => {
        if (assessmentDetails) {

          this.assessmentData = assessmentDetails;

          if (this.assessmentData.recommendations.length) {
            const control = <FormArray>this.formRecommendation.controls['recommendations'];
            while (control.length !== 0) {
              control.removeAt(0);
            }
            this.assessmentData.recommendations.forEach(recommendation => {
              control.push(this.createRecommendation(recommendation.title, recommendation.description));
            });
          }
        }
      });

    } else {
      this.router.navigate(['/']);
    }
  }

  createRecommendation(title = '', description = ''): FormGroup {
    return this.fb.group({
      title: [title],
      description: [description]
    });
  }

  addRecommendation() {
    const control = <FormArray>this.formRecommendation.controls['recommendations'];
    control.push(this.createRecommendation());
  }

  removeRecommendation(index: number) {
    const control = <FormArray>this.formRecommendation.controls['recommendations'];
    control.removeAt(index);
  }

  saveRecommendations() {
    console.log(this.formRecommendation);
    const formData = this.formRecommendation.value;

    formData.recommendations = formData.recommendations.filter(recommedation => {
      return (recommedation.title || recommedation.description);
    });
    console.log(formData);

    this.subSave = this.srvAssessment.postRecommendations(formData).subscribe(response => {
      if (response.status === 'success') {
        alert('Recommendations saved successfully.');
      } else {
        alert('Error occured while saving recommendations.');
      }
    });
  }

  ngOnDestroy() {
    this.subAssDetails.unsubscribe();
    if (this.subSave) {
      this.subSave.unsubscribe();
    }
  }

}
