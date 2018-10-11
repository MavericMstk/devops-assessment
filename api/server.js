'use strict';

const Hapi = require('hapi');
const fs = require('fs');
const MySQL = require('mysql');
const moment = require('moment');
const parseJson = require('parse-json');
const uuidv1 = require('uuid/v1');
const database = require('./Database');
var PptxGenJS = require("pptxgenjs");

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

function deleteAssessment(assessmentToken, updateFlag = false) {
    if (!updateFlag) {
        return db.query(
            'DELETE a, ae, ap, apt ' +
            'FROM assessment a ' +
            'LEFT JOIN assessment_environments ae ON a.assessment_id = ae.assessment_id ' +
            'LEFT JOIN assessment_phase ap ON a.assessment_id = ap.assessment_id ' +
            'LEFT JOIN assessment_phase_tools apt ON a.assessment_id = apt.assessment_id ' +
            'WHERE a.assessment_token = "' + assessmentToken + '" '
        );
    } else {
        return db.query(
            'DELETE ae, ap, apt ' +
            'FROM assessment a ' +
            'LEFT JOIN assessment_environments ae ON a.assessment_id = ae.assessment_id ' +
            'LEFT JOIN assessment_phase ap ON a.assessment_id = ap.assessment_id ' +
            'LEFT JOIN assessment_phase_tools apt ON a.assessment_id = apt.assessment_id ' +
            'WHERE a.assessment_token = "' + assessmentToken + '" '
        );
    }
}

function getAssessmentDetails(assessmentToken) {
    return db.query(
        'SELECT assessment_id, assessment_token assessmentToken, account_name accountName, project_name projectName, automation_status automationStatus, devops_platform platform, summary, quick_notes quickNotes, assessment_date assessmentDate, status ' +
        'FROM assessment ' +
        'WHERE assessment_token = "' + assessmentToken + '" '
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
    });
}

function updateAssessmentFields(payload, lastAssemID) {
    return deleteAssessment(payload.assessmentToken, true).then(status => {
        
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
    });
}

