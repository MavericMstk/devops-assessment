import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListAssessmentComponent } from './list-assessment/list-assessment.component';
import { NewAssessmentComponent } from './new-assessment/new-assessment.component';
import { ViewAssessmentComponent } from './view-assessment/view-assessment.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'new-assessment', component: NewAssessmentComponent },
    { path: 'list', component: ListAssessmentComponent },
    { path: 'view/:assessmentToken', component: ViewAssessmentComponent },
    { path: ':action/:assessmentToken', component: NewAssessmentComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    declarations: []
})
export class AppRoutingModule { }
