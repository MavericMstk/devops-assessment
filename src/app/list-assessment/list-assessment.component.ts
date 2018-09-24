import { Component, OnInit } from '@angular/core';
import { AssessmentService } from '../shared/services/assessment.service';
import { AssessmentList } from 'src/app/shared/interfaces/assessment';

@Component({
  selector: 'app-list-assessment',
  templateUrl: './list-assessment.component.html',
  styleUrls: ['./list-assessment.component.css']
})
export class ListAssessmentComponent implements OnInit {

  assessments: AssessmentList[] = [];

  constructor(private srvAssessment: AssessmentService) { }

  ngOnInit() {
    this.srvAssessment.getAssessments().subscribe((assessments: AssessmentList[]) => {
      this.assessments = assessments;
    });
  }

}
