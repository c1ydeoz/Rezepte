/* =================================================================
   ENGINE LOGIC (Final Version)
   =================================================================
*/
let currentId = recipes[0].id;
let currentPortion = 4;
let shopMode = false;
let currentLang = 'de';
let currentView = 'recipe';

// DOM Cache
const dom = {
    overlay: document.getElementById('sidebar-overlay'),
    sidebar: document.getElementById('sidebar'),
    navContent: document.getElementById('nav-content'),
    mainContent: document.getElementById('main-content'),
    
    getRecipeElements: () => ({
        slider: document.getElementById('p-slider'),
        pDisplay: document.getElementById('p-display'),
        list: document.getElementById('ing-list'),
        shopToggle: document.getElementById('shop-toggle'),
        notes: document.getElementById('user-notes'),
        img: document.getElementById('r-img'),
        label: document.getElementById('r-label'),
        fact: document.getElementById('r-fact'),
        title: document.getElementById('r-title'),
        sub: document.getElementById('r-sub'),
        time: document.getElementById('r-time'),
        diff: document.getElementById('r-diff'),
        prepList: document.getElementById('prep-list'),
        stepList: document.getElementById('step-list'),
        nextTitle: document.getElementById('next-title'),
        nextBtn: document.getElementById('next-btn')
    })
};

function init() {
    buildSidebar();
    loadRecipe(recipes[0].id);
}

function toggleSidebar() {
    dom.sidebar.classList.toggle('open');
    dom.overlay.classList.toggle('open');
}

function buildSidebar() {
    const txt = i18n[currentLang];
    const cats = {};
    
    recipes.forEach(r => {
        const catKey = 'cat_' + (r.category || 'herzhaft'); 
        const catName = txt[catKey] || r.category;
        if(!cats[catName]) cats[catName] = [];
        cats[catName].push(r);
    });

    let html = '';
    for (const [catName, rList] of Object.entries(cats)) {
        html += `<div class="nav-category"><div class="nav-cat-title">${catName}</div>`;
        rList.forEach(r => {
            const rTitle = r[currentLang] ? r[currentLang].title : r.de.title;
            html += `<a class="nav-item" onclick="loadRecipe('${r.id}'); toggleSidebar()">${rTitle}</a>`;
        });
        html += `</div>`;
    }

    html += `<div class="nav-category" style="margin-top:3rem; border-top:2px solid #eee; padding-top:1rem;">
        <div class="nav-cat-title" style="color:var(--primary);">${txt.tools}</div>
        <a class="nav-item" onclick="renderResizer(); toggleSidebar()">🛠 ${txt.tool_resizer}</a>
    </div>`;

    dom.navContent.innerHTML = html;
}

