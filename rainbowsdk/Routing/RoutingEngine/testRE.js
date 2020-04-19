const RE = require('./RE.js');

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
};

function testModifyQueue(){
    let expected = [100];

    RE.poolRef.doc("general").update({
        "queue": [100]
    }).then();

    let doc = RE.poolRef.doc("general");
    var unsubscibe = doc.onSnapshot(docSnapshot =>{
        let currentQ = docSnapshot.get("queue");
        if (currentQ.size !== 0){
            console.log(`Queue is now: ${currentQ}`);
            // console.log(`Expected: ${expected}`);
            // console.log("*** TEST: ", JSON.stringify(currentQ) === JSON.stringify(expected), "***")
        }
    }, err =>{
        console.log(`Encountered error: ${err}`);
    });

    // Add customer that already exists in queue
    RE.addToQueue("general", 100).then();

    //Add new customer (not already in queue)
    expected.push(201);

    RE.addToQueue("general", 201).then(()=>{
        // expected.push(201);
    });


    // //wait for some time, add another new customer (not already in queue)
    sleep(500).then(()=>{
        RE.addToQueue("general", 202).then(()=>{
            expected.push(202);
        });
    });

    // remove a customer that doesn't exist from queue
    RE.removeFromQueue("general", 666).then();

    // remove a customer from queue
    sleep(4000).then(()=>{
        RE.removeFromQueue("general", 201).then(()=>{
            expected.splice(expected.indexOf(201), 1);
        });
    });

    // remove another customer from queue
    sleep(4000).then(()=>{
        RE.removeFromQueue("general", 202).then(()=>{
            expected.splice(expected.indexOf(202), 1);
        });
    });

    // Add 2 customers simultaneously
    sleep(6000).then(()=>{
        RE.addToQueue("general", 123).then(()=> {
            expected.push(123);
        });
        RE.addToQueue("general", 456).then(()=>{
            expected.push(456);
        });
    });

    sleep(9000).then(()=>{
        unsubscibe();
    });
}

// testModifyQueue();

function testReleaseWorker(){
    // Initialise queue
    RE.poolRef.doc("general").update({
        "queue": ["123", "456"]
    }).then();

    /**
     * TEST 1: Release worker (normal)
     */
    let a = RE.releaseWorker("worker1");
    a.then(function(resolve){
        console.log("*** TEST 1:", JSON.stringify(resolve) === JSON.stringify(["worker1", "123"]), "***")
    });

    /**
     * TEST 2: Release another worker servicing the same queue.
     */
    sleep(2000).then(()=>{
        let b = RE.releaseWorker("worker3");
        b.then(function(resolve){
            console.log("*** TEST 2:", JSON.stringify(resolve) === JSON.stringify(["worker3", "456"]), "***")
        });
    });

    /**
     * TEST 3: Release worker twice in a row. Check for race condition on checking and updating queue in database
     */
    sleep(4000).then(()=>{
        RE.releaseWorker("worker1").then();
        let c = RE.releaseWorker("worker1");
        c.then(function(resolve){
            console.log("*** TEST 3: ", resolve === null);
        })
    });
}

// testReleaseWorker();

function testAdmitCustomer() {
    // Initialise queue on server-side
    RE.poolRef.doc("general").update({
        "queue": []
    }).then();

    RE.adminRef.doc("worker1").update({
        "onCall": false
    }).then();

    /**
     * Test 1: Admit customer when there is no queue and there is available worker
     */
    sleep(200).then(() => {
        let a = RE.admitCustomer(888, "general");
        a.then(function (resolve) {
            console.log("*** TEST 1: ", JSON.stringify(resolve) === JSON.stringify(["worker1", 888]), " ***");
        });
    });

    /**
     * Test 2: Admit customer to queue where no worker is available to serve consecutively
     */
    sleep(400).then(() => {
        //
        let b = RE.admitCustomer(999, "general");
        let e = RE.admitCustomer(1999, "general");
        b.then(function (resolve) {
            console.log("*** TEST 2A: ", resolve === -1, " ***")
        });

        e.then(function (resolve) {
            console.log("*** TEST 2B: ", resolve === -1, " ***")
        });
    });
}

// testAdmitCustomer();

function testIntegrated(){

    /**
     * System only interfaces with routing engine using 2 main functions:
     *      (1) admitCustomer() and (2) releaseWorker()
     * Here we test 8 consecutive operations (in mixed order) and check for race conditions on "queue" variable in dataset
     */
    let pool = "testPool";

    let a = RE.admitCustomer("cust1", pool);
    let b = RE.admitCustomer("cust2", pool);
    let c = RE.admitCustomer("cust3", pool);
    let d = RE.releaseWorker("worker4");
    let e = RE.admitCustomer("cust4", pool);
    let f = RE.releaseWorker("worker5");
    let g = RE.releaseWorker("worker4");
    let h = RE.releaseWorker("worker5");

    a.then(function (resolve) {
        console.log("*** TEST 1: ", JSON.stringify(resolve) === JSON.stringify(["worker4", "cust1"]), " ***")
    });

    b.then(function(resolve){
        console.log("*** TEST 2: ", JSON.stringify(resolve) === JSON.stringify(["worker5", "cust2"]), " ***")
    });

    c.then(function(resolve){
        console.log("*** TEST 3: ", resolve === -1, " ***")
    });

    d.then(function(resolve){
        console.log("*** TEST 4: ", JSON.stringify(resolve) === JSON.stringify(["worker4", "cust3"]), " ***")
    });

    e.then(function(resolve){
        console.log("*** TEST 5: ", resolve === -1, " ***")
    });

    f.then(function(resolve){
        console.log("*** TEST 6: ", JSON.stringify(resolve) === JSON.stringify(["worker5", "cust4"]), " ***")
    });

    g.then(function(resolve){
        console.log("*** TEST 7: ", resolve === null, " ***")
    });

    h.then(function(resolve){
        console.log("*** TEST 8: ", resolve === null, " ***")
    });
}

// testIntegrated();

function testGetFreeWorker(){
    let a = RE.getFreeWorker("general");
    a.then(function (resolve) {
        for (let i = 0; i<resolve.length; i++){
            let status = RE.getWorkerState(resolve[0]);
            status.then(function (resolvestate){
                if (resolvestate[0] === true && resolvestate[1] === false ){
                    console.log("*** Test: ",  resolvestate[2].includes("general", " ***"))
                }
            })
        }
    });
}
// testGetFreeWorker();

// const express = require('express');
// const app = express();

// const port = process.env.PORT || 3001;
// const socket = require('socket.io');
//
// const server = app.listen(port, ()=>{
//     console.log(`port ${port} listening`);
// });
//
// const io = socket(server);
//
// io.on('connection', (socket) => {
//     console.log("socket connection made with id ", socket.id);
//
//     socket.on('addUser', (issue)=>{
//         console.log(issue);
//         RE.admitCustomer(12345, issue).then(()=>{
//             console.log("Admitted customer")
//         });
//     })
// });