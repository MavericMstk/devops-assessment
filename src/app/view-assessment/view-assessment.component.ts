import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AssessmentService } from '../shared/services/assessment.service';
import { Assessment } from '../shared/interfaces/assessment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-view-assessment',
  templateUrl: './view-assessment.component.html',
  styleUrls: ['./view-assessment.component.css']
})
export class ViewAssessmentComponent implements OnInit, OnDestroy {

  assessmentToken: string;
  assessmentData: Assessment;

  subAssDetails: Subscription;

  constructor(private route: ActivatedRoute, private router: Router, private srvAssessment: AssessmentService) { }

  ngOnInit() {
    const assessmentToken = this.route.snapshot.paramMap.get('assessmentToken');
    if (assessmentToken) {
      this.assessmentToken = assessmentToken;

      this.subAssDetails = this.srvAssessment.getAssessmentDetails(this.assessmentToken)
      .subscribe(assessmentDetails => {
          // this.parseAssessment(assessmentDetails);
          this.assessmentData = this.srvAssessment.assessmentDetails.getValue();
      });

    } else {
      this.router.navigate(['/']);
    }
  }

  ngOnDestroy() {
    this.subAssDetails.unsubscribe();
    this.srvAssessment.assessmentDetails.next(null);
  }

}
