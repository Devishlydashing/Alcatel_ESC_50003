/* Document Format
*   Help Functions
*   Rainbow SDK Function
*   Chat Functions
*   Call Functions
*   End Functions
*/
const socket = io.connect('http://localhost:3000/');
let adminID = "";
let waitingUser = "";
let issueClicked = "";
let mocClicked = "";
let Callobject = null;

// ALL the Help Functions:
// ------------------------------------------------------------------------------------------------------------------------------------------

// Function that runs when:
// On loading of the page
function help(){
document.getElementById("body").innerHTML = `
<html lang="en">
    <head >
        <link rel="stylesheet" href="style.css">
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
        <title>Help Page</title>
    </head>

    <body>
    <div class="row">
        <div class="col-md-12">
            <div class="mx-auto" style="width: 200px;">
                <h1>Help Page</h1>
                <div class="text-justify">
                    <p>Hi there, please state your <strong>Issue</strong> and preferred <strong>Means of Communication</strong>
                        before clicking the <strong>Next</strong> button.</p>
                </div>

                <!--Issue-->
                <div class="text-justify" id = "text">
                    <label><p><strong>Issue:</strong></p></label><br>
                    <input type = "radio"
                           name = "Issue"
                           id = "general"
                           value = "General"
                           checked = "checked"/>
                    <label for = "General">General</label><br>
                    <input type = "radio"
                           name = "Issue"
                           id = "password"
                           value = "Password"/>
                    <label for = "password">Password</label><br>
                    <input type = "radio"
                           name = "Issue"
                           id = "others"
                           value = "Others"/>
                    <label for = "Others">Others</label><br>
                </div>

                <!--Means of Communication-->
                <div class="text-left">
                    <label><p><strong>Means of Communication:</strong></p></label>

                    <input type = "radio"
                           name = "MoC"
                           id = "Chat"
                           value = "Chat"
                           checked = "checked"/>
                    <!--                   onclick="checkFunc1()"/>-->
                    <label for = "Chat">Chat</label><br>
                    <input type = "radio"
                           name = "MoC"
                           id = "Call"
                           value = "Call"/>
                    <!--                   onclick="checkFunc1()"/>-->
                    <label for = "Call">Call</label><br>
                </div>

                <!--Next Button-->
<!--                <a href="chat.html">-->
                <button type="button"
                        id="Next"
                        onclick="checkFunc()"
                        class="btn btn-primary btn-lg btn-block">Next</button>
<!--                </a>-->

                <!--About the Team-->
                <div class="mt-5">
                    <h10><small>SUTD ISTD Class of 2021 Cohort 3 Group 5.</small></h10>
                </div>
            </div>
        </div>
    </div>
    </body>

</html>
`;
}



//called when the user click next
function checkFunc() {
  // Prevent multiple clicks
  document.getElementById("Next").disabled = true;
  // Wait message
  alert("Please Wait while we connect you with our Administrators.\nThank you.");

  console.log("in checkFunc()");

  var radios_issue = document.getElementsByName("Issue");
  var radios_moc = document.getElementsByName("MoC");

  for (var i = 0; i < radios_issue.length; i++) {
    if (radios_issue[i].checked) {
      // alert(radios_issue[i].id);
      issueClicked = radios_issue[i].id;
      break;
      }
    }

  for (var j = 0; j < radios_moc.length; j++) {
    if (radios_moc[j].checked) {
      // alert(radios_moc[i].id);
      mocClicked = radios_moc[j].id;
      break;
    }
  }

  // Add user to Firebase Database.
  socket.emit("addUser", issueClicked);
  console.log(`issueClick: ${issueClicked}`);
  socket.emit('Anonymous', issueClicked);

  console.log("[DEMO] :: Issue Selected: " + issueClicked);
  console.log("[DEMO] :: MOC Selected: " + mocClicked);
}


// ------------------------------------------------------------------------------------------------------------------------------------------


