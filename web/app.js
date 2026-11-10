"use strict";
// Aktarım — bilgisayar penceresi ve telefon için tek sayfa.
// Dinamik metin yalnızca textContent ile yazılır; innerHTML yalnızca aşağıdaki sabit SVG'ler için kullanılır.

const $ = (s) => document.querySelector(s);
const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};
const UA = navigator.userAgent;
const isIOS = /iPhone|iPad/i.test(UA) || (UA.includes("Macintosh") && "ontouchend" in document);
const isMobile = isIOS || /Android|Mobile/i.test(UA);

// ---------- simgeler (sabit) ----------
const ICONS = {
  upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
  inbox: '<path d="M4 13l2.5-7.5A2 2 0 0 1 8.4 4h7.2a2 2 0 0 1 1.9 1.5L20 13"/><path d="M4 13v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5h-4.5l-1.5 2.5h-4L8.5 13z"/>',
  plane: '<path d="M21 3L10 14"/><path d="M21 3l-7 18-4-7-7-4z"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6"/><path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
  laptop: '<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 19h20"/>',
  photo: '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
  video: '<rect x="2.5" y="6" width="13" height="12" rx="2.5"/><path d="M15.5 10.5L21 7v10l-5.5-3.5z"/>',
  doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  file: '<path d="M13 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9z"/><path d="M13 3v6h6"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  camera: '<path d="M3 8a2 2 0 0 1 2-2h2l1.5-2h7L17 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="3.5"/>',
  text: '<path d="M5 6h14M5 11h14M5 16h9"/>',
  clip: '<rect x="7" y="4" width="10" height="4" rx="1"/><path d="M8 6H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-2"/>',
  audio: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
  zip: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M11 3v2h2v2h-2v2h2v2h-2"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  save: '<path d="M12 4v11M7 10l5 5 5-5"/><path d="M5 20h14"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  restore: '<path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5"/><path d="M4 4v4.5h4.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  more: '<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
  play: '<path d="M8 5l11 7-11 7z" fill="currentColor"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  qr: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2v2h-2zM18 18h2v2h-2zM14 18h2M18 14h2"/>',
};
function icon(name) {
  const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  s.setAttribute("viewBox", "0 0 24 24");
  s.setAttribute("class", "i");
  s.setAttribute("aria-hidden", "true");
  s.innerHTML = ICONS[name] || ICONS.file;
  return s;
}

// ---------- çizimler (sabit) ----------
const LAPTOP = '<rect x="38" y="30" width="96" height="62" rx="7" fill="#fff" stroke="#c7d6f5" stroke-width="2"/><rect x="45" y="37" width="82" height="48" rx="3" fill="#e8f0ff"/><path d="M26 96h120l-6 8H32z" fill="#c7d6f5"/>';
const PHONE = '<rect x="158" y="34" width="40" height="72" rx="9" fill="#fff" stroke="#c7d6f5" stroke-width="2"/><rect x="163" y="42" width="30" height="54" rx="3" fill="#e8f0ff"/><rect x="172" y="37" width="12" height="2.5" rx="1.25" fill="#c7d6f5"/>';
const ART = {
  send: `<svg viewBox="0 0 220 130"><circle cx="110" cy="66" r="62" fill="#007aff" opacity=".08"/>${LAPTOP}${PHONE}
    <rect x="58" y="47" width="22" height="17" rx="3" fill="#ff9500"/><rect x="84" y="47" width="22" height="17" rx="3" fill="#ff2d55"/><rect x="58" y="67" width="48" height="6" rx="3" fill="#5856d6" opacity=".6"/>
    <path d="M118 70c18-26 34-26 46-14" fill="none" stroke="#007aff" stroke-width="3" stroke-dasharray="5 5" stroke-linecap="round"/><path d="M160 49l6 8-10 1" fill="none" stroke="#007aff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="167" y="52" width="22" height="16" rx="3" fill="#ff9500"/><rect x="167" y="72" width="22" height="16" rx="3" fill="#34c759"/></svg>`,
  inbox: `<svg viewBox="0 0 220 130"><circle cx="110" cy="66" r="62" fill="#34c759" opacity=".09"/>
    <path d="M62 70l14-34h68l14 34v30a6 6 0 0 1-6 6H68a6 6 0 0 1-6-6z" fill="#fff" stroke="#bfe8cb" stroke-width="2"/><path d="M62 70h30l6 10h24l6-10h30" fill="none" stroke="#bfe8cb" stroke-width="2"/>
    <rect x="92" y="20" width="36" height="28" rx="4" fill="#007aff" opacity=".9"/><circle cx="102" cy="30" r="3.5" fill="#fff"/><path d="M96 44l9-8 6 5 5-4 8 7" fill="none" stroke="#fff" stroke-width="2"/>
    <path d="M110 52v14M104 60l6 6 6-6" fill="none" stroke="#34c759" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  sent: `<svg viewBox="0 0 220 130"><circle cx="110" cy="66" r="62" fill="#5856d6" opacity=".08"/>
    <path d="M58 70l104-40-30 74-18-26z" fill="#fff" stroke="#d3d2f5" stroke-width="2" stroke-linejoin="round"/><path d="M114 78l48-48" stroke="#d3d2f5" stroke-width="2"/>
    <path d="M40 92c14 4 26 2 38-8" fill="none" stroke="#5856d6" stroke-width="3" stroke-dasharray="4 6" stroke-linecap="round" opacity=".6"/></svg>`,
  bin: `<svg viewBox="0 0 220 130"><circle cx="110" cy="66" r="62" fill="#ff9500" opacity=".09"/>
    <path d="M80 44h60l-5 60a6 6 0 0 1-6 5H91a6 6 0 0 1-6-5z" fill="#fff" stroke="#ffd9a6" stroke-width="2"/><rect x="74" y="36" width="72" height="9" rx="4.5" fill="#ffd9a6"/>
    <circle cx="146" cy="88" r="20" fill="#ff9500"/><path d="M146 78v10l7 4" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>`,
  drop: `<svg viewBox="0 0 220 130">${LAPTOP}${PHONE}<path d="M110 8v30M100 28l10 10 10-10" fill="none" stroke="#007aff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};
document.querySelectorAll("[data-art]").forEach((n) => (n.innerHTML = ART[n.dataset.art]));
document.querySelectorAll("[data-icon]").forEach((n) => n.append(icon(n.dataset.icon)));

// ---------- durum ----------
const state = { data: null, version: -1, tab: "send", device: isMobile ? (isIOS ? "iPhone" : "Android") : "Bilgisayar",
  local: false, filters: { inbox: "all", sent: "all" }, first: true, known: new Set() };
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem("aktarim." + k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem("aktarim." + k, JSON.stringify(v)); } catch { /* özel pencere */ } },
};
const seen = new Set(store.get("seen", []));
const DAYS = { 7: "1 hafta", 14: "2 hafta", 30: "1 ay" };
const FILTERS = [["all", "Tümü"], ["photo", "Fotoğraf"], ["video", "Video"], ["doc", "Belge"], ["text", "Yazı"]];

