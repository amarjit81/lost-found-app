import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  ArrowRight, Bell, BookOpen, Check, ChevronDown, CircleHelp, Clock3, Eye, Filter,
  HeartHandshake, KeyRound, Laptop, LogOut, MapPin, Menu, PackageCheck, Plus, Search,
  ShieldCheck, Smartphone, Sparkles, UserRound, WalletCards, X
} from "lucide-react";
import { api, getToken, setToken } from "./api.js";
import { formatDate, initials, queryString } from "./utils.js";

const AuthContext = createContext(null);
const RouterContext = createContext(null);
const categories = ["", "ID card", "Wallet", "Electronics", "Keys", "Books", "Clothing", "Other"];

function RouterProvider({ children }) {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const update = () => setPath(window.location.pathname);
    window.addEventListener("popstate", update);
    return () => window.removeEventListener("popstate", update);
  }, []);
  const navigate = (to, options = {}) => {
    window.history[options.replace ? "replaceState" : "pushState"]({}, "", to);
    setPath(to);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return <RouterContext.Provider value={{ path, navigate }}>{children}</RouterContext.Provider>;
}

const useNavigate = () => useContext(RouterContext).navigate;
const usePath = () => useContext(RouterContext).path;

function Link({ to, children, onClick, ...props }) {
  const navigate = useNavigate();
  return <a href={to} {...props} onClick={(event) => { onClick?.(event); if (!event.defaultPrevented && !event.metaKey && !event.ctrlKey) { event.preventDefault(); navigate(to); } }}>{children}</a>;
}

function NavLink({ to, end = false, children, className = "", ...props }) {
  const path = usePath();
  const active = end ? path === to : path === to || path.startsWith(`${to}/`);
  return <Link to={to} className={`${className} ${active ? "active" : ""}`.trim()} {...props}>{children}</Link>;
}

