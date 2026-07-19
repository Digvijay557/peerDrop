import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

function formatSize(bytes) {
    if (!bytes && bytes !== 0) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function TransferBox({ selectedFile, onFileSelect, onRemoveFile, onSend, activeContact }) {
    const inputRef = useRef(null);

    return (
        <div className="flex h-full flex-col items-center justify-center gap-8 rounded-3xl bg-transparent p-6">
            {!activeContact ? (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-3xl bg-[var(--color-panel)] shadow-[var(--shadow-soft)] text-center">
                    <p className="text-sm text-[var(--color-ink-dim)]">
                        Select a contact to start sending files
                    </p>
                </div>
            ) : (
                <>
                    <div className="relative flex h-72 w-72 items-center justify-center rounded-[2rem] bg-[var(--color-bg)]">
                        <input
                            ref={inputRef}
                            type="file"
                            className="hidden"
                            onChange={(e) => onFileSelect(e.target.files[0])}
                        />

                        <AnimatePresence mode="wait">
                            {!selectedFile ? (
                                <motion.button
                                    key="add"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    whileHover={{ scale: 1.06 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => inputRef.current?.click()}
                                    className="relative flex h-24 w-24 items-center justify-center rounded-full"
                                    aria-label="Add file"
                                >
                                    <span className="absolute h-24 w-2 rounded-full bg-[var(--color-muted-strong)]" />
                                    <span className="absolute h-2 w-24 rounded-full bg-[var(--color-muted-strong)]" />
                                </motion.button>
                            ) : (
                                <motion.div
                                    key="file"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="flex h-48 w-56 flex-col items-center justify-center gap-3 rounded-2xl
                                               bg-white p-4 text-center shadow-[var(--shadow-lift)]"
                                >
                                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <path d="M14 2v6h6" />
                                        </svg>
                                    </span>
                                    <div className="min-w-0">
                                        <p className="truncate max-w-[11rem] text-sm font-medium text-[var(--color-ink)]">
                                            {selectedFile.name}
                                        </p>
                                        <p className="text-xs text-[var(--color-ink-dim)]">{formatSize(selectedFile.size)}</p>
                                    </div>
                                    <button
                                        onClick={onRemoveFile}
                                        className="text-xs font-medium text-[var(--color-ink-faint)] hover:text-red-500 transition-colors"
                                    >
                                        Remove
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <motion.button
                        onClick={onSend}
                        disabled={!selectedFile}
                        whileHover={selectedFile ? { scale: 1.02 } : {}}
                        whileTap={selectedFile ? { scale: 0.97 } : {}}
                        className="w-72 rounded-xl py-3.5 text-sm font-semibold text-white transition-all duration-200
                                   disabled:cursor-not-allowed disabled:opacity-30"
                        style={{
                            background: "linear-gradient(135deg, var(--color-accent), var(--color-secondary))",
                            boxShadow: selectedFile ? "var(--shadow-lift)" : "none",
                        }}
                    >
                        Send File
                    </motion.button>
                </>
            )}
        </div>
    );
}