function restoreRecipeHTML() {
    if(document.getElementById('r-img')) return;

    dom.mainContent.innerHTML = `
        <aside class="sticky-visuals">
            <div class="recipe-image-container">
                <img id="r-img" src="" alt="Recipe">
                <div class="image-label" id="r-label"></div>
            </div>

            <div class="action-row">
                <button class="action-btn" id="fav-btn" onclick="toggleFavorite()">
                    <span id="fav-icon">♡</span> <span id="fav-text">Merken</span>
                </button>
            </div>

            <div class="tag-container" id="r-tags"></div>

            <div class="nutri-box" id="nutri-box">
                <div style="font-size:0.75rem; text-transform:uppercase; color:var(--text-muted); font-weight:800; margin-bottom:0.8rem; text-align:center;" data-i18n="nutri_title"></div>
                <div class="nutri-grid">
                    <div class="nutri-item"><span class="nutri-val" id="val-cal"></span><span class="nutri-lbl" data-i18n="cal"></span></div>
                    <div class="nutri-item"><span class="nutri-val" id="val-pro"></span><span class="nutri-lbl" data-i18n="pro"></span></div>
                    <div class="nutri-item"><span class="nutri-val" id="val-carb"></span><span class="nutri-lbl" data-i18n="carb"></span></div>
                    <div class="nutri-item"><span class="nutri-val" id="val-fat"></span><span class="nutri-lbl" data-i18n="fat"></span></div>
                </div>
            </div>

            <div class="fun-fact">
                <strong style="display:block; font-size:0.75rem; text-transform:uppercase; color:var(--primary); margin-bottom:0.5rem;" data-i18n="didYouKnow"></strong>
                <span id="r-fact"></span>
            </div>

            <div class="inspire-box" onclick="rollInspiration()" style="margin-top: 2rem;">
                <div style="font-size:0.8rem; text-transform:uppercase; color:var(--primary); font-weight:800;" data-i18n="inspire_title"></div>
                <div class="inspire-text" id="inspire-text">🎲 <span data-i18n="inspire_btn"></span></div>
            </div>
        </aside>

        <section>
            <div class="recipe-header">
                <h1 id="r-title"></h1>
                <p class="subtitle" id="r-sub"></p>
            </div>
            <div class="stats-grid">
                <div class="stat-box">
                    <label data-i18n="timeDifficulty"></label>
                    <div class="stat-value" id="r-time"></div>
                    <div class="diff-dots" id="r-diff"></div>
                </div>
                <div class="stat-box">
                    <label data-i18n="smartScaling"></label>
                    <div class="portion-control">
                        <span class="stat-value" id="p-display" style="width:2ch; text-align:center;"></span>
                        <span data-i18n="servings"></span>
                        <input type="range" id="p-slider" min="1" max="10">
                    </div>
                </div>
            </div>
            <div class="section-header">
                <h3 data-i18n="ingredients"></h3>
                <button class="toggle-mode-btn" id="shop-toggle"></button>
            </div>
            <ul class="ingredients-list" id="ing-list"></ul>
            <div id="prep-box" style="margin: 2rem 0; padding:1.5rem; background:var(--bg-sidebar); border-radius:16px;">
                <h4 style="margin-top:0;" data-i18n="prep"></h4>
                <ul id="prep-list" style="margin:0; padding-left:1.2rem; color:var(--text-muted);"></ul>
            </div>
            <h3 style="margin: 2rem 0 1.5rem 0;" data-i18n="steps"></h3>
            <ol class="steps-list" id="step-list"></ol>
            <div class="notes-section">
                <h4 style="margin:0; color:var(--primary);" data-i18n="notes"></h4>
                <textarea class="notes-area" id="user-notes"></textarea>
            </div>
            <div class="suggestion-box">
                <span style="text-transform:uppercase; font-size:0.7rem; letter-spacing:1px; color:var(--text-muted);" data-i18n="nextRecipe"></span>
                <h3 id="next-title" style="margin:0.5rem 0;"></h3>
                <button class="sug-btn" id="next-btn"></button>
            </div>
        </section>
    `;
    updateStaticTexts();
}

