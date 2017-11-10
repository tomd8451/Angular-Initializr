// Dependencies to wire up http endpoints objects
const express = require('express');
const path = require('path');
const app = express();

// Dependencies for executing shell commands
const cp = require('child_process');


var rimraf = require('rimraf');
var fs = require('fs');
var archiver = require('archiver');

app.use('/', express.static(path.join(__dirname, 'dist')));

app.get('/api', function (req, res){
    var appName = req.query.appName;
    var prefix = req.query.prefix;
    var routing = req.query.routing;
    var ngrx = req.query.ngrx;
    var style = req.query.style;

    if(appName == undefined || appName == 'undefined') {
        appName = 'newApp';
    }
    console.log('creating app with name ' + appName);

    if(prefix == undefined || prefix == 'undefined') {
        prefix = generatePrefix(appName);
    }
    console.log('creating app with prefix ' + prefix);

    if(routing == undefined || routing == 'undefined' || routing != 'false') {
        routing = true;
    } else {
        routing = false;
    }
    console.log('creating app with routing = ' + routing);

    if(ngrx == undefined || ngrx == 'undefined' || ngrx != 'true') {
        ngrx = false;
    } else {
        ngrx = true;
    }
    console.log('creating app with ngrx = ' + ngrx);

    if(style == undefined || style == 'undefined' || style != 'css'
        || style != 'sass') {
            style = 'scss';
    }
    console.log('creating app with style = ' + style);

    // Directory to generate apps in
    var generatedDir = '/usr/generated';

    var generatedApp = '';

    if(ngrx) {
        generatedApp = generateNgrxApp(appName, prefix, routing, style, generatedDir);
        
        let zip = cp.execSync('rm -r node_modules',
            { cwd: generatedDir + '/' + generatedApp },
            (error, stdout, stderr) => {
                if (error) {
                    console.error(`rm -r node_modules execSync error: ${error}`);
                    return;
                }
                console.log(`rm -r node_modules stdout: ${stdout}`);
                console.log(`rm -r node_modules stderr: ${stderr}`);
            }
        );
    } else {
        generatedApp = generateAngularApp(appName, prefix, routing, style, generatedDir);
    }

    if(req.query.fileFormat != undefined && req.query.fileFormat == 'tar') {
        let tar = cp.execSync('tar -cvf ' + generatedApp +'.tar.gz ' + generatedApp,
                { cwd: generatedDir}
            );
        res.setHeader('Content-Disposition', 'attachment; filename=' + generatedApp + '.tar.gz');
        res.sendFile(generatedDir + '/' + generatedApp + '.tar.gz', { root: '/' }, function(err) {
            if(err) {
                console.log("Error sending file: " + err);
            } else {
                rimraf(
                    generatedDir + '/' + generatedApp,
                    function() {console.log("removed " + generatedDir + '/' + generatedApp)});
                fs.unlink(generatedDir + '/' + generatedApp + '.tar.gz', (err) => {
                    console.error('Error removing ' + generatedDir + '/' + generatedApp + '.tar.gz');
                });
            }
        });
    } else {
        let zip = cp.execSync('zip -r ' + generatedApp + '.zip ' + generatedApp,
            { cwd: generatedDir}
        );
        res.setHeader('Content-Disposition', 'attachment; filename=' + generatedApp + '.zip');
        res.sendFile(generatedDir + '/' + generatedApp + '.zip', { root: '/' }, function(err) {
            if(err) {
                console.log("Error sending file: " + err);
            } else {
                rimraf(generatedDir + '/' + generatedApp, 
                    function() {console.log("removed " + generatedDir + '/' + generatedApp)});
                fs.unlink(generatedDir + '/' + generatedApp+'.zip', (err) => {
                    console.error('Error removing ' + generatedDir + '/' + generatedApp+'.zip');
                });
            }
        });
    }
})

generateNgrxApp = function(appName, prefix, routing, style, generatedDir) {

    // Name the workspace
    var workspaceName = appName + 'Workspace';

    // Create the workspace args
    var workspaceCommand = 'ng new ' + workspaceName + ' --collection=@nrwl/schematics';

    console.log('calling execSync for workspace with args ' + workspaceCommand)
    let newWorkspace = cp.execSync(workspaceCommand, 
        { cwd: generatedDir }, 
        (error, stdout, stderr) => {
            if (error) {
                console.error(`workspace execSync error: ${error}`);
                return;
            }
            console.log(`workspace stdout: ${stdout}`);
            console.log(`workspace stderr: ${stderr}`);
        }
    );

    // Create the app within the workspace
    let command = 'ng generate app ' + appName;

    // Add the routing module
    if(routing == true) {
        command = command + ' --routing';
    }

    command = command + ' --style=' + style;

    command = command + ' --prefix=' + prefix;

    command = command + ' --skip-install';

    console.log('calling execSync for app within workspace with ' + command);
    let newApp = cp.execSync(command, 
        { cwd: generatedDir + '/' + workspaceName },
        (error, stdout, stderr) => {
            if (error) {
                console.error(`workspace app execSync error: ${error}`);
                return;
            }
        }
    );

    return workspaceName;
}

generateAngularApp = function(appName, prefix, routing, style, generatedDir) {

    // Create the application args
    var command = 'ng new ' + appName;

    // Add the routing module
    if(routing == true) {
        command = command + ' --routing';
    }

    command = command + ' --style=' + style;

    command = command + ' --prefix=' + prefix;

    command = command + ' --skip-install';


    console.log('calling execSync for app with ' + command);
    let newApp = cp.execSync(command, 
        { cwd: generatedDir },
        (error, stdout, stderr) => {
            if (error) {
                console.error(`app execSync error: ${error}`);
                return;
            }
            console.log(`app stdout: ${stdout}`);
            console.log(`app stderr: ${stderr}`);
        }
    );
    
    return appName;
}

generatePrefix = function(appName) {
    var prefix = appName.toLowerCase();
    prefix = prefix.split('a').join('')
                   .split('e').join('')
                   .split('i').join('')
                   .split('o').join('')
                   .split('u').join('');
    return prefix;
}

app.listen(3000, function() {
    console.log('Example app listening on port 3000!')
});