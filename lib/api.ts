const AUTH = process.env.NEXT_PUBLIC_AUTH_URL as string;
const API = process.env.NEXT_PUBLIC_ADMIN_API_URL as string;

const store = {
  get: (k: string) => (typeof window === "undefined" ? null : sessionStorage.getItem(k)),
  set: (k: string, v: string) => sessionStorage.setItem(k, v),
  clear: () => { sessionStorage.removeItem("at"); sessionStorage.removeItem("rt"); },
};
export const isLogged = () => !!store.get("at");
export const logout = async () => {
  const rt = store.get("rt");
  if (rt) await fetch(`${AUTH}/auth/logout`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ refresh_token: rt }) }).catch(() => {});
  store.clear(); window.location.href = "/login";
};

function save(b: any) { store.set("at", b.access_token); store.set("rt", b.refresh_token); }

export async function login(company_code: string, email: string, password: string) {
  const r = await fetch(`${AUTH}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ company_code, email, password }) });
  const b = await r.json().catch(() => null);
  if (!r.ok) throw new Error(b?.error?.message ?? "Falha no login");
  save(b); return b;
}

async function refresh(): Promise<boolean> {
  const rt = store.get("rt"); if (!rt) return false;
  const r = await fetch(`${AUTH}/auth/refresh`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ refresh_token: rt }) });
  if (!r.ok) return false; save(await r.json()); return true;
}

export async function api<T = any>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const r = await fetch(`${API}${path}`, { ...init, headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${store.get("at")}`, ...(init.headers ?? {}) } });
  if (r.status === 401) {
    if (retry && (await refresh())) return api<T>(path, init, false);
    store.clear(); window.location.href = "/login";
  }
  const body = r.status === 204 ? null : await r.json().catch(() => null);
  if (!r.ok) throw Object.assign(new Error(body?.error?.message ?? "Erro"), { body });
  return body as T;
}