function loadRecipe(id) {
    currentView = 'recipe';
    const r = recipes.find(x => x.id === id);
    if(!r) return;
    currentId = id;
    const content = r[currentLang] || r.de; 
    restoreRecipeHTML();
    const els = dom.getRecipeElements();
    
    currentPortion = r.baseServ;
    els.slider.value = currentPortion;
    els.pDisplay.innerText = currentPortion;
    shopMode = false; 
    updateShopButton(els.shopToggle);

    els.img.src = r.img;
    els.label.innerText = content.label;
    els.fact.innerText = content.fact;
    els.title.innerText = content.title;
    els.sub.innerText = content.subtitle;
    els.time.innerText = r.time;

    els.diff.innerHTML = '';
    for(let i=0; i<5; i++) {
        const d = document.createElement('div');
        d.className = 'dot';
        if(i<r.diff) {
            let col = 'var(--scale-low)';
            if(r.diff > 2) col = 'var(--scale-mid)';
            if(r.diff > 4) col = 'var(--scale-high)';
            d.style.background = col;
        }
        els.diff.appendChild(d);
    }

    // NEU: Tags Rendern
    const tagContainer = document.getElementById('r-tags');
    if(tagContainer && r.tags) {
        tagContainer.innerHTML = r.tags.map(tag => `<span class="recipe-tag">${tag}</span>`).join('');
    }

    // NEU: Nutrition Rendern
    if(r.nutrition) {
        document.getElementById('val-cal').innerText = r.nutrition.cal;
        document.getElementById('val-pro').innerText = r.nutrition.pro + 'g';
        document.getElementById('val-carb').innerText = r.nutrition.carb + 'g';
        document.getElementById('val-fat').innerText = r.nutrition.fat + 'g';
        document.getElementById('nutri-box').classList.remove('hidden');
    } else {
        document.getElementById('nutri-box').classList.add('hidden');
    }

    checkFavoriteStatus();

    renderIngredients();
    els.prepList.innerHTML = content.prep.map(t => `<li>${t}</li>`).join('');
    els.stepList.innerHTML = content.steps.map(t => `<li>${t}</li>`).join('');
    
    const savedNote = localStorage.getItem('note_' + id);
    els.notes.value = savedNote ? savedNote : '';
    els.notes.placeholder = i18n[currentLang].notePlaceholder;
    els.notes.oninput = (e) => localStorage.setItem('note_' + id, e.target.value);
    
    const next = recipes.find(x => x.id === r.suggested) || recipes[0];
    const nextContent = next[currentLang] || next.de;
    els.nextTitle.innerText = nextContent.title;
    els.nextBtn.innerText = i18n[currentLang].goToRecipe;
    
    els.nextBtn.onclick = () => { loadRecipe(next.id); window.scrollTo(0,0); };
    els.slider.oninput = (e) => {
        currentPortion = parseInt(e.target.value);
        els.pDisplay.innerText = currentPortion;
        renderIngredients();
    };

    dom.mainContent.classList.remove('fade-in');
    void dom.mainContent.offsetWidth; 
    dom.mainContent.classList.add('fade-in');
    updateStaticTexts();
}

function renderResizer() {
    currentView = 'tool';
    const txt = i18n[currentLang];

    const html = `
    <section class="fade-in" style="max-width: 800px; margin: 0 auto; text-align: center; padding-top:2rem;">
        <div style="background:var(--bg-sidebar); padding:3rem 2rem; border-radius:var(--radius-card);">
            <h1 style="margin-bottom:1rem;">${txt.resizerTitle}</h1>
            <p style="color:var(--text-muted); margin-bottom:2rem;">${txt.resizerDesc}</p>
            
            <div style="border:2px dashed var(--primary); padding:2rem; border-radius:12px; background:#fff;">
                <input type="file" id="resizer-input" accept="image/*" style="margin-bottom:1rem;">
                <div id="resizer-stats" style="margin:1rem 0; font-weight:bold; min-height:1.5em;"></div>
                <button id="resizer-btn" style="background:var(--primary); color:#fff; border:none; padding:1rem 2rem; border-radius:50px; font-size:1rem; font-weight:700; cursor:pointer; opacity:0.5; pointer-events:none;">
                    ${txt.resizerBtn}
                </button>
            </div>

            <div id="resizer-msg" style="margin-top:2rem; color:var(--scale-low); font-weight:800;"></div>
        </div>
    </section>
    `;

    dom.mainContent.innerHTML = html;

    const input = document.getElementById('resizer-input');
    const btn = document.getElementById('resizer-btn');
    const stats = document.getElementById('resizer-stats');
    const msg = document.getElementById('resizer-msg');
    let file = null;

    input.onchange = (e) => {
        file = e.target.files[0];
        if(file) {
            btn.style.opacity = '1';
            btn.style.pointerEvents = 'all';
            const sizeMB = (file.size / 1024 / 1024).toFixed(2);
            stats.innerHTML = `${txt.resizerOriginal}: <span style="color:red">${sizeMB} MB</span>`;
        }
    };

    btn.onclick = () => {
        if(!file) return;
        btn.innerText = "Processing...";
        
        const reader = new FileReader();
        reader.onload = (readerEvent) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                canvas.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = file.name.replace(/\.[^/.]+$/, "") + "_opt.jpg";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);

                    const newSizeKB = (blob.size / 1024).toFixed(0);
                    stats.innerHTML += ` ➝ <span style="color:var(--scale-low)">${txt.resizerOptimized}: ${newSizeKB} KB</span>`;
                    msg.innerText = `${txt.resizerSuccess} ${txt.resizerSaveInfo}`;
                    btn.innerText = txt.resizerBtn;
                }, 'image/jpeg', 0.85);
            };
            img.src = readerEvent.target.result;
        };
        reader.readAsDataURL(file);
    };
}