const TABS = [
  { id: "send", label: "Gönder", icon: "upload" },
  { id: "inbox", label: "Gelenler", icon: "inbox" },
  { id: "sent", label: "Gönderdiklerim", icon: "plane" },
  { id: "bin", label: "Sonradan Sil", icon: "trash" },
  { id: "connect", label: "Telefon Bağla", icon: "qr", pc: true },
  { id: "setup", label: "Fotoğraflar'a kaydet", icon: "photo", hidden: true },
  { id: "album", label: "Albüm", icon: "folder", hidden: true },
];
const other = () => (isMobile ? "bilgisayar" : "telefon");
const LEADS = {
  send: () => `Fotoğraf, video, belge, yazı… ne istersen ${other()}a gönder.`,
  inbox: () => `${isMobile ? "Bilgisayardan" : "Telefondan"} sana gelenler.`,
  sent: () => `${isMobile ? "Bilgisayara" : "Telefona"} gönderdiklerin.`,
  bin: () => "",
  connect: () => "Telefonunu bu bilgisayara bağla.",
  setup: () => "Bir kez kur; sonra fotoğraf ve videolar tek dokunuşla Fotoğraflar'a iner.",
  album: () => "",
};

// ---------- yardımcılar ----------
async function api(path, body) {
  const opt = body === undefined ? {} : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
  const r = await fetch(path, { credentials: "same-origin", cache: "no-store", ...opt });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || r.statusText);
  return j;
}
function toast(msg, action) {
  const t = $("#toast");
  t.replaceChildren(el("span", "", msg));
  t.classList.toggle("has-action", !!action);
  if (action) {
    const b = el("button", "", action[0]);
    b.addEventListener("click", () => { t.classList.remove("show"); action[1](); });
    t.append(b);
  }
  t.classList.add("show");
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove("show"), action ? 6000 : 2600);
}
function size(n) {
  if (!n) return "0 B";
  if (n < 1024) return n + " B";
  const u = ["KB", "MB", "GB"];
  let i = -1;
  do { n /= 1024; i++; } while (n >= 1024 && i < 2);
  return n.toFixed(n < 10 ? 1 : 0).replace(".", ",") + " " + u[i];
}
function when(ts) {
  const d = new Date(ts * 1000), now = new Date();
  const hm = d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  if (d.toDateString() === now.toDateString()) return "Bugün " + hm;
  const y = new Date(now); y.setDate(now.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return "Dün " + hm;
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" }) + " " + hm;
}
function ago(ts) {
  const s = Date.now() / 1000 - ts;
  if (s < 15) return "Şimdi bağlı";
  if (s < 3600) return Math.max(1, Math.round(s / 60)) + " dk önce";
  if (s < 86400) return Math.round(s / 3600) + " sa önce";
  return Math.round(s / 86400) + " gün önce";
}
function left(exp) {
  const s = exp - Date.now() / 1000;
  if (s <= 3600) return "1 saatten az kaldı";
  if (s < 86400) return Math.ceil(s / 3600) + " saat kaldı";
  return Math.ceil(s / 86400) + " gün kaldı";
}
function kind(it) {
  if (it.kind === "text") return "text";
  const m = it.mime || "";
  if (m.startsWith("image/")) return "photo";
  if (m.startsWith("video/")) return "video";
  if (m.startsWith("audio/")) return "audio";
  if (/zip|rar|7z|tar|gzip/.test(m)) return "zip";
  return "doc";
}
const COLOR = { photo: "", video: "pink", doc: "purple", audio: "teal", zip: "gray", text: "orange" };
const ICON_OF = { photo: "photo", video: "video", doc: "doc", audio: "audio", zip: "zip", text: "text" };
const fileUrl = (it, dl) => `/api/file/${it.id}/${encodeURIComponent(it.name)}${dl ? "?dl=1" : ""}`;
const canShow = (it) => kind(it) === "photo" && !/heic|heif/i.test(it.mime || "");
const mine = (it) => it.source === state.device;
const matches = (it, f) => f === "all" || kind(it) === f || (f === "doc" && ["doc", "zip", "audio"].includes(kind(it)));
const isUrl = (t) => /^https?:\/\/\S+$/.test((t || "").trim());

// ---------- sekmeler ----------
function buildNav() {
  const side = $("#side-nav"), bar = $("#tabbar");
  side.replaceChildren(); bar.replaceChildren();
  TABS.filter((t) => !t.hidden).forEach((t) => {
    const mk = () => {
      const b = el("button");
      b.dataset.tab = t.id;
      b.append(icon(t.icon), el("span", "", t.label));
      const badge = el("em"); badge.hidden = true; badge.dataset.badge = t.id;
      b.append(badge);
      b.addEventListener("click", () => setTab(t.id));
      return b;
    };
    side.append(mk());
    if (!t.pc) bar.append(mk());
  });
}
function setTab(tab) {
  if (tab !== "album") state.albumFrom = tab;
  state.tab = tab;
  document.querySelectorAll(".page").forEach((p) => (p.hidden = p.dataset.page !== tab));
  const navTab = tab === "album" ? state.albumFrom : tab;
  document.querySelectorAll("[data-tab]").forEach((b) => b.classList.toggle("on", b.dataset.tab === navTab));
  const t = TABS.find((x) => x.id === tab);
  $("#title").textContent = t.label;
  $("#lead").textContent = LEADS[tab]();
  if (tab === "album") renderAlbum();
  if (tab === "connect") drawQR();
  if (tab === "inbox") setTimeout(markSeen, 1500);
  window.scrollTo(0, 0);
}
function markSeen() {
  if (state.tab !== "inbox" || !state.data) return;
  state.data.items.filter((i) => !mine(i)).forEach((i) => seen.add(i.id));
  store.set("seen", [...seen].slice(-2000));
  render();
}
function buildFilters() {
  document.querySelectorAll("[data-filter]").forEach((box) => {
    const key = box.dataset.filter;
    FILTERS.forEach(([f, label]) => {
      const b = el("button", f === "all" ? "on" : "", label);
      b.addEventListener("click", () => {
        state.filters[key] = f;
        box.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
        render();
      });
      box.append(b);
    });
  });
  const ret = $("#retention");
  [7, 14, 30].forEach((d) => {
    const b = el("button", "", DAYS[d]);
    b.dataset.d = d;
    b.addEventListener("click", async () => {
      await api("/api/settings", { retention_days: d });
      toast(`Varsayılan süre: ${DAYS[d]}`);
      refresh(true);
    });
    ret.append(b);
  });
}

// ---------- işlem sayfası ve görüntüleyici ----------
function sheet(title, actions) {
  const back = $("#sheet-back"), box = $("#sheet-actions");
  $("#sheet-title").textContent = title;
  box.replaceChildren();
  actions.forEach(([label, fn, red]) => {
    const b = el("button", red ? "red" : "", label);
    b.addEventListener("click", () => { back.hidden = true; fn(); });
    box.append(b);
  });
  back.hidden = false;
}
$("#sheet-cancel").addEventListener("click", () => ($("#sheet-back").hidden = true));
$("#sheet-back").addEventListener("click", (e) => { if (e.target.id === "sheet-back") e.currentTarget.hidden = true; });
function viewer(name, node, it) {
  $("#viewer-name").textContent = name;
  $("#viewer-body").replaceChildren(node);
  const acts = $("#viewer-actions");
  acts.replaceChildren();
  const add = (ic, label, fn) => {
    const b = el("button", "vbtn"); b.append(icon(ic), el("span", "", label)); b.title = label;
    b.addEventListener("click", fn); acts.append(b);
  };
  if (it && it.kind === "text") add("copy", "Kopyala", () => copyText(it.text));
  else if (it) {
    if (isMobile && isMedia(it)) add("save", isIOS ? "Kaydet" : "Galeriye", () => saveToPhotos(it));
    else add("save", "İndir", () => download(it));
    if (state.local) add("folder", "Klasörde göster", () => reveal(it));
    if (isIOS && isMedia(it) && canShareFiles()) getFile(it).catch(() => null);
  }
  $("#viewer").hidden = false;
}
function closeViewer() { $("#viewer").hidden = true; $("#viewer-body").replaceChildren(); }
$("#viewer-close").addEventListener("click", closeViewer);
document.addEventListener("keydown", (e) => {
  if (!$("#confirm").hidden) {
    if (e.key === "Escape") { e.preventDefault(); closeConfirm(true); }
    else if (e.key === "Enter" && !e.target.closest("textarea")) { e.preventDefault(); acceptConfirm(); }
    return;
  }
  if (e.key === "Escape") { closeViewer(); $("#sheet-back").hidden = true; }
});

// ---------- göndermeden önce onay (sürükle-bırak, yapıştır) ----------
let pending = null, previewUrls = [];
function confirmSend(list, text, batchName) {
  pending = { list: [...list], text, batchName };
  drawConfirm();
  $("#confirm").hidden = false;
  $("#confirm-yes").focus();
}
function fileKind(f) {
  const t = f.type || "";
  if (t.startsWith("image/")) return "photo";
  if (t.startsWith("video/")) return "video";
  if (t.startsWith("audio/")) return "audio";
  if (/zip|rar|7z|tar|gzip/.test(t)) return "zip";
  return "doc";
}
function drawConfirm() {
  previewUrls.forEach((u) => URL.revokeObjectURL(u)); previewUrls = [];
  const box = $("#confirm-list");
  box.replaceChildren();
  const target = isMobile ? "Bilgisayara" : "Telefona";
  if (pending.text) {
    $("#confirm-title").textContent = `Bu yazı ${target.toLowerCase()} gönderilsin mi?`;
    $("#confirm-sub").textContent = `${pending.text.length} karakter`;
    box.append(el("pre", "confirm-text", pending.text.slice(0, 600)));
    return;
  }
  const list = pending.list;
  if (!list.length) return closeConfirm(true);
  const total = list.reduce((n, x) => n + (x.file.size || 0), 0);
  $("#confirm-title").textContent = list.length === 1 ? `${target} gönderilsin mi?` : `${list.length} öğe ${target.toLowerCase()} gönderilsin mi?`;
  $("#confirm-sub").textContent = `Toplam ${size(total)}${list.length > 1 ? ` · tek albüm${pending.batchName ? " (“" + pending.batchName + "”)" : ""} olarak gider` : ""} · istemediklerini ✕ ile çıkar`;
  list.forEach((x, i) => {
    const r = el("div", "row");
    const k = fileKind(x.file);
    const ic = el("span", "ic-badge " + (COLOR[k] || ""));
    if (k === "photo" && i < 60 && !/heic|heif/i.test(x.file.type)) {
      const u = URL.createObjectURL(x.file); previewUrls.push(u);
      const img = el("img"); img.src = u; img.alt = ""; ic.append(img);
    } else ic.append(icon(ICON_OF[k] || "file"));
    const main = el("div", "main-t");
    main.append(el("div", "name", x.name || x.file.name || "dosya"), el("div", "sub", size(x.file.size || 0)));
    r.append(ic, main);
    if (list.length > 1) {
      const rm = el("button", "more", "✕"); rm.title = "Çıkar";
      rm.addEventListener("click", () => { pending.list.splice(i, 1); drawConfirm(); });
      r.append(rm);
    }
    box.append(r);
  });
}
function closeConfirm(cancelled) {
  previewUrls.forEach((u) => URL.revokeObjectURL(u)); previewUrls = [];
  $("#confirm").hidden = true;
  if (cancelled && pending) toast("Gönderilmedi");
  pending = null;
}
function acceptConfirm() {
  const p = pending;
  closeConfirm(false);
  if (!p) return;
  if (p.text) sendText(p.text); else uploadAll(p.list, p.batchName);
}
$("#confirm-yes").addEventListener("click", acceptConfirm);
$("#confirm-no").addEventListener("click", () => closeConfirm(true));
$("#confirm").addEventListener("click", (e) => { if (e.target.id === "confirm") closeConfirm(true); });

function openItem(it) {
  const k = kind(it);
  if (k === "text") return viewer("Yazı", el("pre", "", it.text), it);
  if (canShow(it)) { const img = el("img"); img.src = fileUrl(it); img.alt = it.name; return viewer(it.name, img, it); }
  if (k === "video") {
    const v = el("video"); v.src = fileUrl(it); v.controls = true; v.playsInline = true; v.autoplay = true;
    return viewer(it.name, v, it);
  }
  if (k === "audio") { const a = el("audio"); a.src = fileUrl(it); a.controls = true; a.autoplay = true; return viewer(it.name, a, it); }
  if (/pdf|text\/plain/.test(it.mime || "")) { const f = el("iframe"); f.src = fileUrl(it); return viewer(it.name, f, it); }
  if (state.local) return reveal(it);
  window.open(fileUrl(it), "_blank");
}
function download(it) {
  const a = el("a");
  a.href = fileUrl(it, true);
  a.download = it.name;
  document.body.append(a);
  a.click();
  a.remove();
  if (isIOS) toast("İndirilenler → Dosyalar uygulamasında");
}
// ---------- galeriye / Fotoğraflar'a kaydetme ----------
// Samsung/Android: indirilen fotoğraf ve video Galeri'de (İndirilenler) görünür.
// iPhone: Safari yalnızca güvenli bağlantıda (https) paylaşım menüsünü açar → "Görüntüyü/Videoyu Kaydet"
// doğrudan Fotoğraflar'a kaydeder. Paylaşım dokunuşun hemen ardından çağrılmalı; bu yüzden dosyalar önceden alınır.
const isMedia = (it) => it.kind === "file" && ["photo", "video"].includes(kind(it));
const canShareFiles = () => window.isSecureContext && !!navigator.canShare;
const mediaCache = new Map();
let cacheBytes = 0, prefetching = false;
const CACHE_MAX = 400 * 1024 * 1024;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function getFile(it) {
  if (mediaCache.has(it.id)) return mediaCache.get(it.id);
  const blob = await (await fetch(fileUrl(it))).blob();
  const f = new File([blob], it.name, { type: it.mime || blob.type });
  if (cacheBytes + f.size <= CACHE_MAX) { mediaCache.set(it.id, f); cacheBytes += f.size; }
  return f;
}
async function prefetchMedia() {
  if (!isIOS || !canShareFiles() || prefetching || !state.data) return;
  prefetching = true;
  try {
    for (const it of state.data.items.filter((i) => !mine(i) && isMedia(i))) {
      if (!mediaCache.has(it.id) && cacheBytes + (it.size || 0) <= CACHE_MAX) await getFile(it).catch(() => null);
    }
  } finally { prefetching = false; }
}
function saveToPhotos(list) {
  const items = [].concat(list).filter(isMedia);
  if (!items.length) return;
  if (isIOS) {
    if (!canShareFiles()) return setTab("setup");
    const missing = items.filter((i) => !mediaCache.has(i.id));
    if (missing.length) {
      toast(`Hazırlanıyor… (${missing.length})`);
      Promise.all(missing.map(getFile)).then(() => toast("Hazır — “Kaydet”e yeniden dokun"), () => toast("Dosya alınamadı"));
      return;
    }
    const files = items.map((i) => mediaCache.get(i.id));
    if (!navigator.canShare({ files })) { toast("Bu dosya türü Fotoğraflar'a kaydedilemiyor"); return; }
    navigator.share({ files }).catch((e) => { if (e.name !== "AbortError") toast("Kaydedilemedi: " + e.message); });
    return;
  }
  (async () => {
    for (const it of items) { download(it); await sleep(500); }
    toast(items.length > 1 ? `${items.length} öğe Galeri'ye iniyor (İndirilenler)` : "Galeri'ye iniyor (İndirilenler albümü)");
  })();
}
function secureUrl() {
  const port = location.port ? ":" + location.port : "";
  return `https://${location.hostname}${port}/?k=${encodeURIComponent((info && info.token) || "")}`;
}
// Sertifika telefona yüklenip güvenilmiş mi? (güvenilmemişse https isteği hata verir)
async function httpsTrusted() {
  if (location.protocol === "https:" || !(info && info.ca)) return false;
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 1500);
  try { await fetch(`https://${location.hostname}:${location.port}/api/ping`, { mode: "no-cors", cache: "no-store", signal: ctl.signal }); return true; }
  catch { return false; } finally { clearTimeout(t); }
}
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); } catch {
    const t = el("textarea"); t.value = text; t.style.position = "fixed"; t.style.opacity = "0";
    document.body.append(t); t.select(); t.setSelectionRange(0, text.length); document.execCommand("copy"); t.remove();
  }
  toast("Kopyalandı");
}
async function reveal(it) {
  try { await api("/api/reveal", { id: it.id }); } catch (e) { toast(e.message); }
}
function laterMenu(it) {
  sheet(`“${it.name}” ne zaman silinsin? Bu süre içinde Sonradan Sil'den geri yükleyebilirsin.`, [
    ["1 hafta sonra sil", () => softDelete(it, 7)],
    ["2 hafta sonra sil", () => softDelete(it, 14)],
    ["1 ay sonra sil", () => softDelete(it, 30)],
    ["Hemen kalıcı olarak sil", () => purge(it), true],
  ]);
}
async function softDelete(it, days) {
  await api("/api/delete", { id: it.id, days });
  toast(`Sonradan Sil'e taşındı · ${DAYS[days]} sonra silinecek`);
  refresh(true);
}
async function purge(it) {
  if (!confirm(`“${it.name}” kalıcı olarak silinsin mi? Bu geri alınamaz.`)) return;
  await api("/api/purge", { id: it.id });
  toast("Kalıcı olarak silindi");
  refresh(true);
}
async function restore(it) {
  await api("/api/restore", { id: it.id });
  toast("Geri yüklendi");
  refresh(true);
}

