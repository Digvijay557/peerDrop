import { getPeer } from "./peer";

export async function createOffer() {

    const peer = getPeer();

    if (!peer) {
        throw new Error("Peer connection not created.");
    }

    const offer = await peer.createOffer();

    await peer.setLocalDescription(offer);

    console.log("Offer Created");

    console.log(peer.localDescription);

    return offer;
}


export async function createAnswer(offer) {

    const peer = getPeer();

    await peer.setRemoteDescription(offer);

    const answer = await peer.createAnswer();

    await peer.setLocalDescription(answer);

    console.log("Answer Created");

    return answer;
}

export async function setRemoteAnswer(answer) {

    const peer = getPeer();

    await peer.setRemoteDescription(answer);

    console.log("Remote Answer Set");

}