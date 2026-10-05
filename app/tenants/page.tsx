"use client";
import { useEffect, useState } from "react";
import { api, isLogged, logout } from "@/lib/api";

type Tenant = { id: string; code: string; name: string; status: string; admin_email: string; db_provisioned: boolean; plan?: { name: string } };
type Plan = { id: number; name: string };

export default function Tenants() {
  const [rows, setRows] = useState<Tenant[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [me, setMe] = useState<any>(null);
  const [err, setErr] = useState("");
  const [created, setCreated] = useState<any>(null);
  const [f, setF] = useState({ code: "", name: "", plan_id: "", admin_name: "", admin_email: "" });

  async function load() {
    try {
      const [m, t, d, p] = await Promise.all([api("/me"), api("/tenants?per_page=50"), api("/dashboard"), api("/plans")]);
      setMe(m); setRows(t.data); setStats(d); setPlans(p); setErr("");
    } catch (e: any) { setErr(e.message); }
  }
  useEffect(() => { if (!isLogged()) window.location.href = "/login"; else load(); }, []);

  async function act(id: string, a: "suspend" | "reactivate") {
    try { await api(`/tenants/${id}/${a}`, { method: "POST" }); load(); } catch (e: any) { alert(e.message); }
  }
  async function create(e: React.FormEvent) {
    e.preventDefault();
    try { setCreated(await api("/tenants", { method: "POST", body: JSON.stringify({ ...f, plan_id: Number(f.plan_id) }) })); load(); }
    catch (e: any) { alert(e.message + (e.body?.error?.fields ? "\n" + JSON.stringify(e.body.error.fields) : "")); }
  }
  const th = { textAlign: "left" as const, padding: 8, background: "#103B5C", color: "#fff" };
  const td = { padding: 8, borderBottom: "1px solid #e2e8f0" };
  const inp = { padding: 8, marginRight: 8 };
  return (
    <main style={{ maxWidth: 1080, margin: "24px auto", padding: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Instituições</h2>
        <span>{me && <>{me.name} ({me.roles?.join(", ")}) · <button onClick={logout}>Sair</button></>}</span>
      </header>
      {stats && <p>Activos: <b>{stats.tenants_by_status?.active ?? 0}</b> · Suspensos: <b>{stats.tenants_by_status?.suspended ?? 0}</b> · BD escolar por provisionar: <b>{stats.tenants_db_pending}</b></p>}
      {err && <p style={{ color: "#b91c1c" }}>{err}</p>}
      <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
        <thead><tr>{["Código", "Nome", "Plano", "Estado", "Administrador", "Acções"].map((h) => <th style={th} key={h}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((t) => (
          <tr key={t.id}>
            <td style={td}>{t.code}</td><td style={td}>{t.name}</td><td style={td}>{t.plan?.name}</td><td style={td}>{t.status}</td><td style={td}>{t.admin_email}</td>
            <td style={td}>
              {t.status === "active" && <button onClick={() => act(t.id, "suspend")}>Suspender</button>}
              {t.status === "suspended" && <button onClick={() => act(t.id, "reactivate")}>Reactivar</button>}
            </td>
          </tr>))}</tbody>
      </table>
      <h3>Novo colégio</h3>
      <form onSubmit={create}>
        <input style={inp} placeholder="código (ex.: colegio-x)" required value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} />
        <input style={inp} placeholder="Nome" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <select style={inp} required value={f.plan_id} onChange={(e) => setF({ ...f, plan_id: e.target.value })}>
          <option value="">Plano</option>{plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input style={inp} placeholder="Nome do administrador" required value={f.admin_name} onChange={(e) => setF({ ...f, admin_name: e.target.value })} />
        <input style={inp} type="email" placeholder="E-mail do administrador" required value={f.admin_email} onChange={(e) => setF({ ...f, admin_email: e.target.value })} />
        <button>Criar</button>
      </form>
      {created?.admin?.temporary_password && (
        <p style={{ background: "#FFF6BF", padding: 10 }}>Colégio criado. Palavra-passe temporária de <b>{created.admin.email}</b>: <code>{created.admin.temporary_password}</code> (mostrada apenas uma vez).</p>
      )}
    </main>
  );
}
