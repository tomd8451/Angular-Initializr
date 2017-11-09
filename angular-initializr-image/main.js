// Dependencies to wire up http endpoints objects
const express = require('express');
const app = express();

// Dependencies for executing shell commands
const cp = require('child_process');


var rimraf = require('rimraf');
var fs = require('fs');
var archiver = require('archiver');

app.get('/api', function(req, res){
    res.send(`
        <html>
            <head>
            </head>
            <body>
                <h1>
                Available Parameters
                </h1>
                <table>
                    <th>
                        <td>parameter</td>
                        <td>values</td>
                        <td>default</td>
                    <th>
                    <tr>
                        <td>appName</td>
                        <td>n/a</td>
                        <td>n/a</td>
                    </tr>
                    <tr>
                        <td>prefix</td>
                        <td>n/a</td>
                        <td>n/a</td>
                    </tr>
                    <tr>
                        <td>ngrx</td>
                        <td>true, false</td>
                        <td>false</td>
                    </tr>
                    <tr>
                        <td>routing</td>
                        <td>true,false</td>
                        <td>true</td>
                    </tr>
                    <tr>
                        <td>fileFormat</td>
                        <td>tar,zip</td>
                        <td>zip</td>
                    </tr>
                    <tr>
                        <td>style</td>
                        <td>css,scss,sass</td>
                        <td>scss</td>
                    </tr>
                </table>
            </body>
        </html>
        `);
});

app.get('/', function (req, res){
    var appName = req.query.appName;
    var prefix = req.query.prefix;
    var routing = req.query.routingModule;
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

    var generatedApp = '';

    if(ngrx) {
        generatedApp = generateNgrxApp(appName, prefix, routing, style);
    } else {
        generatedApp = generateAngularApp(appName, prefix, routing, style);
    }

    if(req.query.fileFormat != undefined && req.query.fileFormat == 'tar') {
        let tar = cp.execSync('tar -cvf ' + appName +'.tar.gz ' + generatedApp);
        res.setHeader('Content-Disposition', 'attachment; filename=' + appName + '.tar.gz');
        res.sendFile(appName + '.tar.gz', { root: __dirname }, function(err) {
            if(err) {
                console.log("Error sending file: " + err);
            } else {
                //rimraf(generatedApp, function() {console.log("removed " + generatedApp)});
                //fs.unlink(appName+'.tar.gz');
            }
        });
    } else {
        let zip = cp.execSync('zip -r ' + appName + '.zip ' + generatedApp);
        res.setHeader('Content-Disposition', 'attachment; filename=' + appName + '.zip');
        res.sendFile(appName + '.zip', { root: __dirname }, function(err) {
            if(err) {
                console.log("Error sending file: " + err);
            } else {
                //rimraf(generatedApp, function() {console.log("removed " + generatedApp)});
                //fs.unlink(appName+'.zip');
            }
        });
    }
})

generateNgrxApp = function(appName, prefix, routing, style) {

    // Directory to generate apps in
    var generatedDir = '/usr/generated';

    // Name the workspace
    var workspaceName = appName + 'Workspace';

    // Create the workspace args
    var workspaceArgs = 'new ' + workspaceName + ' --collection=@nrwl/schematics --skip-install';

    console.log('calling execSync for workspace with args ' + workspaceArgs)
    let newWorkspace = cp.execSync('ng', workspaceArgs, {
        cwd: generatedDir,
        stdio: 'pipe',
        stderr: 'pipe'
    });
    console.log(' STDOUT: ' + String(newWorkspace.stdout));
    console.log(' STDERR: ' + String(newWorkspace.stderr));

    // Create the app within the workspace
    let args = 'ng generate app ' + appName;

    // Add the routing module
    if(routing == true) {
        args = args + ' --routing';
    }

    args = args + ' --style=' + style;

    args = args + ' --prefix=' + prefix;

    args = args + ' --skip-install';

    console.log('calling execSync for app within workspace with ' + args);
    let newApp = cp.execSync(args, {
        cwd: generatedDir + '/' + workspaceName,
        stdio: 'pipe',
        stderr: 'pipe'
    });

    return generatedDir + '/' + workspaceName;
}

generateAngularApp = function(appName, prefix, routing, style) {

    // Directory to generate apps in
    var generatedDir = '/usr/generated';

    // Create the application args
    var args = 'ng new ' + appName;

    // Add the routing module
    if(routing == true) {
        args = args + ' --routing';
    }

    args = args + ' --style=' + style;

    args = args + ' --prefix=' + prefix;

    args = args + ' --skip-install';


    console.log('calling execSync for app with ' + args);
    let newApp = cp.execSync(args, {
        cwd: generatedDir,
        stdio: 'pipe',
        stderr: 'pipe'
    });
    console.log(' STDOUT: ' + String(newApp.stdout));
    console.log(' STDERR: ' + String(newApp.stderr));
    
    return generatedDir + '/' + appName;
    
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