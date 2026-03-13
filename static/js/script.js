/* ─── BadgeVault – main.js ────────────────────────────────── */

const $ = id => document.getElementById(id);

const Els = {
    loading: $('state-loading'),
    error: $('state-error'),
    empty: $('state-empty'),
    grid: $('badges-grid'),
    search: $('search'),
    reload: $('reload-btn'),
    retry: $('retry-btn'),
    count: $('badge-count'),
    errorMsg: $('error-msg'),
    time: $('footer-time'),
};

let allSets = [];

/* ─── State helpers ──────────────────────────────────── */
function showState(name) {
    ['loading', 'error', 'empty', 'grid'].forEach(k => {
        Els[k].classList.toggle('hidden', k !== name);
    });
}

/* ─── Fetch ──────────────────────────────────────────── */
async function fetchBadges() {
    showState('loading');
    Els.reload.classList.add('spinning');
    Els.search.value = '';

    try {
        const res = await fetch('/badges');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        allSets = data?.data ?? [];
        if (!allSets.length) {
            showState('empty');
            return;
        }

        renderGrid(allSets);
        Els.count.textContent = `${allSets.length} sets`;
        Els.time.textContent = `Atualizado às ${new Date().toLocaleTimeString('pt-BR')}`;
    } catch (err) {
        Els.errorMsg.textContent = `Erro ao carregar: ${err.message}`;
        showState('error');
    } finally {
        Els.reload.classList.remove('spinning');
    }
}

/* ─── Render ─────────────────────────────────────────── */
function renderGrid(sets) {
    if (!sets.length) {
        showState('empty');
        return;
    }

    Els.grid.innerHTML = '';
    sets.forEach((set, i) => {
        const card = buildCard(set, i);
        Els.grid.appendChild(card);
    });

    showState('grid');
}

function buildCard(set, index) {
    const card = document.createElement('div');
    card.className = 'badge-card';
    card.style.animationDelay = `${Math.min(index * 35, 500)}ms`;

    const versions = set.versions ?? [];

    card.innerHTML = `
        <div class="badge-card-header">
            <span class="badge-set-id">${escHtml(set.set_id)}</span>
            <span class="badge-versions-count">${versions.length}v</span>
        </div>
        <div class="badge-versions">
            ${versions.map(v => buildVersion(v)).join('')}
        </div>
    `;

    return card;
}

function buildVersion(v) {
    const img1x = v.image_url_1x ?? '';
    const img2x = v.image_url_2x ?? img1x;
    const title = v.title ?? v.id ?? '─';

    return `
        <div class="badge-version">
            <div class="badge-imgs">
                <img class="badge-img"
                    src="${escHtml(img2x)}"
                    alt="${escHtml(title)}"
                    loading="lazy"
                    oneerror="this.src='${escHtml(img1x)}'"
                >
                <span class="badge-img-label">2x</span>
            </div>
            <div class="badge-info">
                <div class="badge-title" title="${escHtml(title)}">${escHtml(title)}</div>
                <div class="badge-version-id">${escHtml(String(v.id))}</div>
            </div>
        </div>
    `;
}

/* ─── Search / Filter ────────────────────────────────── */
let searchTimer;
Els.search.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        const q = Els.search.value.trim().toLowerCase();
        if (!q) {
            renderGrid(allSets);
            return;
        }

        const filtered = allSets.filter(set => {
            if (set.set_id.toLowerCase().includes(q)) return true;
            return (set.versions ?? []).some(v => 
                (v.title ?? '').toLowerCase().includes(q) ||
                String(v.id).toLowerCase().includes(q)
                                                    );
        });

        renderGrid(filtered);
        Els.count.textContent = `${filtered.length} / ${allSets.length} sets`;
    }, 180);
});

/* ─── Escape HTML ────────────────────────────────────── */
function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/* ─── Events ─────────────────────────────────────────── */
Els.reload.addEventListener('click', fetchBadges);
Els.retry.addEventListener('click', fetchBadges);

/* ─── Init ─────────────────────────────────────────── */
fetchBadges();