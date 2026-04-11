"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const isDisabled = !account.trim() || !password.trim();

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (account === "admin" && password === "admin") {
      router.push("/dashboard");
      return;
    }
    setError("账号或密码错误");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 16px",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: 420,
          backgroundColor: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: 10,
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
          padding: 36,
        }}
      >
        <div style={{ marginBottom: 22, textAlign: "center" }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>
            腾讯简历系统
          </h1>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 14 }}>
            <label
              htmlFor="account"
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#374151",
                marginBottom: 6,
              }}
            >
              账号
            </label>
            <input
              id="account"
              type="text"
              value={account}
              placeholder="admin"
              onChange={(e) => {
                setAccount(e.target.value);
                setError("");
              }}
              style={{
                width: "100%",
                height: 38,
                padding: "0 12px",
                fontSize: 14,
                color: "#111827",
                backgroundColor: "#fff",
                border: "1px solid #d1d5db",
                borderRadius: 8,
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#0052D9")}
              onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#374151",
                marginBottom: 6,
              }}
            >
              密码
            </label>
            <input
              id="password"
              type="password"
              value={password}
              placeholder="admin"
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              style={{
                width: "100%",
                height: 38,
                padding: "0 12px",
                fontSize: 14,
                color: "#111827",
                backgroundColor: "#fff",
                border: `1px solid ${error ? "#ef4444" : "#d1d5db"}`,
                borderRadius: 8,
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = error ? "#ef4444" : "#0052D9")}
              onBlur={(e) => (e.target.style.borderColor = error ? "#ef4444" : "#d1d5db")}
            />
          </div>

          {error && (
            <div style={{ fontSize: 12, color: "#ef4444", marginBottom: 12 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isDisabled}
            style={{
              width: "100%",
              height: 40,
              borderRadius: 8,
              border: "none",
              fontSize: 14,
              fontWeight: 600,
              cursor: isDisabled ? "not-allowed" : "pointer",
              backgroundColor: isDisabled ? "#d1d5db" : "#0052D9",
              color: "#fff",
              transition: "background-color 0.15s",
            }}
            onMouseEnter={(e) => {
              if (!isDisabled) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#0047BF";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = isDisabled ? "#d1d5db" : "#0052D9";
            }}
          >
            登录看板
          </button>
        </form>
      </div>
    </main>
  );
}
