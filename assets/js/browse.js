$(async function () {
  // Initial: New Releases (albums) via /api/featured
  try {
    const res = await fetch(`${API_BASE}/api/featured`);
    const json = await res.json();
    const items = (json.albums && json.albums.items) || [];
    renderCards(items); // albums
  } catch (e) {
    console.error("Featured fetch failed", e);
    // Fallback placeholders
    $("#playlistGrid").html(
      `<div class="col-12"><div class="alert alert-warning">Could not load Spotify data. Showing placeholders.</div></div>`
    );
    for (let i = 0; i < 6; i++) {
      $("#playlistGrid").append(
        `<div class="col-12 col-sm-6 col-lg-4">
          <div class="card">
            <div class="placeholder-cover card-img-top"></div>
            <div class="card-body">
              <h5 class="card-title">Sample Item ${i + 1}</h5>
              <div class="d-flex gap-2">
                <a class="btn btn-primary btn-sm" target="_blank" href="#">Open</a>
                <button class="btn btn-outline-secondary btn-sm fav-btn">♥ Favorite</button>
              </div>
            </div>
          </div>
        </div>`
      );
    }
  }

  // Live search (playlists)
  $("#searchInput").on(
    "input",
    debounce(async function () {
      const q = $(this).val().trim();
      if (!q) return;

      try {
        const res = await fetch(
          `${API_BASE}/api/search?q=` + encodeURIComponent(q) + `&limit=50`
        );
        const json = await res.json();
        const items = (json.playlists && json.playlists.items) || [];
        renderCards(items); // playlists
      } catch (e) {
        console.error("Search failed", e);
      }
    }, 350)
  );

  // ---------- Render ----------
  function renderCards(items) {
    const grid = $("#playlistGrid").empty();

    (items || []).forEach((raw) => {
      const p = raw || null;
      if (!p) return;

      const kind =
        p.type === "album" || p.album_type
          ? "album"
          : p.type === "playlist" || p.owner
          ? "playlist"
          : Array.isArray(p.artists)
          ? "album"
          : "playlist";

      const title = p && p.name ? p.name : "Untitled";
      const subtitle =
        kind === "album"
          ? (p.artists && p.artists[0] && p.artists[0].name) ||
            "Various Artists"
          : (p.owner && p.owner.display_name) || "Spotify";

      const img =
        (p.images && p.images[0] && p.images[0].url) ||
        (p.images && p.images[1] && p.images[1].url) ||
        "";

      const url =
        (p.external_urls && p.external_urls.spotify) ||
        "https://open.spotify.com";

      const id = p.id || Math.random().toString(36).slice(2);

      const card = $(`
      <div class="col-12 col-sm-6 col-lg-4">
        <div class="card media-card" data-id="${id}" data-type="${kind}">
          ${
            img
              ? `<img class="card-img-top" src="${img}" alt="">`
              : `<div class="placeholder-cover card-img-top"></div>`
          }
          <div class="card-body">
            <h5 class="card-title">${escapeHtml(title)}</h5>
            <p class="card-text small text-secondary">${escapeHtml(
              subtitle
            )}</p>
            <div class="d-flex gap-2">
              <a href="${url}" target="_blank" class="btn btn-primary btn-sm">Open</a>
              <button class="btn btn-outline-secondary btn-sm fav-btn">♥ Favorite</button>
            </div>
          </div>
        </div>
      </div>
    `);

      grid.append(card.hide().fadeIn(120));
    });

    if (!grid.children().length) {
      grid.append(
        `<div class="col-12"><div class="alert alert-secondary">No results.</div></div>`
      );
    }
  }

  // Save to favorites
  $(document).on("click", ".fav-btn", function () {
    const card = $(this).closest(".media-card");
    const id = card.data("id");
    const type = card.data("type") || "playlist";
    const title = card.find(".card-title").text();
    const img = card.find("img").attr("src") || "";
    const url = card.find("a.btn-primary").attr("href") || "";
    saveFavorite({ id, title, img, url, type });
    $(this).text("✓ Saved");
  });

  // ---------- helpers ----------
  function debounce(fn, ms) {
    let t;
    return function () {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, arguments), ms);
    };
  }
  function escapeHtml(s) {
    return (s || "").replace(
      /[&<>"]/g,
      (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m])
    );
  }
});
