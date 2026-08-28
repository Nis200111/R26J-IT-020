/**
 * Real measured results for the member 1 classifier.
 *
 * Every number here is transcribed from the output of your own training
 * notebook (1111.ipynb) — the per-epoch logs and the sklearn classification
 * report. Nothing is estimated or rounded up.
 *
 * When you retrain, replace these values. The Model Performance tab reads only
 * from this file, so it can never show a figure the model did not actually
 * produce.
 */

export const MODEL_INFO = {
    architecture: "EfficientNetB0",
    strategy: "Transfer learning, frozen head then partial fine-tune",
    inputSize: "224 × 224 × 3",
    parameters: "4,216,248",
    classes: 21,
    testAccuracy: 0.8687,
    testLoss: 0.4353,
    macroPrecision: 0.87,
    macroRecall: 0.86,
    macroF1: 0.86,
};

export const DATASET = {
    totalImages: 3095,
    train: 2158,
    val: 457,
    test: 480,
    source: "Haldummulla Medicinal Plant Garden",
    validation: "Wickramarachchi Ayurveda University",
    splitMethod: "Random 70 / 15 / 15 per class, seed 42",
};

/** Per-class results on the 480 held-out test images. */
export const PER_CLASS = [
    { name: "Abutilon_indicum", precision: 0.63, recall: 0.75, f1: 0.69, support: 16 },
    { name: "Andrographis_paniculata", precision: 0.94, recall: 0.88, f1: 0.91, support: 17 },
    { name: "Boehmeria_nivea", precision: 0.70, recall: 0.78, f1: 0.74, support: 18 },
    { name: "Boerhavia_diffusa", precision: 0.94, recall: 1.00, f1: 0.97, support: 15 },
    { name: "Catharanthus_roseus", precision: 1.00, recall: 0.96, f1: 0.98, support: 27 },
    { name: "Datura_metel", precision: 0.84, recall: 0.89, f1: 0.86, support: 35 },
    { name: "Euphorbia_hirta", precision: 0.83, recall: 0.83, f1: 0.83, support: 24 },
    { name: "Exallage_auricularia", precision: 0.88, recall: 0.82, f1: 0.85, support: 17 },
    { name: "Gymnema_sylvestre", precision: 0.93, recall: 0.72, f1: 0.81, support: 18 },
    { name: "Morinda_citrifolia", precision: 0.80, recall: 0.83, f1: 0.82, support: 24 },
    { name: "Mucuna_pruriens", precision: 0.77, recall: 0.85, f1: 0.81, support: 20 },
    { name: "Munronia_pinnata", precision: 0.82, recall: 0.86, f1: 0.84, support: 21 },
    { name: "Opuntia_dillenii", precision: 0.91, recall: 1.00, f1: 0.95, support: 30 },
    { name: "Piper_sarmentosum", precision: 0.94, recall: 1.00, f1: 0.97, support: 17 },
    { name: "Plectranthus_amboinicus", precision: 0.94, recall: 0.91, f1: 0.92, support: 32 },
    { name: "Premna_serratifolia", precision: 0.93, recall: 0.78, f1: 0.85, support: 18 },
    { name: "Scoparia_dulcis", precision: 0.94, recall: 0.76, f1: 0.84, support: 21 },
    { name: "Sida_cordata", precision: 0.86, recall: 0.60, f1: 0.71, support: 20 },
    { name: "Stachys_sp", precision: 0.95, recall: 0.90, f1: 0.93, support: 21 },
    { name: "Tephrosia_purpurea", precision: 0.94, recall: 0.92, f1: 0.93, support: 36 },
    { name: "Thespesia_populnea", precision: 0.80, recall: 0.97, f1: 0.88, support: 33 },
];

/**
 * Validation accuracy per epoch, in the order the three fit() calls ran.
 * The dip at epoch 21 is real: fine-tuning began there and validation accuracy
 * fell from 0.8775 to 0.8096 in one epoch. Showing it is better than hiding it —
 * it is a result, and the audit explains the cause (7 BatchNormalization layers
 * were unfrozen).
 */
