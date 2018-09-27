import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, retry, catchError } from 'rxjs/operators';
import { AssessmentMasterPhase, Assessment, AssessmentList } from '../interfaces/assessment';

@Injectable({
  providedIn: 'root'
})
export class AssessmentService {

  constructor(private http: HttpClient) { }

  getMaster(): Observable<AssessmentMasterPhase[]> {
    return this.http.get<AssessmentMasterPhase[]>('http://localhost:8000/get-master').pipe(
      map((response: AssessmentMasterPhase[]) => {
        // this.products = data;
        /* response.assessmentPhases = [{
          phaseId: 'planning_tools',
          phaseName: 'Planning Tools',
          tools: [{
            toolName: 'JIRA',
            version: ''
          }, {
            toolName: 'Confluence',
            version: ''
          }, {
            toolName: 'VSTS',
            version: ''
          }]
        },
        {
          phaseId: 'scm',
          phaseName: 'Source Code Management',
          tools: [{
            toolName: 'Git',
            version: ''
          }, {
            toolName: 'SVN',
            version: ''
          }]
        }]; */
        return response as AssessmentMasterPhase[];
      }),
      catchError(error => {
        return throwError('Something went wrong!');
      })
    );
  }

  getAssessments(): Observable<AssessmentList[]> {
    // return this.http.get<AssessmentList[]>('https://baconipsum.com/api/?type=all-meat&sentences=1&start-with-lorem=1').pipe(
    return this.http.get<AssessmentList[]>('http://localhost:8000/list-assessments').pipe(
      map((response: AssessmentList[]) => {
        // tslint:disable-next-line:max-line-length
        // response = [{ 'assessmentToken': 'sdflsd-2df3-243-kuwoer3', 'accountName': 'IPF', 'projectName': 'PIPS', 'automationStatus': 'Partically Automated', 'platform': 'Open Source', 'summary': '', 'assessmentDate': '2018-01-01 12:12:12' }, { 'assessmentToken': 'd3flsd-2df3-243-kuwoewy', 'accountName': 'MCL', 'projectName': 'MCL', 'automationStatus': 'Partically Automated', 'platform': 'Open Source', 'summary': '', 'assessmentDate': '2018-02-11 09:32:00' }];
        return response as AssessmentList[];
      }),
      catchError(error => {
        return throwError('Something went wrong!');
      })
    );
  }

  postAssessment(postData: Assessment): Observable<any> {
    // return this.http.get<AssessmentList[]>('https://baconipsum.com/api/?type=all-meat&sentences=1&start-with-lorem=1').pipe(
    return this.http.post<any>('http://localhost:8000/save-assessment', postData).pipe(
      map((response) => {
        // tslint:disable-next-line:max-line-length
        // response = [{ 'assessmentToken': 'sdflsd-2df3-243-kuwoer3', 'accountName': 'IPF', 'projectName': 'PIPS', 'automationStatus': 'Partically Automated', 'platform': 'Open Source', 'summary': '', 'assessmentDate': '2018-01-01 12:12:12' }, { 'assessmentToken': 'd3flsd-2df3-243-kuwoewy', 'accountName': 'MCL', 'projectName': 'MCL', 'automationStatus': 'Partically Automated', 'platform': 'Open Source', 'summary': '', 'assessmentDate': '2018-02-11 09:32:00' }];
        return response;
      }),
      catchError(error => {
        return throwError('Something went wrong!');
      })
    );
  }

  getAssessmentDetails(assessmentToken: string): Observable<Assessment> {
    return this.http.get<Assessment>('http://localhost:8000/view-assessment?id=' + assessmentToken).pipe(
      map((response: Assessment) => {
        // tslint:disable-next-line:max-line-length
        // response = { 'assessmentToken': 'sdflsd-2df3-243-kuwoer3', 'accountName': 'IPF', 'projectName': 'PIPS', 'automationStatus': 'Partically Automated', 'platform': 'Open Source', 'summary': '', 'environments': [ { 'env': 'DEV', 'applicable': true, 'managedBy': 'Mastek', 'autoDeloy': 'Yes', 'remarks': 'Deployed via jenkins' }, { 'env': 'SIT', 'applicable': true, 'managedBy': 'Mastek', 'autoDeloy': 'Yes', 'remarks': 'Deployed via jenkins' }, { 'env': 'UAT', 'applicable': true, 'managedBy': 'Mastek', 'autoDeloy': 'Yes', 'remarks': 'Deployed via jenkins' }, { 'env': 'PREPROD', 'applicable': false, 'managedBy': '', 'autoDeloy': '', 'remarks': '' }, { 'env': 'PROD', 'applicable': true, 'managedBy': 'Client', 'autoDeloy': 'No', 'remarks': 'Build needs to be deployed manually' } ], 'assessmentPhases': [ { 'phaseName': 'Planning Tools', 'phaseId': 'planning_tools', 'automationStatus': 'Partially Automated', 'processes': 'Some process', 'automationSatisfaction': 'Yes', 'observations': 'Some observations', 'specialRemarks': 'Can we improve?', 'assessmentPhaseTools': [ { toolName: 'JIRA'}, {toolName: 'VSTS'} ], 'assessmentPhaseOtherTools': 'Swagger, Excel' }, { 'phaseName': 'Source Code Management', 'phaseId': 'scm', 'automationStatus': 'Partially Automated', 'processes': 'Some engg. practices', 'automationSatisfaction': 'No', 'observations': 'Some issues', 'specialRemarks': '', 'assessmentPhaseTools': [ {toolName: 'SVN'} ], 'assessmentPhaseOtherTools': '' } ] } ;
        return response as Assessment;
      }),
      catchError(error => {
        return throwError('Something went wrong!');
      })
    );
  }

  /*
  .pipe(
      /* map((res: AssessmentMasterPhases) => {
        let test: AssessmentMasterPhases;
        test.assessmentPhases.push({
          id: 'planning_tools',
          title: 'Planning Tools',
          tools: [
            'JIRA',
            'Confluence'
          ]
        });
         = [
          {
            id: 'planning_tools',
            title: 'Planning Tools',
            tools: [
              'JIRA',
              'Confluence'
            ]
          },
          {
            id: 'source_code_management',
            title: 'Source Code Management',
            tools: [
              'SVN',
              'Git'
            ]
          }
        ];
        return test;
      }), * /
      catchError(err => of([]))
    )
    */
}
