var asyncMutex = require('async-mutex').Mutex;
const mutex = new asyncMutex();
mutex.acquire().then();

class Engine{
    constructor(){
        this.admin = require("firebase-admin");
        let serviceAccount = require("./escproject-40279-firebase-adminsdk-11yxn-c11b112c39.json");

        this.admin.initializeApp({
            credential: this.admin.credential.cert(serviceAccount),
            databaseURL: "https://escproject-40279.firebaseio.com"
        });

        this.db = this.admin.firestore();
        this.adminRef = this.db.collection("admin");
        this.poolRef = this.db.collection("pools");
        this.skills = ["general", "password", "others"];

        this.mutex = new asyncMutex();
    }

    initStats(skill, available, onCall){
        /**
         * Aggregates the number of available and onCall workers by traversing through all workers that has specified skill
         */
        this.poolRef.doc(skill).update({
            "available": available,
            "onCall": onCall
        }).then(function(){
            console.log("Successfully updated skillStats.")
        });
    }

    resetDatabase(skill){
        /**
         * Prints all workers with specified filed
         * @type {number}
         */
        let available = 0;
        let onCall = 0;
        let query = this.adminRef.where("skills", "array-contains", skill)
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

                this.initStats(skill, available, onCall);
            })
            .catch((err) => {
                console.log("Error retrieving data.", err)
            });
    }

    addWorkerToDatabase(workerID, skills){
        /*
        Add a worker to the admin database.
         */
        this.adminRef.doc(workerID).set({
            "availability": true,
            "onCall": false,
            "skills": skills,
            "id": workerID
        }).then(function(){
            console.log(`successfully added worker ${workerID} to database`);
        });
    }

    async getFreeWorker(skill){
        /**
         Get worker available to take call. Query worker who is available, not on call, and has the required skill.
         */
        let adminAvail = [];
        await this.adminRef.where("skills", "array-contains", skill)
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

    getWorkerState(workerID){
        return this.adminRef.doc(workerID).get().then(function(doc){
            return [doc.get("availability"), doc.get("onCall"), doc.get("skills")]
        })
    }

    async addToQueue(pool, custID){
        // const release = await this.mutex.acquire();

        await this.poolRef.doc(pool).update({
            "queue": this.admin.firestore.FieldValue.arrayUnion(custID)
        }).then(function(){
            console.log(`Added ${custID} to queue.`)
        });
        // release();
    }

    async removeFromQueue(skill, custID){
        /**
         * Remove customer by customer ID from specified queue
         */
        // const release = await this.mutex.acquire();
        this.poolRef.doc(skill).update({
            "queue": this.admin.firestore.FieldValue.arrayRemove(custID)
        }).then(function(){
            console.log(`Removed ${custID} from queue`)
        });
        // release();
    }

    async releaseWorker(workerID){
        /**
         * Function is called when worker ends his current call.
         * Get next customer to talk to.
         * Returns both WorkerID and CustomerID.
         */

        const getq = await this.mutex.acquire();
        console.log("In ReleaseWorker");

        var self = this;
        return self.adminRef.doc(workerID).get().then(function (doc) {
            let workerSkill = doc.get("skills")[0];

            return self.poolRef.doc(workerSkill).get().then(function (doc) {
                let q = doc.get("queue");
                console.log(q);
                if (q.length === 0) {
                    self.setWorkerOnCall(workerID, false);
                    getq();

                    return null
                } else {
                    self.removeFromQueue(workerSkill, q[0]);
                    getq();
                    return [workerID, q[0]]
                }
            })
        });
    }

    setWorkerAvailability(workerID, avail){
        this.adminRef.doc(workerID).update({
            "availability": avail
        }).then(function(){
            console.log("Flipped Admin Availability");
        })
    }

    setWorkerOnCall(workerID, toBool){
        var self = this;
        self.adminRef.doc(workerID).update({
            "onCall": toBool
        }).then(function(){
            console.log(`${workerID} onCall set to ${toBool}`)
        })
    }

    async admitCustomer(custID, pool) {
        const getq = await this.mutex.acquire();

        var self = this;
        return this.poolRef.doc(pool).get().then(function (doc) {
            let queue = doc.get("queue");
            console.log(queue);

            if (Array.isArray(queue) && queue.length === 0){
                let workerFree = self.getFreeWorker(pool);
                return workerFree.then(function(resolve){
                    if (resolve.length > 0){
                        self.setWorkerOnCall(resolve[0], true);
                        getq();
                        return [resolve[0], custID]
                    }else{
                        self.addToQueue(pool, custID).then();
                        getq();
                        return -1
                    }
                })
            }else{
                self.addToQueue(pool, custID).then();
                getq();
                return -1
            }
        })
    }
}

module.exports = new Engine();