function Navigate({ to, replace = false }) {
  const navigate = useNavigate();
  useEffect(() => navigate(to, { replace }), [to, replace]);
  return null;
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken()));

  useEffect(() => {
    if (!getToken()) return;
    api("/auth/me").then(({ user }) => setUser(user)).catch(() => setToken(null)).finally(() => setLoading(false));
  }, []);

  const value = useMemo(() => ({
    user, loading,
    async authenticate(mode, values) {
      const result = await api(`/auth/${mode}`, { method: "POST", body: JSON.stringify(values) });
      setToken(result.token); setUser(result.user);
    },
    logout() { setToken(null); setUser(null); }
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

const useAuth = () => useContext(AuthContext);

function Logo({ light = false }) {
  return <Link to="/" className={`logo ${light ? "logo-light" : ""}`}><span className="logo-mark"><PackageCheck size={20} /></span><span>campus<span>reclaim</span></span></Link>;
}

function Landing() {
  const { user } = useAuth();
  return <div className="landing">
    <header className="site-header wrap">
      <Logo />
      <nav className="landing-nav"><a href="#how">How it works</a><a href="#safety">Safety</a></nav>
      <div className="header-actions">{user ? <Link className="button small" to="/app">Open portal</Link> : <><Link className="text-button" to="/login">Sign in</Link><Link className="button small" to="/register">Join campus</Link></>}</div>
    </header>

    <main>
      <section className="hero wrap">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={15} /> Built for student communities</div>
          <h1>Lost it on campus?<br /><em>Let’s bring it back.</em></h1>
          <p>Report a missing item in under a minute. Campus Reclaim connects lost and found posts, so the right person sees the right clue.</p>
          <div className="hero-actions"><Link className="button" to={user ? "/app/report" : "/register"}>Report an item <ArrowRight size={18} /></Link><Link className="outline-button" to={user ? "/app" : "/login"}>Browse reports</Link></div>
          <div className="trust-row"><span><ShieldCheck /> Campus-email access</span><span><HeartHandshake /> Community verified</span></div>
        </div>
        <div className="hero-visual" aria-label="Example lost and found matches">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <article className="floating-card lost-card">
            <div className="card-image wallet"><WalletCards size={46} /></div>
            <div><span className="type-pill lost">Lost</span><h3>Black wallet</h3><p><MapPin /> G Block library</p></div>
          </article>
          <div className="match-badge"><Sparkles size={16} /> 86% match</div>
          <article className="floating-card found-card">
            <div className="card-image keys"><KeyRound size={46} /></div>
            <div><span className="type-pill found">Found</span><h3>Keys with blue tag</h3><p><MapPin /> Hostel J entrance</p></div>
          </article>
        </div>
      </section>

      <section id="how" className="how-section">
        <div className="wrap"><div className="section-heading"><span>Simple by design</span><h2>Three steps between “lost” and “found.”</h2></div>
          <div className="steps">
            <article><span>01</span><div className="step-icon"><Plus /></div><h3>Post the details</h3><p>Tell the campus what went missing or what you picked up.</p></article>
            <article><span>02</span><div className="step-icon"><Sparkles /></div><h3>We surface matches</h3><p>Category, location and keywords connect related reports.</p></article>
            <article><span>03</span><div className="step-icon"><HeartHandshake /></div><h3>Return it safely</h3><p>Confirm the details, arrange a hand-off and close the report.</p></article>
          </div>
        </div>
      </section>

      <section id="safety" className="safety wrap">
        <div><span className="section-kicker">A safer campus loop</span><h2>Your campus, looking out for you.</h2><p>Only approved campus email addresses can enter the portal. Contact details stay within the signed-in community, and every post remains under its owner’s control.</p><Link to="/register" className="inline-link">Create your student account <ArrowRight size={17} /></Link></div>
        <div className="safety-grid"><article><ShieldCheck /><strong>Closed community</strong><span>Campus-domain registration</span></article><article><Eye /><strong>Owner controlled</strong><span>Edit, resolve or remove posts</span></article><article><Bell /><strong>Useful alerts</strong><span>Notifications for strong matches</span></article><article><CircleHelp /><strong>Clear details</strong><span>Location and item context</span></article></div>
      </section>
    </main>
    <footer><div className="wrap"><Logo light /><p>Helping good things find their way home.</p><span>© 2026 Campus Reclaim</span></div></footer>
  </div>;
}

function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const { authenticate, user } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  if (user) return <Navigate to="/app" replace />;

  async function submit(event) {
    event.preventDefault(); setError(""); setSubmitting(true);
    try { await authenticate(mode, values); navigate("/app"); }
    catch (error) { setError(error.message); }
    finally { setSubmitting(false); }
  }

  return <div className="auth-page">
    <div className="auth-brand"><Logo light /><div><div className="auth-quote">“Small acts of honesty build the kind of campus we all want.”</div><p>Join students helping belongings make their way back.</p></div></div>
    <div className="auth-panel"><Link className="back-link" to="/">← Back home</Link><div className="auth-form-wrap">
      <span className="form-kicker">{isRegister ? "Join the community" : "Welcome back"}</span>
      <h1>{isRegister ? "Create your account" : "Sign in to Campus Reclaim"}</h1>
      <p>{isRegister ? "Use your campus email to get started." : "See new reports and possible matches."}</p>
      <form onSubmit={submit}>
        {isRegister && <label>Full name<input value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} placeholder="Your full name" autoComplete="name" required /></label>}
        <label>Campus email<input type="email" value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} placeholder="name@thapar.edu" autoComplete="email" required /></label>
        <label>Password<input type="password" minLength="8" value={values.password} onChange={(e) => setValues({ ...values, password: e.target.value })} placeholder="At least 8 characters" autoComplete={isRegister ? "new-password" : "current-password"} required /></label>
        {error && <div className="form-error">{error}</div>}
        <button className="button auth-submit" disabled={submitting}>{submitting ? "Please wait…" : isRegister ? "Create account" : "Sign in"}<ArrowRight size={18} /></button>
      </form>
      <p className="auth-switch">{isRegister ? "Already registered?" : "New to Campus Reclaim?"} <Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Sign in" : "Create an account"}</Link></p>
    </div></div>
  </div>;
}

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><Logo /><span className="spinner" /></div>;
  return user ? children : <Navigate to="/login" replace />;
}

