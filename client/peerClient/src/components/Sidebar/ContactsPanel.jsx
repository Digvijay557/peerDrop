import { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import SearchBar from "./SearchBar";
import UserCard from "./UserCard";

export default function ContactsPanel({ contacts, onlineUserIds, onSendToContact }) {
    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        if (!query.trim()) return contacts;
        return contacts.filter((u) =>
            u.username.toLowerCase().includes(query.trim().toLowerCase())
        );
    }, [contacts, query]);

    const onlineCount = contacts.filter((c) => onlineUserIds.has(String(c.id))).length;

    return (
        <aside className="flex h-full w-full flex-col gap-4 rounded-3xl bg-[var(--color-panel)] p-5 shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold tracking-wide text-[var(--color-ink)]">
                    Contacts
                </h2>
                <span className="rounded-full bg-[var(--color-success-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-success)]">
                    {onlineCount} online
                </span>
            </div>

            <SearchBar value={query} onChange={setQuery} placeholder="Filter your contacts" />

            <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto pr-1">
                <AnimatePresence initial={false}>
                    {filtered.map((user) => (
                        <UserCard
                            key={user.id}
                            user={user}
                            online={onlineUserIds.has(String(user.id))}
                            onSend={onSendToContact}
                        />
                    ))}
                </AnimatePresence>

                {filtered.length === 0 && (
                    <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
                        <p className="text-sm text-[var(--color-ink-dim)]">
                            {contacts.length === 0
                                ? "No contacts yet — search for a username above to connect"
                                : "No matches"}
                        </p>
                    </div>
                )}
            </div>
        </aside>
    );
}
