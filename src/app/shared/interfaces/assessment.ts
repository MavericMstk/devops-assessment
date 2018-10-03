export interface AssessmentPhaseTool {
    toolName: string;
    version?: string;
    type?: string;
}

export interface AssessmentPhase {
    phaseId: string;
    phaseName: string;
    automationStatus: string;
    processes: string;
    automationSatisfaction: string;
    observations: string;
    reasons: string;
    specialRemarks: string;
    assessmentPhaseTools: AssessmentPhaseTool[];
    assessmentPhaseOtherTools: string;
}
export interface AssessmentEnvironment {
    env: string;
    applicable: boolean;
    managedBy: string;
    autoDeloy: string;
    remarks: string;
}
export interface AssessmentRecommedation {
    title: string;
    description: string;
}

export interface Assessment {
    assessmentToken?: string;
    assessmentDate?: string;
    accountName: string;
    projectName: string;
    automationStatus: string;
    platform: string;
    summary: string;
    environments: AssessmentEnvironment[];
    recommendations: AssessmentRecommedation[];
    assessmentPhases: AssessmentPhase[];
}

export interface AssessmentMasterPhase {
    phaseId: string;
    phaseName: string;
    tools: AssessmentPhaseTool[];
}

/* export interface AssessmentMasterPhases {
    assessmentPhases: AssessmentMasterPhase[];
} */

export interface AssessmentList {
    assessmentToken?: string;
    assessmentDate?: string;
    accountName: string;
    projectName: string;
    automationStatus: string;
    platform: string;
    summary: string;
}