function PortalLayout({ children, refreshKey, onRefresh }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => { api("/notifications").then(({ notifications }) => setNotifications(notifications)).catch(() => {}); }, [refreshKey]);
  const unread = notifications.filter((n) => !n.read).length;

  async function readNotice(notification) {
    if (!notification.read) await api(`/notifications/${notification._id}/read`, { method: "PATCH" });
    setNotifications((items) => items.map((n) => n._id === notification._id ? { ...n, read: true } : n));
  }

  return <div className="portal">
    <header className="portal-header"><Logo /><button className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation"><Menu /></button>
      <nav className={mobileOpen ? "open" : ""}><NavLink end to="/app" onClick={() => setMobileOpen(false)}>Discover</NavLink><NavLink to="/app/my-posts" onClick={() => setMobileOpen(false)}>My reports</NavLink><NavLink to="/app/report" onClick={() => setMobileOpen(false)}>Report item</NavLink></nav>
      <div className="portal-actions"><div className="notice-wrap"><button className="icon-button" onClick={() => setNoticeOpen(!noticeOpen)} aria-label="Notifications"><Bell />{unread > 0 && <span>{unread > 9 ? "9+" : unread}</span>}</button>
        {noticeOpen && <div className="notification-panel"><div className="notification-head"><strong>Possible matches</strong><button onClick={() => setNoticeOpen(false)}><X size={18} /></button></div>
          {notifications.length === 0 ? <div className="empty-mini"><Bell /><p>No match alerts yet.</p></div> : notifications.map((notification) => <button key={notification._id} className={`notice ${notification.read ? "" : "unread"}`} onClick={() => readNotice(notification)}><span className="notice-dot" /><div><strong>{notification.score}% match for {notification.item?.title || "your report"}</strong><p>{notification.matchedItem?.title || "A related item"} · {notification.reasons?.join(" · ")}</p></div></button>)}
        </div>}
      </div><div className="user-menu"><span>{initials(user.name)}</span><div><strong>{user.name.split(" ")[0]}</strong><small>{user.role}</small></div><ChevronDown size={15} /></div><button className="logout-icon" onClick={() => { logout(); navigate("/"); }} title="Sign out"><LogOut size={19} /></button></div>
    </header>
    <main className="portal-main">{children}</main>
    <nav className="mobile-bottom"><NavLink end to="/app"><Search /><span>Discover</span></NavLink><NavLink to="/app/report"><Plus /><span>Report</span></NavLink><NavLink to="/app/my-posts"><UserRound /><span>My posts</span></NavLink></nav>
  </div>;
}

const categoryIcons = { "ID card": ShieldCheck, Wallet: WalletCards, Electronics: Smartphone, Keys: KeyRound, Books: BookOpen, Clothing: UserRound, Other: PackageCheck };

function ItemCard({ item, currentUser, onChanged }) {
  const Icon = categoryIcons[item.category] || PackageCheck;
  const mine = item.createdBy?._id === currentUser?.id || item.createdBy === currentUser?.id;
  const [busy, setBusy] = useState(false);

  async function toggleResolved() {
    setBusy(true);
    try { await api(`/items/${item._id}`, { method: "PATCH", body: JSON.stringify({ status: item.status === "open" ? "resolved" : "open" }) }); onChanged?.(); }
    finally { setBusy(false); }
  }

  return <article className={`item-card ${item.status === "resolved" ? "resolved" : ""}`}>
    <div className={`item-art ${item.category.toLowerCase().replaceAll(" ", "-")}`}>{item.imageUrl ? <img src={item.imageUrl} alt="" /> : <Icon />}</div>
    <div className="item-body"><div className="item-meta"><span className={`type-pill ${item.type}`}>{item.type}</span><span><Clock3 /> {formatDate(item.occurredAt)}</span></div><h3>{item.title}</h3><p className="description">{item.description}</p><p className="location"><MapPin /> {item.location}</p>
      <div className="card-footer"><div className="poster"><span>{initials(item.createdBy?.name)}</span><small>Posted by<br /><strong>{item.createdBy?.name || "Campus member"}</strong></small></div>
        {mine ? <button className="resolve-button" onClick={toggleResolved} disabled={busy}><Check /> {item.status === "open" ? "Mark resolved" : "Reopen"}</button> : <a className="contact-button" href={`mailto:${item.contact}`}><HeartHandshake /> Contact</a>}
      </div>
    </div>
  </article>;
}

