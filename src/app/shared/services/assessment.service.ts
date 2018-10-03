import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { map, retry, catchError } from 'rxjs/operators';
import { AssessmentMasterPhase, Assessment, AssessmentList } from '../interfaces/assessment';

@Injectable({
  providedIn: 'root'
})
export class AssessmentService {

  assessmentDetails: BehaviorSubject<Assessment> = new BehaviorSubject(null);

  constructor(private http: HttpClient) { }

  getMaster(): Observable<AssessmentMasterPhase[]> {
    return this.http.get<AssessmentMasterPhase[]>('http://localhost:8000/get-master').pipe(
      map((response: AssessmentMasterPhase[]) => {
        return response as AssessmentMasterPhase[];
      }),
      catchError(error => {
        return throwError('Something went wrong!');
      })
    );
  }

  getAssessments(): Observable<AssessmentList[]> {
    return this.http.get<AssessmentList[]>('http://localhost:8000/list-assessments').pipe(
      map((response: AssessmentList[]) => {
        return response as AssessmentList[];
      }),
      catchError(error => {
        return throwError('Something went wrong!');
      })
    );
  }

  postAssessment(postData: Assessment): Observable<any> {
    return this.http.post<any>('http://localhost:8000/save-assessment', postData).pipe(
      map((response) => {
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
        this.assessmentDetails.next(response);
        return this.assessmentDetails.getValue();
      }),
      catchError(error => {
        return throwError('Something went wrong!');
      })
    );
  }

  postRecommendations(postData: Assessment): Observable<any> {
    return this.http.post<any>('http://localhost:8000/save-recommendations', postData).pipe(
      map((response) => {
        return response;
      }),
      catchError(error => {
        return throwError('Something went wrong!');
      })
    );
  }
}
