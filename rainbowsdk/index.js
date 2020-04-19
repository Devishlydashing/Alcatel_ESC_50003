const express = require('express');
const sdk = require('./sdk.js');
const app = express();
const port = process.env.PORT || 3000;
const socket = require('socket.io');
var asyncMutex = require('async-mutex').Mutex;
const mutex = new asyncMutex();
mutex.acquire().then();
const RE = require("./Routing/RoutingEngine/RE.js");



//configurations
let options = {
    rainbow: {
        host: "sandbox"
    },
    credentials: {
        login: "cheng_lin@mymail.sutd.edu.sg", // To replace by your developer credendials
        password: "Killer00!" // To replace by your developer credentials
    },
    // Application identifier
    application: {
        appID: "a39da8b0515511ea819a43cb4a9dae9b",
        appSecret: "Y7EqjtweVCH0yWospZ2s47tgTmskQSUK6HpjvCnVRYXk0wdadV1C0PmwS2ZbjQxF"
    },
    // Logs options
    logs: {
        enableConsoleLogs: true,
        enableFileLogs: false,
        "color": true,
        "level": 'debug',
        "customLabel": "vincent01",
        "system-dev": {
            "internals": false,
            "http": false,
        }, 
        file: {
            path: "/var/tmp/rainbowsdk/",
            customFileName: "R-SDK-Node-Sample2",
            level: "debug",
            zippedArchive : false/*,
            maxSize : '10m',
            maxFiles : 10 // */
        }
    },
    // IM options
    im: {
        sendReadReceipt: true
    }
};

//instantiate a server that listen to the port number
const server = app.listen(port, ()=>{
    console.log(`port ${port} listening`);
});

//static files for base page
app.use(express.static('./client/public'));

//instantiate socket that connects to the server
const io = socket(server);
var id;

//loads the eventlisteners when socket is connected
io.on('connection', (socket) => {
    console.log("socket connection made with id ", socket.id);

    //listen to the request of creating anonymous account
    socket.on('Anonymous', (data)=>{
        console.log(data);
            sdk.tokenize().then((Jsontoken) => {
                console.log("User ID: " + Jsontoken.loggedInUser.id);
                let adminID = RE.admitCustomer(Jsontoken.loggedInUser.id, data);
                adminID.then(function(resolve){
                    console.log("Admitted customer")
                    console.log(resolve[0]);
                    socket.emit('token', [Jsontoken.token, resolve[0], Jsontoken.loggedInUser.id]);
                                    });
            }).catch((errorMsg) =>{
                console.log(errorMsg);
            });
    })

    //listen to the request to end conversation
    socket.on("end", (adminID)=>{
        console.log(adminID);
        let waitingPair = RE.releaseWorker(adminID);
        waitingPair.then(function(resolve){
            if(resolve != null){
                console.log("Return Waiting Pair");
                console.log("ADMIN ID: " + resolve[0]);
                console.log("USER ID: " + resolve[1]);
                io.emit('waiting', [resolve[0],resolve[1]]);
            }
            });
        });
});


//start NodeSDK with configurations
sdk.start(options);