function Discover({ refreshKey, onRefresh }) {
  const { user } = useAuth();
  const [filters, setFilters] = useState({ search: "", type: "", category: "", status: "open" });
  const [data, setData] = useState({ items: [], stats: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => { setLoading(true); api(`/items?${queryString(filters)}`).then(setData).finally(() => setLoading(false)); }, 180);
    return () => clearTimeout(timer);
  }, [filters, refreshKey]);

  return <>
    <section className="dashboard-hero"><div><span className="section-kicker">Campus feed</span><h1>What are we looking for today?</h1><p>Search recent reports or help a belonging find its owner.</p></div><Link className="button" to="/app/report"><Plus /> Report an item</Link></section>
    <section className="stats-row"><div><span className="stat-icon lost"><Search /></span><p><strong>{data.stats.lostOpen ?? "—"}</strong>Lost reports</p></div><div><span className="stat-icon found"><PackageCheck /></span><p><strong>{data.stats.foundOpen ?? "—"}</strong>Found reports</p></div><div><span className="stat-icon resolved"><HeartHandshake /></span><p><strong>{data.stats.resolved ?? "—"}</strong>Reunited items</p></div></section>
    <section className="feed-controls"><div className="search-box"><Search /><input placeholder="Search wallet, library, ID card…" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} /></div><div className="filters"><Filter size={18} /><select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}><option value="">Lost & found</option><option value="lost">Lost only</option><option value="found">Found only</option></select><select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>{categories.map((category) => <option key={category} value={category}>{category || "All categories"}</option>)}</select></div></section>
    <div className="feed-heading"><h2>Recent reports</h2><span>{data.pagination?.total ?? 0} open items</span></div>
    {loading ? <CardSkeletons /> : data.items.length ? <div className="item-grid">{data.items.map((item) => <ItemCard key={item._id} item={item} currentUser={user} onChanged={onRefresh} />)}</div> : <EmptyFeed />}
  </>;
}

function CardSkeletons() { return <div className="item-grid">{[1, 2, 3].map((n) => <div className="item-card skeleton" key={n}><div /><span /><span /><span /></div>)}</div>; }
function EmptyFeed() { return <div className="empty-feed"><div><Search /></div><h3>No reports match those filters</h3><p>Try a wider search, or be the first to post this item.</p><Link className="outline-button" to="/app/report">Create a report</Link></div>; }

