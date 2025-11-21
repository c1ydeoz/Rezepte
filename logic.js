/* =================================================================
   SYSTEM & DATA LOADING
   ================================================================= */

let recipes = []; // Wird jetzt aus YAML geladen
let i18n = {};
let currentLang = "de";
let currentRecipeId = null;
let currentPortion = 4;
let shopMode = false;

// NEU: Hauptfunktion zum Starten der App
async function startApp() {
    try {
        // 1. Übersetzungen laden
        const i18nResponse = await fetch("translations.yaml");
        const i18nText = await i18nResponse.text();
        i18n = jsyaml.load(i18nText);

        // 2. Rezepte laden (NEU!)
        const recipesResponse = await fetch("recipes.yaml");
        const recipesText = await recipesResponse.text();
        const recipesData = jsyaml.load(recipesText);
        recipes = recipesData.recipes; // Das Array aus der YAML holen

        // 3. App initialisieren
        if (recipes && recipes.length > 0) {
            currentRecipeId = recipes[0].id;
            setLanguage(currentLang); // Baut Navigation & Rendert erstes Rezept
        } else {
            console.error("Keine Rezepte in recipes.yaml gefunden!");
        }

    } catch (e) {
        console.error("Fehler beim Laden der Daten:", e);
        document.getElementById("main-content").innerHTML = `<h1 style="padding:2rem; color:red">Fehler beim Laden der Daten</h1><p style="padding:0 2rem">${e}</p>`;
    }
}

function t(key) {
    return i18n?.[currentLang]?.[key] || key;
}

async function setLanguage(lang) {
    currentLang = lang;
    
    // UI Updates
    buildNavigation();
    
    if (currentRecipeId === 'tool') {
        renderResizer();
    } else if (currentRecipeId) {
        renderRecipe(currentRecipeId);
    }

    // Buttons aktualisieren
    document.getElementById("lang-de").classList.toggle("active", lang === "de");
    document.getElementById("lang-ru").classList.toggle("active", lang === "ru");
}

/* =================================================================
   SIDEBAR + NAVIGATION
   ================================================================= */

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebar-overlay");
    sidebar.classList.toggle("open");
    overlay.classList.toggle("open");
}

function buildNavigation() {
    const nav = document.getElementById("nav-content");
    nav.innerHTML = "";

    const categories = {};

    recipes.forEach(r => {
        const cat = r.category || "Andere";
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(r);
    });

    for (let cat in categories) {
        const catBox = document.createElement("div");
        catBox.className = "nav-category";

        const title = document.createElement("div");
        title.className = "nav-cat-title";
        title.textContent = i18n?.[currentLang]?.[`cat_${cat}`] || cat; 
        catBox.appendChild(title);

        categories[cat].forEach(r => {
            const item = document.createElement("div");
            item.className = "nav-item";
            const rContent = r[currentLang] || r.de;
            item.textContent = rContent.title;
            item.onclick = () => {
                toggleSidebar();
                renderRecipe(r.id);
            };
            catBox.appendChild(item);
        });
        nav.appendChild(catBox);
    }

    // Tools
    const toolBox = document.createElement("div");
    toolBox.className = "nav-category";
    toolBox.style.marginTop = "2rem";
    toolBox.style.borderTop = "1px solid #eee";
    toolBox.style.paddingTop = "1rem";

    const toolTitle = document.createElement("div");
    toolTitle.className = "nav-cat-title";
    toolTitle.textContent = t("tools");
    toolBox.appendChild(toolTitle);

    const resizerLink = document.createElement("div");
    resizerLink.className = "nav-item";
    resizerLink.textContent = "🛠 " + t("tool_resizer");
    resizerLink.onclick = () => {
        toggleSidebar();
        renderResizer();
    };
    toolBox.appendChild(resizerLink);
    nav.appendChild(toolBox);
}

/* =================================================================
   RENDER RECIPE
   ================================================================= */

