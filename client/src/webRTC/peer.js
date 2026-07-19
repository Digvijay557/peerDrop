import { socket } from "../socket/socket.js";
import { getRemotePeer } from "./session.js";
let receivedChunks = [];
let peer = null;
let dataChannel = null;
let currentMetadata = null;

let onMetadata = null;
let onAccept = null;

// =======================
// Message Handler
// =======================

function handleMessage(event) {
    console.log("========== RECEIVED ==========");
    console.log(event.data);

    // Later this will receive file chunks
    if (event.data instanceof ArrayBuffer) {

    receivedChunks.push(event.data);

    console.log(
        "Chunks:",
        receivedChunks.length
    );

    return;

}

    const message = JSON.parse(event.data);

    switch (message.type) {

        case "metadata":

    console.log("Incoming Metadata");

    currentMetadata = message;

    receivedChunks = [];

    if (onMetadata) {
        onMetadata(message);
    }

    break;

        case "accept":

            console.log("Receiver Accepted File");

            if (onAccept) {
                onAccept();
            }

            break;

        case "complete":

    console.log("Transfer Complete");

    const blob = new Blob(receivedChunks, {
        type: currentMetadata.mime
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = currentMetadata.name;

    a.click();

    URL.revokeObjectURL(url);

    console.log("Downloaded");

    receivedChunks = [];

    currentMetadata = null;



    break;

        default:

            console.log("Unknown Message:", message);

    }

}

// =======================
// Create Peer
// =======================

export function createPeer(isInitiator = false) {

    console.log("Creating Peer");
    console.log("Initiator:", isInitiator);

    peer = new RTCPeerConnection({

        iceServers: [

            {
                urls: "stun:stun.l.google.com:19302"
            }

        ]

    });

    // -----------------------
    // Initiator creates channel
    // -----------------------

    if (isInitiator) {

        console.log("Creating DataChannel");

        dataChannel = peer.createDataChannel("file-transfer");

        setupDataChannel();

    }

    // -----------------------
    // Receiver gets channel
    // -----------------------

    peer.ondatachannel = (event) => {

        console.log("Data Channel Received");

        dataChannel = event.channel;

        setupDataChannel();

    };

    // -----------------------
    // ICE Candidates
    // -----------------------

    peer.onicecandidate = (event) => {

        if (!event.candidate) return;

        console.log("ICE Candidate Found");

        socket.emit("ice-candidate", {

            targetId: getRemotePeer(),
            candidate: event.candidate

        });

    };

    // -----------------------
    // Connection State
    // -----------------------

    peer.onconnectionstatechange = () => {

        console.log(
            "Connection:",
            peer.connectionState
        );

    };

    return peer;

}

// =======================
// Setup DataChannel
// =======================

function setupDataChannel() {

    dataChannel.binaryType = "arraybuffer";

    console.log("setupDataChannel called");

    dataChannel.onopen = () => {
        console.log("Data Channel Open");
    };

    dataChannel.onmessage = (event) => {

        console.log("RAW MESSAGE:", event.data);

        handleMessage(event);

    };

}

// =======================
// Send Message
// =======================

export function sendMessage(message) {

    console.log("========== SEND ==========");
    console.log("Message:", message);
    console.log("Channel:", dataChannel);
    console.log("State:", dataChannel?.readyState);

    if (!dataChannel) {
        console.log("No DataChannel");
        return;
    }

    if (dataChannel.readyState !== "open") {
        console.log("Not Open");
        return;
    }

    dataChannel.send(message);

    console.log("Sent Successfully");
}

// =======================
// Callbacks
// =======================

export function setMetadataHandler(handler) {

    onMetadata = handler;

}

export function setAcceptHandler(handler) {

    onAccept = handler;

}

// =======================
// Getters
// =======================

export function getPeer() {

    return peer;

}

export function getDataChannel() {

    return dataChannel;

}