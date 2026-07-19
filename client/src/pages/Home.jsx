import { setRemotePeer, getRemotePeer } from "../webRTC/session";
import { getPeer } from "../webRTC/peer";
import { useEffect, useState } from "react";
import { socket } from "/src/socket/socket.js";
import axios from "axios";
import { API_URL } from "../config.js";
import { createPeer } from "../webRTC/peer";
import { createAnswer, createOffer, setRemoteAnswer } from "../webRTC/signaling";
import { sendMessage } from "../webRTC/peer";
import { setMetadataHandler } from "../webRTC/peer";
import { setAcceptHandler } from "../webRTC/peer";

import TopBar from "../components/TopBar";
import ContactsPanel from "../components/Sidebar/ContactsPanel";
import TransferBox from "../components/Workspace/TransferBox";
import NotificationPanel from "../components/NotificationPanel/NotificationPanel";

export default function Home() {

    const [onlineUsers, setOnlineUsers] = useState([]);
    const [incomingRequest, setIncomingRequest] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [incomingFile, setIncomingFile] = useState(null);

    const [currentUsername, setCurrentUsername] = useState("");
    const [currentUserId, setCurrentUserId] = useState(null);
    const [activeContact, setActiveContact] = useState(null);

    // Permanent contacts (users who have accepted a connection request before)
    const [contacts, setContacts] = useState([]);

    // Global "search any user" state, shown in the TopBar
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    // userId -> live socket id, derived from the online-users broadcast
    const onlineUserIds = new Set(
        onlineUsers.filter((u) => u.userId).map((u) => String(u.userId))
    );

    function findSocketIdByUserId(userId) {
        const match = onlineUsers.find((u) => String(u.userId) === String(userId));
        return match ? match.id : null;
    }

    async function fetchContacts() {
        try {
            const res = await axios.get(API_URL + "/user/contacts", {
                withCredentials: true
            });
            setContacts(res.data.contacts || []);
        } catch (err) {
            console.log("Failed to load contacts:", err.message);
        }
    }

    useEffect(() => {

        async function init() {
            console.log("1. Calling /me");

            const res = await axios.get(
                API_URL + "/user/me",
                { withCredentials: true }
            );

            console.log("2. User:", res.data);
            setCurrentUsername(res.data.username);
            setCurrentUserId(res.data.id);

            fetchContacts();

            if (!socket.connected) {

                socket.connect();

                socket.once("connect", () => {

                    console.log("Socket Connected");

                    socket.emit("register", {
                        username: res.data.username,
                        userId: res.data.id
                    });

                });

            } else {

                socket.emit("register", {
                    username: res.data.username,
                    userId: res.data.id
                });

            }

        }
        init();

    }, []);

    // Debounced global user search (hits the server, not just online users)
    useEffect(() => {

        const q = searchQuery.trim();

        if (!q) {
            setSearchResults([]);
            setSearching(false);
            return;
        }

        setSearching(true);

        const timeout = setTimeout(async () => {
            try {
                const res = await axios.get(
                    `${API_URL}/user/search?q=${encodeURIComponent(q)}`,
                    { withCredentials: true }
                );
                setSearchResults(res.data.users || []);
            } catch (err) {
                console.log("Search failed:", err.message);
            } finally {
                setSearching(false);
            }
        }, 300);

        return () => clearTimeout(timeout);

    }, [searchQuery]);

    useEffect(() => {

        socket.on("ice-candidate", async ({ candidate }) => {

            const peer = getPeer();

            if (!peer) return;

            await peer.addIceCandidate(candidate);

            console.log("ICE Candidate Added");

        });

        return () => {
            socket.off("ice-candidate");
        };

    }, []);

    useEffect(() => {

        socket.on("incoming-request", (data) => {

            setIncomingRequest(data);

        });

        return () => {

            socket.off("incoming-request");

        };

    }, []);

    // A saved contact was added on either side of a fresh accepted request
    useEffect(() => {

        socket.on("contact-added", (contact) => {

            setContacts((prev) => {
                if (prev.some((c) => String(c.id) === String(contact.id))) return prev;
                return [contact, ...prev];
            });

        });

        return () => {
            socket.off("contact-added");
        };

    }, []);

    useEffect(() => {

        socket.on("request-failed", ({ reason }) => {
            alert(reason || "Could not reach that user.");
        });

        return () => {
            socket.off("request-failed");
        };

    }, []);

    function acceptRequest() {

        socket.emit("connection-response", {
            targetId: incomingRequest.fromId,
            accepted: true
        });

        // The receiver is now connected to this peer too — surface it in the workspace
        setActiveContact({
            id: incomingRequest.fromUserId,
            username: incomingRequest.fromUsername
        });

        setIncomingRequest(null);

    }
    function rejectRequest() {

        socket.emit("connection-response", {
            targetId: incomingRequest.fromId,
            accepted: false
        });

        setIncomingRequest(null);

    }
    useEffect(() => {

        socket.on("connection-response", async ({ accepted, peerId, peerUserId, peerUsername }) => {

            if (!accepted) return;

            setRemotePeer(peerId);   // ⭐ Save receiver's socket id

            setActiveContact((prev) => prev ?? { id: peerUserId, username: peerUsername });

            createPeer(true);

            const offer = await createOffer();

            socket.emit("offer", {
                targetId: peerId,
                offer
            });

        });

        return () => {

            socket.off("connection-response");

        };

    }, []);

    useEffect(() => {

        setAcceptHandler(() => {

            console.log("Start Sending File");

        });

    }, []);

    useEffect(() => {

        const handleOffer = async ({ fromId, offer }) => {

            console.log("Offer Received");

            setRemotePeer(fromId);

            createPeer(false);

            const answer = await createAnswer(offer);

            socket.emit("answer", {
                targetId: fromId,
                answer
            });

        };

        socket.on("offer", handleOffer);

        return () => {
            socket.off("offer", handleOffer);
        };

    }, []);
    useEffect(() => {

        setMetadataHandler((metadata) => {

            setIncomingFile(metadata);

        });

    }, []);

    useEffect(() => {

        socket.on("online-users", (users) => {
            console.log("Received:", users);
            setOnlineUsers(users);
        });

        return () => {
            socket.off("online-users");
        };

    }, [socket]);
    useEffect(() => {

        const handleAnswer = async ({ answer }) => {

            await setRemoteAnswer(answer);

            console.log("Handshake Complete");

        };

        socket.on("answer", handleAnswer);

        return () => {
            socket.off("answer", handleAnswer);
        };

    }, []);

    function handleFile(file) {

        if (!file) return;

        setSelectedFile(file);

        console.log(file);

    }
    function sendMetadata() {

        if (!selectedFile) {
            alert("Select a file first");
            return;
        }

        sendMessage(JSON.stringify({

            type: "metadata",

            name: selectedFile.name,

            size: selectedFile.size,

            mime: selectedFile.type

        }));

        console.log("Metadata Sent");

    }
    function acceptFile() {

        sendMessage(JSON.stringify({

            type: "accept"

        }));

        console.log("Accept Sent");

    }
    useEffect(() => {

        setAcceptHandler(async () => {

            console.log("Start Sending File");

            const buffer = await selectedFile.arrayBuffer();

            const CHUNK_SIZE = 64 * 1024;

            let offset = 0;

            while (offset < buffer.byteLength) {

                const chunk = buffer.slice(
                    offset,
                    offset + CHUNK_SIZE
                );

                sendMessage(chunk);

                console.log(
                    `Sent ${offset + chunk.byteLength}/${buffer.byteLength}`
                );

                offset += CHUNK_SIZE;

            }
            sendMessage(JSON.stringify({
                type: "complete"
            }));


            console.log("File Sent");

        });

    }, [selectedFile]);

    // ── Fresh connection: only used the very first time you reach out to someone.
    // Once they accept, they become a permanent contact and this step is skipped forever.
    function sendConnectionRequest(targetUserId) {
        socket.emit("connection-request", { targetUserId });
    }

    // TopBar global search result was clicked
    function handleSearchSelect(user) {

        setSearchQuery("");
        setSearchResults([]);

        const alreadyContact = contacts.some((c) => String(c.id) === String(user.id));

        if (alreadyContact) {
            reuseConnect(user);
            return;
        }

        setActiveContact({ id: user.id, username: user.username });
        sendConnectionRequest(user.id);
    }

    // ── Reuse an existing contact: connect straight to WebRTC, no request/accept needed.
    // Only the file transfer request notification will be shown on the other side.
    function reuseConnect(contact) {

        const socketId = findSocketIdByUserId(contact.id);

        if (!socketId) {
            alert(`${contact.username} is currently offline.`);
            return;
        }

        setActiveContact(contact);

        setRemotePeer(socketId);

        createPeer(true);

        createOffer().then((offer) => {
            socket.emit("offer", {
                targetId: socketId,
                offer
            });
        });

    }

    function isContact(userId) {
        return contacts.some((c) => String(c.id) === String(userId));
    }

    function isOnline(userId) {
        return onlineUserIds.has(String(userId));
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-[var(--color-bg)] px-6 py-6">
            <div className="ambient-glow" />

            <div className="relative z-10 mx-auto flex h-[calc(100vh-3rem)] max-w-[1600px] flex-col">
                <TopBar
                    username={currentUsername}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    searchResults={searchResults.filter((u) => String(u.id) !== String(currentUserId))}
                    searching={searching}
                    onSelectResult={handleSearchSelect}
                    isContact={isContact}
                    isOnline={isOnline}
                />

                <div className="grid flex-1 grid-cols-1 gap-5 overflow-hidden lg:grid-cols-[280px_1fr_300px]">
                    <ContactsPanel
                        contacts={contacts}
                        onlineUserIds={onlineUserIds}
                        onSendToContact={reuseConnect}
                    />

                    <TransferBox
                        selectedFile={selectedFile}
                        onFileSelect={handleFile}
                        onRemoveFile={() => setSelectedFile(null)}
                        onSend={sendMetadata}
                        activeContact={activeContact}
                    />

                    <NotificationPanel
                        incomingRequest={incomingRequest}
                        onAcceptRequest={acceptRequest}
                        onRejectRequest={rejectRequest}
                        incomingFile={incomingFile}
                        onAcceptFile={acceptFile}
                    />
                </div>
            </div>
        </div>
    );
}