function renderRecipe(id) {
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) return;

    currentRecipeId = id;
    currentPortion = recipe.baseServ;
    shopMode = false;

    const content = recipe[currentLang] || recipe.de;
    const main = document.getElementById("main-content");
    
    // --- HIER WAR DER FEHLER ---
    // Falsch: main.className = ''; 
    // Richtig: Wir müssen das Grid-Layout erzwingen!
    main.className = 'recipe-layout fade-in'; 
    // ---------------------------

    main.innerHTML = "";

    /* === LINKE SPALTE (Bild & Widgets) === */
    const left = document.createElement("div");
    left.className = "sticky-visuals";

    const imgSrc = recipe.img || ""; 
    const tagsHtml = recipe.tags 
        ? recipe.tags.map(t => `<div class="recipe-tag">${t}</div>`).join("") 
        : "";

    // Nutrition HTML vorbereiten
    let nutriHtml = "";
    if (recipe.nutrition) {
        nutriHtml = `
        <div class="nutri-box">
            <div style="text-align:center; font-size:0.7rem; text-transform:uppercase; color:#888; margin-bottom:0.5rem; font-weight:800">${t("nutri_title")}</div>
            <div class="nutri-grid">
                ${Object.keys(recipe.nutrition).map(k => `
                    <div class="nutri-item">
                        <div class="nutri-val">${recipe.nutrition[k]}</div>
                        <div class="nutri-lbl">${t(k)}</div> 
                    </div>
                `).join("")}
            </div>
        </div>`;
    }

    // Trivia / Fact HTML vorbereiten
    let factHtml = "";
    if (content.fact) {
        factHtml = `
        <div class="fun-fact" style="margin-bottom: 1.5rem;">
            <strong style="display:block; font-size:0.75rem; text-transform:uppercase; color:var(--primary); margin-bottom:0.5rem;">${t("didYouKnow")}</strong>
            <span id="r-fact">${content.fact}</span>
        </div>`;
    }

    left.innerHTML = `
        <div class="recipe-image-container">
            <img src="${imgSrc}" alt="${content.title}">
            <div class="image-label">${content.label || ""}</div>
        </div>

        <div class="tag-container">${tagsHtml}</div>

        <div class="action-row" style="margin-bottom: 1.5rem;">
            <button class="action-btn" id="fav-btn" onclick="toggleFavorite()">
                <span id="fav-icon">♡</span> <span id="fav-text">${t("fav_off")}</span>
            </button>
        </div>

        ${nutriHtml}

        ${factHtml}

        <div class="inspire-box" onclick="rollInspiration()">
            <div style="font-size:0.7rem; text-transform:uppercase; color:var(--primary); font-weight:800; margin-bottom:0.2rem">${t("inspire_btn")}</div>
            <div id="inspire-text" class="inspire-text">🎲 Click me</div>
        </div>
    `;

    /* === RECHTE SPALTE (Content) === */
    const right = document.createElement("div");
    
    let diffDots = "";
    for(let i=1; i<=5; i++) {
        let color = i <= recipe.diff ? (recipe.diff < 3 ? 'var(--scale-low)' : 'var(--scale-high)') : '#e0e0e0';
        diffDots += `<div class="dot" style="background:${color}"></div>`;
    }

    right.innerHTML = `
        <div class="recipe-header">
            <h1>${content.title}</h1>
            <p class="subtitle">${content.subtitle}</p>
        </div>
        <div class="stats-grid">
             <div class="stat-box">
                <label>${t("timeDifficulty")}</label>
                <div class="stat-value">${recipe.time}</div>
                <div class="diff-dots" style="display:flex; gap:4px; margin-top:5px;">${diffDots}</div>
             </div>
             <div class="stat-box">
                <label>${t("smartScaling")}</label>
                <div class="portion-control">
                    <span class="stat-value" id="p-display" style="width:2ch; text-align:center;">${currentPortion}</span>
                    <span>${t("servings")}</span>
                    <input type="range" id="p-slider" min="1" max="12" value="${currentPortion}" oninput="updatePortions(this.value)">
                </div>
             </div>
        </div>
        <div class="section-header">
            <h3>${t("ingredients")}</h3>
            <button class="toggle-mode-btn" id="shop-toggle" onclick="toggleShopMode()">${t("startShopping")}</button>
        </div>
        <ul class="ingredients-list" id="ing-list"></ul>
        ${content.prep ? `
        <div id="prep-box" style="margin: 2rem 0; padding:1.5rem; background:var(--bg-sidebar); border-radius:16px;">
            <h4 style="margin-top:0;">${t("prep")}</h4>
            <ul style="margin:0; padding-left:1.2rem; color:var(--text-muted);">
                ${content.prep.map(p => `<li>${p}</li>`).join("")}
            </ul>
        </div>` : ""}
        <h3>${t("steps")}</h3>
        <ol class="steps-list">
            ${content.steps.map(s => `<li>${s}</li>`).join("")}
        </ol>
        ${recipe.tips && recipe.tips.length ? `
        <div class="tips-section" style="margin-top:2.5rem;">
            <h3 style="color:var(--primary);">${t("tips") || "Tipps"}</h3>
            <ul style="margin:0; padding-left:1.2rem;">
                ${recipe.tips.map(tip => `<li>${tip}</li>`).join("")}
            </ul>
        </div>
        ` : ""}
    `;

    main.appendChild(left);
    main.appendChild(right);

    renderIngredients();
    checkFavoriteStatus();

    // Notes section removed; no longer storing or rendering personal notes
}

