import { useEffect, useRef, useState } from "react";

function initials(name = "") {
    return name.trim().slice(0, 2).toUpperCase();
}

export default function TopBar({
    username,
    searchQuery,
    onSearchChange,
    searchResults,
    searching,
    onSelectResult,
    isContact,
    isOnline,
}) {
    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="flex items-center justify-between gap-4 px-1 pb-5">
            <div className="flex shrink-0 items-center gap-2.5">
                <div
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-sm font-bold text-white"
                    style={{ background: "linear-gradient(135deg, var(--color-accent), var(--color-secondary))" }}
                >
                    P
                </div>
                <span className="text-base font-semibold tracking-tight text-[var(--color-ink)]">
                    PeerDrop
                </span>
            </div>

            <div ref={wrapRef} className="relative w-full max-w-md">
                <svg
                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-ink-faint)]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                    type="text"
                    value={searchQuery}
                    onFocus={() => setOpen(true)}
                    onChange={(e) => {
                        onSearchChange(e.target.value);
                        setOpen(true);
                    }}
                    placeholder="Find a user by username..."
                    className="w-full rounded-full bg-[var(--color-muted)] py-2.5 pl-11 pr-4 text-sm text-[var(--color-ink)]
                               placeholder:text-[var(--color-ink-faint)] outline-none transition-all duration-200
                               focus:bg-white focus:shadow-[var(--shadow-soft)] focus:ring-2 focus:ring-[var(--color-accent-soft)]"
                />

                {open && searchQuery.trim() && (
                    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 max-h-80 overflow-y-auto rounded-2xl bg-white p-2 shadow-[var(--shadow-lift)]">
                        {searching && (
                            <p className="px-3 py-3 text-center text-xs text-[var(--color-ink-faint)]">
                                Searching...
                            </p>
                        )}

                        {!searching && searchResults.length === 0 && (
                            <p className="px-3 py-3 text-center text-xs text-[var(--color-ink-faint)]">
                                No users found
                            </p>
                        )}

                        {!searching &&
                            searchResults.map((user) => {
                                const already = isContact?.(user.id);
                                const online = isOnline?.(user.id);
                                return (
                                    <button
                                        key={user.id}
                                        onClick={() => {
                                            onSelectResult(user);
                                            setOpen(false);
                                        }}
                                        className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-[var(--color-muted)]"
                                    >
                                        <div className="relative shrink-0">
                                            <div
                                                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white"
                                                style={{ background: "linear-gradient(135deg, var(--color-accent), var(--color-secondary))" }}
                                            >
                                                {initials(user.username)}
                                            </div>
                                            {online && (
                                                <span
                                                    className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white"
                                                    style={{ background: "var(--color-success)" }}
                                                />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-[var(--color-ink)]">
                                                {user.username}
                                            </p>
                                            <p className="text-[11px] text-[var(--color-ink-faint)]">
                                                {already ? (online ? "Contact · Send file" : "Contact · Offline") : "Send connection request"}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                    </div>
                )}
            </div>

            {username && (
                <div className="flex shrink-0 items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-3.5 shadow-[var(--shadow-soft)]">
                    <div
                        className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                        style={{ background: "linear-gradient(135deg, var(--color-accent), var(--color-secondary))" }}
                    >
                        {username.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs font-medium text-[var(--color-ink-dim)]">{username}</span>
                </div>
            )}
        </header>
    );
}
