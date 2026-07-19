import { motion } from "framer-motion";

function initials(name = "") {
    return name.trim().slice(0, 2).toUpperCase();
}

function accentFor(name = "") {
    const colors = ["var(--color-accent)", "var(--color-secondary)"];
    const code = name.charCodeAt(0) || 0;
    return colors[code % colors.length];
}

export default function UserCard({ user, online, onSend }) {
    const accent = accentFor(user.username);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="group relative rounded-2xl bg-[var(--color-muted)] p-3.5 shadow-[var(--shadow-soft)]
                       transition-shadow duration-300 hover:bg-white hover:shadow-[var(--shadow-lift)]"
        >
            <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                    <div
                        className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
                        style={{ background: `linear-gradient(135deg, ${accent}, var(--color-accent))`, opacity: online ? 1 : 0.5 }}
                    >
                        {initials(user.username)}
                    </div>
                    <span
                        className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white"
                        style={{ background: online ? "var(--color-success)" : "var(--color-ink-faint)" }}
                    />
                </div>

                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--color-ink)]">
                        {user.username}
                    </p>
                    <p className="text-xs text-[var(--color-ink-dim)]">{online ? "Online" : "Offline"}</p>
                </div>
            </div>

            <motion.button
                onClick={() => onSend(user)}
                disabled={!online}
                whileHover={online ? { scale: 1.02 } : {}}
                whileTap={online ? { scale: 0.97 } : {}}
                className="mt-0 w-full overflow-hidden rounded-xl text-xs font-semibold text-white
                           opacity-0 h-0 group-hover:h-9 group-hover:mt-2.5 group-hover:opacity-100
                           transition-all duration-300 ease-out disabled:cursor-not-allowed"
                style={{
                    background: online
                        ? "linear-gradient(135deg, var(--color-accent), var(--color-secondary))"
                        : "var(--color-ink-faint)",
                }}
            >
                {online ? "Send File" : "Offline"}
            </motion.button>
        </motion.div>
    );
}