// ---------- çizim ----------
function actionsFor(it) {
  const k = kind(it), a = [];
  if (k === "text") {
    a.push(["copy", "Kopyala", () => copyText(it.text)]);
    if (isUrl(it.text)) a.push(["link", "Aç", () => window.open(it.text.trim(), "_blank")]);
    else a.push(["eye", "Göster", () => openItem(it)]);
  } else {
    a.push(["eye", "Aç", () => openItem(it)]);
    if (state.local) a.push(["folder", "Klasörde", () => reveal(it)]);
    else if (isMobile && isMedia(it)) a.push(["save", isIOS ? "Kaydet" : "Galeriye", () => saveToPhotos(it)]);
    else a.push(["save", "İndir", () => download(it)]);
  }
  a.push(["trash", "Sil", () => quickDelete([it]), true]);
  return a;
}
function thumb(it) {
  const k = kind(it), t = el("button", "thumb");
  if (k === "text") {
    t.classList.add("text");
    t.textContent = it.text.slice(0, 220);
  } else if (canShow(it)) {
    const img = el("img"); img.loading = "lazy"; img.src = fileUrl(it); img.alt = "";
    t.append(img);
  } else if (k === "video") {
    const v = el("video"); v.src = fileUrl(it) + "#t=0.5"; v.muted = true; v.playsInline = true; v.preload = "metadata";
    const p = el("span", "play"); p.append(icon("play"));
    t.append(v, p);
  } else {
    const b = el("span", "ic-badge " + (COLOR[k] || "")); b.append(icon(ICON_OF[k] || "file"));
    const ext = (it.name.split(".").pop() || "").slice(0, 5);
    t.append(b);
    if (ext && ext !== it.name) t.append(el("span", "ext", ext));
  }
  t.addEventListener("click", () => openItem(it));
  return t;
}
function card(it, isNew) {
  const c = el("div", "item");
  if (isNew) c.append(el("span", "new", "Yeni"));
  c.append(thumb(it));
  const m = el("div", "meta");
  m.append(el("b", "", it.kind === "text" ? (isUrl(it.text) ? "Bağlantı" : "Yazı") : it.name),
    el("small", "", `${it.source || ""} · ${when(it.created)}${it.kind === "file" ? " · " + size(it.size) : ""}`));
  const acts = el("div", "acts");
  actionsFor(it).forEach(([ic, label, fn, red]) => {
    const b = el("button", red ? "red" : "");
    b.append(icon(ic), el("span", "", label));
    b.title = label;
    b.addEventListener("click", fn);
    acts.append(b);
  });
  c.append(m, acts);
  return c;
}
// ---------- albümler (toplu gönderimler) ----------
// Aynı anda gönderilen dosyalar (aynı "batch") tek bir albüm kartı olarak görünür.
function grouped(list) {
  const count = {};
  list.forEach((i) => { if (i.batch) count[i.batch] = (count[i.batch] || 0) + 1; });
  const out = [], done = new Set();
  list.forEach((i) => {
    if (i.batch && count[i.batch] > 1) {
      if (done.has(i.batch)) return;
      done.add(i.batch);
      out.push({ album: i.batch, items: list.filter((x) => x.batch === i.batch) });
    } else out.push({ item: i });
  });
  return out;
}
function albumItems(batch) {
  return state.data ? state.data.items.filter((i) => i.batch === batch) : [];
}
function albumTitle(items) {
  return items[0].batch_name || "Albüm";
}
function albumSummary(items) {
  const n = items.length, ph = items.filter((i) => kind(i) === "photo").length, vd = items.filter((i) => kind(i) === "video").length;
  const parts = [];
  if (ph) parts.push(`${ph} fotoğraf`);
  if (vd) parts.push(`${vd} video`);
  if (n - ph - vd) parts.push(`${n - ph - vd} dosya`);
  return parts.join(", ");
}
function openAlbum(batch) {
  state.album = batch;
  setTab("album");
}
function albumActions(items) {
  const a = [["eye", "Aç", () => openAlbum(items[0].batch)]];
  const media = items.filter(isMedia);
  if (state.local) a.push(["folder", "Klasörde", () => reveal(items[0])]);
  else if (isMobile && media.length) a.push(["save", isIOS ? "Hepsini kaydet" : "Galeriye", () => saveToPhotos(media)]);
  else a.push(["save", "Hepsini indir", () => downloadAll(items)]);
  a.push(["trash", "Sil", () => quickDelete(items), true]);
  return a;
}
async function downloadAll(items) {
  for (const it of items.filter((i) => i.kind === "file")) { download(it); await sleep(500); }
}
function albumLaterMenu(items) {
  const run = async (days) => {
    for (const it of items) await api("/api/delete", { id: it.id, days });
    toast(`${items.length} öğe Sonradan Sil'e taşındı · ${DAYS[days]} sonra silinecek`);
    if (state.tab === "album") setTab(state.albumFrom || "inbox");
    refresh(true);
  };
  const purgeAll = async () => {
    if (!confirm(`“${albumTitle(items)}” içindeki ${items.length} öğe kalıcı olarak silinsin mi? Bu geri alınamaz.`)) return;
    for (const it of items) await api("/api/purge", { id: it.id });
    toast("Kalıcı olarak silindi");
    if (state.tab === "album") setTab(state.albumFrom || "inbox");
    refresh(true);
  };
  sheet(`“${albumTitle(items)}” (${items.length} öğe) ne zaman silinsin? Bu süre içinde Sonradan Sil'den geri yükleyebilirsin.`, [
    ["1 hafta sonra sil", () => run(7)], ["2 hafta sonra sil", () => run(14)], ["1 ay sonra sil", () => run(30)],
    ["Hemen kalıcı olarak sil", purgeAll, true],
  ]);
}
// Sil: soru sormadan Sonradan Sil'e taşır (varsayılan süreyle); süre Sonradan Sil ekranında seçilir.
async function quickDelete(list) {
  const items = [].concat(list);
  for (const it of items) await api("/api/delete", { id: it.id });
  const days = state.data ? state.data.retention_days : 14;
  if (state.tab === "album" && items.length > 1) setTab(state.albumFrom || "inbox");
  toast(`${items.length > 1 ? items.length + " öğe " : ""}Sonradan Sil'e taşındı · ${DAYS[days] || days + " gün"} sonra silinir`, ["Geri al", async () => {
    for (const it of items) await api("/api/restore", { id: it.id });
    toast("Geri alındı");
    refresh(true);
  }]);
  refresh(true);
}
async function setDuration(items, days) {
  for (const it of items) await api("/api/delete", { id: it.id, days });
  toast(`${DAYS[days]} sonra silinecek`);
  refresh(true);
}
async function restoreAll(items) {
  for (const it of items) await api("/api/restore", { id: it.id });
  toast(items.length > 1 ? `${items.length} öğe geri yüklendi` : "Geri yüklendi");
  refresh(true);
}
async function purgeAll(items) {
  const what = items.length > 1 ? `${items.length} öğe` : `“${items[0].name}”`;
  if (!confirm(`${what} kalıcı olarak silinsin mi? Bu geri alınamaz.`)) return;
  for (const it of items) await api("/api/purge", { id: it.id });
  toast("Kalıcı olarak silindi");
  refresh(true);
}
// Kolaj: 1–5 kare; daha fazlasında son karede "+N".
function collage(items) {
  const t = el("button", "thumb album-thumb");
  const ordered = [...items].sort((a, b) => a.created - b.created);
  const visual = [...ordered.filter((i) => canShow(i) || kind(i) === "video"), ...ordered.filter((i) => !(canShow(i) || kind(i) === "video"))];
  const pics = visual.slice(0, 5);
  const grid = el("div", "collage n" + pics.length);
  const extra = items.length - pics.length;
  pics.forEach((it, idx) => {
    const cell = el("span", "cell");
    if (canShow(it)) { const img = el("img"); img.loading = "lazy"; img.src = fileUrl(it); img.alt = ""; cell.append(img); }
    else if (kind(it) === "video") {
      const v = el("video"); v.src = fileUrl(it) + "#t=0.5"; v.muted = true; v.playsInline = true; v.preload = "metadata"; cell.append(v);
    } else { const b = el("span", "ic-badge " + (COLOR[kind(it)] || "")); b.append(icon(ICON_OF[kind(it)] || "file")); cell.append(b); }
    if (kind(it) === "video") { const pl = el("span", "mini-play"); pl.append(icon("play")); cell.append(pl); }
    if (extra > 0 && idx === pics.length - 1) cell.append(el("span", "more-n", "+" + extra));
    grid.append(cell);
  });
  const badge = el("span", "count"); badge.append(icon("photo"), el("span", "", String(items.length)));
  t.append(grid, badge);
  t.addEventListener("click", () => openAlbum(items[0].batch));
  return t;
}
function albumCard(items, isNew) {
  const c = el("div", "item album");
  if (isNew) c.append(el("span", "new", "Yeni"));
  c.append(collage(items));
  const total = items.reduce((n, i) => n + (i.size || 0), 0);
  const latest = Math.max(...items.map((i) => i.created));
  const m = el("div", "meta");
  m.append(el("b", "", albumTitle(items)), el("small", "", `${albumSummary(items)} · ${size(total)}`),
    el("small", "", `${items[0].source || ""} · ${when(latest)}`));
  const acts = el("div", "acts");
  albumActions(items).forEach(([ic, label, fn, red]) => {
    const b = el("button", red ? "red" : ""); b.append(icon(ic), el("span", "", label)); b.title = label;
    b.addEventListener("click", fn); acts.append(b);
  });
  c.append(m, acts);
  return c;
}
function cardsFor(list, markNew) {
  return grouped(list).map((g) => g.album
    ? albumCard(g.items, markNew && g.items.some((i) => !seen.has(i.id)))
    : card(g.item, markNew && !seen.has(g.item.id)));
}
function renderAlbum() {
  if (state.tab !== "album") return;
  const items = albumItems(state.album);
  if (!items.length) { setTab(state.albumFrom || "inbox"); return; }
  $("#title").textContent = albumTitle(items);
  const total = items.reduce((n, i) => n + (i.size || 0), 0);
  $("#lead").textContent = `${albumSummary(items)} · ${size(total)} · ${items[0].source || ""} · ${when(Math.max(...items.map((i) => i.created)))}`;
  const tools = $("#album-tools");
  tools.replaceChildren();
  albumActions(items).slice(1).forEach(([ic, label, fn, red]) => {
    const b = el("button", "btn small " + (red ? "danger" : "soft")); b.append(icon(ic), el("span", "", label));
    b.addEventListener("click", fn); tools.append(b);
  });
  const fromOther = !mine(items[0]);
  const ordered = [...items].sort((a, b) => a.created - b.created);
  $("#album-cards").replaceChildren(...ordered.map((i) => card(i, fromOther && !seen.has(i.id))));
  if (fromOther) setTimeout(() => { items.forEach((i) => seen.add(i.id)); store.set("seen", [...seen].slice(-2000)); }, 1500);
}

