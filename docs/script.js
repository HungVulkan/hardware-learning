/* ====== CẤU HÌNH — sửa 3 dòng này cho đúng repo của bạn ====== */
const OWNER = "HungVulkan";
const REPO = "hardware-learning";
const BRANCH = "main";
const CONTENT_PATH = "docs/content"; // nơi chứa các file .md (vì Pages đang serve từ /docs)
/* ============================================================= */

const STRINGS = {
  vi: {
    site_title: "Nhật ký học tập Hardware",
    site_lede: "Ghi lại quá trình tự học digital design, FPGA, kiến trúc máy tính và embedded — theo từng phase.",
    foot_text: "Cập nhật liên tục theo từng phase.",
    loading: "Đang tải bài viết từ GitHub...",
    error: "Không tải được bài viết. Kiểm tra lại OWNER/REPO/CONTENT_PATH trong script.js.",
    empty: "Chưa có bài viết nào trong content/.",
    no_translation: "Chưa có bản dịch tiếng Anh — đang hiển thị bản gốc tiếng Việt."
  },
  en: {
    site_title: "Hardware Learning Journal",
    site_lede: "Tracking self-study progress in digital design, FPGA, computer architecture and embedded systems — phase by phase.",
    foot_text: "Updated continuously as phases progress.",
    loading: "Loading posts from GitHub...",
    error: "Could not load posts. Check OWNER/REPO/CONTENT_PATH in script.js.",
    empty: "No posts in content/ yet.",
    no_translation: "English translation not available yet — showing the original Vietnamese."
  }
};

let currentLang = "vi";
let posts = [];

/* ---------- Lấy danh sách file .md từ GitHub API ---------- */
async function fetchFileList() {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${CONTENT_PATH}?ref=${BRANCH}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("GitHub API error: " + res.status);
  const files = await res.json();
  return files.filter((f) => f.name.endsWith(".md"));
}

/* ---------- Parse frontmatter đơn giản ---------- */
function parseFrontmatter(raw) {
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  const meta = {};
  m[1].split("\n").forEach((line) => {
    const idx = line.indexOf(":");
    if (idx === -1) return;
    meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  });
  return { meta, body: m[2].trim() };
}

