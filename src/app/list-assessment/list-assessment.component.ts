import { Component, OnInit } from '@angular/core';
import { AssessmentService } from '../shared/services/assessment.service';
import { AssessmentList } from 'src/app/shared/interfaces/assessment';

@Component({
  selector: 'app-list-assessment',
  templateUrl: './list-assessment.component.html',
  styleUrls: ['./list-assessment.component.css']
})
export class ListAssessmentComponent implements OnInit {

  page = 1;
  pageSize = 5;
  pointer = 0;
  assessments: AssessmentList[] = [];
  currentPage: AssessmentList[] = [];

  constructor(private srvAssessment: AssessmentService) { }

  ngOnInit() {
    this.loadAssessments();
  }

  loadAssessments() {
    this.srvAssessment.getAssessments().subscribe((assessments: AssessmentList[]) => {
      this.assessments = assessments;
      this.loadPage(this.page);
    });
  }

  loadPage(pageNumber) {
    this.page = pageNumber;
    this.pointer = (this.page - 1) * this.pageSize;
    this.currentPage = this.assessments.slice(this.pointer, this.pointer + this.pageSize);
  }

  exportAssessment(assessmentToken) {
    this.srvAssessment.exportAssessment(assessmentToken).subscribe(result => {
      console.log('Done');
    });
  }
  deleteAssessment(assessmentToken) {
    this.srvAssessment.deleteAssessment(assessmentToken).subscribe(result => {
      console.log('Done');
      this.loadAssessments();
    });
  }
}