// Sonradan Sil satırı: tek öğe ya da albüm; süre (1 hafta / 2 hafta / 1 ay) doğrudan seçilir.
function binRow(items) {
  const it = items[0], album = items.length > 1;
  const r = el("div", "row bin-row");
  const ic = el("span", "ic-badge " + (album ? "orange" : COLOR[kind(it)] || ""));
  const pic = items.find(canShow);
  if (pic) { const img = el("img"); img.loading = "lazy"; img.src = fileUrl(pic); img.alt = ""; ic.append(img); }
  else ic.append(icon(album ? "folder" : ICON_OF[kind(it)] || "file"));
  if (album) ic.append(el("span", "stack-n", String(items.length)));
  const main = el("div", "main-t");
  const exp = Math.min(...items.map((i) => i.expires_at));
  const soon = exp - Date.now() / 1000 < 2 * 86400;
  const total = items.reduce((n, i) => n + (i.size || 0), 0);
  const sub = el("div", "sub" + (soon ? " soon" : ""));
  sub.append(icon("clock"), el("span", "", `${left(exp)}${total ? " · " + size(total) : ""}`));
  const name = album ? `${albumTitle(items)} · ${albumSummary(items)}`
    : (it.kind === "text" ? it.text.replace(/\s+/g, " ").slice(0, 80) : it.name);
  main.append(el("div", "name", name), sub);
  const seg = el("div", "segmented mini");
  const cur = it.retention_days;
  [7, 14, 30].forEach((d) => {
    const b = el("button", d === cur ? "on" : "", DAYS[d]);
    b.title = `${DAYS[d]} sonra silinsin`;
    b.addEventListener("click", () => { if (d !== cur) setDuration(items, d); });
    seg.append(b);
  });
  main.append(seg);
  const side = el("div", "bin-side");
  const back = el("button", "btn soft", "Geri yükle");
  back.addEventListener("click", () => restoreAll(items));
  const del = el("button", "btn danger-soft", "Şimdi sil");
  del.addEventListener("click", () => purgeAll(items));
  side.append(back, del);
  r.append(ic, main, side);
  return r;
}
function setBadge(tab, n) {
  document.querySelectorAll(`[data-badge="${tab}"]`).forEach((b) => { b.hidden = !n; b.textContent = n; });
}
function renderDevices(d) {
  const box = $("#devices");
  box.replaceChildren(el("b", "", "Bağlı cihazlar"));
  const phones = (d.devices || []).filter((x) => x.name !== "Bilgisayar").sort((a, b) => b.last_seen - a.last_seen);
  if (!phones.length) {
    box.append(el("div", "dev", "Henüz telefon bağlanmadı"));
    const b = el("button", "btn soft", "Telefon bağla");
    b.addEventListener("click", () => setTab("connect"));
    box.append(b);
    return;
  }
  phones.forEach((p) => {
    const on = Date.now() / 1000 - p.last_seen < 15;
    const r = el("div", "dev" + (on ? " on" : ""));
    r.append(icon("phone"), el("span", "", p.name), el("small", "", ago(p.last_seen)));
    box.append(r);
  });
}
function render() {
  const d = state.data;
  if (!d) return;
  const incoming = d.items.filter((i) => !mine(i));
  const outgoing = d.items.filter(mine);
  const fi = incoming.filter((i) => matches(i, state.filters.inbox));
  const fo = outgoing.filter((i) => matches(i, state.filters.sent));
  $("#inbox").replaceChildren(...cardsFor(fi, true));
  const media = fi.filter(isMedia);
  const all = $("#save-all");
  if (all) { all.hidden = media.length < 2; all.lastChild.textContent = `Hepsini ${isIOS ? "Fotoğraflar'a" : "Galeri'ye"} kaydet (${media.length})`; }
  $("#photos-banner").hidden = !(isIOS && !canShareFiles() && info && info.ca && incoming.some(isMedia));
  prefetchMedia();
  $("#inbox-empty").hidden = fi.length > 0;
  $("#sent").replaceChildren(...cardsFor(fo, false));
  renderAlbum();
  $("#sent-empty").hidden = fo.length > 0;
  setBadge("inbox", incoming.filter((i) => !seen.has(i.id)).length);
  $("#bin").replaceChildren(...grouped(d.bin).map((g) => binRow(g.album ? g.items : [g.item])));
  $("#bin-empty").hidden = d.bin.length > 0;
  $("#empty-bin").hidden = d.bin.length === 0;
  setBadge("bin", grouped(d.bin).length);
  document.querySelectorAll("#retention button").forEach((b) => b.classList.toggle("on", +b.dataset.d === d.retention_days));
  renderDevices(d);
}

