import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AssessmentService } from '../shared/services/assessment.service';
import { Assessment } from '../shared/interfaces/assessment';

@Component({
  selector: 'app-view-assessment',
  templateUrl: './view-assessment.component.html',
  styleUrls: ['./view-assessment.component.css']
})
export class ViewAssessmentComponent implements OnInit {

  assessmentToken: string;
  assessmentData: Assessment;

  constructor(private route: ActivatedRoute, private router: Router, private srvAssessment: AssessmentService) { }

  ngOnInit() {
    const assessmentToken = this.route.snapshot.paramMap.get('assessmentToken');
    if (assessmentToken) {
      this.assessmentToken = assessmentToken;

      this.srvAssessment.getAssessmentDetails(this.assessmentToken)
      .subscribe(assessmentDetails => {
          // this.parseAssessment(assessmentDetails);
          this.assessmentData = assessmentDetails;
      });

    } else {
      this.router.navigate(['/']);
    }
  }

}
