// initialising connection to database
let admin = require("firebase-admin");
let serviceAccount = require("./escproject-40279-firebase-adminsdk-11yxn-c11b112c39.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://escproject-40279.firebaseio.com"
});


let db = admin.firestore();
let adminRef = db.collection("admin");
let poolRef = db.collection("pools");
const skills = ["general", "password", "others"];

function initStats(skill, available, onCall){
    /**
     * Aggregates the number of available and onCall workers by traversing through all workers that has specified skill
     */
    poolRef.doc(skill).update({
        "available": available,
        "onCall": onCall
    }).then(function(){
        console.log("Successfully updated skillStats.")
    });
}

function resetDatabase(skill){
    /**
     * Prints all workers with specified filed
     * @type {number}
     */
    var available = 0;
    var onCall = 0;
    let query = adminRef.where("skills", "array-contains", skill)
        .get().then(snapshot=>{
            if (snapshot.empty){
                console.log("No worker available");
                return;
            }
            snapshot.forEach(doc=>{
                if (doc.get("availability")){
                    available ++;
                }
                if (doc.get("onCall")){
                    onCall ++;
                }

                console.log(doc.id, "=>", doc.data());
            });
            console.log(`available: ${available}`);
            console.log(`onCall: ${onCall}`);

            initStats(skill, available, onCall);
        })
        .catch((err) => {
            console.log("Error retrieving data.", err)
        });
}

// for (let i= 0; i< skills.length; i++){
//     resetDatabase(skills[i])
// }


function addWorkerToDatabase(workerID, skills){
    /*
    Add a worker to the admin database.
     */
    adminRef.doc(workerID).set({
        "availability": true,
        "onCall": false,
        "skills": skills,
        "id": workerID
    }).then(function(){
        console.log(`successfully added worker ${workerID} to database`);
    });
}

async function getFreeWorker(skill){
    /**
     Get worker available to take call. Query worker who is available, not on call, and has the required skill.
     */
    let adminAvail = [];
    await adminRef.where("skills", "array-contains", skill)
        .where("availability", '==', true)
        .where("onCall", "==", false)
        .get().then(snapshot=>{
            if (snapshot.empty){
                console.log("No worker available");
                return;
            }
            snapshot.forEach(doc=>{
                let adminID = doc.id;
                adminAvail.push(adminID);
            });
        })
        .catch((err) => {
            console.log("Error retrieving data.", err)
        });
    return adminAvail;
}


function getWorkerState(workerID){
    return adminRef.doc(workerID).get().then(function(doc){
        return [doc.get("availability"), doc.get("onCall"), doc.get("skills")]
    })
}

function testGetFreeWorker(){
    let a = getFreeWorker("general");
    a.then(function (resolve) {

        for (let i = 0; i<resolve.length; i++){
            let status = getWorkerState(resolve[0]);
            // console.log(status);
            status.then(function (resolvestate){
                // console.log(resolvestate[2][0]);
                if (resolvestate[0] === true && resolvestate[1] === false ){
                    console.log(resolvestate[2].includes("general"))
                }
            })
        }
    });
}

// TODO: Uncomment for testing DEMO
testGetFreeWorker();

function addToQueue(pool, custID){
    poolRef.doc(pool).update({
        "queue": admin.firestore.FieldValue.arrayUnion(custID)
    }).then(function(){
        console.log(`Added ${custID} to queue.`)
    });
}

function removeFromQueue(skill, custID){
    /**
     * Remove customer by customer ID from specified queue
     */

    poolRef.doc(skill).update({
        "queue": admin.firestore.FieldValue.arrayRemove(custID)
    }).then(function(){
        console.log(`Removed ${custID} from queue`)
    });
}

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
};

