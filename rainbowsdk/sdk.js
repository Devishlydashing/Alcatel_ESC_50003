// Load the SDK
let RainbowNodeSDK = require("rainbow-node-sdk");

class SDK{

    //only create nodeSDK when start is being called
    constructor() {
        this.nodeSDK = null;
    }

    //start the node SDK
    start(options){
        // Instantiate the SDK
        return new Promise((resolve) =>{
            this.rainbowNodeSDK = new RainbowNodeSDK(options);
                        
            this.rainbowNodeSDK.events.on('rainbow_onready', () => {
               console.log("SDK READY");
            });

            this.rainbowNodeSDK.start().then(()=>{
                //when rainbowSDK ready send resolve
                resolve();
            });
        });
        
    }
    
    //create anonymous user
    creatGuest(){
        return new Promise((resolve, reject)=>{
            
            let ttl = 3600 // active for x seconds
            this.rainbowNodeSDK.admin.createAnonymousGuestUser(ttl).then((guest) => {
                // Do something when the anonymous guest has been created and added to that company
                resolve(guest);
            }).catch((err) => {
                // Do something in case of error
                reject(err);
            });
        });

    }
    
    //get the contact object that contains the token to login and user id
    tokenize(){
        return new Promise((resolve, reject)=>{
            this.creatGuest().then((user) =>{
                this.rainbowNodeSDK.admin.askTokenOnBehalf(user.loginEmail, user.password).then((JsonToken) =>{
                    resolve(JsonToken);
                }).catch((err) =>{
                    reject(err);
                });
            }).catch((errorMsg) =>{
                reject(errorMsg + "tokenize failed");
            });
        })
    }

    /* not in use
    get state() {       
        return this.rainbowNodeSDK.state;
    }

    get version() {
        return this.rainbowNodeSDK.version;
    }

    get sdk() {
        return this.rainbowNodeSDK;
    }
    */
}

//export to index.js
module.exports = new SDK();