'use strict';

const Hapi = require('hapi');
const MySQL = require('mysql');
const moment = require('moment');
const parseJson = require('parse-json');
const uuidv1 = require('uuid/v1');
const database = require('./Database');

const db = new database();

// Create a server with a host and port
const server = new Hapi.Server();

const connection = MySQL.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'assessment'
});

server.connection({
    host: 'localhost',
    port: 8000
});

// connection.connect();

server.route({
    method: 'GET',
    path: '/helloworld',
    handler: function (request, reply) {
        return reply('hello world');
    }
});

function deleteAssessment(assessmentToken) {
    return db.query(
        'DELETE a, ae, ap, apt ' +
        'FROM assessment a ' +
        'LEFT JOIN assessment_environments ae ON a.assessment_id = ae.assessment_id ' +
        'LEFT JOIN assessment_phase ap ON a.assessment_id = ap.assessment_id ' +
        'LEFT JOIN assessment_phase_tools apt ON a.assessment_id = apt.assessment_id ' +
        'WHERE a.assessment_token = "' + assessmentToken + '" '
    );
}

// Add the route
server.route({
    method: 'GET',
    path: '/list-assessments',
    handler: function (request, reply) {

        db.query('SELECT * FROM assessment ').then(results => {
            // do something with the result
            const response = [];
            if (results) {
                results.forEach(function (result) {
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
    method: 'GET',
    path: '/delete-assessment',

    handler: function (request, reply) {
        const assessmentToken = request.query.assessmentToken;
        deleteAssessment(assessmentToken).then(delResult => {
            reply({status: 'success'});
        }).catch((reason) => {
            reply({status: 'fail'});
            throw reason;
        });
    }
});
server.route({
    method: 'POST',
    path: '/save-assessment',

    handler: function (request, reply) {

        const payload = request.payload;
        const asstToken = uuidv1();
        const oldAsstToken = payload.assessmentToken;
        const assessmentTime = moment().format('YYYY-MM-DD HH:mm:ss');

        db.connection.beginTransaction(() => {
            return db.query(
                'INSERT INTO assessment (assessment_token, assessment_date, account_name, project_name, automation_status, devops_platform, summary, assessed_by, is_active) ' +
                'VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [asstToken, assessmentTime, payload.accountName, payload.projectName, payload.automationStatus, payload.platform, payload.summary, 0, 1]
            ).then(result => {
                var lastAssemID = result.insertId;
                const phasePromise = Promise.all(
                    payload.assessmentPhases.map(phase => {
                        return db.query(
                            'INSERT INTO assessment_phase (assessment_id, phase_id, phase_name, automation_status, processes, automation_satisfaction, observations, reasons, special_remarks ) ' +
                            ' VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                            [lastAssemID, phase.phaseId, phase.phaseName, phase.automationStatus, phase.processes, phase.automationSatisfaction, phase.observations, phase.reasons, phase.remarks]
                        ).then(phaseResult => {
                            var lastAssemPhaseID = phaseResult.insertId;
                            const phaseToolPromise = Promise.all(
                                phase.assessmentPhaseTools.map(phaseTool => {
                                    return db.query(
                                        'INSERT INTO assessment_phase_tools (assessment_phase_id, assessment_id, tool_name, version, category) ' +
                                        ' VALUES ( ?, ?, ?, ?, ?)',
                                        [lastAssemPhaseID, lastAssemID, phaseTool.toolName.toString().trim(), phaseTool.version, '']
                                    ).then(phaseToolResult => {
                                        return phaseToolResult;
                                    }).catch((reason) => {
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
                                            [lastAssemPhaseID, lastAssemID, phaseTool.toString().trim(), phaseTool.version, 'Other']
                                        ).then(phaseToolResult => {
                                            return phaseToolResult;
                                        }).catch((reason) => {
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
                            [lastAssemID, environment.env, (environment.applicable ? 1 : 0), environment.managedBy, environment.autoDeloy, environment.remarks]
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
                if (oldAsstToken) {
                    // Delete existing records
                    deleteAssessment(oldAsstToken).then(delResult => {
                        db.connection.commit();
                        reply({ status: 'success' });
                    }).catch((reason) => {
                        db.connection.rollback();
                        reply({ status: 'fail' });
                        throw reason;
                    });
                } else {
                    db.connection.commit();
                    reply({ status: 'success' });
                }

            }).catch((reason) => {
                console.log(reason);
                db.connection.rollback();
                reply({ status: 'fail' });
            });
        })

    },
});

// Add the route
server.route({
    method: 'GET',
    path: '/view-assessment',
    handler: function (request, reply) {
        return db.query(
            'SELECT assessment_id, assessment_token assessmentToken, account_name accountName, project_name projectName, automation_status automationStatus, devops_platform platform, summary ' +
            'FROM assessment ' +
            'WHERE assessment_token = "' + request.query.id + '" '
        ).then((assessment) => {
            if (assessment.length > 0) {
                assessment = assessment[0];
                return Promise.all([
                    db.query(
                        'SELECT environment env, applicable, managed_by managedBy, auto_deploy autoDeploy, remarks FROM assessment_environments WHERE assessment_id = "' + assessment.assessment_id + '" '
                    ).then((environments) => {
                        // assessment.environments = environments;
                        // console.log(assessment);
                        return environments;
                        // resolve(environments);
                    }).catch((error) => {
                        console.log(error);
                        return error;
                        // reject(error);
                    }),
                    db.query(
                        'SELECT title, description FROM assessment_recommendations WHERE assessment_id = "' + assessment.assessment_id + '" '
                    ).then((recommendations) => {
                        return recommendations;
                    }).catch((error) => {
                        console.log(error);
                        return error;
                        // reject(error);
                    }),
                    db.query(
                        'SELECT assessment_phase_id, phase_id phaseId, phase_name phaseName, automation_status automationStatus, processes, automation_satisfaction automationSatisfaction, observations, reasons, special_remarks remarks FROM assessment_phase WHERE assessment_id = "' + assessment.assessment_id + '" '
                    ).then((phases) => {
                        return Promise.all(
                            phases.map((phase) => {
                                return db.query(
                                    'SELECT tool_name toolName, version, category FROM assessment_phase_tools WHERE assessment_phase_id = "' + phase.assessment_phase_id + '" '
                                ).then((tools) => {
                                    const formatTools = tools.map((tool) => {
                                        if (tool.category.toLowerCase() !== 'other') {
                                            return tool;
                                        } else {
                                            return false;
                                        }
                                    });
                                    const otherTools = tools.map((tool) => {
                                        if (tool.category.toLowerCase() == 'other') {
                                            return tool.toolName;
                                        } else {
                                            return false;
                                        }
                                    });
                                    // phase.assessmentPhaseTools = tools;
                                    phase.assessmentPhaseTools = formatTools.filter(Boolean);
                                    phase.assessmentPhaseOtherTools = otherTools.filter(Boolean).join(', ');
                                    return phase;
                                });
                            })
                        ).then((phases) => {
                            return phases;
                        });
                    }).catch((error) => {
                        console.log(error)
                    })
                ]).then((response) => {
                    assessment.environments = response[0];
                    assessment.recommendations = response[1];
                    assessment.assessmentPhases = response[2];
                    return assessment;
                });
            } else {
                return {};
            }
        }).then((assessment) => {
            reply(assessment);
        }).catch((error) => {
            console.log(error)
        });
    }
});
server.route({
    method: 'POST',
    path: '/save-recommendations',

    handler: function (request, reply) {

        const payload = request.payload;
        const assessmentToken = payload.assessmentToken;
        const recommendationTime = moment().format('YYYY-MM-DD HH:mm:ss');

        db.connection.beginTransaction(() => {
            return db.query(
                'SELECT * FROM assessment ' +
                'WHERE assessment_token = "' + assessmentToken + '" '
            ).then(result => {

                if (result.length > 0) {
                    result = result[0];
                    return db.query(
                        'DELETE FROM assessment_recommendations WHERE assessment_id = "' + result.assessment_id + '" '
                    ).then(delResult => {

                        return Promise.all(
                            payload.recommendations.map(recommendation => {
                                return db.query(
                                    'INSERT INTO assessment_recommendations (assessment_id, title, description, added_on ) ' +
                                    ' VALUES ( ?, ?, ?, ?)',
                                    [result.assessment_id, recommendation.title, recommendation.description, recommendationTime]
                                ).then(recResult => {
                                    return recResult.insertId;
                                }).catch((reason) => {
                                    db.connection.rollback();
                                    throw reason;
                                });
                            })
                        ).then(allInsertResult => {
                            return allInsertResult;
                        }).catch((reason) => {
                            db.connection.rollback();
                            throw reason;
                        });
                    });
                }
            }).then(status => {
                if (status) {
                    reply({status: 'success'});
                } else {
                    reply({status: 'false'});
                }
                db.connection.commit();
            }).catch((reason) => {
                reply({status: 'fail'});
                db.connection.rollback();
                throw reason;
            });
        })
    }
});

server.register({
    register: require('hapi-cors'),
    options: {
        origins: ['http://localhost:4200']
    }
}, function (err) {
    server.start((err) => {

        if (err) {
            throw err;
        }
        console.log('Server running at:', server.info.uri);
    });
});
