let express = require('express');
var cors = require('cors');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let cron = require('node-cron');
let debug = require('debug')('cli-api:server');
require('dotenv').config();
const { exec } = require('child_process');

let router = require('./routes');

let app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

getUsage(process.env.VOLUME);

cron.schedule('* * * * *', () => {
    getUsage(process.env.VOLUME);
});

app.use(['/', '/capacity'], router);

function getUsage(volume) {
    if(volume === "" || volume === undefined || volume === null) {
        console.log("No disk configured.  Check your .env file.");
        debug("No disk configured.  Check your .env file.");
        return;
    }
    let outputArray = [];
    const capacityCheck = exec('./scripts/capacity.sh');
    capacityCheck.stdout.on('data', (data)=>{
        outputArray = data.split('\n');
        for(let i = 0; outputArray.length > i; i++){
            if(outputArray[i].startsWith(volume.trim())) {
                let source = outputArray[i].split(' ');
                let capacity = {
                    size: source[1],
                    used: source[2],
                    available: source[3],
                    usagePercentage: (source[4].replace('%', '')/100),
                };
                app.set('capacity', capacity);
            }
        }
    });
}

module.exports = app;
