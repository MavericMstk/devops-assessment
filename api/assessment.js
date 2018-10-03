var express = require('express')
var router = express.Router()


router.get('/', function (req, res) {
    res.send('{status: "success assessement"}');
})


// Add the route
router.get('/list', function (req, res) {
    dbc.query('SELECT * FROM assessment ').then(results => {
        // do something with the result
        const response = [];
        if(results) {
            results.forEach(function(result) {
                response.push({
                    assessmentToken: result.assessment_token,
                    accountName: result.account_name,
                    projectName: result.project_name,
                    automationStatus: result.automation_status,
                    platform: result.platform,
                    summary: result.summary,
                    assessmentDate: result.assessment_date
                })
            });
        }
        reply(response);
    });
});
/* 

// Add the route
server.route({
    method: 'GET',
    path: '/get-master',
    handler: function (request, reply) {

        return db.query(
            'SELECT phase_id, phase_name FROM master_phase WHERE is_active="1" '
        ).then((phases) => {
            return Promise.all(
                phases.map((phase) => {
                    const response = {
                        phaseId: phase.phase_id,
                        phaseName: phase.phase_name,
                        tools: [],
                    };
                    return db.query(
                        'SELECT tool_name as toolName, version as version FROM phase_tool pt INNER JOIN master_tool mt on pt.tool_id = mt.tool_id WHERE pt.phase_id = "' + phase.phase_id + '" AND pt.is_active = "1" AND mt.is_active="1" '
                    ).then((tools) => {
                        response.tools = tools;
                        return response;
                    });
                })
            ).then(response => {
                reply(response);
            });
        });
    }
});


server.route({
    method: 'POST',
    path: '/save-assessment',

    handler: function (request, reply) {

        const payload = request.payload;
		const asstToken = uuidv1();
        const assessmentTime = moment().format('YYYY-MM-DD HH:mm:ss');

        db.connection.beginTransaction(() => {
            return db.query(
                'INSERT INTO assessment (assessment_token, assessment_date, account_name, project_name, automation_status, devops_platform, summary, assessed_by, is_active) ' + 
                'VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [ asstToken, assessmentTime, payload.accountName, payload.projectName, payload.automationStatus, payload.platform, payload.summary, 0, 1]
            ).then(result => {
                var lastAssemID =  result.insertId;
    
                const phasePromise = Promise.all(
                    payload.assessmentPhases.map(phase => {
                        return db.query(
                            'INSERT INTO assessment_phase (assessment_id, phase_name, automation_status, processes, automation_satisfaction, observations, special_remarks ) ' +
                            ' VALUES ( ?, ?, ?, ?, ?, ?, ?)', 
                            [ lastAssemID, phase.phaseName, phase.automationStatus, phase.processes, phase.automationSatisfaction, phase.observations, phase.remarks ]
                        ).then(phaseResult => {
                            var lastAssemPhaseID =  phaseResult.insertId;
                            console.log(lastAssemPhaseID + ' - ' + lastAssemID);
                            const phaseToolPromise = Promise.all(
                                phase.assessmentPhaseTools.map(phaseTool => {
                                    return db.query(
                                        'INSERT INTO assessment_phase_tools (assessment_phase_id, assessment_id, tool_name, version, category) ' +
                                        ' VALUES ( ?, ?, ?, ?, ?)', 
                                        [ lastAssemPhaseID, lastAssemID, phaseTool, '', '' ]
                                    ).then(phaseToolResult => {
                                        return phaseToolResult;
                                    }).catch((reason) => {
                                        console.log('####');
                                        console.log(reason);
                                        db.connection.rollback();
                                        throw reason;
                                    })
                                })
                            );

                            let phaseOtherToolPromise = '';
                            if (phase.assessmentPhaseOtherTools) {
                                let otherTools = phase.assessmentPhaseOtherTools.split(',');
                                phaseOtherToolPromise = Promise.all(
                                    otherTools.map(phaseTool => {
                                        return db.query(
                                            'INSERT INTO assessment_phase_tools (assessment_phase_id, assessment_id, tool_name, version, category) ' +
                                            ' VALUES ( ?, ?, ?, ?, ?)', 
                                            [ lastAssemPhaseID, lastAssemID, phaseTool, '', 'Other' ]
                                        ).then(phaseToolResult => {
                                            return phaseToolResult;
                                        }).catch((reason) => {
                                            console.log('$$$');
                                            console.log(reason);
                                            db.connection.rollback();
                                            throw reason;
                                        })
                                    })
                                );
                            }

                            return Promise.all([phaseToolPromise, phaseOtherToolPromise]).then(resultCon => {
                                return resultCon;
                            }).catch((reason) => {
                                db.connection.rollback();
                                throw reason;
                            })
                        });
                    })
                ).then(response => {
                    return response;
                });
    
                const envPromise = Promise.all(
                    payload.environments.map(environment => {
                        db.query(
                            'INSERT INTO assessment_environments (assessment_id, environment, applicable, managed_by, auto_deploy, remarks) ' +
                            'VALUES ( ?, ?, ?, ?, ?, ?)',
                            [ lastAssemID, environment.env, (environment.applicable? 1 : 0), environment.managedBy, environment.autoDeloy, environment.remarks ]
                        ).then(envResult => {
                            return envResult;
                        }).catch((reason) => {
                            db.connection.rollback();
                            throw reason;
                        });
                    })
                ).then(response => {
                    return response;
                }).catch((reason) => {
                    db.connection.rollback();
                    throw reason;
                });

                return Promise.all([phasePromise, envPromise]).then(resultCon => {
                    return resultCon;
                }).catch((reason) => {
                    db.connection.rollback();
                    throw reason;
                })
            })
            .then(finalResult => {
                console.log(finalResult);
                db.connection.commit();
                reply({status: 'success'});
            }).catch((reason) => {
                console.log(reason);
                db.connection.rollback();
                reply({status: 'fail 2'});
            });
        })
        
    },
});



// Add the route
server.route({
    method: 'GET',
    path: '/view-assessment/',
    handler: function (request, reply) {
        
        db.query('SELECT * FROM assessment ').then(results => {
            // do something with the result
            const response = [];
            if(results) {
                results.forEach(function(result) {
                    response.push({
                        assessmentToken: result.assessment_token,
                        accountName: result.account_name,
                        projectName: result.project_name,
                        automationStatus: result.automation_status,
                        platform: result.platform,
                        summary: result.summary,
                        assessmentDate: result.assessment_date
                    })
                });
            }
            reply(response);
        });
    }
});
 */

module.exports = router;