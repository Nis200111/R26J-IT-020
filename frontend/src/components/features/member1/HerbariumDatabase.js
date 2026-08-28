"use client";

/**
 * Member 1 — Medicinal Herbarium Database.
 *
 * This is the tab that was previously `cursor-not-allowed` and did nothing.
 *
 * Everything shown here comes from src/data/plants.js. Fields you have not
 * filled in render as "Not documented yet" rather than being hidden, so the page
 * never implies knowledge the project does not have — which matters when the
 * subject is what people may safely put in a medicinal preparation.
 */

import { useMemo, useState } from "react";
import {
    Search, X, Leaf, AlertTriangle, ArrowLeftRight, MapPin, Scissors, BookOpen,
} from "lucide-react";

import { PLANTS, allFamilies, completeness, displayName } from "@/data/plants";

const norm = (s) => (s || "").toLowerCase();

export default function HerbariumDatabase() {
    const [query, setQuery] = useState("");
    const [family, setFamily] = useState("All");
    const [selected, setSelected] = useState(null);

    const families = useMemo(() => ["All", ...allFamilies()], []);
    const progress = useMemo(() => completeness(), []);

    const results = useMemo(() => {
        const q = norm(query).trim();
        return PLANTS.filter((p) => {
            if (family !== "All" && p.family !== family) return false;
            if (!q) return true;
            return [p.scientificName, p.sinhalaName, p.sinhalaNameDraft, p.tamilName,
            p.family, displayName(p.key)]
                .some((v) => norm(v).includes(q));
        });
    }, [query, family]);

    return (
        <div className="w-full px-4 lg:px-12 py-10">

            {/* header + search */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Medicinal Herbarium</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        The {PLANTS.length} species this system can identify, collected at Haldummulla
                        Medicinal Plant Garden.
                    </p>
                </div>

                <div className="relative w-full lg:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search botanical, Sinhala or Tamil name…"
                        className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 bg-white text-sm
                       focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                    />
                    {query && (
                        <button onClick={() => setQuery("")} aria-label="Clear search"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* family filter */}
            <div className="flex flex-wrap gap-2 mb-6">
                {families.map((f) => (
                    <button key={f} onClick={() => setFamily(f)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all border ${family === f
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300"}`}>
                        {f}
                    </button>
                ))}
            </div>

            {/* completeness — remove this block once the data file is finished */}
            {progress.percent < 100 && (
                <div className="mb-6 flex items-center gap-4 p-4 rounded-xl border border-amber-200 bg-amber-50">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <div className="flex-1">
                        <p className="text-xs font-bold text-amber-800 mb-1">
                            Plant records {progress.percent}% complete
                        </p>
                        <div className="w-full h-1.5 bg-amber-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full"
                                style={{ width: `${progress.percent}%` }} />
                        </div>
                        <p className="text-[10px] text-amber-700 mt-1.5">
                            {progress.total - progress.filled} fields still empty in src/data/plants.js.
                            Empty fields show as &quot;not documented&quot; below. Delete this notice when done.
                        </p>
                    </div>
                </div>
            )}

            {/* grid */}
            {results.length === 0 ? (
                <div className="py-20 text-center">
                    <Leaf className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-400">No species match &quot;{query}&quot;.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {results.map((p) => (
                        <button key={p.key} onClick={() => setSelected(p)}
                            className="text-left bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden
                         hover:shadow-md hover:border-emerald-300 transition-all group">
                            <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                                {p.image ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={encodeURI(`/plants/${p.image}`)} alt={p.scientificName}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                        <Leaf className="w-8 h-8 mb-1" />
                                        <span className="text-[10px]">photo needed</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <p className="text-sm font-bold text-slate-800 italic leading-tight">
                                    {p.scientificName}
                                </p>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    {p.sinhalaName
                                        || (p.sinhalaNameDraft
                                            ? `${p.sinhalaNameDraft} · unverified`
                                            : "Sinhala name not set")}
                                </p>
                                <div className="flex items-center gap-2 mt-3">
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                        {p.family}
                                    </span>
                                    {p.lookAlike && (
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                                            look-alike
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {selected && <PlantDetail plant={selected} onClose={() => setSelected(null)} />}
        </div>
    );
}

/* --------------------------------------------------------------------- */

function PlantDetail({ plant, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center bg-slate-900/60 p-4 overflow-y-auto"
            onClick={onClose} role="presentation">
            <div className="bg-white rounded-2xl w-full max-w-3xl my-8 overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}>

                <div className="relative h-56 bg-slate-100">
                    {plant.image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={encodeURI(`/plants/${plant.image}`)} alt={plant.scientificName}
                            className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Leaf className="w-12 h-12" />
                        </div>
                    )}
                    <button onClick={onClose} aria-label="Close"
                        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 hover:bg-white
                       flex items-center justify-center shadow-sm">
                        <X className="w-4 h-4 text-slate-700" />
                    </button>
                </div>

                <div className="p-7">
                    <h3 className="text-2xl font-bold text-slate-800 italic">{plant.scientificName}</h3>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 mb-6 text-xs text-slate-500">
                        <span><strong className="text-slate-700">Family:</strong> {plant.family}</span>
                        <span><strong className="text-slate-700">Sinhala:</strong>{" "}
                            {plant.sinhalaName || (plant.sinhalaNameDraft
                                ? `${plant.sinhalaNameDraft} (unverified)` : "not documented")}</span>
                        <span><strong className="text-slate-700">Tamil:</strong>{" "}
                            {plant.tamilName || "not documented"}</span>
                    </div>

                    <Field icon={MapPin} label="Habitat" value={plant.habitat} />
                    <Field icon={Scissors} label="Parts used" value={plant.partsUsed?.join(", ")} />
                    <Field icon={BookOpen} label="Documented uses" list={plant.uses} />

                    <div className="mt-5 p-4 rounded-xl border border-red-100 bg-red-50">
                        <p className="text-[10px] font-bold text-red-800 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" /> Toxicity and cautions
                        </p>
                        <p className="text-xs text-red-700 leading-relaxed">
                            {plant.toxicity || "Not documented. Absence of information here does not mean the plant is safe."}
                        </p>
                    </div>

                    {plant.lookAlike && (
                        <div className="mt-4 p-4 rounded-xl border border-amber-100 bg-amber-50">
                            <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                <ArrowLeftRight className="w-3.5 h-3.5" /> Confused with {plant.lookAlike}
                            </p>
                            <p className="text-xs text-amber-700 leading-relaxed">
                                {plant.howToTell || "Distinguishing features not documented yet."}
                            </p>
                        </div>
                    )}

                    {plant.note && (
                        <p className="mt-4 text-[11px] text-slate-400 leading-relaxed">{plant.note}</p>
                    )}

                    <p className="mt-6 pt-4 border-t border-slate-100 text-[10px] text-slate-400 leading-relaxed">
                        Reference information compiled for research purposes. It is not medical advice and
                        must not be used to prepare or administer any remedy without a qualified
                        practitioner.
                    </p>
                </div>
            </div>
        </div>
    );
}

function Field({ icon: Icon, label, value, list }) {
    const empty = list ? !list?.length : !value;
    return (
        <div className="mb-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5" /> {label}
            </p>
            {empty ? (
                <p className="text-xs text-slate-400 italic">Not documented yet.</p>
            ) : list ? (
                <ul className="list-disc pl-5 space-y-1">
                    {list.map((v) => <li key={v} className="text-xs text-slate-600 leading-relaxed">{v}</li>)}
                </ul>
            ) : (
                <p className="text-xs text-slate-600 leading-relaxed">{value}</p>
            )}
        </div>
    );
}