function ReportItem({ onCreated }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ type: "lost", category: "Wallet", title: "", description: "", location: "", occurredAt: new Date().toISOString().slice(0, 10), contact: "", imageUrl: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault(); setError(""); setBusy(true);
    try { const result = await api("/items", { method: "POST", body: JSON.stringify(form) }); onCreated(); navigate("/app", { state: { matchCount: result.matchCount } }); }
    catch (error) { setError(error.message); }
    finally { setBusy(false); }
  }

  return <div className="report-layout"><aside><span className="section-kicker">New report</span><h1>Give the campus a useful clue.</h1><p>The best reports are specific without giving away every identifying detail.</p><div className="report-tips"><h3>Before you post</h3><p><Check /> Add the closest known location</p><p><Check /> Mention distinctive details</p><p><Check /> Keep one detail private for verification</p></div></aside>
    <section className="report-card"><form onSubmit={submit}><div className="form-section"><div><span>1</span><h2>What happened?</h2></div><div className="type-choice"><label className={form.type === "lost" ? "selected lost" : ""}><input type="radio" name="type" value="lost" checked={form.type === "lost"} onChange={(e) => setForm({ ...form, type: e.target.value })} /><Search /><strong>I lost something</strong><small>Help me find it</small></label><label className={form.type === "found" ? "selected found" : ""}><input type="radio" name="type" value="found" checked={form.type === "found"} onChange={(e) => setForm({ ...form, type: e.target.value })} /><PackageCheck /><strong>I found something</strong><small>Help return it</small></label></div></div>
      <div className="form-section"><div><span>2</span><h2>Item details</h2></div><div className="form-grid"><label>Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.slice(1).map((category) => <option key={category}>{category}</option>)}</select></label><label>Date<input type="date" value={form.occurredAt} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setForm({ ...form, occurredAt: e.target.value })} required /></label><label className="full">Short title<input value={form.title} maxLength="100" placeholder="e.g. Black leather wallet" onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label><label className="full">Description<textarea rows="4" maxLength="1000" value={form.description} placeholder="Colour, brand, contents or other useful details…" onChange={(e) => setForm({ ...form, description: e.target.value })} required /></label><label className="full">Last seen / found at<input value={form.location} placeholder="e.g. G Block library, first floor" onChange={(e) => setForm({ ...form, location: e.target.value })} required /></label></div></div>
      <div className="form-section"><div><span>3</span><h2>Safe return</h2></div><div className="form-grid"><label className="full">Contact email or phone<input value={form.contact} placeholder="Only signed-in students can see this" onChange={(e) => setForm({ ...form, contact: e.target.value })} required /></label><label className="full">Image URL <em>optional</em><input type="url" value={form.imageUrl} placeholder="https://…" onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} /></label></div></div>
      {error && <div className="form-error">{error}</div>}<div className="form-actions"><Link to="/app" className="text-button">Cancel</Link><button className="button" disabled={busy}>{busy ? "Publishing…" : "Publish report"}<ArrowRight /></button></div></form></section></div>;
}

function MyPosts({ refreshKey, onRefresh }) {
  const { user } = useAuth();
  const [status, setStatus] = useState("open");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { setLoading(true); api(`/items?mine=true&status=${status}`).then(({ items }) => setItems(items)).finally(() => setLoading(false)); }, [status, refreshKey]);
  return <><section className="page-heading"><div><span className="section-kicker">Your activity</span><h1>My reports</h1><p>Manage the items you have reported to the campus.</p></div><Link className="button" to="/app/report"><Plus /> New report</Link></section><div className="tabs"><button className={status === "open" ? "active" : ""} onClick={() => setStatus("open")}>Open</button><button className={status === "resolved" ? "active" : ""} onClick={() => setStatus("resolved")}>Resolved</button></div>{loading ? <CardSkeletons /> : items.length ? <div className="item-grid">{items.map((item) => <ItemCard key={item._id} item={item} currentUser={user} onChanged={onRefresh} />)}</div> : <EmptyFeed />}</>;
}

function PortalRoutes() {
  const path = usePath();
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey((value) => value + 1);
  let page = <Discover refreshKey={refreshKey} onRefresh={refresh} />;
  if (path === "/app/report") page = <ReportItem onCreated={refresh} />;
  else if (path === "/app/my-posts") page = <MyPosts refreshKey={refreshKey} onRefresh={refresh} />;
  else if (path !== "/app" && path !== "/app/") page = <Navigate to="/app" replace />;
  return <PortalLayout refreshKey={refreshKey} onRefresh={refresh}>{page}</PortalLayout>;
}

function AppRoutes() {
  const path = usePath();
  if (path === "/") return <Landing />;
  if (path === "/login") return <AuthPage mode="login" />;
  if (path === "/register") return <AuthPage mode="register" />;
  if (path === "/app" || path.startsWith("/app/")) return <Protected><PortalRoutes /></Protected>;
  return <Navigate to="/" replace />;
}

export default function App() {
  return <RouterProvider><AuthProvider><AppRoutes /></AuthProvider></RouterProvider>;
}
