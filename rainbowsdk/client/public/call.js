<audio id="globalAudioTag" autoplay style="display:none;"></audio>

if(rainbowSDK.webRTC.canMakeAudioVideoCall()) {
    /* Your browser is compliant: You can make audio and video call using WebRTC in your application */
    /* Call this method to know if a webcam is detected */
    if(rainbowSDK.webRTC.hasACamera()) {
        /* A webcam is available, you can make video call */
    }
    else {
        /* No webcam detected */
    }

    /* Call this method to know if a microphone is detected */
    if(rainbowSDK.webRTC.hasAMicrophone()) {
        /* A microphone is available, you can make at least audio call */
    }
    else {
        /* No microphone detected */
    }


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
                        // This is a device of type 'microphone'
                        break;
                    case "audiooutput":
                        // This is a device of type 'speaker'
                        break;
                    case "videoinput":
                        // This is a device of type 'camera'
                        break;
                    default:
                        break;
                }
                
            });

            /* Select the microphone to use */
            rainbowSDK.webRTC.useMicrophone(microphoneDevice.deviceId);

            /* Select the speaker to use */
            rainbowSDK.webRTC.useSpeaker(speaker.deviceId);

            /* Select the camera to use */
            rainbowSDK.webRTC.useCamera(camera.deviceId);

    
        }).catch(function(error) {
            /* In case of error when enumerating the devices */
        });
    }).catch(function(error) {
        /* In case of error when authorizing the application to access the media devices */
    });


    let onWebRTCErrorHandled = function(event) {
        let errorSDK = event.detail;
        // event.detail contains an Error object
        console.log("WebRTC ERROR", errorSDK)
    }

    document.addEventListener(rainbowSDK.webRTC.RAINBOW_ONWEBRTCERRORHANDLED, onWebRTCErrorHandled)

    var callInAudio = function callInAudio(contact) {
        /* Call this API to call a contact using only audio stream*/
        var res = rainbowSDK.webRTC.callInAudio(contact);
        if(res.label === "OK") {
            /* Your call has been correctly initiated. Waiting for the other peer to answer */
        }
    };

    /* Listen to WebRTC call state change */    
    let onWebRTCCallChanged = function(event) {
        
        // event.detail contains a Call Object
        console.log("onWebRTCCallChanged event", event.detail)
    }

    /* Subscribe to WebRTC call change */
    document.addEventListener(rainbowSDK.webRTC.RAINBOW_ONWEBRTCCALLSTATECHANGED, onWebRTCCallChanged)


}
else {
    /* Your browser is not compliant: Do not propose audio and video call in your application */

}