// Add the route
server.route({
    method: 'GET',
    path: '/list-assessments',
    handler: function (request, reply) {

        db.query('SELECT * FROM assessment WHERE status <> "Deleted" ORDER BY assessment_date DESC ').then(results => {
            // do something with the result
            const response = [];
            if (results) {
                results.forEach(function (result) {
                    response.push({
                        assessmentToken: result.assessment_token,
                        accountName: result.account_name,
                        projectName: result.project_name,
                        automationStatus: result.automation_status,
                        platform: result.devops_platform,
                        summary: result.summary,
                        status: result.status,
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
        const assessmentToken = request.query.id;
        // deleteAssessment(assessmentToken).then(delResult => {
        const query = 'UPDATE assessment SET status = "Deleted" WHERE assessment_token = "' + assessmentToken + '" ';
        db.query( query ).then(delResult => {
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

            var query = '';
            var params = [];
            var flag = 'new';
            if (!oldAsstToken) {
                query = 'INSERT INTO assessment (assessment_token, assessment_date, account_name, project_name, automation_status, devops_platform, summary, quick_notes, assessed_by, status) ' +
                        'VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                params = [asstToken, assessmentTime, payload.accountName, payload.projectName, payload.automationStatus, payload.platform, payload.summary, payload.quickNotes, 0, payload.status];
                flag = 'new';
            } else {
                query = 'UPDATE assessment SET assessment_date = ?, account_name = ?, project_name = ?, automation_status = ?, devops_platform = ?, summary = ?, quick_notes=?, assessed_by = ?, status = ? ' +
                        'WHERE assessment_token = ? ';
                params = [assessmentTime, payload.accountName, payload.projectName, payload.automationStatus, payload.platform, payload.summary, payload.quickNotes, 0, payload.status, oldAsstToken];
                flag = 'update';
            }

            return db.query( query, params ).then(result => {
                    if (flag == 'new') {
                        var lastAssemID = result.insertId;
                        payload.assessmentToken = asstToken;
                        return updateAssessmentFields(payload, lastAssemID);
                    } else {
                        return db.query( 'SELECT * FROM assessment WHERE assessment_token = "' + oldAsstToken + '" ' ).then(result => {
                            if (result) {
                                payload.assessmentToken = oldAsstToken;
                                return updateAssessmentFields(payload, result[0].assessment_id);
                            } else {
                                throw 'Unable to complete action';
                            }
                        }).catch(error => {
                            return error;
                        })
                    }
                })
                .then(finalResult => {
                    db.connection.commit();
                    reply({ status: 'success', 'token': payload.assessmentToken });
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
        getAssessmentDetails(request.query.id)
        .then((assessment) => {
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
server.route({
    method: 'GET',
    path: '/export-assessment',

    handler: function (request, reply) {
        getAssessmentDetails(request.query.id).then(assessmentDetails => {

            var pptx = new PptxGenJS();

            pptx.setAuthor('Application Support and Maintenance');
            pptx.setCompany('Mastek Ltd.');
            pptx.setRevision('1');
            pptx.setSubject(assessmentDetails.accountName + ' Assessment');
            pptx.setTitle('DEVACT Framework');

            pptx.defineSlideMaster({
                title: 'MASTER_SLIDE',
                bkgd:  'F0F0F0',
                objects: [
                    { 'text':  { text: assessmentDetails.accountName + ' Assessment', options: { x:4.5, y:1.5, w:5, color:'4299A8', fontSize:26, align: 'right' } } },
                    { 'image': { path:'ppt-assets/masteklogo.png', x:7, y:0.5, w:2.2, h:0.7 } },
                    { 'image': { path:'ppt-assets/SecondaryBorder1.png', x:0, y:0, w:0.5, h:'20%' } },
                    { 'image': { path:'ppt-assets/SecondaryBorder2.png', x:0, y:'20%', w:0.5, h:'80%' } },
                    { 'text':  { text:'© Mastek Ltd. 2017 - Confidential', options: { x:0.3, y:'95%', w:3, color:'888888', fontSize:6, align: 'l' } } },
                    { 'text':  { text:'DEVACT Framework | Application Support and Maintenance', options: { x:'40%', y:'95%', w:6, color:'4299A8', fontSize:6, align: 'l' } } },
                ]
            });
            pptx.defineSlideMaster({
                title: 'SECONDARY_SLIDE',
                bkgd:  'F0F0F0',
                objects: [
                    { 'line':  { x: 2.5, y:0.4, w:1, h:0, line:'03afdb', lineSize:2 } },
                    { 'line':  { x: 3.5, y:0.4, w:4, h:0, line:'005171', lineSize:2 } },
                    { 'image': { path:'ppt-assets/masteklogo.png', x:8, y:0.1, w:1.3, h:0.4 } },
                    { 'image': { path:'ppt-assets/SecondaryBorder1.png', x:0, y:0, w:0.1, h:'20%' } },
                    { 'image': { path:'ppt-assets/SecondaryBorder2.png', x:0, y:'20%', w:0.1, h:'80%' } },
                    { 'text':  { text:'© Mastek Ltd. 2017 - Confidential', options: { x:0.3, y:'95%', w:3, color:'888888', fontSize:6, align: 'l' } } },
                    { 'text':  { text:'DEVACT Framework | Application Support and Maintenance', options: { x:'40%', y:'95%', w:6, color:'4299A8', fontSize:6, align: 'l' } } },
                ]
            });
            pptx.defineSlideMaster({
                title: 'FINAL_SLIDE',
                bkgd:  'F0F0F0',
                objects: [
                    { 'line':  { x: '25%', y: '50%', w: '50%', h:0, line:'005171', lineSize:2 } },
                    { 'image': { path:'ppt-assets/masteklogo.png', x:8, y:0.1, w:1.3, h:0.4 } },
                    { 'image': { path:'ppt-assets/thank-you.png', x:'43%', y:'30%', w:1, h:1 } },
                    { 'text':  { text:'THANK YOU', options: { x: '39%', y:'53%', w:5, color:'888888', fontSize:20, align: 'l', bold: true } } },
                    { 'text':  { text:'© Mastek Ltd. 2017 - Confidential', options: { x:0.3, y:'95%', w:3, color:'888888', fontSize:6, align: 'l' } } },
                    { 'text':  { text:'DEVACT Framework | Application Support and Maintenance', options: { x:'40%', y:'95%', w:6, color:'4299A8', fontSize:6, align: 'l' } } },
                ]
            });
            console.log();
            var slide = pptx.addNewSlide('MASTER_SLIDE');
            // slide.slideNumber({ x:1.0, y:'90%' });
            // slide.addImage({ path:'ppt-assets/HomeBg.jpg', x:0, y:0, w:'50%', h:'100%' });
            // slide.addImage({ path:'ppt-assets/masteklogo.png', x:7, y:0.5, w:2.2, h:0.7 });
            slide.addText(moment(assessmentDetails.assessmentDate).format('DD/MM/YYYY'), { x:7.4, y:5, w:2, color:'4299A8', fontSize:16, align: 'right' });
            
            var slideReport = pptx.addNewSlide('SECONDARY_SLIDE');
            slideReport.addText('DevACT Assessment Report', { x:2.5, y:0.1, w:5, color:'015171', fontSize:18, align: 'l' });
            var rows = [];
            // Row One: cells will be formatted according to any options provided to `addTable()`
            var headerOptions = {fill:'7f7f7f', color: 'ffffff', fontSize:12, align: 'c', bold: false};
            rows.push( [
                { text:'Phase', options: headerOptions },
                { text:'Tools', options: headerOptions },
                { text:'Engineering Practices', options: headerOptions },
                { text:'Culture', options: headerOptions },
                { text:'Impact Observations', options: headerOptions },
            ] );
            // Row Two: set/override formatting for each cell
            var rowCol1Options = {fill:'58697b', color: 'ffffff', fontSize: 11, align: 'l', bold: false};
            var rowCol5Options = {fill:'b4c7e7', color: '000000', fontSize: 11, align: 'l', bold: false};
            assessmentDetails.assessmentPhases.map((phase) => {
                rows.push(
                    [
                        { text: phase.phaseName, options: rowCol1Options },
                        { text:'', options: {} },
                        { text:'', options: {} },
                        { text:'', options: {} },
                        { text: phase.observations, options: rowCol5Options },
                    ]
                );
            });
            if (rows.length) {
                slideReport.addTable( rows, { x: 0.5, y: 0.7, w: 9.0, colW: [1.5,1,1,1,4.5] } );
            }
            
            var slideRecm = pptx.addNewSlide('SECONDARY_SLIDE');
            slideRecm.addText('DevACT Assessment Recommendations', { x:2.5, y:0.1, w:5, color:'015171', fontSize:18, align: 'l' });

            var rows = [];
            var rowCol1Options = {};
            var rowCol5Options = {fontSize:10};
            assessmentDetails.recommendations.map((recommendation, index) => {
                rows.push(
                    [
                        { text: ("0000" + (index + 1)).slice(-2) + ")", options: rowCol1Options },
                        { text: recommendation.title + "\n" + recommendation.description, options: rowCol5Options },
                    ]
                );
            });
            if (rows.length) {
                slideRecm.addTable( rows, { x: 0.5, y: 0.7, w: "100%", margin: [0, 0, 3, 0], autoPage: true, border: 'none', colW: [0.5,7] } );
            }
            
            var slideTy = pptx.addNewSlide('FINAL_SLIDE');

            var basefilename = 'presentations/assessment_' + (request.query.id);
            pptx.save(basefilename, function(filename){
                console.log(filename);
                fs.stat(filename, function(stats) {
                    reply.file(filename, {
                        filename: filename, // override the filename in the Content-Disposition header
                        mode: 'attachment', // specify the Content-Disposition is an attachment
                    });
                });
            });

            // reply({status: 'success'});
        }).catch(error => {
            reply({status: 'fail'});
        });
    }
});

async function example() {
    await server.register({ register: require('inert'), options: { message: 'hello' } });
}

server.register({
    register: require('hapi-cors'),
    options: {
        origins: ['http://localhost:4200']
    }
}, function (err) {
    /* await server.register({
        plugin: require('inert')
    }); */
    example();

    server.start((err) => {

        if (err) {
            throw err;
        }
        console.log('Server running at:', server.info.uri);
    });
});
