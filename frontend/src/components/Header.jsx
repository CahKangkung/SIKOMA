// src/components/Header.jsx
import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { User as UserIcon, IdCard, LogOut, ArrowLeft, Bell, FilePlus2, Users } from "lucide-react";

export default function Header({ title }) {
  const { user, clearUser } = useUser();
  const { id: paramId } = useParams(); // orgId dari URL (/:id/..)
  const location = useLocation();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // ===== Notifikasi =====
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifData, setNotifData] = useState({
    role: null,
    counts: { newDocs: 0, joinRequests: 0, accepted: 0 },
    total: 0,
    items: [],
  });
  const notifRef = useRef(null);

  // Base URL API (pakai env kalau ada, fallback ke localhost)
  const API_BASE = import.meta.env?.VITE_API_BASE || "http://localhost:8080/api";

  const lastDocsKey = paramId ? `notif_last_docs_${paramId}` : null;
  const lastStatusKey = paramId ? `notif_last_status_${paramId}` : null;

  const since = useMemo(() => {
    if (!paramId) return null;
    let sinceDocsAt = "";
    let sinceStatusAt = "";
    try {
      sinceDocsAt = localStorage.getItem(lastDocsKey) || "";
      sinceStatusAt = localStorage.getItem(lastStatusKey) || "";
    } catch (_) {}
    return { sinceDocsAt, sinceStatusAt };
  }, [paramId, lastDocsKey, lastStatusKey]);

  async function loadNotifications() {
    // === MODE ORGANISASI ===
    if (paramId) {
      try {
        setNotifLoading(true);
        const params = new URLSearchParams();
        if (since?.sinceDocsAt) params.set("sinceDocsAt", since.sinceDocsAt);
        if (since?.sinceStatusAt) params.set("sinceStatusAt", since.sinceStatusAt);

        const resp = await fetch(
          `${API_BASE}/organization/${paramId}/header-notifications?${params.toString()}`,
          { credentials: "include" }
        );
        if (!resp.ok) throw new Error(await resp.text());
        const base = await resp.json();

        let role = base?.role || null;
        let items = Array.isArray(base?.items) ? base.items.slice() : [];
        let counts = {
          newDocs: Number(base?.counts?.newDocs || 0),
          joinRequests: Number(base?.counts?.joinRequests || 0),
          accepted: Number(base?.counts?.accepted || 0),
        };

        // Perbaiki tautan dokumen baru agar mengarah ke /manage-document/
        items = items.map((it) =>
          it.type === "doc_new"
            ? { ...it, link: it.link?.replace("/view-doc/", "/manage-document/") }
            : it
        );

        // Admin: merge join request dari /requests jika belum ada
        if (role === "admin" && counts.joinRequests === 0) {
          try {
            const r2 = await fetch(`${API_BASE}/organization/${paramId}/requests`, {
              credentials: "include",
            });
            if (r2.ok) {
              const jr = await r2.json();
              const reqs = Array.isArray(jr)
                ? jr
                : Array.isArray(jr?.requests)
                ? jr.requests
                : Array.isArray(jr?.data)
                ? jr.data
                : [];
              const joinItems = reqs.map((r) => ({
                type: "join_request",
                id: String(r?.user?._id || r?.user || Math.random()),
                title: `${r?.user?.username || r?.user?.email || "Unknown"} meminta bergabung`,
                createdAt: r?.requestedAt || r?.createdAt || new Date().toISOString(),
                link: `/${paramId}/members`,
              }));
              counts.joinRequests = joinItems.length;
              items = [...joinItems, ...items]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 10);
            }
          } catch {}
        }

        setNotifData({
          role,
          items,
          counts,
          total: counts.newDocs + counts.joinRequests + counts.accepted,
        });
      } catch (e) {
        console.error("Notif load error (org):", e);
        setNotifData({
          role: null,
          counts: { newDocs: 0, joinRequests: 0, accepted: 0 },
          total: 0,
          items: [],
        });
      } finally {
        setNotifLoading(false);
      }
      return;
    }

    // === MODE HOME ===
    try {
      setNotifLoading(true);
      const r = await fetch(`${API_BASE}/organization/my`, { credentials: "include" });
      if (!r.ok) throw new Error(await r.text());
      const data = await r.json();

      const items = [];
      const nowISO = new Date().toISOString();

      // Pending join
      (data?.pending || []).forEach((org) => {
        items.push({
          type: "join_pending",
          id: `pending-${org._id}`,
          title: `Waiting for approval ${org.name}`,
          createdAt: org.updatedAt || nowISO,
          link: `/home`,
        });
      });

      // Accepted join
      (data?.joined || []).forEach((org) => {
        const acceptedAt = org.acceptedAt || org.updatedAt || nowISO;
        items.push({
          type: "membership_accepted",
          id: `accepted-${org._id}`,
          title: `Accepted by ${org.name}`,
          createdAt: acceptedAt,
          link: `/${org._id}/dashboard`,
        });
      });

      setNotifData({
        role: "member",
        items: items
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 10),
        counts: {
          newDocs: 0,
          joinRequests: 0,
          accepted: items.filter((i) => i.type === "membership_accepted").length,
        },
        total: items.length,
      });
    } catch (e) {
      console.error("Notif load error (home):", e);
      setNotifData({
        role: "member",
        counts: { newDocs: 0, joinRequests: 0, accepted: 0 },
        total: 0,
        items: [],
      });
    } finally {
      setNotifLoading(false);
    }
  }

  async function markNotificationsRead() {
    if (!paramId) return;
    try {
      await fetch(`${API_BASE}/organization/${paramId}/header-notifications/read`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
    } catch (e) {
      console.warn("mark read failed:", e);
    }
    const now = new Date().toISOString();
    try {
      if (lastDocsKey) localStorage.setItem(lastDocsKey, now);
      if (lastStatusKey) localStorage.setItem(lastStatusKey, now);
    } catch (_) {}
  }

  // Tutup dropdown saat klik di luar / tekan Escape
  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Interval refresh notifikasi
  useEffect(() => {
    loadNotifications();
    if (!paramId) return;
    const t = setInterval(loadNotifications, 30000); // refresh 30 detik
    return () => clearInterval(t);
  }, [paramId]);

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      clearUser();
      navigate("/login");
    } catch (err) {
      console.error("Logout Error: ", err);
    }
  };

  // === Perbaikan tombol back ===
  const isHome = location.pathname === "/home" || location.pathname === "/";
  const showBackButton =
    !isHome && (!paramId || (paramId && location.pathname.includes("/settings")));

  // Toggle dropdown notifikasi + tandai read
  const onToggleNotif = async () => {
    const willOpen = !notifOpen;
    setNotifOpen(willOpen);
    if (willOpen) {
      await markNotificationsRead();
      setTimeout(loadNotifications, 250);
    }
  };

  const badge = notifData?.total || 0;

  return (
    <header className="flex justify-between items-center px-8 py-4 bg-white border-b border-gray-200 relative">
      <div className="flex items-center gap-4">
        {showBackButton && (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#23358B] font-medium hover:opacity-80"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>

      {/* === Right area: Notif + User menu === */}
      <div className="flex items-center gap-3">
        {/* 🔔 Notifikasi */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={onToggleNotif}
            className="relative rounded-full p-2 text-[#23358B] hover:bg-indigo-50"
            title={paramId ? "Notifications" : "Open organization to see notifications"}
            aria-haspopup="menu"
            aria-expanded={notifOpen}
          >
            <Bell className="h-5 w-5" />
            {badge > 0 && (
              <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-semibold text-white">
                {badge > 99 ? "99+" : badge}
              </span>
            )}
          </button>

          {/* Dropdown notifikasi */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-[360px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl z-50">
              <div className="flex items-center justify-between border-b px-4 py-2">
                <div className="text-sm font-semibold text-[#23358B]">Notifications</div>
                <div className="text-xs text-gray-400">{notifLoading ? "Refreshing…" : ""}</div>
              </div>

              <div className="max-h-[360px] divide-y divide-gray-100 overflow-auto">
                {notifData?.items?.length ? (
                  notifData.items.map((it) => {
                    const go = (evt) => {
                      setNotifOpen(false);
                      if (it.link) {
                        evt?.preventDefault?.();
                        navigate(it.link);
                      }
                    };
                    const when = it.createdAt ? new Date(it.createdAt).toLocaleString("id-ID") : "";
                    const Icon =
                      it.type === "join_request" ? Users : it.type === "doc_new" ? FilePlus2 : Users;
                    const iconCls =
                      it.type === "join_request"
                        ? "text-rose-500"
                        : it.type === "doc_new"
                        ? "text-[#23358B]"
                        : "text-green-600";
                    return (
                      <a
                        key={`${it.type}-${it.id}`}
                        href={it.link || "#"}
                        onClick={go}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-indigo-50/40"
                      >
                        <div className="mt-0.5">
                          <Icon className={`h-5 w-5 ${iconCls}`} />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm text-gray-800">{it.title}</div>
                          {when && <div className="mt-0.5 text-xs text-gray-400">{when}</div>}
                        </div>
                      </a>
                    );
                  })
                ) : (
                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                    {paramId ? "No new notifications" : "Open organization to see notifications"}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* === User menu === */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-2 text-[#23358B] font-medium hover:opacity-80"
          >
            <span>{user?.username || "User"}</span>
            <UserIcon className="w-6 h-6" />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl bg-neutral-900 text-white shadow-2xl ring-1 ring-black/10 z-50"
            >
              <button
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  navigate(paramId ? `/${paramId}/account` : "/account");
                }}
                className="flex w-full items-center gap-3 px-4 py-3 hover:bg-neutral-800"
              >
                <IdCard className="h-5 w-5 text-white/80" />
                <span>Account Detail</span>
              </button>

              <div className="h-px bg-white/10" />

              <button
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-3 hover:bg-neutral-800 text-red-300"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
