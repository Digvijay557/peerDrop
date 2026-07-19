// session.js

let remotePeerId = null;

export function setRemotePeer(id) {
    remotePeerId = id;
}

export function getRemotePeer() {
    return remotePeerId;
}