import { useState } from "react";
import api from "../api/axios.js";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config.js";

export default function Auth() {

    const navigate = useNavigate();

    const [mode, setMode] = useState("login"); // "login" | "signup"
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const isSignup = mode === "signup";

    function switchMode(next) {
        setMode(next);
        setError("");
        setPassword("");
        setConfirmPassword("");
    }

    async function handleSubmit(e) {

        e.preventDefault();
        setError("");

        if (!username.trim() || !password) {
            setError("Please fill in both fields.");
            return;
        }

        if (isSignup && password !== confirmPassword) {
            setError("Passwords don't match.");
            return;
        }

        setLoading(true);

        try {

            await api.post(
                `${API_URL}/user/${isSignup ? "register" : "login"}`,
                { username: username.trim(), password },
                { withCredentials: true }
            );
            if (res.data.token) {
                localStorage.setItem("token", res.data.token);
            }

            navigate("/home");

        } catch (err) {

            setError(
                err.response?.data?.message ||
                (isSignup ? "Registration failed" : "Login failed")
            );

        } finally {
            setLoading(false);
        }

    }

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-bg)] px-4">
            <div className="ambient-glow" />

            <div className="relative z-10 w-full max-w-sm rounded-3xl bg-[var(--color-panel)] p-8 shadow-[var(--shadow-lift)]">

                <div className="mb-7 flex flex-col items-center gap-2.5">
                    <div
                        className="flex h-11 w-11 items-center justify-center rounded-2xl text-base font-bold text-white"
                        style={{ background: "linear-gradient(135deg, var(--color-accent), var(--color-secondary))" }}
                    >
                        P
                    </div>
                    <h1 className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">
                        {isSignup ? "Create your account" : "Welcome back"}
                    </h1>
                    <p className="text-center text-xs text-[var(--color-ink-dim)]">
                        {isSignup
                            ? "Sign up to start sending files peer-to-peer"
                            : "Log in to PeerDrop to continue"}
                    </p>
                </div>

                <div className="mb-6 flex rounded-full bg-[var(--color-muted)] p-1">
                    <button
                        type="button"
                        onClick={() => switchMode("login")}
                        className={`flex-1 rounded-full py-2 text-xs font-semibold transition-all duration-200 ${
                            !isSignup
                                ? "bg-white text-[var(--color-ink)] shadow-[var(--shadow-soft)]"
                                : "text-[var(--color-ink-faint)]"
                        }`}
                    >
                        Log In
                    </button>
                    <button
                        type="button"
                        onClick={() => switchMode("signup")}
                        className={`flex-1 rounded-full py-2 text-xs font-semibold transition-all duration-200 ${
                            isSignup
                                ? "bg-white text-[var(--color-ink)] shadow-[var(--shadow-soft)]"
                                : "text-[var(--color-ink-faint)]"
                        }`}
                    >
                        Sign Up
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">

                    <div className="flex flex-col gap-1.5">
                        <label className="px-1 text-xs font-medium text-[var(--color-ink-dim)]">
                            Username
                        </label>
                        <input
                            type="text"
                            autoComplete="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="yourname"
                            className="w-full rounded-xl bg-[var(--color-muted)] px-4 py-3 text-sm text-[var(--color-ink)]
                                       placeholder:text-[var(--color-ink-faint)] outline-none transition-all duration-200
                                       focus:bg-white focus:shadow-[var(--shadow-soft)] focus:ring-2 focus:ring-[var(--color-accent-soft)]"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="px-1 text-xs font-medium text-[var(--color-ink-dim)]">
                            Password
                        </label>
                        <input
                            type="password"
                            autoComplete={isSignup ? "new-password" : "current-password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full rounded-xl bg-[var(--color-muted)] px-4 py-3 text-sm text-[var(--color-ink)]
                                       placeholder:text-[var(--color-ink-faint)] outline-none transition-all duration-200
                                       focus:bg-white focus:shadow-[var(--shadow-soft)] focus:ring-2 focus:ring-[var(--color-accent-soft)]"
                        />
                    </div>

                    {isSignup && (
                        <div className="flex flex-col gap-1.5">
                            <label className="px-1 text-xs font-medium text-[var(--color-ink-dim)]">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full rounded-xl bg-[var(--color-muted)] px-4 py-3 text-sm text-[var(--color-ink)]
                                           placeholder:text-[var(--color-ink-faint)] outline-none transition-all duration-200
                                           focus:bg-white focus:shadow-[var(--shadow-soft)] focus:ring-2 focus:ring-[var(--color-accent-soft)]"
                            />
                        </div>
                    )}

                    {error && (
                        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-500">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 w-full rounded-xl py-3 text-sm font-semibold text-white transition-all duration-200
                                   disabled:cursor-not-allowed disabled:opacity-50"
                        style={{
                            background: "linear-gradient(135deg, var(--color-accent), var(--color-secondary))",
                            boxShadow: "var(--shadow-soft)"
                        }}
                    >
                        {loading
                            ? "Please wait..."
                            : isSignup ? "Create Account" : "Log In"}
                    </button>

                </form>

                <p className="mt-5 text-center text-xs text-[var(--color-ink-faint)]">
                    {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
                    <button
                        type="button"
                        onClick={() => switchMode(isSignup ? "login" : "signup")}
                        className="font-semibold text-[var(--color-accent)] hover:underline"
                    >
                        {isSignup ? "Log in" : "Sign up"}
                    </button>
                </p>

            </div>
        </div>
    );

}