export const TRAINING = {
    phases: [
        { name: "Phase 1 — frozen backbone", startEpoch: 1, endEpoch: 20 },
        { name: "Phase 2 — fine-tune", startEpoch: 21, endEpoch: 35 },
        { name: "Phase 2 continued", startEpoch: 36, endEpoch: 50 },
    ],
    trainAcc: [
        0.3939, 0.6515, 0.7169, 0.7502, 0.7785, 0.8086, 0.8128, 0.8239, 0.8346, 0.8489,
        0.8573, 0.8522, 0.8786, 0.8689, 0.8670, 0.8791, 0.8874, 0.8925, 0.8971, 0.9129,
        0.7753, 0.7753, 0.7901, 0.8035, 0.7887, 0.8086, 0.8211, 0.8309, 0.8475, 0.8434,
        0.8452, 0.8582, 0.8633, 0.8619, 0.8614,
        0.8703, 0.8642, 0.8781, 0.8740, 0.8791, 0.8804, 0.8814, 0.8800, 0.8934, 0.8800,
        0.8906, 0.8948, 0.8930, 0.9013, 0.8957,
    ],
    valAcc: [
        0.6521, 0.7549, 0.7943, 0.8118, 0.8315, 0.8315, 0.8446, 0.8556, 0.8468, 0.8687,
        0.8687, 0.8643, 0.8600, 0.8840, 0.8643, 0.8643, 0.8578, 0.8818, 0.8775, 0.8775,
        0.8096, 0.8228, 0.8249, 0.8381, 0.8359, 0.8446, 0.8468, 0.8512, 0.8446, 0.8468,
        0.8534, 0.8534, 0.8534, 0.8556, 0.8643,
        0.8687, 0.8731, 0.8687, 0.8796, 0.8775, 0.8775, 0.8775, 0.8753, 0.8753, 0.8753,
        0.8796, 0.8775, 0.8818, 0.8775, 0.8862,
    ],
};

/**
 * Known limitations. This panel exists so the page never claims more than the
 * evidence supports — and so a reviewer sees you already know what is missing.
 * Delete each entry as the corresponding experiment gets done.
 */
export const LIMITATIONS = [
    {
        title: "No category for unknown plants",
        body: "The output layer has 21 units and softmax forces them to sum to 1. A plant "
            + "outside the 21 species is still assigned to the closest match. Measured: random "
            + "noise scores 33.5% on Morinda citrifolia, higher than a real photograph of "
            + "Munronia pinnata at 28%.",
        status: "open",
    },
    {
        title: "Out-of-distribution rejection not yet measured",
        body: "No AUROC or FPR@95TPR has been computed, because no set of non-target plant "
            + "photographs has been collected yet. This is the main gap.",
        status: "open",
    },
    {
        title: "Duplicate-image leakage not yet audited",
        body: "The split was random at image level. Photographs of the same physical plant may "
            + "appear on both sides, which would inflate the 86.87% figure. Unverified either way.",
        status: "open",
    },
    {
        title: "Model attends to flowers more than leaves",
        body: "Grad-CAM shows attention landing on the flower for several species. Leaf-only "
            + "photographs, and non-flowering seasons, are likely failure modes and have not "
            + "been tested.",
        status: "open",
    },
    {
        title: "Adulterant species are not in the training set",
        body: "All 21 classes are genuine medicinal plants. The system can flag species pairs "
            + "it confuses, but it has never seen a documented adulterant and cannot identify "
            + "one as such.",
        status: "open",
    },
];

/** Confusions measured on the test set, not assumed. */
export const CONFUSION_NOTES = [
    {
        pair: ["Sida_cordata", "Abutilon_indicum"],
        note: "The weakest pair. Sida cordata recall 0.60 and Abutilon indicum precision 0.63 "
            + "are the two lowest numbers in the report and are the same error seen from both "
            + "sides. Both are Malvaceae, so the confusion is botanically real.",
    },
    {
        pair: ["Boehmeria_nivea", "Boerhavia_diffusa"],
        note: "Boehmeria nivea has the second-lowest precision at 0.70.",
    },
    {
        pair: ["Gymnema_sylvestre", "—"],
        note: "Recall 0.72 against precision 0.93: the model rarely calls it wrongly, but "
            + "misses more than a quarter of real specimens. More photographs of this species "
            + "would help more than more epochs.",
    },
];

export function weakestClasses(n = 5) {
    return [...PER_CLASS].sort((a, b) => a.f1 - b.f1).slice(0, n);
}

export function strongestClasses(n = 5) {
    return [...PER_CLASS].sort((a, b) => b.f1 - a.f1).slice(0, n);
}