/* =================================================================
   HELPER FUNCTIONS
   ================================================================= */

function updatePortions(val) {
    currentPortion = parseInt(val);
    document.getElementById("p-display").innerText = currentPortion;
    renderIngredients();
}

function renderIngredients() {
    const list = document.getElementById("ing-list");
    if(!list) return;
    list.innerHTML = "";

    const recipe = recipes.find(r => r.id === currentRecipeId);
    const content = recipe[currentLang] || recipe.de;
    const factor = currentPortion / recipe.baseServ;

    content.ingredients.forEach(ing => {
        const amount = ing.amount * factor;
        const displayAmount = Number.isInteger(amount) ? amount : amount.toFixed(1).replace('.', ',');
        const li = document.createElement("li");
        
        if (shopMode) {
            li.className = "ing-item shopping-mode";
            li.innerHTML = `<label style="display:flex; align-items:center; width:100%; cursor:pointer;"><input type="checkbox"><span style="margin-left:12px;">${displayAmount} ${ing.unit || ""} <strong>${ing.name}</strong></span></label>`;
        } else {
            li.className = "ing-item";
            li.innerHTML = `<span>${ing.name}</span><span style="font-weight:700; color:var(--primary)">${displayAmount} ${ing.unit || ""}</span>`;
        }
        list.appendChild(li);
    });
}

function toggleShopMode() {
    shopMode = !shopMode;
    document.getElementById("shop-toggle").innerText = shopMode ? t("stopShopping") : t("startShopping");
    renderIngredients();
}

function checkFavoriteStatus() {
    const btn = document.getElementById("fav-btn");
    const icon = document.getElementById("fav-icon");
    const txt = document.getElementById("fav-text");
    if(!btn) return;

    const isFav = localStorage.getItem("fav_" + currentRecipeId);
    if (isFav) {
        btn.classList.add("active");
        icon.innerText = "♥";
        txt.innerText = t("fav_on");
    } else {
        btn.classList.remove("active");
        icon.innerText = "♡";
        txt.innerText = t("fav_off");
    }
}

function toggleFavorite() {
    const key = "fav_" + currentRecipeId;
    if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
    } else {
        localStorage.setItem(key, "true");
    }
    checkFavoriteStatus();
}

function rollInspiration() {
    const list = i18n[currentLang]?.inspirations || ["Pizza?"];
    const txt = list[Math.floor(Math.random() * list.length)];
    document.getElementById("inspire-text").textContent = "✨ " + txt;
}

function renderResizer() {
    currentRecipeId = 'tool';
    const main = document.getElementById("main-content");
    main.innerHTML = `
    <section class="fade-in" style="max-width: 800px; margin: 0 auto; text-align: center; padding-top:2rem;">
        <div style="background:var(--bg-sidebar); padding:3rem 2rem; border-radius:24px;">
            <h1 style="margin-bottom:1rem;">${t("resizerTitle")}</h1>
            <p style="color:var(--text-muted); margin-bottom:2rem;">${t("resizerDesc")}</p>
            <div style="border:2px dashed var(--primary); padding:2rem; border-radius:12px; background:#fff;">
                <input type="file" id="resizer-input" accept="image/*" style="margin-bottom:1rem;">
                <div id="resizer-stats" style="margin:1rem 0; font-weight:bold; min-height:1.5em;"></div>
                <button id="resizer-btn" style="background:var(--primary); color:#fff; border:none; padding:1rem 2rem; border-radius:50px; font-size:1rem; font-weight:700; cursor:pointer; opacity:0.5; pointer-events:none;">
                    ${t("resizerBtn")}
                </button>
            </div>
        </div>
    </section>`;
}

// APP STARTEN
startApp();