function testModifyQueue(){
    let expected = [100];

    poolRef.doc("general").update({
        "queue": [100]
    });

    let doc = poolRef.doc("general");
    var unsubscibe = doc.onSnapshot(docSnapshot =>{

        let currentQ = docSnapshot.get("queue");
        if (currentQ.size !== 0){
            console.log(`Queue is now: ${currentQ}`);
            console.log("*** TEST: ", JSON.stringify(currentQ) === JSON.stringify(expected), "***")
        }
    }, err =>{
        console.log(`Encountered error: ${err}`);
    });

    // Add customer that already exists in queue
    addToQueue("general", 100);

    //Add new customer (not already in queue)
    expected.push(201);
    addToQueue("general", 201);


    // //wait for some time, add another new customer (not already in queue)
    sleep(500).then(()=>{
        addToQueue("general", 202);
        expected.push(202);
    });

    // remove a customer that doesn't exist from queue
    removeFromQueue("general", 666);

    // remove a customer from queue
    sleep(2000).then(()=>{
        expected.splice(expected.indexOf(201), 1);
        removeFromQueue("general", 201);
    });

    // remove another customer from queue
    sleep(2000).then(()=>{
        expected.splice(expected.indexOf(202), 1);
        removeFromQueue("general", 202);
    });

    sleep(5000).then(()=>{
        unsubscibe();
    });
}

// TODO: uncomment for testing DEMO
// testModifyQueue();


async function releaseWorker(workerID){
    /**
     * Function is called when worker ends his current call.
     * Get next customer to talk to.
     * Returns both WorkerID and CustomerID.
     */
    return adminRef.doc(workerID).get().then(function (doc) {
        let workerSkill = doc.get("skills")[0];

        return poolRef.doc(workerSkill).get().then(function (doc) {
            let q = doc.get("queue");
            if (q.length === 0) {
                setWorkerOnCall(workerID);
                return -1
            } else {
                removeFromQueue(workerSkill, q[0]);
                return [workerID, q[0]]
            }
        })
    })
}

// releaseWorker("worker1");

function testReleaseWorker(){
    // Initialise queue
    poolRef.doc("general").update({
        "queue": ["123", "456"]
    }).then();


    let a = releaseWorker("worker1");
    a.then(function(resolve){
        console.log("*** TEST 1:", JSON.stringify(resolve) === JSON.stringify(["worker1", "123"]), "***")
    });

    sleep(2000).then(()=>{
        let b = releaseWorker("worker3");
        b.then(function(resolve){
            console.log("*** TEST 2:", JSON.stringify(resolve) === JSON.stringify(["worker3", "456"]), "***")
        });
    });

    sleep(4000).then(()=>{
        let c = releaseWorker("worker1");
        c.then(function(resolve){
            console.log("*** TEST 3: ", resolve === null);
        })
    })

    // maybe want to write a listener to record when the onCall is toggled.
}

// TODO: uncomment for testing demo
// testReleaseWorker();

function setWorkerAvailability(workerID, avail){
    adminRef.doc(workerID).update({
        "availability": avail
    }).then(function(){
        console.log("Flipped Admin Availability");
    })
}

function setWorkerOnCall(workerID, toBool){
    adminRef.doc(workerID).update({
        "onCall": toBool
    }).then(function(){
        console.log(`${workerID} onCall set to ${toBool}`)
    })
}

function admitCustomer(custID, pool) {
    return poolRef.doc(pool).get().then(function (doc) {
        let queue = doc.get("queue");
        console.log(queue);

        if (Array.isArray(queue) && queue.length === 0){
            let workerFree = getFreeWorker(pool);
            return workerFree.then(function(resolve){
                if (resolve.length > 0){
                    setWorkerOnCall(resolve[0], true);
                    return [resolve[0], custID]
                }else{
                    return -1
                }
            })
        }else{
            addToQueue(pool, custID);
            return -1
        }
    })
}

// admitCustomer(123, "general").then(()=>{
//     console.log("done");
// });

function testAdmitCustomer(){
    // Initialise queue on server-side
    poolRef.doc("general").update({
        "queue": []
    }).then();


    adminRef.doc("worker1").update({
        "onCall": false
    }).then();

    // Admit customer when there is no queue and there is available to serve
    let a = admitCustomer(888, "general");
    a.then(function(resolve){
        console.log("*** TEST 1: ", JSON.stringify(resolve) === JSON.stringify(["worker1", 888]), " ***");
    });

    // Admit customer to queue where no worker is available to serve
    let b = admitCustomer(999, "others");
    b.then(function(resolve){
        console.log("*** TEST 2: ", resolve === -1, " ***")
    });



    sleep(500).then(()=>{
        //Adding customer to queue
        addToQueue("general", 111);


        let c = releaseWorker("worker1");
        c.then(function(resolve){
            console.log("*** TEST 3: ", JSON.stringify(resolve) === JSON.stringify(["worker1", 111]), " ***");
        });
    });
}

// TODO: uncomment for DEMO:
// testAdmitCustomer();
