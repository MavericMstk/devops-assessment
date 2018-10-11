import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap/accordion/accordion';
import { FormControl, FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { environment } from '../../environments/environment';
import { AssessmentPhase, AssessmentPhaseTool, Assessment } from '../shared/interfaces/assessment';
import { AssessmentService } from '../shared/services/assessment.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { CheckboxFormControl } from '../shared/interfaces/custom-form-controls';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { auditTime } from 'rxjs/operators';

@Component({
    selector: 'app-new-assessment',
    templateUrl: './new-assessment.component.html',
    styleUrls: ['./new-assessment.component.css']
})
export class NewAssessmentComponent implements OnInit, NgbPanelChangeEvent {

    panelId;
    nextState;
    preventDefault;

    @ViewChild('content') content: ElementRef;
    errorMessage = '';

    envManagedByMaster = environment.envManagedByMaster;
    statusMaster = environment.statusMaster;
    automationStatusMaster = environment.automationStatusMaster;

    readonlyMode = true;
    autoSaveStatus = '';
    action = 'New';
    assessmentToken: string;
    assessmentData: Assessment;
    formDisableStatus: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

    assessmentForm = this.fb.group({
        assessmentToken: [''],
        accountName: ['', Validators.required],
        projectName: ['', Validators.required],
        automationStatus: ['None', Validators.required],
        platform: ['Open Source', Validators.required],
        summary: [''],
        quickNotes: [''],
        status: ['Draft'],
        environments: this.fb.array([]),
        assessmentPhases: this.fb.array([])
    });

    constructor(private fb: FormBuilder, private srvAssessment: AssessmentService, private cdRef: ChangeDetectorRef,
        private modalService: NgbModal, private route: ActivatedRoute, private router: Router) { }

    ngOnInit() {
        this.panelId = 'toggle-base';
        // this.assessmentTools = environment.assessmentPhaseTools;

        this.action = this.route.snapshot.paramMap.get('action');

        if (this.action === 'edit') {
            this.readonlyMode = false;
        } else if (this.action === 'view') {
            this.readonlyMode = true;
        } else {
            this.action = 'new';
            this.readonlyMode = false;
        }

        this.assessmentForm.valueChanges.pipe(
            auditTime(5000)
        ).subscribe(formData => {
            if (!this.assessmentForm.pristine && this.assessmentForm.valid) {
                this.autoSaveStatus = 'inprogress';
                this.saveDetails(true);
            }
        });


        this.formDisableStatus.subscribe(status => {
            if (status) {
                this.assessmentForm.disable();
            } else {
                this.assessmentForm.enable();
            }
        });

        this.createEnvironments();
        this.createAssessmentPhases();

        const assessmentToken = this.route.snapshot.paramMap.get('assessmentToken');
        if (assessmentToken) {
            this.assessmentToken = assessmentToken;
        }
    }

    setFormStatus(status: boolean) {
        if (this.readonlyMode) {
            this.formDisableStatus.next(true);
        } else {
            this.formDisableStatus.next(status);
        }
    }

    getAssessment(): void {
        this.setFormStatus(true);
        this.srvAssessment.getAssessmentDetails(this.assessmentToken)
            .subscribe(assessmentDetails => {
                // this.parseAssessment(assessmentDetails);
                this.assessmentData = assessmentDetails;
                this.assessmentForm.patchValue(this.assessmentData);
                this.prepopulateForm();
                this.setFormStatus(false);
            });
    }

    prepopulateForm() {
        if (this.assessmentData) {
            console.log(this.assessmentForm);
            (this.assessmentForm.get('assessmentPhases') as FormArray).controls.forEach((assessmentPhase: FormGroup) => {
                const currentPhase = this.assessmentData.assessmentPhases.find((dataAssessmentPhase: AssessmentPhase) => {
                    return dataAssessmentPhase.phaseId === assessmentPhase.get('phaseId').value;
                });
                if (currentPhase.phaseId) {
                    (assessmentPhase.get('assessmentPhaseTools') as FormArray).controls.forEach((toolGroup: FormGroup) => {
                        // phaseTools.defaultValue
                        const toolElem = toolGroup.get('toolName') as CheckboxFormControl;
                        toolElem.setValue(false);
                        toolElem.disable();
                        currentPhase.assessmentPhaseTools.forEach(dataPhaseTool => {
                            if (toolElem.defaultValue === dataPhaseTool.toolName) {
                                toolElem.setValue(dataPhaseTool.toolName);
                            }
                        });
                    });
                }
            });
        }
    }

    createEnvironments() {
        this.setFormStatus(true);
        if (environment.environmentsMaster) {
            environment.environmentsMaster.forEach(environmentElem => {

                // tslint:disable-next-line:prefer-const
                let env = this.fb.group({
                    env: environmentElem,
                    applicable: '',
                    managedBy: '',
                    autoDeloy: '',
                    remarks: ''
                });
                const test = this.assessmentForm.get('environments') as FormArray;  // . addControl(phase);
                test.push(env);

            });

            this.cdRef.detectChanges();
        }
        this.setFormStatus(false);
    }

    createAssessmentPhases() {
        this.setFormStatus(true);
        this.srvAssessment.getMaster().subscribe(masters => {
            const defaultAutomationStatus = this.automationStatusMaster[0];
            if (masters.length) {
                masters.forEach((assessmentPhase, index) => {

                    // Convert to tools to checkboxes
                    let assessmentPhaseTools: FormGroup[] = [];
                    assessmentPhaseTools = assessmentPhase.tools.map(tool => {
                        const chkbox = new CheckboxFormControl({ value: false, disabled: true });
                        chkbox.defaultValue = tool.toolName;
                        if (this.formDisableStatus.getValue()) {
                            chkbox.disable();
                        }

                        // return chkbox;
                        return this.fb.group({
                            toolName: chkbox,
                            version: tool.version
                        });
                    });

                    // tslint:disable-next-line:prefer-const
                    let phase = this.fb.group({
                        phaseId: assessmentPhase.phaseId,
                        phaseName: assessmentPhase.phaseName,
                        automationStatus: 'None',
                        processes: '',
                        automationSatisfaction: 'No',
                        observations: '',
                        reasons: '',
                        remarks: '',
                        assessmentPhaseTools: this.fb.array(assessmentPhaseTools),
                        assessmentPhaseOtherTools: ''
                    });
                    const test = this.assessmentForm.get('assessmentPhases') as FormArray;
                    test.push(phase);
                    this.cdRef.detectChanges();
                    this.setFormStatus(true);
                });
                if (this.assessmentToken) {
                    this.getAssessment();
                } else {
                    this.setFormStatus(false);
                }
                this.cdRef.detectChanges();
            }
        });
    }


    public toggleAccordian(props: NgbPanelChangeEvent) {
        this.panelId = (props.nextState) ? props.panelId : '';
        window.location.hash = '#toggle-' + props.panelId;
        // props.nextState   // true === panel is toggling to an open state // false === panel is toggling to a closed state
        // props.panelId;    // the ID of the panel that was clicked
        // props.preventDefault(); // don't toggle the state of the selected panel
        // console.log(props);
        // return true;
    }

    get assessmentPhases(): FormArray {
        return this.assessmentForm.get('assessmentPhases') as FormArray;
    }

    setAutomationStatus() {
        if (this.assessmentForm.get('automationStatus').value === 'Fully Automated') {
            const phases = this.assessmentForm.get('assessmentPhases') as FormArray;
            phases.controls.forEach(phase => {
                phase.get('automationStatus').setValue('Fully Automated');
            });
        }
    }

    saveDetails(autoMode = false) {
        console.log(this.assessmentForm);
        /* if (1) {
            console.log(this.assessmentForm.pristine);
            this.assessmentForm.markAsPristine();
            console.log(this.assessmentForm.pristine);
            this.autoSaveStatus = 'saved';
            return true;
        } */
        if (this.assessmentForm.valid) {
            const formData: Assessment = this.assessmentForm.value;
            formData.assessmentPhases.forEach((phase, phaseIndex) => {
                phase.assessmentPhaseTools.forEach((tool, toolIndex) => {
                    if (!tool.toolName) {
                        delete phase.assessmentPhaseTools[toolIndex];
                    }
                });
                phase.assessmentPhaseTools = phase.assessmentPhaseTools.filter(Boolean);
            });
            console.log(formData);
            this.srvAssessment.postAssessment(formData).subscribe(response => {
                if (response.status === 'success') {
                    if (!autoMode) {
                        this.router.navigate(['/']);
                    } else {
                        this.assessmentForm.get('assessmentToken').setValue(response.token);
                    }
                    this.assessmentForm.markAsPristine();
                    this.autoSaveStatus = 'saved';
                } else {
                    alert('Error');
                    this.autoSaveStatus = 'failed';
                }
            });

        } else {
            this.markFormGroupTouched(this.assessmentForm);
            this.assessmentForm.markAsTouched({ onlySelf: true });
            this.errorMessage = 'Please provide all mandatory information.';
            this.showError();
        }
        return false;
    }

    showError() {
        this.modalService.open(this.content, {
            ariaLabelledBy: 'modal-basic-title'
        });
    }

    markFormGroupTouched(formGroup: FormGroup) {
        (<any>Object).values(formGroup.controls).forEach(control => {
            if (control.controls) { // control is a FormGroup
                this.markFormGroupTouched(control);
            } else { // control is a FormControl
                control.markAsTouched();
            }
        });
    }
}
