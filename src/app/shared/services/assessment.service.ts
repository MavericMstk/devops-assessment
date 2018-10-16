import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { map, retry, catchError } from 'rxjs/operators';
import { AssessmentMasterPhase, Assessment, AssessmentList } from '../interfaces/assessment';
import { UtilsService } from './utils.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AssessmentService {

  assessmentDetails: BehaviorSubject<Assessment> = new BehaviorSubject(null);

  constructor(private http: HttpClient) { }

  getMaster(): Observable<AssessmentMasterPhase[]> {
    return this.http.get<AssessmentMasterPhase[]>(environment.apiURL + 'get-master').pipe(
      map((response: AssessmentMasterPhase[]) => {
        return response as AssessmentMasterPhase[];
      }),
      catchError(error => {
        return throwError('Something went wrong!');
      })
    );
  }

  getAssessments(): Observable<AssessmentList[]> {
    return this.http.get<AssessmentList[]>(environment.apiURL + 'list-assessments').pipe(
      map((response: AssessmentList[]) => {
        return response as AssessmentList[];
      }),
      catchError(error => {
        return throwError('Something went wrong!');
      })
    );
  }

  postAssessment(postData: Assessment): Observable<any> {
    return this.http.post<any>(environment.apiURL + 'save-assessment', postData).pipe(
      map((response) => {
        return response;
      }),
      catchError(error => {
        return throwError('Something went wrong!');
      })
    );
  }

  deleteAssessment(assessmentToken: string): Observable<any> {
    return this.http.get<any>(environment.apiURL + 'delete-assessment?id=' + assessmentToken).pipe(
      map((response) => {
        return response;
      }),
      catchError(error => {
        return throwError('Something went wrong!');
      })
    );
  }

  getAssessmentDetails(assessmentToken: string): Observable<Assessment> {
    return this.http.get<Assessment>(environment.apiURL + 'view-assessment?id=' + assessmentToken).pipe(
      map((response: Assessment) => {
        this.assessmentDetails.next(response);
        return this.assessmentDetails.getValue();
      }),
      catchError(error => {
        return throwError('Something went wrong!');
      })
    );
  }

  postRecommendations(postData: Assessment): Observable<any> {
    return this.http.post<any>(environment.apiURL + 'save-recommendations', postData).pipe(
      map((response) => {
        return response;
      }),
      catchError(error => {
        return throwError('Something went wrong!');
      })
    );
  }

  exportAssessment(assessmentToken): Observable<any> {
    return this.http.get(environment.apiURL + 'export-assessment?id=' + assessmentToken, {
      responseType: 'blob'
    }).pipe(
      map((response: Blob) => {
        const options = { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation;' };
        const filename = assessmentToken + '.pptx';

        UtilsService.createAndDownloadBlobFile(response, options, filename);
        return true;
      }),
      catchError(error => {
        console.log(error);
        return throwError('Something went wrong!');
      })
    );

    /*
    .catch((err) => console.log(err))
    .map((res:Response) => res)
    .finally( () => { }); */
  }
}
