document.addEventListener("DOMContentLoaded", () => {
  // 1. Tema claro/escuro persistente
  const savedTheme = localStorage.getItem("atlas-theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);

  const themeBtn = document.getElementById("themeToggle");
  if (themeBtn) {
    themeBtn.textContent = savedTheme === "dark" ? "Tema Claro" : "Tema Escuro";
    themeBtn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("atlas-theme", next);
      themeBtn.textContent = next === "dark" ? "Tema Claro" : "Tema Escuro";
    });
  }

  // 2. Marca página ativa no menu
  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach((a) => {
    if (a.getAttribute("href") === page) a.classList.add("active");
  });

  // 3. Gera índice lateral automaticamente a partir das seções
  const tocList = document.getElementById("tocList");
  if (tocList) {
    document.querySelectorAll(".doc-section").forEach((sec) => {
      const h2 = sec.querySelector("h2");
      if (!h2 || !sec.id) return;
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `#${sec.id}`;
      a.textContent = h2.textContent;
      li.appendChild(a);
      tocList.appendChild(li);
    });
  }

  // 4. Botão copiar em cada bloco <pre>
  document.querySelectorAll("pre").forEach((pre) => {
    const wrap = document.createElement("div");
    wrap.className = "code-wrap";
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);

    const btn = document.createElement("button");
    btn.className = "btn-copy";
    btn.type = "button";
    btn.textContent = "Copiar";
    btn.addEventListener("click", async () => {
      await navigator.clipboard.writeText(pre.innerText);
      btn.textContent = "Copiado!";
      setTimeout(() => (btn.textContent = "Copiar"), 1500);
    });
    wrap.appendChild(btn);

    // Realce leve de sintaxe
    const codeEl = pre.querySelector("code");
    if (codeEl && !codeEl.dataset.noHighlight) {
      codeEl.innerHTML = highlightCode(codeEl.textContent);
    }
  });

  // 5. Filtro de busca em tempo real
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const q = e.target.value.trim().toLowerCase();
      document.querySelectorAll(".entry-card").forEach((card) => {
        const match = !q || card.textContent.toLowerCase().includes(q);
        card.classList.toggle("hidden", !match);
      });
      document.querySelectorAll(".doc-section").forEach((sec) => {
        const cards = sec.querySelectorAll(".entry-card");
        if (!cards.length) return;
        const visible = [...cards].some((c) => !c.classList.contains("hidden"));
        sec.classList.toggle("hidden", !visible);
      });
    });
  }
});

function highlightCode(raw) {
  const esc = raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const keywords =
    /\b(public|private|protected|static|final|class|interface|enum|record|sealed|permits|void|int|long|double|float|boolean|char|byte|short|var|new|return|if|else|switch|case|default|for|while|do|break|continue|try|catch|finally|throw|throws|import|package|using|namespace|async|await|def|lambda|yield|from|as|with|match|struct|typedef|sizeof|const|constexpr|template|typename|auto|nullptr|virtual|override|noexcept|concept|requires|include|define|display|flex|grid|position|color|background)\b/g;

  return esc
    .replace(/(\/\/.*$|#.*$|\/\*[\s\S]*?\*\/)/gm, '<span class="tok-com">$1</span>')
    .replace(/("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g, '<span class="tok-str">$1</span>')
    .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="tok-num">$1</span>')
    .replace(keywords, '<span class="tok-kw">$1</span>');
}