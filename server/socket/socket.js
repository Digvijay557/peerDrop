const { Contact } = require("../models/contactModel");

// socket.id -> { username, userId }
const users = new Map();

// userId -> socket.id  (fast lookup for "is this saved contact online right now")
const onlineByUserId = new Map();

function broadcastOnlineUsers(io) {
    io.emit(
        "online-users",
        [...users.entries()].map(([id, user]) => ({
            id,
            userId: user.userId,
            username: user.username
        }))
    );
}

async function saveContactPair(userIdA, userIdB) {
    // Save both directions so each user sees the other in their permanent list
    await Promise.all([
        Contact.updateOne(
            { owner: userIdA, contact: userIdB },
            { $setOnInsert: { owner: userIdA, contact: userIdB } },
            { upsert: true }
        ),
        Contact.updateOne(
            { owner: userIdB, contact: userIdA },
            { $setOnInsert: { owner: userIdB, contact: userIdA } },
            { upsert: true }
        )
    ]);
}

module.exports = (io) => {

    io.on("connection", (socket) => {

        console.log("Connected:", socket.id);

        socket.on("register", ({ username, userId }) => {

            console.log("Registered:", username, userId);

            users.set(socket.id, { username, userId });

            if (userId) {
                onlineByUserId.set(String(userId), socket.id);
            }

            broadcastOnlineUsers(io);

        });

        socket.on("disconnect", () => {

            console.log("Disconnected:", socket.id);

            const user = users.get(socket.id);

            if (user?.userId) {
                onlineByUserId.delete(String(user.userId));
            }

            users.delete(socket.id);

            broadcastOnlineUsers(io);

        });

        // Fresh connection request — only needed the FIRST time two users connect.
        // targetUserId lets us find the user regardless of which socket/tab they're on.
        socket.on("connection-request", ({ targetUserId }) => {

            const targetSocketId = onlineByUserId.get(String(targetUserId));

            if (!targetSocketId) {
                socket.emit("request-failed", {
                    reason: "User is not online right now."
                });
                return;
            }

            const fromUser = users.get(socket.id);

            io.to(targetSocketId).emit("incoming-request", {
                fromId: socket.id,
                fromUserId: fromUser?.userId,
                fromUsername: fromUser?.username
            });

        });

        socket.on("connection-response", async ({ targetId, accepted }) => {

            const responder = users.get(socket.id);
            const requester = users.get(targetId);

            if (accepted && responder?.userId && requester?.userId) {
                try {
                    await saveContactPair(responder.userId, requester.userId);
                } catch (err) {
                    console.log("Failed to save contact:", err.message);
                }

                // Let both sides know their permanent contacts list changed
                io.to(targetId).emit("contact-added", {
                    id: responder.userId,
                    username: responder.username
                });
                socket.emit("contact-added", {
                    id: requester.userId,
                    username: requester.username
                });
            }

            io.to(targetId).emit("connection-response", {
                accepted,
                peerId: socket.id,
                peerUserId: responder?.userId,
                peerUsername: responder?.username
            });
        });

        // Used to look up an existing (saved) contact's live socket id so we can
        // start the WebRTC handshake directly, skipping the request/accept step.
        socket.on("get-online-socket", ({ userId }, callback) => {
            const targetSocketId = onlineByUserId.get(String(userId)) || null;
            if (typeof callback === "function") {
                callback({ socketId: targetSocketId });
            }
        });

        socket.on("offer", ({ targetId, offer }) => {

            console.log("Offer received on server");
            console.log("Target:", targetId);

            io.to(targetId).emit("offer", {
                fromId: socket.id,
                offer
            });

        });

        socket.on("answer", ({ targetId, answer }) => {

            console.log("Sending answer to:", targetId);

            io.to(targetId).emit("answer", {
                answer
            });

        });

        socket.on("ice-candidate", ({ targetId, candidate }) => {

            io.to(targetId).emit("ice-candidate", {
                candidate
            });

        });

    });

};
