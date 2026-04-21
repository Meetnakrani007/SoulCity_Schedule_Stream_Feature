dayjs.extend(window.dayjs_plugin_relativeTime);

document.addEventListener('DOMContentLoaded', () => {
  const videoGrid    = document.getElementById('videoGrid');
  const loader       = document.getElementById('loader');
  const errorState   = document.getElementById('errorState');
  const emptyState   = document.getElementById('emptyState');
  const retryBtn     = document.getElementById('retryBtn');
  const searchInput  = document.getElementById('searchInput');
  const sortSelect   = document.getElementById('sortSelect');
  const showingCount = document.getElementById('showingCount');
  const navbar       = document.getElementById('navbar');

  let allStreams = [];

  // Init
  fetchUpcoming();

  // Scroll Listener for Navbar
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Listeners
  retryBtn.addEventListener('click', fetchUpcoming);
  searchInput.addEventListener('input', applyFilters);
  sortSelect.addEventListener('change', applyFilters);

  // ── Fetch ─────────────────────────────────────
  async function fetchUpcoming() {
    showState('loader');
    try {
      const res = await fetch('/api/upcoming?tag=%23lifeinsoulcity');
      if (!res.ok) throw new Error(res.status);
      const raw = await res.json();

      // Deduplicate by videoId
      const seen = new Set();
      allStreams = raw.filter(s => {
        if (seen.has(s.videoId)) return false;
        seen.add(s.videoId);
        return true;
      });

      if (!allStreams.length) { showState('empty'); return; }
      applyFilters();
    } catch (e) {
      console.error(e);
      showState('error');
    }
  }

  // ── Filter + Sort ─────────────────────────────
  function applyFilters() {
    const q = searchInput.value.toLowerCase().trim();
    let filtered = allStreams;

    if (q) {
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.channel.toLowerCase().includes(q)
      );
    }

    // Sort — only by raw YouTube API data (no derived metrics)
    const sort = sortSelect.value;
    if (sort === 'date') {
      filtered.sort((a, b) => {
        const da = a.scheduledStart || a.publishedAt || '';
        const db = b.scheduledStart || b.publishedAt || '';
        return new Date(db) - new Date(da);
      });
    } else if (sort === 'az') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    renderCards(filtered);
  }

  // ── Render ────────────────────────────────────
  function renderCards(streams) {
    videoGrid.innerHTML = '';

    if (!streams.length) { showState('empty'); return; }

    streams.forEach((s, index) => {
      const card = document.createElement('a');
      card.className = 'stream-card';
      card.style.setProperty('--magnetic-y', '0px');
      card.style.setProperty('--magnetic-x', '0px');
      setTimeout(() => card.classList.add('visible'), index * 50);

      card.href = `https://www.youtube.com/watch?v=${s.videoId}`;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';

      // Time helpers
      let scheduleText = '';
      let relativeText = '';
      if (s.scheduledStart) {
        const d = dayjs(s.scheduledStart);
        scheduleText = d.format('MMM D, h:mm A');
        relativeText = d.fromNow();
      } else {
        scheduleText = 'Scheduled';
        relativeText = 'TBD';
      }

      // Use the raw liveBroadcastContent from YouTube API for the badge
      const badgeText = (s.liveBroadcastContent || 'upcoming').toUpperCase();

      card.innerHTML = `
        <div class="thumbnail-container">
          <img src="https://i.ytimg.com/vi/${s.videoId}/maxresdefault.jpg" onerror="this.onerror=null; this.src='https://i.ytimg.com/vi/${s.videoId}/hqdefault.jpg';" alt="" class="thumbnail" loading="lazy">
          <div class="live-badge">
            <span class="live-dot-small"></span> ${badgeText}
          </div>
          <div class="duration-badge">
            <i class="fa-regular fa-clock"></i> ${relativeText}
          </div>
        </div>
        <div class="card-content">
          <div class="stream-card-title">${esc(s.title)}</div>
          <div class="channel-info">
            <h3 class="stream-channel-name">${esc(s.channel)}</h3>
          </div>
          <div class="stream-card-stats">
            <span class="stream-card-stat"><i class="fa-regular fa-calendar"></i> ${scheduleText}</span>
          </div>
        </div>
      `;

      videoGrid.appendChild(card);
    });

    showingCount.textContent = streams.length;
    showState('grid');
  }

  // ── UI State ──────────────────────────────────
  function showState(which) {
    loader.classList.add('hidden');
    errorState.classList.add('hidden');
    emptyState.classList.add('hidden');
    videoGrid.classList.add('hidden');

    if (which === 'loader')  loader.classList.remove('hidden');
    if (which === 'error')   errorState.classList.remove('hidden');
    if (which === 'empty')   emptyState.classList.remove('hidden');
    if (which === 'grid')    videoGrid.classList.remove('hidden');
  }

  // ── Helpers ───────────────────────────────────
  // Decode HTML entities from YouTube API (&#39; → ') then re-escape for safety
  function esc(str) {
    const decoder = document.createElement('textarea');
    decoder.innerHTML = str;
    const decoded = decoder.value;
    const safe = document.createElement('div');
    safe.textContent = decoded;
    return safe.innerHTML;
  }
});
