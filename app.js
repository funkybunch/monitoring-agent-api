let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let cron = require('node-cron');
require('dotenv').config();
const { exec } = require('child_process');

let router = require('./routes');

let app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

getUsage(process.env.VOLUME);

cron.schedule('* * * * *', () => {
    getUsage(process.env.VOLUME);
});

app.use(['/', '/capacity'], router);

function getUsage(volume) {
    console.log('running a task every minute');
    let outputArray = [];
    exec('df -h', (err, stdout, stderr) => {
        if (err) {
            //some err occurred
            console.error(err);
        } else {
            // the *entire* stdout and stderr (buffered)
            outputArray = stdout.split('\n');
            for(let i = 0; outputArray.length > i; i++){
                if(outputArray[i].includes(volume)) {
                    let capacityTotal = outputArray[i].substring(13, 20).trim();
                    let spaceUsed = outputArray[i].substring(21, 27).trim();
                    let spaceAvailable = outputArray[i].substring(29, 35).trim();
                    let usagePercentage = outputArray[i].substring(37, 40).trim()/100;
                    let parsedData = {
                        size: capacityTotal,
                        used: spaceUsed,
                        available: spaceAvailable,
                        usagePercentage: usagePercentage,
                    };
                    app.set('capacity', parsedData);
                }
            }
        }
    });
}

module.exports = app;
