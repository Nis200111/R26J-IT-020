/**
 * Plant data for the Medicinal Herbarium Database page.
 * Location: frontend/src/data/plants.js
 *
 * ============================================================================
 *  JAGATH — FILL THIS IN FIRST. Everything else is blocked on it.
 * ============================================================================
 *
 * WHAT I FILLED IN
 *   scientificName, family, and the model's class key. Botanical families are
 *   stable, verifiable taxonomy, so these are safe starting points.
 *
 * WHAT YOU MUST FILL IN
 *   sinhalaName, tamilName, partsUsed, uses, toxicity, lookAlike, howToTell,
 *   habitat.
 *
 *   I have deliberately left every medicinal and toxicity field empty. I am not
 *   going to invent Ayurvedic uses or safety information for real plants that
 *   people may act on — that has to come from your Haldummulla and
 *   Wickramarachchi sources. Empty fields render as "Not documented" on the
 *   page, which is honest. Invented ones would not be.
 *
 * ABOUT THE SINHALA NAMES
 *   Where I was reasonably confident I put a suggestion in `sinhalaNameDraft`.
 *   These are SUGGESTIONS ONLY — check every one against your sources, move the
 *   correct value into `sinhalaName`, and delete the draft field. Do not ship
 *   the drafts unchecked.
 *
 * HOW TO FILL IT
 *   Short is fine. Two or three lines per field. `uses` and `partsUsed` are
 *   arrays — add as many strings as you need. If you genuinely do not have
 *   information for a field, leave it empty rather than guessing.
 *
 * PHOTOS
 *   Put one clear photo per species in frontend/public/plants/ and set `image`
 *   to its filename. You already have 8 there; you need 21.
 */

