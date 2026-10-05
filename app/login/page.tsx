"use client";
import { useState } from "react";
import { login } from "@/lib/api";

export default function Login() {
  const [f, setF] = useState({ company: "eduvia", email: "", password: "" });
  const [err, setErr] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    try { await login(f.company, f.email, f.password); window.location.href = "/tenants"; }
    catch (e: any) { setErr(e.message); }
  }
  const input = { display: "block", width: "100%", padding: 10, margin: "8px 0", boxSizing: "border-box" as const };
  return (
    <form onSubmit={submit} style={{ maxWidth: 360, margin: "12vh auto", background: "#fff", padding: 28, borderRadius: 10, boxShadow: "0 2px 12px #0002" }}>
      <h2 style={{ color: "#103B5C" }}>Eduvia | Super Admin</h2>
      <input style={input} placeholder="Código da empresa" required value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} />
      <input style={input} placeholder="E-mail" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
      <input style={input} placeholder="Palavra-passe" type="password" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
      {err && <p style={{ color: "#b91c1c" }}>{err}</p>}
      <button style={{ ...input, background: "#1877B8", color: "#fff", border: 0, cursor: "pointer" }}>Entrar</button>
    </form>
  );
}
