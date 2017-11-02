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
        prefix = appName.toLowerCase();
        prefix = prefix.split('a').join('')
                       .split('e').join('')
                       .split('i').join('')
                       .split('o').join('')
                       .split('u').join('');
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

    var args = ['new', appName,'--skip-install'];

    // Add the routing module
    if(routing == true) {
        args.push('--routing');
    }

    // Use NX to include ngrx
    if(ngrx == true) {
        args.push('--collection=@nrwl/schematics');
    }

    args.push('--style=' + style);

    // console.log("calling ng " + args);

    let newApp = cp.spawnSync('ng', args, {
        stdio: 'pipe'
    });
    console.log(String(newApp.stdout));

    if(req.query.fileFormat != undefined && req.query.fileFormat == 'tar') {
        let tar = cp.spawnSync('tar', ['-cvf', appName+'.tar.gz', appName]);
        res.setHeader('Content-Disposition', 'attachment; filename=' + appName + '.tar.gz');
        res.sendFile(appName + '.tar.gz', { root: __dirname }, function(err) {
            if(err) {
                console.log("Error sending file: " + err);
            } else {
                rimraf(appName, function() {console.log("removed " + appName)});
                fs.unlink(appName+'.tar.gz')
                // let cleanupTar = cp.spawn('rm' [ appName + '.tar.gz' ]);
                // let cleanupDir = cp.spawn('rm', ['-rf', appName]);
            }
        });
    } else {
        let zip = cp.spawnSync('zip', ['-r', appName + '.zip', appName]);
        res.setHeader('Content-Disposition', 'attachment; filename=' + appName + '.zip');
        res.sendFile(appName + '.zip', { root: __dirname }, function(err) {
            if(err) {
                console.log("Error sending file: " + err);
            } else {
                rimraf(appName, function() {console.log("removed " + appName)});
                fs.unlink(appName+'.zip')
                // let cleanupTar = cp.spawn('rm' [appName+'.zip']);
                // let cleanupDir = cp.spawn('rm', ['-rf', appName]);
            }
        });
    //     let cleanupZip = cp.spawn('rm' [appName+'.zip']);
    }
})

app.listen(3000, function() {
    console.log('Example app listening on port 3000!')
});