// Rainbow SDK Function
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
    };

    /* Callback for handling the event 'RAINBOW_ONLOADED' */
    var onLoaded = function onLoaded() {
        console.log("[DEMO] :: On SDK Loaded !");
        // Activate full SDK log
        rainbowSDK.setVerboseLog(true);

        rainbowSDK.initialize(applicationID,applicationSecret).then(function() {
            console.log("[DEMO] :: Rainbow SDK is initialized!");
        }).catch(function() {
            console.log("[DEMO] :: Something went wrong with the SDK...");
        });
    };


    //signin the guest user when receiving the token
    socket.on('token', (data)=>{
        if(data[1] != null){
            adminID = data[1];
        }
        rainbowSDK.connection.signinSandBoxWithToken(data[0]).then(function() {
            console.log("[DEMO] :: adminID: " + data[1]);
            //connected
            console.log("[DEMO] :: Signed in");

            //if the admin is free, start the conversation
            if(data[1] != null){
                adminID = data[1];
                initiateConversation(data[1]);
            }
            //else if admin not free, send waiting user to queue
            else{
                waitingUser = data[2];
            }
        }).catch(function(err) {
            console.error("[DEMO] :: Error signin", err);
        });
    });

    // To reconnect a waiting user once the Admin is free.
    socket.on('waiting',(data)=>{
        console.log("[DEMO] :: data[1] " + data[1]);
        console.log("[DEMO] :: waitingUser " + waitingUser);
        if(data[1] == waitingUser){
            adminID = data[0];
            initiateConversation(data[0]);
        }
    })

    var onNewMessageReceived = function(event) {
        var messageContent = "";

        let message = event.detail.message;
        let conversation = event.detail.conversation;

        console.log("[DEMO] :: new message received", message, conversation);

        //Send a read receipt
        rainbowSDK.im.markMessageFromConversationAsRead(conversation, message);
        messageContent = message.data;
        //rainbowSDK.im.sendMessageToConversation(conversation, messageContent + " read!");

        RecMess(messageContent);
    }
    //getting permission to use microphone
    navigator.mediaDevices.getUserMedia({audio: true, video: false}).then(function(stream) {
        /* Stream received which means that the user has authorized the application to access to the audio and video devices. Local stream can be stopped at this time */
        stream.getTracks().forEach(function(track) {
            track.stop();
        });

        /*  Get the list of available devices */
        navigator.mediaDevices.enumerateDevices().then(function(devices){

            /* Do something for each device (e.g. add it to a selector list) */
            devices.forEach(function(device) {
                switch (device.kind) {
                    case "audioinput":
                        console.log("[DEMO] :: " + device.deviceId);
                        /* Select the microphone to use */
                        rainbowSDK.webRTC.useMicrophone(device.deviceId);
                        break;
                    case "audiooutput":
                        /* Select the speaker to use */
                        rainbowSDK.webRTC.useSpeaker(device.deviceId);
                        break;
                    case "videoinput":
                        // This is a device of type 'camera'
                        break;
                    default:
                        break;
                }
            });
        }).catch(function(error) {
            console.log("[DEMO} :: " + error);
        });
    }).catch(function(error) {
        console.log("[DEMO} ::" + error);
    });

    //listen when webRTC error occured
    let onWebRTCErrorHandled = function(event) {
        let errorSDK = event.detail;
        // event.detail contains an Error object
        console.log("WebRTC ERROR", errorSDK)
    }

    /* Listen to WebRTC call state change */    
    let onWebRTCCallChanged = function(event) {
        // event.detail contains a Call Object
        console.log("onWebRTCCallChanged event", event.detail)
        let call = event.detail;

        console.log("[DEMO] :: OnWebRTCCallChanged event", event.detail.status.value);
        let close_btn = document.getElementById("endButton");

        function terminateCall() {
          let res = rainbowSDK.webRTC.release(call);
        }

        if (call.status.value == "active") {
          document.getElementById("p1").innerHTML = "Connected";
          close_btn.addEventListener("click", terminateCall);

          console.log("[DEMO] :: Connected");
        } else if (event.detail.status.value == "Unknown") {
          document.getElementById("p1").innerHTML = "Call Terminated";
        } else if (event.detail.status.value == "dialing") {
          close_btn.addEventListener("click", terminateCall);
        }
    }
    

    /* Listen to the SDK event RAINBOW_ONLOADED */
    document.addEventListener(rainbowSDK.RAINBOW_ONLOADED, onLoaded);

    /* Listen to the SDK event RAINBOW_ONREADY */
    document.addEventListener(rainbowSDK.RAINBOW_ONREADY, onReady);

    // listen to the new message received
    document.addEventListener(rainbowSDK.im.RAINBOW_ONNEWIMMESSAGERECEIVED, onNewMessageReceived);

    //Error when handling webRTC
    document.addEventListener(rainbowSDK.webRTC.RAINBOW_ONWEBRTCERRORHANDLED, onWebRTCErrorHandled);

    /* Subscribe to WebRTC call change */
    document.addEventListener(rainbowSDK.webRTC.RAINBOW_ONWEBRTCCALLSTATECHANGED, onWebRTCCallChanged);

    rainbowSDK.load();
});

