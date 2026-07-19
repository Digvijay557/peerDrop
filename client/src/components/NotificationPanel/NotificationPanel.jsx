import { AnimatePresence, motion } from "framer-motion";

function RequestCard({ title, subtitle, meta, onAccept, onReject, acceptLabel = "Accept", rejectLabel = "Reject" }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)]"
        >
            <p className="text-sm font-medium text-[var(--color-ink)]">{title}</p>
            {subtitle && <p className="mt-0.5 text-xs text-[var(--color-ink-dim)]">{subtitle}</p>}
            {meta && <p className="mt-0.5 text-[11px] text-[var(--color-ink-faint)]">{meta}</p>}

            <div className="mt-3 flex gap-2">
                <button
                    onClick={onAccept}
                    className="flex-1 rounded-lg py-2 text-xs font-semibold text-white transition-transform active:scale-95"
                    style={{ background: "var(--color-success)" }}
                >
                    {acceptLabel}
                </button>
                <button
                    onClick={onReject}
                    className="flex-1 rounded-lg bg-[var(--color-muted)] py-2 text-xs font-semibold
                               text-[var(--color-ink-dim)] transition-colors hover:bg-red-50 hover:text-red-500"
                >
                    {rejectLabel}
                </button>
            </div>
        </motion.div>
    );
}

function formatSize(bytes) {
    if (!bytes && bytes !== 0) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function NotificationPanel({
    incomingRequest,
    onAcceptRequest,
    onRejectRequest,
    incomingFile,
    onAcceptFile,
}) {
    const hasNotifications = incomingRequest || incomingFile;

    return (
        <aside className="flex h-full w-full flex-col gap-4 rounded-3xl bg-[var(--color-muted)] p-5 shadow-[var(--shadow-soft)]">
            <h2 className="px-1 text-sm font-semibold tracking-wide text-[var(--color-ink)]">
                Requests
            </h2>

            <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
                <AnimatePresence>
                    {incomingRequest && (
                        <RequestCard
                            key="conn-req"
                            title={`${incomingRequest.fromUsername} wants to connect`}
                            subtitle="Peer-to-peer connection request"
                            onAccept={onAcceptRequest}
                            onReject={onRejectRequest}
                        />
                    )}

                    {incomingFile && (
                        <RequestCard
                            key="file-req"
                            title={incomingFile.name}
                            subtitle={`${formatSize(incomingFile.size)} · ${incomingFile.mime || "file"}`}
                            meta="Incoming file transfer"
                            onAccept={onAcceptFile}
                            onReject={() => {}}
                            acceptLabel="Accept"
                            rejectLabel="Reject"
                        />
                    )}
                </AnimatePresence>

                {!hasNotifications && (
                    <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
                        <p className="text-sm text-[var(--color-ink-dim)]">No pending requests</p>
                    </div>
                )}
            </div>
        </aside>
    );
}
