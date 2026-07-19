export default function SearchBar({ value, onChange, placeholder = "Search online users" }) {
    return (
        <div className="relative">
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
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-full bg-[var(--color-muted)] py-3 pl-11 pr-4 text-sm text-[var(--color-ink)]
                           placeholder:text-[var(--color-ink-faint)] outline-none transition-all duration-200
                           focus:bg-white focus:shadow-[var(--shadow-soft)] focus:ring-2 focus:ring-[var(--color-accent-soft)]"
            />
        </div>
    );
}