function renderIngredients() {
    const els = dom.getRecipeElements();
    els.list.innerHTML = '';
    const r = recipes.find(x => x.id === currentId);
    const content = r[currentLang] || r.de;
    const factor = currentPortion / r.baseServ;

    content.ingredients.forEach(ing => {
        const amount = ing.amount * factor;
        const displayAmount = Number.isInteger(amount) ? amount : amount.toFixed(1).replace('.', ',');
        const li = document.createElement('li');
        if (shopMode) {
            li.className = 'ing-item shopping-mode';
            li.innerHTML = `
                <label style="display:flex; align-items:center; width:100%; cursor:pointer;">
                    <input type="checkbox"> 
                    <span style="margin-left:12px; transition:color 0.2s;">${displayAmount} ${ing.unit} <strong>${ing.name}</strong></span>
                </label>
            `;
        } else {
            li.className = 'ing-item';
            li.innerHTML = `<span>${ing.name}</span><span style="font-weight:700; color:var(--primary);">${displayAmount} ${ing.unit}</span>`;
        }
        els.list.appendChild(li);
    });
}

window.toggleShopMode = () => {
    shopMode = !shopMode;
    updateShopButton(document.getElementById('shop-toggle'));
    renderIngredients();
}

function updateShopButton(btn) {
    if(!btn) return;
    const key = shopMode ? 'stopShopping' : 'startShopping';
    btn.innerText = i18n[currentLang][key];
}

window.setLanguage = (lang) => {
    currentLang = lang;
    document.getElementById('lang-de').classList.toggle('active', lang === 'de');
    document.getElementById('lang-ru').classList.toggle('active', lang === 'ru');
    buildSidebar(); 
    if(currentView === 'recipe') {
        loadRecipe(currentId); 
    } else {
        renderResizer(); 
    }
    updateStaticTexts();
}

function updateStaticTexts() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if(i18n[currentLang][key]) el.innerText = i18n[currentLang][key];
    });
}

// --- Funktionen für Favoriten & Inspiration ---
function checkFavoriteStatus() {
    const btn = document.getElementById('fav-btn');
    const icon = document.getElementById('fav-icon');
    const text = document.getElementById('fav-text');
    if(!btn) return;

    const isFav = localStorage.getItem('fav_' + currentId) === 'true';
    if (isFav) {
        btn.classList.add('active');
        icon.innerText = '♥'; 
        text.innerText = i18n[currentLang].fav_on;
    } else {
        btn.classList.remove('active');
        icon.innerText = '♡'; 
        text.innerText = i18n[currentLang].fav_off;
    }
}

window.toggleFavorite = () => {
    const isFav = localStorage.getItem('fav_' + currentId) === 'true';
    if (isFav) {
        localStorage.removeItem('fav_' + currentId);
    } else {
        localStorage.setItem('fav_' + currentId, 'true');
    }
    checkFavoriteStatus(); 
}

window.rollInspiration = () => {
    const list = inspirations[currentLang];
    const randomText = list[Math.floor(Math.random() * list.length)];
    document.getElementById('inspire-text').innerText = "✨ " + randomText;
}

// Start
init();