// ---------- veri ----------
function setStatus(ok, text) {
  $("#status").classList.toggle("off", !ok);
  $("#status b").textContent = text;
}
async function refresh(force) {
  try {
    if (!force && state.data) {
      const v = await api("/api/version");
      setStatus(true, "Bağlı");
      if (v.version === state.version) { if (!isMobile) renderDevices(state.data); return; }
    }
    const d = await api("/api/items");
    setStatus(true, "Bağlı");
    const fresh = d.items.filter((i) => !mine(i) && !state.known.has(i.id));
    if (!state.first && fresh.length) {
      const from = [...new Set(fresh.map((i) => i.source))].join(", ");
      toast(`${from}: ${fresh.length} yeni öğe geldi`);
    }
    d.items.forEach((i) => state.known.add(i.id));
    state.first = false;
    state.data = d;
    state.version = d.version;
    render();
  } catch (e) {
    setStatus(false, /anahtar/.test(e.message) ? "QR kodu yeniden okut" : "Bağlantı yok");
  }
}

// ---------- gönderme ----------
const PICKS = [
  { id: "in-photo", icon: "photo", color: "", label: "Fotoğraf", sub: isIOS ? "Fotoğraf Arşivi'nden" : "Galeriden" },
  { id: "in-video", icon: "video", color: "pink", label: "Video", sub: "Bir ya da birden çok" },
  { id: "in-doc", icon: "doc", color: "purple", label: "Belge", sub: "PDF, Word, Excel…" },
  { id: "in-any", icon: "file", color: "teal", label: "Herhangi bir dosya", sub: isIOS ? "Dosyalar uygulamasından" : "Ne olursa" },
  { id: "in-cam", icon: "camera", color: "green", label: "Kamera", sub: "Çek ve gönder", mobile: true },
  { id: "in-folder", icon: "folder", color: "orange", label: "Klasör", sub: "İçindekilerin hepsi", pc: true },
  { id: "clip", icon: "clip", color: "gray", label: "Panodan", sub: "Kopyaladığın görsel/yazı", pc: true },
];
function buildPicks() {
  const folder = el("input"); folder.type = "file"; folder.id = "in-folder"; folder.multiple = true; folder.hidden = true;
  folder.setAttribute("webkitdirectory", "");
  document.body.append(folder);
  const grid = $("#pick-grid");
  PICKS.filter((p) => (isMobile ? !p.pc : !p.mobile)).forEach((p) => {
    const b = el("button", "pick");
    const ic = el("span", "ic-badge " + p.color); ic.append(icon(p.icon));
    b.append(ic, el("b", "", p.label), el("small", "", p.sub));
    b.addEventListener("click", () => (p.id === "clip" ? pasteFromClipboard() : $("#" + p.id).click()));
    grid.append(b);
  });
  ["in-photo", "in-video", "in-doc", "in-any", "in-cam", "in-folder"].forEach((id) => {
    $("#" + id).addEventListener("change", (e) => {
      const files = [...e.target.files];
      const rel = files[0] && files[0].webkitRelativePath;
      const folder = rel ? rel.split("/")[0] : null;
      uploadAll(files.map((f) => ({ file: f, name: (f.webkitRelativePath ? f.webkitRelativePath.split("/").slice(1).join(" - ") : f.name) })), folder);
      e.target.value = "";
    });
  });
}
async function pasteFromClipboard() {
  try {
    const items = await navigator.clipboard.read();
    const files = [];
    for (const ci of items) {
      const img = ci.types.find((t) => t.startsWith("image/"));
      if (img) { const b = await ci.getType(img); files.push({ file: b, name: `Panodan ${new Date().toLocaleString("tr-TR").replace(/[/:]/g, ".")}.png` }); }
    }
    if (files.length) return confirmSend(files);
    const text = await navigator.clipboard.readText();
    if (text.trim()) return confirmSend([], text.trim());
    toast("Panoda gönderilecek bir şey yok");
  } catch {
    toast("Ctrl+V ile de yapıştırabilirsin");
  }
}
function newBatchId() {
  const a = new Uint8Array(6);
  crypto.getRandomValues(a);
  return [...a].map((x) => x.toString(16).padStart(2, "0")).join("");
}
function sendOne(file, name, batch, batchName, onProgress) {
  return new Promise((resolve) => {
    const x = new XMLHttpRequest();
    x.open("POST", "/api/upload");
    x.setRequestHeader("X-Filename", encodeURIComponent(name));
    x.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    if (batch) x.setRequestHeader("X-Batch", batch);
    if (batchName) x.setRequestHeader("X-Batch-Name", encodeURIComponent(batchName));
    x.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(e.loaded); };
    x.onload = () => {
      let j = {}; try { j = JSON.parse(x.responseText || "{}"); } catch { /* boş */ }
      if (x.status === 201) { state.known.add(j.id); resolve({ ok: true, item: j }); }
      else resolve({ ok: false, error: j.error || String(x.status) });
    };
    x.onerror = () => resolve({ ok: false, error: "Bağlantı koptu" });
    x.send(file);
  });
}
// Birden çok dosya: tek albüm (karşı tarafta tek kart, bilgisayarda tek klasör) ve tek ilerleme satırı.
async function uploadBatch(files, batchName) {
  const batch = newBatchId();
  const total = files.reduce((n, f) => n + (f.file.size || 0), 0);
  const r = el("div", "up");
  const ic = el("span", "ic-badge orange"); ic.append(icon("folder"));
  const main = el("div", "main-t");
  const bar = el("div", "bar"), fill = el("i"); bar.append(fill);
  const title = el("div", "name", `${batchName ? "“" + batchName + "” · " : ""}${files.length} öğe albüm olarak`);
  const sub = el("div", "sub", "Bekliyor · " + size(total));
  main.append(title, sub, bar);
  r.append(ic, main);
  $("#uploads").prepend(r);
  let done = 0, ok = 0, failed = 0, label = null;
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const res = await sendOne(f.file, f.name || f.file.name || "dosya", batch, batchName, (loaded) => {
      const p = total ? Math.round(((done + loaded) / total) * 100) : 0;
      fill.style.width = p + "%";
      sub.textContent = `${i + 1}/${files.length} · %${p} · ${size(done + loaded)} / ${size(total)}`;
    });
    done += f.file.size || 0;
    if (res.ok) { ok++; label = label || res.item.batch_name; } else failed++;
  }
  fill.style.width = "100%";
  if (label) title.textContent = `“${label}” · ${files.length} öğe`;
  sub.textContent = failed ? `${ok} gönderildi, ${failed} gönderilemedi` : "Hepsi tek albüm olarak gönderildi";
  if (!failed) { ic.replaceChildren(icon("check")); ic.classList.replace("orange", "green"); } else fill.style.background = "var(--red)";
  setTimeout(() => r.remove(), failed ? 20000 : 6000);
  return ok;
}
function upload(file, name) {
  name = name || file.name || "dosya";
  const r = el("div", "up");
  const ic = el("span", "ic-badge"); ic.append(icon("upload"));
  const main = el("div", "main-t");
  const bar = el("div", "bar"), fill = el("i"); bar.append(fill);
  const sub = el("div", "sub", "Bekliyor · " + size(file.size));
  main.append(el("div", "name", name), sub, bar);
  r.append(ic, main);
  $("#uploads").prepend(r);
  return new Promise((resolve) => {
    const x = new XMLHttpRequest();
    x.open("POST", "/api/upload");
    x.setRequestHeader("X-Filename", encodeURIComponent(name));
    x.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    x.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;
      const p = Math.round((e.loaded / e.total) * 100);
      fill.style.width = p + "%";
      sub.textContent = `%${p} · ${size(e.loaded)} / ${size(e.total)}`;
    };
    x.onload = () => {
      const ok = x.status === 201;
      let j = {}; try { j = JSON.parse(x.responseText || "{}"); } catch { /* boş */ }
      sub.textContent = ok ? "Gönderildi" : "Hata: " + (j.error || x.status);
      fill.style.width = "100%";
      if (ok) { ic.replaceChildren(icon("check")); ic.classList.add("green"); state.known.add(j.id); }
      else fill.style.background = "var(--red)";
      setTimeout(() => r.remove(), ok ? 5000 : 20000);
      resolve(ok);
    };
    x.onerror = () => { sub.textContent = "Bağlantı koptu"; fill.style.background = "var(--red)"; resolve(false); };
    x.send(file);
  });
}
async function uploadAll(list, batchName) {
  const files = list.filter(Boolean);
  if (!files.length) return;
  if (state.tab !== "send") setTab("send");
  let ok = 0;
  if (files.length > 1) ok = await uploadBatch(files, batchName);
  else ok = (await upload(files[0].file, files[0].name)) ? 1 : 0;
  const how = files.length > 1 ? " tek albüm olarak" : "";
  toast(ok === files.length ? `${ok} öğe${how} gönderildi` : `${ok}/${files.length} öğe gönderildi`);
  refresh(true);
}
async function sendText(text) {
  const it = await api("/api/text", { text });
  state.known.add(it.id);
  toast("Yazı gönderildi");
  refresh(true);
}
$("#send-text").addEventListener("click", async () => {
  const t = $("#text"), text = t.value.trim();
  if (!text) return t.focus();
  await sendText(text);
  t.value = "";
});