export const PLANTS = [
    {
        key: "Abutilon_indicum",
        scientificName: "Abutilon indicum",
        family: "Malvaceae",
        sinhalaNameDraft: "Anoda / Beheth anoda",   // VERIFY, then move to sinhalaName
        sinhalaName: "",
        tamilName: "",
        image: "beheth anoda.jpg",
        habitat: "",
        partsUsed: [],
        uses: [],
        toxicity: "",
        lookAlike: "Sida cordata",                  // measured: worst confusion pair in your model
        howToTell: "",
    },
    {
        key: "Andrographis_paniculata",
        scientificName: "Andrographis paniculata",
        family: "Acanthaceae",
        sinhalaNameDraft: "Heen binkohomba / Kalu binkohomba",
        sinhalaName: "",
        tamilName: "",
        image: "Heen_Binkohomba.jpg",
        habitat: "",
        partsUsed: [],
        uses: [],
        toxicity: "",
        lookAlike: "",
        howToTell: "",
    },
    {
        key: "Boehmeria_nivea",
        scientificName: "Boehmeria nivea",
        family: "Urticaceae",
        sinhalaNameDraft: "",
        sinhalaName: "",
        tamilName: "",
        image: "Bu-dettha.jpg",
        habitat: "",
        partsUsed: [],
        uses: [],
        toxicity: "",
        lookAlike: "",
        howToTell: "",
    },
    {
        key: "Boerhavia_diffusa",
        scientificName: "Boerhavia diffusa",
        family: "Nyctaginaceae",
        sinhalaNameDraft: "Pita sudu sarana",
        sinhalaName: "",
        tamilName: "",
        image: "",
        habitat: "",
        partsUsed: [],
        uses: [],
        toxicity: "",
        lookAlike: "",
        howToTell: "",
    },
    {
        key: "Catharanthus_roseus",
        scientificName: "Catharanthus roseus",
        family: "Apocynaceae",
        sinhalaNameDraft: "Mini-mal",
        sinhalaName: "",
        tamilName: "",
        image: "",
        habitat: "",
        partsUsed: [],
        uses: [],
        toxicity: "",
        lookAlike: "",
        howToTell: "",
    },
    {
        key: "Datura_metel",
        scientificName: "Datura metel",
        family: "Solanaceae",
        sinhalaNameDraft: "Attana",
        sinhalaName: "",
        tamilName: "",
        image: "",
        habitat: "",
        partsUsed: [],
        uses: [],
        // IMPORTANT: this genus is well known to be toxic. Whatever your sources say,
        // this field must not be left empty on the live site.
        toxicity: "",
        lookAlike: "",
        howToTell: "",
    },
    {
        key: "Euphorbia_hirta",
        scientificName: "Euphorbia hirta",
        family: "Euphorbiaceae",
        sinhalaNameDraft: "Bu dada kiriya",
        sinhalaName: "",
        tamilName: "",
        image: "Buudadakiriya.jpg",
        habitat: "",
        partsUsed: [],
        uses: [],
        toxicity: "",
        lookAlike: "",
        howToTell: "",
    },
    {
        key: "Exallage_auricularia",
        scientificName: "Exallage auricularia",
        family: "Rubiaceae",
        sinhalaNameDraft: "",
        sinhalaName: "",
        tamilName: "",
        image: "",
        habitat: "",
        partsUsed: [],
        uses: [],
        toxicity: "",
        lookAlike: "",
        howToTell: "",
        note: "Also published as Hedyotis auricularia — worth mentioning in the paper.",
    },
    {
        key: "Gymnema_sylvestre",
        scientificName: "Gymnema sylvestre",
        family: "Apocynaceae",
        sinhalaNameDraft: "Masbedda",
        sinhalaName: "",
        tamilName: "",
        image: "",
        habitat: "",
        partsUsed: [],
        uses: [],
        toxicity: "",
        lookAlike: "",
        howToTell: "",
    },
    {
        key: "Morinda_citrifolia",
        scientificName: "Morinda citrifolia",
        family: "Rubiaceae",
        sinhalaNameDraft: "Ahu",
        sinhalaName: "",
        tamilName: "",
        image: "Ahu.jpg",
        habitat: "",
        partsUsed: [],
        uses: [],
        toxicity: "",
        lookAlike: "",
        howToTell: "",
    },
    {
        key: "Mucuna_pruriens",
        scientificName: "Mucuna pruriens",
        family: "Fabaceae",
        sinhalaNameDraft: "Wanduru mal",
        sinhalaName: "",
        tamilName: "",
        image: "",
        habitat: "",
        partsUsed: [],
        uses: [],
        toxicity: "",
        lookAlike: "",
        howToTell: "",
    },
    {
        key: "Munronia_pinnata",
        scientificName: "Munronia pinnata",
        family: "Meliaceae",
        sinhalaNameDraft: "Bin kohomba",
        sinhalaName: "",
        tamilName: "",
        image: "binkohomba.jpg",
        habitat: "",
        partsUsed: [],
        uses: [],
        toxicity: "",
        lookAlike: "",
        howToTell: "",
        note: "Your model misread this photo as Datura metel at 28%. Worth a slide.",
    },
    {
        key: "Opuntia_dillenii",
        scientificName: "Opuntia dillenii",
        family: "Cactaceae",
        sinhalaNameDraft: "Katu pathok",
        sinhalaName: "",
        tamilName: "",
        image: "",
        habitat: "",
        partsUsed: [],
        uses: [],
        toxicity: "",
        lookAlike: "",
        howToTell: "",
    },
    {
        key: "Piper_sarmentosum",
        scientificName: "Piper sarmentosum",
        family: "Piperaceae",
        sinhalaNameDraft: "",
        sinhalaName: "",
        tamilName: "",
        image: "",
        habitat: "",
        partsUsed: [],
        uses: [],
        toxicity: "",
        lookAlike: "",
        howToTell: "",
    },
    {
        key: "Plectranthus_amboinicus",
        scientificName: "Plectranthus amboinicus",
        family: "Lamiaceae",
        sinhalaNameDraft: "Kapparawalliya",
        sinhalaName: "",
        tamilName: "",
        image: "",
        habitat: "",
        partsUsed: [],
        uses: [],
        toxicity: "",
        lookAlike: "",
        howToTell: "",
    },
    {
        key: "Premna_serratifolia",
        scientificName: "Premna serratifolia",
        family: "Lamiaceae",
        sinhalaNameDraft: "",
        sinhalaName: "",
        tamilName: "",
        image: "",
        habitat: "",
        partsUsed: [],
        uses: [],
        toxicity: "",
        lookAlike: "",
        howToTell: "",
        note: "Formerly placed in Verbenaceae — you may see both in the literature.",
    },
    {
        key: "Scoparia_dulcis",
        scientificName: "Scoparia dulcis",
        family: "Plantaginaceae",
        sinhalaNameDraft: "Wal koththamalli",
        sinhalaName: "",
        tamilName: "",
        image: "",
        habitat: "",
        partsUsed: [],
        uses: [],
        toxicity: "",
        lookAlike: "",
        howToTell: "",
        note: "Formerly Scrophulariaceae.",
    },
    {
        key: "Sida_cordata",
        scientificName: "Sida cordata",
        family: "Malvaceae",
        sinhalaNameDraft: "Heen bevila",
        sinhalaName: "",
        tamilName: "",
        image: "",
        habitat: "",
        partsUsed: [],
        uses: [],
        toxicity: "",
        lookAlike: "Abutilon indicum",   // measured: your model's weakest class, 0.60 recall
        howToTell: "",                   // fill this one carefully — it is your headline pair
    },
    {
        key: "Stachys_sp",
        scientificName: "Stachys sp.",
        family: "Lamiaceae",
        sinhalaNameDraft: "Girapala",
        sinhalaName: "",
        tamilName: "",
        image: "Girapala.jpg",
        habitat: "",
        partsUsed: [],
        uses: [],
        toxicity: "",
        lookAlike: "",
        howToTell: "",
        note: "Identify to species before submission if you can — a reviewer will ask why this class is not resolved to species level while the other 20 are.",
    },
    {
        key: "Tephrosia_purpurea",
        scientificName: "Tephrosia purpurea",
        family: "Fabaceae",
        sinhalaNameDraft: "Kathurupila / Pila",
        sinhalaName: "",
        tamilName: "",
        image: "",
        habitat: "",
        partsUsed: [],
        uses: [],
        toxicity: "",
        lookAlike: "",
        howToTell: "",
    },
    {
        key: "Thespesia_populnea",
        scientificName: "Thespesia populnea",
        family: "Malvaceae",
        sinhalaNameDraft: "Gan suriya",
        sinhalaName: "",
        tamilName: "",
        image: "Gansooyia.jpg",
        habitat: "",
        partsUsed: [],
        uses: [],
        toxicity: "",
        lookAlike: "",
        howToTell: "",
    },
];

/** Look up one species by the model's class key. */
export function getPlant(key) {
    return PLANTS.find((p) => p.key === key) || null;
}

/** Human-readable name: "Abutilon indicum" rather than "Abutilon_indicum". */
export function displayName(key) {
    return key.replace(/_/g, " ");
}

/** Every family present, for the herbarium filter row. */
export function allFamilies() {
    return [...new Set(PLANTS.map((p) => p.family))].sort();
}

/** How complete is the data? The herbarium page shows this so you can see what is left. */
export function completeness() {
    const required = ["sinhalaName", "habitat", "toxicity", "howToTell"];
    let filled = 0;
    let total = 0;
    for (const p of PLANTS) {
        for (const f of required) {
            total += 1;
            if (p[f] && String(p[f]).trim()) filled += 1;
        }
        total += 2;
        if (p.uses?.length) filled += 1;
        if (p.partsUsed?.length) filled += 1;
    }
    return { filled, total, percent: Math.round((filled / total) * 100) };
}
