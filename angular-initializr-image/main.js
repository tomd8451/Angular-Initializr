const express = require('express');
const app = express();

var fs = require('fs');
var archiver = require('archiver');

var output = fs.createWriteStream('temp.zip');
var zipArchive = archiver('zip');

output.on('close', function() {
    console.log('done with the zip', 'temp.zip');
});

zipArchive.pipe(output);

zipArchive.directory("srcDirectory", "srcDirectory");

zipArchive.finalize(function(err, bytes) {

    if(err) {
        throw err;
    }

    console.log('done:', base, bytes);
});

app.get('/', function (req, res){
    res.sendFile('temp.zip', { root: __dirname });
})

app.listen(3000, function() {
    console.log('Example app listening on port 3000!')
});