// sürükle-bırak (klasörler dahil)
let dragDepth = 0;
const hasFiles = (e) => [...(e.dataTransfer?.types || [])].includes("Files");
window.addEventListener("dragenter", (e) => { if (hasFiles(e)) { dragDepth++; document.body.classList.add("dragging"); } });
window.addEventListener("dragleave", () => { if (--dragDepth <= 0) { dragDepth = 0; document.body.classList.remove("dragging"); } });
window.addEventListener("dragover", (e) => { if (hasFiles(e)) e.preventDefault(); });
window.addEventListener("drop", async (e) => {
  e.preventDefault();
  dragDepth = 0;
  document.body.classList.remove("dragging");
  const entries = [...e.dataTransfer.items].map((i) => i.webkitGetAsEntry && i.webkitGetAsEntry()).filter(Boolean);
  if (!entries.length) return confirmSend([...e.dataTransfer.files].map((f) => ({ file: f, name: f.name })));
  const out = [];
  const walk = (entry, prefix) => new Promise((res) => {
    if (entry.isFile) return entry.file((f) => { out.push({ file: f, name: prefix + f.name }); res(); }, res);
    const reader = entry.createReader(), all = [];
    const next = () => reader.readEntries(async (batch) => {
      if (!batch.length) { for (const c of all) await walk(c, prefix + entry.name + " - "); return res(); }
      all.push(...batch); next();
    }, res);
    next();
  });
  const single = entries.length === 1 && entries[0].isDirectory;
  if (single) {
    const reader = entries[0].createReader();
    const kids = await new Promise((res) => { const all = []; const next = () => reader.readEntries((b) => { if (!b.length) return res(all); all.push(...b); next(); }, () => res(all)); next(); });
    for (const k of kids) await walk(k, "");
  } else for (const en of entries) await walk(en, "");
  if (out.length) confirmSend(out, undefined, single ? entries[0].name : undefined);
});
window.addEventListener("paste", (e) => {
  const files = [...(e.clipboardData?.files || [])].map((f, i) => ({ file: f, name: f.name === "image.png" ? `Yapıştırılan ${Date.now()}-${i}.png` : f.name }));
  if (files.length) { e.preventDefault(); return confirmSend(files); }
  if (e.target.closest && e.target.closest("textarea, input")) return;
  const text = e.clipboardData?.getData("text");
  if (text && text.trim()) confirmSend([], text.trim());
});

