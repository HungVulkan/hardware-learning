/* ====== CẤU HÌNH — sửa 3 dòng này cho đúng repo của bạn ====== */
const OWNER = "HungVulkan"; // TODO: đổi thành username GitHub của bạn
const REPO = "hardware-learning";
const BRANCH = "main";
const CONTENT_PATH = "docs/content"; // nơi chứa các file .md (vì Pages đang serve từ /docs)
/* ============================================================= */

const STRINGS = {
  vi: {
    site_title: "Nhật ký học tập Hardware",
    site_lede: "Ghi lại quá trình tự học digital design, FPGA, kiến trúc máy tính và embedded — theo từng phase. Nội dung được đọc trực tiếp từ thư mục content/ trên GitHub.",
    foot_text: "Cập nhật liên tục theo từng phase.",
    loading: "Đang tải bài viết từ GitHub...",
    error: "Không tải được bài viết. Kiểm tra lại OWNER/REPO/CONTENT_PATH trong script.js.",
    translating: "đang dịch...",
    empty: "Chưa có bài viết nào trong content/."
  },
  en: {
    site_title: "Hardware Learning Journal",
    site_lede: "Tracking self-study progress in digital design, FPGA, computer architecture and embedded systems — phase by phase. Content is loaded directly from the content/ folder on GitHub.",
    foot_text: "Updated continuously as phases progress.",
    loading: "Loading posts from GitHub...",
    error: "Could not load posts. Check OWNER/REPO/CONTENT_PATH in script.js.",
    translating: "translating...",
    empty: "No posts in content/ yet."
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
  return { meta, body: m[2] };
}

/* ---------- Tải toàn bộ post ---------- */
async function loadPosts() {
  const files = await fetchFileList();
  const loaded = await Promise.all(
    files.map(async (f) => {
      const res = await fetch(f.download_url);
      const raw = await res.text();
      const { meta, body } = parseFrontmatter(raw);

      // nếu file có sẵn bản EN thủ công, tách bằng dòng "<!--en-->"
      const parts = body.split(/<!--\s*en\s*-->/i);
      const body_vi_raw = parts[0].trim();
      const body_en_raw = parts[1] ? parts[1].trim() : null;

      const titleMatch = body_vi_raw.match(/^#\s+(.*)$/m);
      const title_vi = meta.title || (titleMatch ? titleMatch[1] : f.name.replace(/\.md$/, ""));

      return {
        id: f.name.replace(/\.md$/, ""),
        phase: meta.phase || "",
        date: meta.date || "",
        tags: meta.tags ? meta.tags.split(",").map((s) => s.trim()) : [],
        title_vi,
        body_vi_raw,
        title_en_manual: meta.title_en || null,
        body_en_raw_manual: body_en_raw,
        cache: {} // { en: { title, html } }
      };
    })
  );
  loaded.sort((a, b) => (a.date < b.date ? -1 : 1));
  return loaded;
}

/* ---------- Dịch tự động qua MyMemory (khi không có bản EN thủ công) ---------- */
async function translateText(text, from, to) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.responseData && data.responseData.translatedText) {
    return data.responseData.translatedText;
  }
  throw new Error("translate failed");
}

async function getRenderedContent(post, lang) {
  if (lang === "vi") {
    return { title: post.title_vi, html: marked.parse(post.body_vi_raw) };
  }

  // ưu tiên bản EN viết thủ công trong file .md
  if (post.title_en_manual || post.body_en_raw_manual) {
    return {
      title: post.title_en_manual || post.title_vi,
      html: marked.parse(post.body_en_raw_manual || post.body_vi_raw)
    };
  }

  // nếu đã dịch trước đó, dùng cache
  if (post.cache.en) return post.cache.en;

  // tự dịch qua API, dịch title và body riêng
  const [title, bodyText] = await Promise.all([
    translateText(post.title_vi, "vi", "en"),
    translateText(post.body_vi_raw, "vi", "en")
  ]);
  const result = { title, html: marked.parse(bodyText), auto: true };
  post.cache.en = result;
  return result;
}

/* ---------- Render ---------- */
function buildEntryEl(post) {
  const el = document.createElement("article");
  el.className = "entry done";

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

async function renderPosts(lang) {
  const container = document.getElementById("timeline");
  container.innerHTML = "";

  if (!posts.length) {
    container.innerHTML = `<p class="status-msg">${STRINGS[lang].empty}</p>`;
    return;
  }

  for (const post of posts) {
    const { el, h2, body, note } = buildEntryEl(post);
    container.appendChild(el);
    h2.textContent = "…";
    body.classList.add("translating");
    body.textContent = STRINGS[lang].translating;

    try {
      const content = await getRenderedContent(post, lang);
      h2.textContent = content.title;
      body.classList.remove("translating");
      body.innerHTML = content.html;
      if (lang === "en" && content.auto) {
        note.textContent = "auto-translated";
      }
    } catch (e) {
      h2.textContent = post.title_vi;
      body.classList.remove("translating");
      body.innerHTML = marked.parse(post.body_vi_raw);
      note.textContent = "translation unavailable — showing original";
    }
  }
}

function applyStrings(lang) {
  document.querySelectorAll("[data-t]").forEach((elm) => {
    const key = elm.getAttribute("data-t");
    if (STRINGS[lang][key]) elm.textContent = STRINGS[lang][key];
  });
  document.documentElement.lang = lang;
}

async function setLang(lang) {
  currentLang = lang;
  document.querySelectorAll(".lang-toggle .opt").forEach((opt) => {
    opt.classList.toggle("active", opt.dataset.lang === lang);
  });
  applyStrings(lang);
  await renderPosts(lang);
}

document.getElementById("langToggle").addEventListener("click", () => {
  setLang(currentLang === "vi" ? "en" : "vi");
});

/* ---------- Init ---------- */
(async () => {
  const container = document.getElementById("timeline");
  try {
    posts = await loadPosts();
    await setLang("vi");
  } catch (e) {
    container.innerHTML = `<p class="status-msg error">${STRINGS.vi.error}</p>`;
    console.error(e);
  }
})();
