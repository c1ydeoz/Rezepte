const recipes = [
    {
        // --- GEMEINSAME DATEN (Shared) ---
        id: "coq-au-vin",
        category: "herzhaft", 
        img: "img/coq_au_vin_opt.jpg", // Stelle sicher, dass dieses Bild existiert, sonst nimm den Link von vorher
        time: "2h 30min",
        diff: 3,
        baseServ: 4,
        suggested: "pasta-aglio",

        // NEU: Tags und Nährwerte
        tags: ["🇫🇷 Klassiker", "🍷 Mit Wein", "Slow Food"],
        nutrition: { cal: 650, pro: 45, carb: 12, fat: 38 },

        // --- SPRACHE: DEUTSCH ---
        de: {
            title: "Coq au Vin",
            subtitle: "Französischer Klassiker in Rotwein geschmort.",
            label: "🇫🇷 Frankreich",
            fact: "Traditionell wird ein alter Hahn verwendet, der erst durch langes Schmoren zart wird.",
            ingredients: [
                { name: "Hähnchenschenkel", amount: 4, unit: "Stk" },
                { name: "Rotwein", amount: 500, unit: "ml" },
                { name: "Speckwürfel", amount: 150, unit: "g" },
                { name: "Champignons", amount: 250, unit: "g" },
                { name: "Hühnerfond", amount: 250, unit: "ml" }
            ],
            prep: ["Gemüse waschen.", "Fleisch tupfen."],
            steps: ["Speck anbraten.", "Fleisch anbraten.", "Schmoren lassen."]
        },

        // --- SPRACHE: RUSSISCH ---
        ru: {
            title: "Петух в вине",
            subtitle: "Французская классика в красном вине.",
            label: "🇫🇷 Франция",
            fact: "Традиционно используется старый петух, который становится мягким только после долгого тушения.",
            ingredients: [
                { name: "Куриные ножки", amount: 4, unit: "шт" },
                { name: "Красное вино", amount: 500, unit: "мл" },
                { name: "Бекон", amount: 150, unit: "г" },
                { name: "Шампиньоны", amount: 250, unit: "г" },
                { name: "Куриный бульон", amount: 250, unit: "мл" }
            ],
            prep: ["Помыть овощи.", "Обсушить мясо."],
            steps: ["Обжарить бекон.", "Обжарить мясо.", "Тушить до готовности."]
        }
    },
    {
        id: "bananen-shake",
        category: "sweet",
        img: "https://images.unsplash.com/photo-1584586629529-2bc6a67d8467?q=80&w=800&auto=format&fit=crop",
        time: "5 min",
        diff: 1,
        baseServ: 1,
        suggested: "coq-au-vin",
        
        tags: ["⚡ Schnell", "💪 Protein", "Vegetarisch"],
        nutrition: { cal: 320, pro: 25, carb: 40, fat: 8 },

        de: {
            title: "Bananen Shake",
            subtitle: "Power Drink.",
            label: "Energie",
            fact: "Bananen sind botanisch gesehen Beeren.",
            ingredients: [
                { name: "Banane", amount: 1, unit: "Stk" },
                { name: "Milch", amount: 200, unit: "ml" }
            ],
            prep: ["Banane schälen"],
            steps: ["Mixen."]
        },
        ru: {
            title: "Банановый шейк",
            subtitle: "Энергетический напиток.",
            label: "Энергия",
            fact: "Бананы - это ягоды.",
            ingredients: [
                { name: "Банан", amount: 1, unit: "шт" },
                { name: "Молоко", amount: 200, unit: "мл" }
            ],
            prep: ["Очистить банан"],
            steps: ["Взбить."]
        }
    }
];

// --- NEU: Inspirationen ---
const inspirations = {
    de: [
        "Wie wäre es heute einfach mit Pizza bestellen?",
        "Ein Käsebrot ist auch ein Abendessen.",
        "Sushi Date Night?",
        "Einfach mal Reste aufbraten?",
        "Ein Glas Wein und Oliven reichen manchmal."
    ],
    ru: [
        "Может, просто заказать пиццу?",
        "Бутерброд с сыром - тоже ужин.",
        "Вечер суши?",
        "Просто пожарить остатки?",
        "Бокала вина и оливок иногда достаточно."
    ]
};

// --- TEXTE & KATEGORIEN ---
const i18n = {
    de: {
        menu: "Menü",
        tools: "Werkzeuge & Tools",
        tool_resizer: "Bild-Optimierer",
        recipes: "Rezepte",
        didYouKnow: "Historie & Fakten",
        timeDifficulty: "Zeit & Aufwand",
        smartScaling: "Smart Scaling",
        servings: "Pers.",
        ingredients: "Zutaten",
        startShopping: "Einkaufs-Modus",
        stopShopping: "Normale Ansicht",
        prep: "Vorbereitung",
        steps: "Zubereitung",
        notes: "Meine Notizen",
        nextRecipe: "Nächstes Rezept",
        goToRecipe: "Zum Rezept",
        notePlaceholder: "Notizen hier...",
        cat_herzhaft: "Herzhaftes",
        cat_sweet: "Süßes & Drinks",
        resizerTitle: "Bilder für das Web optimieren",
        resizerDesc: "Lade hier deine großen Originalbilder hoch. Das Tool verkleinert sie auf 800px Breite.",
        resizerBtn: "Bild auswählen & Optimieren",
        resizerSuccess: "Fertig! Dein Bild wurde optimiert.",
        resizerSaveInfo: "Speichere die heruntergeladene Datei in deinen 'img/' Ordner.",
        resizerOriginal: "Originalgröße",
        resizerOptimized: "Neue Größe (ca.)",
        
        // NEU Update 5
        nutri_title: "Nährwerte (pro Pers.)",
        cal: "Kcal", pro: "Prot", carb: "Kohlenhydrate", fat: "Fett",
        fav_on: "Gemerkt", fav_off: "Merken",
        inspire_title: "Doch keine Lust zu kochen?",
        inspire_btn: "Idee würfeln"
    },
    ru: {
        menu: "Меню",
        tools: "Инструменты",
        tool_resizer: "Оптимизатор фото",
        recipes: "Рецепты",
        didYouKnow: "История и Факты",
        timeDifficulty: "Время и Сложность",
        smartScaling: "Калькулятор порций",
        servings: "Порц.",
        ingredients: "Ингредиенты",
        startShopping: "Режим покупок",
        stopShopping: "Обычный вид",
        prep: "Подготовка",
        steps: "Приготовление",
        notes: "Заметки",
        nextRecipe: "Следующий рецепт",
        goToRecipe: "Открыть",
        notePlaceholder: "Ваши заметки...",
        cat_herzhaft: "Сытные блюда",
        cat_sweet: "Десерты и Напитки",
        resizerTitle: "Оптимизация изображений",
        resizerDesc: "Загрузите большие фото. Инструмент уменьшит их до 800px.",
        resizerBtn: "Выбрать и Оптимизировать",
        resizerSuccess: "Готово! Изображение оптимизировано.",
        resizerSaveInfo: "Сохраните скачанный файл в папку 'img/'.",
        resizerOriginal: "Оригинал",
        resizerOptimized: "Новый размер",

        // NEU Update 5
        nutri_title: "БЖУ (на порцию)",
        cal: "Ккал", pro: "Белки", carb: "Угл", fat: "Жиры",
        fav_on: "Сохранено", fav_off: "В избранное",
        inspire_title: "Не хотите готовить?",
        inspire_btn: "Кинуть кубик"
    }
};