$("#album-back").addEventListener("click", () => setTab(state.albumFrom || "inbox"));
$("#empty-bin").addEventListener("click", async () => {
  if (!confirm("Sonradan Sil kutusundaki her şey kalıcı olarak silinsin mi?")) return;
  const r = await api("/api/empty-bin", {});
  toast(`${r.removed} öğe kalıcı olarak silindi`);
  refresh(true);
});

// ---------- bağlan / QR ----------
let info = null;
function drawQR() {
  if (!info) return;
  const url = $("#urls").value || info.urls[0];
  const box = $("#qr");
  box.replaceChildren();
  if (window.QRCode) new window.QRCode(box, { text: url, width: 230, height: 230, correctLevel: window.QRCode.CorrectLevel.M });
  else box.append(el("div", "muted", "QR kodu yüklenemedi; bu bağlantıyı telefonda aç:"), el("b", "", url));
}
$("#urls").addEventListener("change", drawQR);
$("#copy-url").addEventListener("click", () => copyText($("#urls").value));

async function init() {
  buildNav();
  buildFilters();
  buildPicks();
  info = await api("/api/info").catch(() => null);
  if (info) {
    state.device = info.device;
    state.local = !!info.local;
    $("#device").textContent = info.device === "Bilgisayar" ? "Bu bilgisayar" : info.device;
    $("#urls").replaceChildren(...info.urls.map((u) => { const o = el("option", "", u); o.value = u; return o; }));
    $("#data-dir").textContent = "Dosyalar bu bilgisayarda: " + info.data_dir;
  }
  if (isMobile) {
    $("#drop-title").textContent = "Bilgisayara gönder";
    $("#drop-sub").textContent = "Aşağıdan fotoğraf, video ya da dosya seç; bilgisayarda anında görünür.";
    $("#inbox-empty-sub").textContent = "Bilgisayarda Aktarım'a sürükleyip bıraktıkların burada görünür.";
  } else {
    $("#inbox-empty-sub").textContent = "Telefonda Aktarım'ı açıp Gönder'e dokun; gönderdiklerin burada görünür.";
  }
  if (isMobile) {
    const b = el("button", "btn soft small"); b.id = "save-all"; b.hidden = true;
    b.append(icon("save"), el("span", "", ""));
    b.addEventListener("click", () => saveToPhotos(state.data.items.filter((i) => !mine(i) && isMedia(i) && matches(i, state.filters.inbox))));
    $("#inbox-tools").append(b);
  }
  $("#banner-go").addEventListener("click", () => setTab("setup"));
  $("#setup-ca").href = (info && info.ca) || "/aktarim-ca.cer";
  $("#setup-go").addEventListener("click", async () => {
    if (await httpsTrusted()) location.href = secureUrl();
    else toast("Önce 2. ve 3. adımı bitir (sertifikaya güven)");
  });
  if (isIOS && location.protocol === "http:" && await httpsTrusted()) { location.replace(secureUrl()); return; }
  if (state.local) {
    const b = el("button", "btn soft small"); b.append(icon("folder"), el("span", "", "Klasörü aç"));
    b.addEventListener("click", () => api("/api/open-folder", {}).catch((e) => toast(e.message)));
    $("#inbox-tools").append(b);
  }
  await refresh(true);
  const d = state.data;
  if (!isMobile && d && !d.items.length && !(d.devices || []).some((x) => x.name !== "Bilgisayar")) setTab("connect");
  else if (d && d.items.some((i) => !mine(i) && !seen.has(i.id))) setTab("inbox");
  else setTab("send");
  setInterval(refresh, 2000);
  window.addEventListener("load", () => state.tab === "connect" && drawQR());
}
document.addEventListener("visibilitychange", () => { if (!document.hidden) refresh(true); });
init();
