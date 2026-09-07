const STRINGS = {
  vi: {
    site_title: "Nhật ký học tập Hardware",
    site_lede: "Ghi lại quá trình tự học digital design, FPGA, kiến trúc máy tính và embedded — theo từng phase.",
    foot_text: "Cập nhật liên tục theo từng phase."
  },
  en: {
    site_title: "Hardware Learning Journal",
    site_lede: "Tracking self-study progress in digital design, FPGA, computer architecture and embedded systems — phase by phase.",
    foot_text: "Updated continuously as phases progress."
  }
};

let currentLang = "vi";

function renderPosts(lang) {
  const container = document.getElementById("timeline");
  container.innerHTML = "";

  POSTS.forEach((post) => {
    const entry = document.createElement("article");
    entry.className = "entry" + (post.done ? " done" : "");

    const meta = document.createElement("div");
    meta.className = "entry-meta";
    meta.innerHTML = `<span>${post.phase}</span><span class="date">${post.date}</span>`;
    entry.appendChild(meta);

    const h2 = document.createElement("h2");
    h2.textContent = post.title[lang];
    entry.appendChild(h2);

    const body = document.createElement("div");
    body.className = "body";
    post.body[lang].forEach((para) => {
      const p = document.createElement("p");
      p.textContent = para;
      body.appendChild(p);
    });
    entry.appendChild(body);

    if (post.tags && post.tags.length) {
      const tagsWrap = document.createElement("div");
      tagsWrap.className = "tags";
      post.tags.forEach((tag) => {
        const t = document.createElement("span");
        t.className = "tag";
        t.textContent = tag;
        tagsWrap.appendChild(t);
      });
      entry.appendChild(tagsWrap);
    }

    container.appendChild(entry);
  });
}

function applyStrings(lang) {
  document.querySelectorAll("[data-t]").forEach((el) => {
    const key = el.getAttribute("data-t");
    if (STRINGS[lang][key]) el.textContent = STRINGS[lang][key];
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

setLang("vi");