// ------------------------------------------------------------------------------------------------------------------------------------------

 

// ALL the Chat Functions:
// ------------------------------------------------------------------------------------------------------------------------------------------

let conversation1=null;
// Current Messages that will load when chat page is loaded.
const chat_json = [
{
    class: "admin",
    background:"background: #072F5F;",
    order:"",
    image: "4.png",
    message: "Hi, I am here to help you! Do tell me what issue you are facing.",
}
];

//get the conversation between admin and the user
function initiateConversation(adminID){
    rainbowSDK.contacts.searchById(adminID).then((contact)=>{
        console.log("[DEMO] :: " + contact);
        if(mocClicked == "Chat"){
            rainbowSDK.conversations.openConversationForContact(contact).then(function(conversation) {
                console.log("[DEMO] :: Conversation", conversation);
                conversation1 = conversation;
                rainbowSDK.im.getMessagesFromConversation(conversation, 30).then(function() {
                    console.log("[DEMO] :: Messages", conversation);
                    chat();
                }).catch(function(err) {
                    console.error("[DEMO] :: Error Messages 1", err);
                });
            }).catch(function(err) {
                console.error("[DEMO] :: Error conversation", err);
            });
        }else{
            //check browser compatibility
            if(rainbowSDK.webRTC.canMakeAudioVideoCall()) {
                console.log("[DEMO] :: Audio supported");
                if(rainbowSDK.webRTC.hasAMicrophone()) {
                    /* A microphone is available, you can make at least audio call */
                    console.log("[DEMO] :: microphone supported");
                    var res = rainbowSDK.webRTC.callInAudio(contact);
                    if(res.label === "OK") {
                        call();
                        /* Your call has been correctly initiated. Waiting for the other peer to answer */
                        console.log("[DEMO] :: Contact Successful");
                        let paragraph = document.getElementById("p1");
                        paragraph.innerHTML("Waiting for Admin to pick up.");
                    }
                    else{console.log("[DEMO] :: Call not initialised successfully.");}
                }else {
                    alert("DEMO :: no microphone found");
                }
            }else{
                alert("DEMO :: browser does not support audio")
            }
        }
  }).catch((err)=>{
      console.log(err);
  });
}

function sendFunc(){

  text = document.getElementById("sendBox").value; // get text

  // Check for Malicious Injection.
  var check = (text.match(/</g) != null);
  if (check) {
    console.log("ERROR: Malicious Code detected.");
    alert("Please type something not in the HTML format.");
  }
  // Check for Empty Input
  else if(text == ""){alert("Please type something before clicking send.");}
  else{
      chat_json.push({
         class:"user",
         background:"background: #1261AD;",
         order:"order: -1;",
         image:"1.png",
         message: text,
      });
  }
  //alert(sendBox.id);
  console.log(chat_json);
  chat();
  // Write function to send User message to Administrator:
  rainbowSDK.im.sendMessageToConversation(conversation1, text);
  //--------
 }


function RecMess(message){

     chat_json.push({
        class: "admin",
        background:"background: #072F5F;",
        order:"",
        image: "4.png",
        message: message,
     });


    console.log(chat_json);
    chat();
}

