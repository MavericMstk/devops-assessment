import { AssessmentService } from 'src/app/shared/services/assessment.service';
import { Observable, of } from 'rxjs';
import { AssessmentMasterPhase, AssessmentList, Assessment } from 'src/app/shared/interfaces/assessment';

export class MockAssessmentService extends AssessmentService {

    getMaster(): Observable<AssessmentMasterPhase[]> {
        return of([]);
    }

    getAssessments(): Observable<AssessmentList[]> {
        return of([]);
    }

    postAssessment(postData: Assessment): Observable<any> {
        return of([]);
    }

    deleteAssessment(assessmentToken: string): Observable<any> {
        return of([]);
    }
}
