


/* Wait for the page is completely loaded */
$(function() {

    console.log("[DEMO] :: Rainbow IM Sample");
    /* Bootstrap the SDK */
    
    var applicationID = "a39da8b0515511ea819a43cb4a9dae9b",
        applicationSecret = "Y7EqjtweVCH0yWospZ2s47tgTmskQSUK6HpjvCnVRYXk0wdadV1C0PmwS2ZbjQxF";
    
    angular.bootstrap(document, ["sdk"]).get("rainbowSDK");
    
    /* Callback for handling the event 'RAINBOW_ONREADY' */
    var onReady = function onReady() {
        console.log("[DEMO] :: On SDK Ready !");

        let loginEmail = "JohnBerry@gmail.com";
        let password = "j0hnBerry!";
        let contactIdToSearch = "5e606512d8084c29e64eb6ab";
        //let token = "";

        //disconnected
        // replace with signin using token and implement a socket to hold token
        //rainbowSDK.connection.signinSandBoxWithToken(token).then(function() {
        rainbowSDK.connection.signin(loginEmail, password).then(function() {
            //connected
            console.log("[DEMO] :: Signed in");
            
            rainbowSDK.contacts.searchById(contactIdToSearch).then((contact)=>{
                console.log(contact);
                
                rainbowSDK.conversations.openConversationForContact(contact).then(function(conversation) {
                    console.log("[DEMO] :: Conversation", conversation);
    
                    rainbowSDK.im.getMessagesFromConversation(conversation, 30).then(function() {
                        console.log("[DEMO] :: Messages", conversation);
    
                        rainbowSDK.im.sendMessageToConversation(conversation, "First message");
    
                        rainbowSDK.im.sendMessageToConversation(conversation,  "Second message");
    
                    }).catch(function(err) {
                        console.error("[DEMO] :: Error Messages 1", err);
                    });
    
                }).catch(function(err) {
                    console.error("[DEMO] :: Error conversation", err);
                });

            }).catch((err)=>{
                console.log(err);
            });
            
        }).catch(function(err) {
            console.error("[DEMO] :: Error signin", err);
        });
    
    };

    /* Callback for handling the event 'RAINBOW_ONLOADED' */
    var onLoaded = function onLoaded() {
        console.log("[DEMO] :: On SDK Loaded !");

        rainbowSDK.initialize(applicationID,applicationSecret).then(function() {
            console.log("[DEMO] :: Rainbow SDK is initialized!");
        }).catch(function() {
            console.log("[DEMO] :: Something went wrong with the SDK...");
        });
    };

    /* Callback for handling the event 'RAINBOW_ONCONNECTIONSTATECHANGED' */
    /*var onConnectionChanged = function(event, state) {
        console.log("[DEMO] :: Connection state switch to " + state);
        if (state === "connected") {
            console.log("[DEMO] :: User is connected successfully!");    
        }else{
            console.log("[DEMO] :: User is " + state);
        }
    };*/

    var onNewMessageReceived = function(event, message, conversation) {
        var messageContent = "";
        
        console.log("[DEMO] :: new message received", message, conversation);
        console.log("[DEMO] :: side", message.side);

        //Send a read receipt
        rainbowSDK.im.markMessageFromConversationAsRead(conversation, message);

        messageContent = message.data;

        rainbowSDK.im.sendMessageToConversation(conversation, messageContent + " read!");
    }

    var onNewMessageReceiptReceived = function(event, message, conversation, type) {
        console.log("[DEMO] :: new receipt received", message, conversation, type);

        switch (type) {
            case "server":
                // Do something when Rainbow received your message
                console.log("[DEMO] :: Server receipt");
                break;
            case "received":
                // Do something when the recipient application received your message
                console.log("[DEMO] :: Received receipt");
                break;
            case "read":
                // Do something when the recipient application or the recipient user read your message
                console.log("[DEMO] :: Read receipt");
                break;
            default:
                break;
        }
    };



    
    /* Listen to the SDK event RAINBOW_ONLOADED */
    document.addEventListener(rainbowSDK.RAINBOW_ONLOADED, onLoaded);

    /* Listen to the SDK event RAINBOW_ONREADY */
    document.addEventListener(rainbowSDK.RAINBOW_ONREADY, onReady);

    //document.addEventListener(rainbowSDK.connection.RAINBOW_ONCONNECTIONSTATECHANGED, onConnectionChanged);

    document.addEventListener(rainbowSDK.im.RAINBOW_ONNEWIMMESSAGERECEIVED, onNewMessageReceived);

    document.addEventListener(rainbowSDK.im.RAINBOW_ONNEWIMRECEIPTRECEIVED, onNewMessageReceiptReceived);
   
    rainbowSDK.load();

    

});