// chat Template that organises the Json String into HTML
function chatTemplate(chat_json) {
    return `
    <div class = "${chat.class}" style = "display: flex; flex-flow: row wrap; align-items: flex-start; margin-bottom: 10px;">
        <div class="user-photo" style = "width: 60px; height: 60px; background: #ccc; border-radius: 50%; overflow: hidden;">
            <img src=${chat_json.image} style = "width: 100%">
        </div>
        <p class="chat-message" style = "width: 80%; padding: 15px; margin: 5px 10px 0; border-radius: 10px; color: #fff; font-size: 20px; ${chat_json.background}${chat_json.order}">
            ${chat_json.message}
        </p>
    </div>
    `;
}

// Function that runs when:
// Going from Help page to Chat page
// User sends a message
// Administrator sends a message
function chat(){
document.getElementById("body").innerHTML = `
<html>
    <head>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
        <link rel="stylesheet" type="text/css" href="chat.css">
        <title>Chat</title>
    </head>

    <body id = "body">
        <div class = "row">
            <div class ="col-md-12">
                <div class="mx-auto" style="width: 200px;">
                    <div class="mb-5">
                        <h1 class="text-center" >Chat</h1>
                    </div>
                </div>
            </div>

            <div class ="col-md-6">
                <div class="mx-auto" style="width: 200px;">
                    <div class="chatbox">
                        <div class="chatlogs" id="chatlogs">
                            ${chat_json.map(chatTemplate).join("")}
                        </div>
                        <div class="chat-form">
                            <textarea class="form-control" id="sendBox" rows= "1"></textarea>
                            <button type="button" id="sendButton" onclick="sendFunc()">Send</button>
                            <button type="button" id="endButton" style = "color: #ff0000;" onclick="endFunc()">End</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </body>
</html>
`;
}

// ------------------------------------------------------------------------------------------------------------------------------------------




// ALL the Call Functions:
// ------------------------------------------------------------------------------------------------------------------------------------------
function call(){
 document.getElementById("body").innerHTML = `
 <html>
     <head>
         <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
         <link rel="stylesheet" type="text/css" href="chat.css">
         <title>Call</title>
     </head>

     <body id = "body">
         <div class = "row">
             <div class="mx-auto" style="width: 200px;">
                 <div class="mb-5">
                     <h1 class="text-center" >Call Page</h1><br>
                     <p class="text-center" > Please speak into your mic to talk to our Administrator.</p>
                     <p class="text-center" id = "status" > Status: </p>
                     <p class="text-center" id = "p1"></p>
                     <audio id="globalAudioTag" autoplay style="display:none;"></audio>
                     <div class="text-center">
                        <button type="button" id="endButton" style = "color: #ff0000;" onclick="endFunc()">End Call</button>
                     </div>
                 </div>
             </div>
         </div>
     </body>
 </html>
 `;
 }


// ------------------------------------------------------------------------------------------------------------------------------------------




// ALL the End Functions:
// ------------------------------------------------------------------------------------------------------------------------------------------




// when user clicked end button
function endFunc(){
    var result = confirm("Are you sure you want to exit the chat?");
    if(result){
    endConversation();
    document.getElementById("body").innerHTML = `
    <html>
        <head>
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
            <link rel="stylesheet" type="text/css" href="chat.css">
            <title>Thank You</title>
        </head>

        <body id = "body">
            <div class = "row">

                    <div class="mx-auto" style="width: 200px;">
                        <div class="mb-5">
                            <h1 class="text-center" >Thank You!</h1><br>
                            <p class="text-center" > We hope that we have been of assistance to you!</p>
                        </div>
                    </div>

            </div>
        </body>
    `;
    }
}

// when conversation ended
function endConversation(){
    if(adminID != ""){
        console.log("[DEMO] :: End Call Function");
        // When User End Conversation. Indicate which Admin is done.
        //RE.setWorkerOnCall(adminID, false);
        socket.emit("end", adminID);
    }
}

// when tab is closed
//window.onbeforeunload
window.onbeforeunload = function(event) {
    endConversation();
};
//window.addEventListener("beforeunload", (event)=>{
//    alert("Closing page");
//    endConversation();
//});

// ------------------------------------------------------------------------------------------------------------------------------------------