function extractTitle(meta, body, fallback) {
  const m = body.match(/^#\s+(.*)$/m);
  return meta.title || (m ? m[1] : fallback);
}

/* ---------- Tải và ghép cặp file .md theo slug (vi + en) ---------- */
async function loadPosts() {
  const files = await fetchFileList();

  // gom theo slug: "phase-0-setup.md" -> vi, "phase-0-setup.en.md" -> en
  const groups = {}; // slug -> { vi: file, en: file }
  files.forEach((f) => {
    if (f.name.endsWith(".en.md")) {
      const slug = f.name.slice(0, -".en.md".length);
      groups[slug] = groups[slug] || {};
      groups[slug].en = f;
    } else {
      const slug = f.name.slice(0, -".md".length);
      groups[slug] = groups[slug] || {};
      groups[slug].vi = f;
    }
  });

  const loaded = await Promise.all(
    Object.entries(groups)
      .filter(([, g]) => g.vi) // bắt buộc phải có bản VI
      .map(async ([slug, g]) => {
        const rawVi = await (await fetch(g.vi.download_url)).text();
        const { meta: metaVi, body: bodyVi } = parseFrontmatter(rawVi);

        let title_en = null;
        let body_en_raw = null;
        if (g.en) {
          const rawEn = await (await fetch(g.en.download_url)).text();
          const { meta: metaEn, body: bodyEn } = parseFrontmatter(rawEn);
          title_en = extractTitle(metaEn, bodyEn, null);
          body_en_raw = bodyEn;
        }

        return {
          id: slug,
          phase: metaVi.phase || "",
          date: metaVi.date || "",
          tags: metaVi.tags ? metaVi.tags.split(",").map((s) => s.trim()) : [],
          title_vi: extractTitle(metaVi, bodyVi, slug),
          body_vi_raw: bodyVi,
          title_en,
          body_en_raw
        };
      })
  );

  loaded.sort((a, b) => (a.date < b.date ? -1 : 1));
  return loaded;
}

/* ---------- Render ---------- */
function buildEntryEl(post) {
  const el = document.createElement("article");
  el.className = "entry done";
  el.id = `post-${post.id}`;

  const meta = document.createElement("div");
  meta.className = "entry-meta";
  meta.innerHTML = `<span>${post.phase}</span><span class="date">${post.date}</span>`;
  el.appendChild(meta);

  const h2 = document.createElement("h2");
  el.appendChild(h2);

  const body = document.createElement("div");
  body.className = "body";
  el.appendChild(body);

  if (post.tags.length) {
    const tagsWrap = document.createElement("div");
    tagsWrap.className = "tags";
    post.tags.forEach((tag) => {
      const t = document.createElement("span");
      t.className = "tag";
      t.textContent = tag;
      tagsWrap.appendChild(t);
    });
    el.appendChild(tagsWrap);
  }

  const note = document.createElement("div");
  note.className = "translate-note";
  el.appendChild(note);

  return { el, h2, body, note };
}

function renderPosts(lang) {
  const container = document.getElementById("timeline");
  container.innerHTML = "";

  if (!posts.length) {
    container.innerHTML = `<p class="status-msg">${STRINGS[lang].empty}</p>`;
    return;
  }

  posts.forEach((post) => {
    const { el, h2, body, note } = buildEntryEl(post);
    container.appendChild(el);

    const hasEn = Boolean(post.body_en_raw);
    const useEn = lang === "en" && hasEn;

    h2.textContent = useEn ? post.title_en : post.title_vi;
    body.innerHTML = marked.parse(useEn ? post.body_en_raw : post.body_vi_raw);

    if (lang === "en" && !hasEn) {
      note.textContent = STRINGS.en.no_translation;
    } else {
      note.textContent = "";
    }
  });
}

/* ---------- Thanh nav chuyển nhanh giữa các phase ---------- */
let scrollObserver = null;

function buildPhaseNav() {
  const nav = document.getElementById("phaseNav");
  nav.innerHTML = "";

  posts.forEach((post) => {
    const pill = document.createElement("button");
    pill.className = "phase-pill";
    pill.textContent = post.phase || post.id;
    pill.dataset.target = `post-${post.id}`;
    pill.addEventListener("click", () => {
      document.getElementById(`post-${post.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    nav.appendChild(pill);
  });

  setupScrollSpy();
}

function setupScrollSpy() {
  if (scrollObserver) scrollObserver.disconnect();

  scrollObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        document.querySelectorAll(".phase-pill").forEach((pill) => {
          pill.classList.toggle("active", pill.dataset.target === id);
        });
      });
    },
    { rootMargin: "-45% 0px -45% 0px" } // coi entry là "đang xem" khi ở giữa viewport
  );

  posts.forEach((post) => {
    const el = document.getElementById(`post-${post.id}`);
    if (el) scrollObserver.observe(el);
  });
}

function applyStrings(lang) {
  document.querySelectorAll("[data-t]").forEach((elm) => {
    const key = elm.getAttribute("data-t");
    if (STRINGS[lang][key]) elm.textContent = STRINGS[lang][key];
  });
  document.documentElement.lang = lang;
}

function setLang(lang) {
  currentLang = lang;
  document.querySelectorAll(".lang-toggle .opt").forEach((opt) => {
    opt.classList.toggle("active", opt.dataset.lang === lang);
  });
  applyStrings(lang);
  renderPosts(lang);
}

document.getElementById("langToggle").addEventListener("click", () => {
  setLang(currentLang === "vi" ? "en" : "vi");
});

/* ---------- Init ---------- */
(async () => {
  const container = document.getElementById("timeline");
  try {
    posts = await loadPosts();
    buildPhaseNav();
    setLang("vi");
  } catch (e) {
    container.innerHTML = `<p class="status-msg error">${STRINGS.vi.error}</p>`;
    console.error(e);
  }
})();
