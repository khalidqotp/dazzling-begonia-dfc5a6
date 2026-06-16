import { createFileRoute } from '@tanstack/react-router';
import { useDbStore } from '../store/useDbStore';
import { generateConjugationMatrix, isIAdjective, isIchidan, isGodan, isIrregular } from '../lib/conjugation';
import { Search, Sparkles, HelpCircle, BookOpen, Layers, Info, Check, ArrowRight } from 'lucide-react';

export const Route = createFileRoute('/')({
  component: ConjugationExplorer,
});

function ConjugationExplorer() {
  const {
    loading,
    error,
    query,
    setQuery,
    results,
    selectedEntry,
    setSelectedEntry,
  } = useDbStore();

  // Examples for the user to try clicking
  const examples = [
    { text: '行けば', label: 'Conditional of "to go"' },
    { text: '忘れた', label: 'Past of "to forget"' },
    { text: '寒くない', label: 'Negative of "cold"' },
    { text: '来ます', label: 'Polite of "to come"' },
    { text: '勉強する', label: 'Dictionary of "to study"' },
    { text: '泳いだ', label: 'Past of "to swim"' },
  ];

  // Helper to format POS codes to clean English text
  const formatPos = (pos: string) => {
    const parts = pos.split(' ');
    const displayParts = parts.map(p => {
      switch (p) {
        case 'v1': return 'Ichidan Verb (Group 2)';
        case 'v5k': return 'Godan Verb (-ku)';
        case 'v5g': return 'Godan Verb (-gu)';
        case 'v5s': return 'Godan Verb (-su)';
        case 'v5t': return 'Godan Verb (-tsu)';
        case 'v5n': return 'Godan Verb (-nu)';
        case 'v5m': return 'Godan Verb (-mu)';
        case 'v5r': return 'Godan Verb (-ru)';
        case 'v5w': return 'Godan Verb (-u)';
        case 'v5u': return 'Godan Verb (-u)';
        case 'v5b': return 'Godan Verb (-bu)';
        case 'vk': return 'Irregular Verb (Kuru)';
        case 'vs': return 'Irregular Verb (Suru)';
        case 'adj-i': return 'I-Adjective';
        case 'vi': return 'Intransitive';
        case 'vt': return 'Transitive';
        case 'n': return 'Noun';
        default: return p;
      }
    });
    return displayParts.join(' • ');
  };

  // Check if a cell's text matches the active search query
  const isCellMatched = (cellText: string) => {
    if (!query.trim()) return false;
    const cleanQuery = query.trim();
    // Split on slashes/commas/spaces and trim to match multiple possible outputs (e.g. for adjectives)
    const options = cellText.split(/[/,，、\s]+/).map(o => o.trim());
    return options.some(opt => opt === cleanQuery);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] bg-radial-glow flex flex-col items-center justify-center p-6 text-[#f3f4f6]">
        <div className="relative flex flex-col items-center">
          {/* Pulsing visual glow */}
          <div className="absolute w-40 h-40 rounded-full bg-indigo-500/20 blur-3xl animate-pulse"></div>
          <Sparkles className="w-12 h-12 text-indigo-400 animate-spin mb-4 duration-3000" />
          <h2 className="text-xl font-semibold tracking-tight font-jp-serif text-indigo-100">
            Loading Japanese Dictionary Core...
          </h2>
          <p className="text-sm text-zinc-500 mt-2 font-mono">
            WASM Engine & SQLite Dictionary Initializing
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center p-6 text-[#f3f4f6]">
        <div className="max-w-md w-full p-6 rounded-2xl bg-red-950/10 border border-red-500/30 text-center">
          <HelpCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-200">Database Load Error</h2>
          <p className="text-sm text-zinc-400 mt-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-red-900/30 hover:bg-red-900/50 border border-red-500/40 text-red-200 rounded-lg text-sm transition"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const matrixRows = selectedEntry ? generateConjugationMatrix(selectedEntry) : [];

  return (
    <div className="min-h-screen bg-[#050508] bg-radial-glow flex flex-col text-[#f3f4f6]">
      {/* Top Banner / Navbar */}
      <header className="border-b border-zinc-900/80 bg-zinc-950/40 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/10">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-jp-serif tracking-wide bg-gradient-to-r from-indigo-200 via-purple-200 to-indigo-100 bg-clip-text text-transparent">
                日本語活用探検家 <span className="font-sans font-medium text-sm text-indigo-400">v1.0</span>
              </h1>
              <p className="text-xs text-zinc-500 tracking-tight font-sans">
                Japanese Conjugation Explorer • WebAssembly SQLite Edition
              </p>
            </div>
          </div>
          
          <div className="text-xs text-zinc-500 font-mono flex items-center gap-2 bg-zinc-900/40 px-3 py-1.5 rounded-lg border border-zinc-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            local-wasm-db: active
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        
        {/* Search & Suggestions Card */}
        <section className="bg-zinc-950/60 border border-zinc-900/80 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none"></div>
          
          <div className="max-w-2xl mx-auto text-center mb-6">
            <h2 className="text-2xl font-bold font-jp-serif tracking-tight text-zinc-100">
              Seek Lemma or Conjugated Word
            </h2>
            <p className="text-sm text-zinc-400 mt-1 font-sans">
              Enter any Japanese verb, adjective, or conjugated form (e.g. 行けば, 飲まない, 寒かった)
            </p>
          </div>

          <div className="max-w-2xl mx-auto relative group">
            {/* Soft border focus glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-20 group-focus-within:opacity-40 transition duration-300"></div>
            
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-zinc-500 absolute left-4 pointer-events-none group-focus-within:text-indigo-400 transition" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type in Kanji, Hiragana or English definitions..."
                className="w-full pl-12 pr-12 py-3.5 bg-zinc-900/80 hover:bg-zinc-900/95 border border-zinc-800/80 focus:border-indigo-500/80 focus:ring-0 focus:outline-none rounded-xl text-[#f3f4f6] text-lg font-sans transition placeholder-zinc-600 shadow-inner"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-4 text-zinc-500 hover:text-zinc-300 font-sans text-sm bg-zinc-800 hover:bg-zinc-700 px-1.5 py-0.5 rounded transition"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Clickable Quick Examples */}
          <div className="max-w-3xl mx-auto mt-5 flex flex-wrap justify-center gap-2 items-center">
            <span className="text-xs text-zinc-500 font-medium mr-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Quick Try:
            </span>
            {examples.map((ex) => (
              <button
                key={ex.text}
                onClick={() => setQuery(ex.text)}
                title={ex.label}
                className="text-xs px-3 py-1.5 bg-zinc-900 hover:bg-indigo-950/40 hover:text-indigo-300 hover:border-indigo-800/50 text-zinc-400 border border-zinc-800/60 rounded-lg transition"
              >
                {ex.text}
              </button>
            ))}
          </div>
        </section>

        {/* Search Results Drawer / Switcher (Only visible when typing and multiple matches found) */}
        {results.length > 1 && (
          <section className="bg-zinc-950/40 border border-zinc-900/60 rounded-xl p-3 flex flex-col gap-2 max-h-48 overflow-y-auto">
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider px-2 flex items-center justify-between">
              <span>Matching Core Entries ({results.length})</span>
              <span>Click to view conjugation matrix</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {results.map((entry) => (
                <button
                  key={entry.sequence}
                  onClick={() => setSelectedEntry(entry)}
                  className={`px-3 py-2 rounded-lg text-left transition border flex flex-col justify-between h-14 ${
                    selectedEntry?.sequence === entry.sequence
                      ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300'
                      : 'bg-zinc-900/20 border-zinc-900 hover:bg-zinc-900/50 hover:border-zinc-800 text-zinc-400'
                  }`}
                >
                  <span className="font-jp-serif font-semibold text-sm truncate">{entry.term}</span>
                  <span className="text-[10px] font-mono text-zinc-500 truncate">{entry.reading}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Dashboard 2-Column Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column - Dictionary Card */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {selectedEntry ? (
              <div className="bg-zinc-950/70 border border-zinc-900/80 rounded-2xl p-6 backdrop-blur-xl flex flex-col shadow-xl relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-32 h-32 bg-purple-500/5 blur-2xl rounded-full pointer-events-none"></div>
                
                {/* Score and Rank Indicator */}
                <div className="flex items-center justify-between text-xs border-b border-zinc-900/60 pb-4 mb-5">
                  <span className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800/80 text-zinc-400 font-mono text-[10px]">
                    SEQ #{selectedEntry.sequence}
                  </span>
                  <span className="text-zinc-500 font-sans flex items-center gap-1">
                    Score: <strong className="text-indigo-400 font-mono">{selectedEntry.score}</strong>
                  </span>
                </div>

                {/* Massive Kanji display */}
                <div className="text-center py-6 border-b border-zinc-900/60 mb-5">
                  <span className="text-xs text-zinc-500 font-mono block mb-1 tracking-widest">FURIGANA</span>
                  <span className="text-lg font-jp-serif text-zinc-400 tracking-wide block mb-1">
                    {selectedEntry.reading}
                  </span>
                  <h3 className="text-5xl font-bold font-jp-serif text-zinc-100 hover:scale-105 transition duration-300 inline-block cursor-default">
                    {selectedEntry.term}
                  </h3>
                </div>

                {/* Linguistic classification & tags */}
                <div className="flex flex-col gap-4 mb-5">
                  <div>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1.5">
                      Linguistic Category
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedEntry.pos.split(' ').map((posTag) => (
                        <span
                          key={posTag}
                          className="text-[10px] px-2 py-1 rounded-md bg-indigo-500/5 border border-indigo-500/20 text-indigo-400 font-semibold"
                        >
                          {formatPos(posTag)}
                        </span>
                      ))}
                    </div>
                  </div>

                  {selectedEntry.tags && (
                    <div>
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1.5">
                        Dictionary Tags
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {selectedEntry.tags.split(' ').map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 font-mono"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* English Definitions List */}
                <div className="flex-1 border-t border-zinc-900/60 pt-5">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-3">
                    English Definitions
                  </span>
                  <ul className="space-y-2.5">
                    {selectedEntry.definitions.map((def, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start text-sm text-zinc-300 leading-relaxed font-sans">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/60 mt-2 flex-shrink-0"></span>
                        <span>{def}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-950/40 border border-zinc-900/60 rounded-2xl p-8 text-center text-zinc-500 backdrop-blur-xl">
                <HelpCircle className="w-10 h-10 text-zinc-600 mx-auto mb-3 animate-pulse" />
                <p className="text-sm font-sans">No matching dictionary entry selected.</p>
              </div>
            )}

            {/* Quick Grammar Conjugation Guide */}
            <div className="bg-zinc-950/40 border border-zinc-900/60 rounded-2xl p-5 backdrop-blur-xl">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-purple-400" /> Conjugation Guide
              </h4>
              <p className="text-xs text-zinc-500 leading-relaxed font-sans">
                Japanese verbs are categorized into three groups:
                <br />• <strong>Ichidan (v1)</strong>: Verbs ending in -eru/-iru that drop "ru" to conjugate.
                <br />• <strong>Godan (v5*)</strong>: Verbs that conjugate across the 5 rows of the kana chart.
                <br />• <strong>Irregulars (vk, vs)</strong>: *Kuru* (to come) and *Suru* (to do) have completely custom rules.
              </p>
            </div>
          </div>

          {/* Right Column - Conjugation Matrix */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-zinc-950/70 border border-zinc-900/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900/60 pb-4 mb-6 gap-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-lg font-bold tracking-tight font-sans text-zinc-100">
                    Comparative Conjugation Matrix
                  </h3>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono bg-indigo-950/20 px-2.5 py-1 rounded-md border border-indigo-900/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                  Side-by-Side View
                </div>
              </div>

              {selectedEntry ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse border-spacing-0">
                    <thead>
                      <tr className="border-b border-zinc-900 text-xs text-zinc-400 font-bold uppercase tracking-wider bg-zinc-900/10">
                        <th className="py-3 px-4 font-sans w-1/4">Conjugation Mode</th>
                        <th className="py-3 px-4 font-sans w-3/8">Casual / Plain (口語)</th>
                        <th className="py-3 px-4 font-sans w-3/8">Formal / Polite (丁寧語)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/60 text-sm">
                      {matrixRows.map((row) => {
                        const casualMatch = isCellMatched(row.casual);
                        const politeMatch = isCellMatched(row.polite);

                        return (
                          <tr key={row.formName} className="hover:bg-zinc-900/20 transition-all duration-150">
                            
                            {/* Form Name & Explanation */}
                            <td className="py-4 px-4 align-top">
                              <span className="font-bold text-zinc-200 block mb-0.5 text-xs tracking-wide">
                                {row.formName}
                              </span>
                              <span className="text-[10px] text-zinc-500 leading-relaxed block max-w-[160px] font-sans">
                                {row.description}
                              </span>
                            </td>

                            {/* Casual / Plain form cell */}
                            <td className="py-3 px-3 align-top">
                              <div
                                className={`p-3.5 rounded-xl border transition-all duration-300 flex flex-col justify-center h-full relative overflow-hidden ${
                                  casualMatch
                                    ? 'bg-indigo-500/15 border-indigo-400 shadow-lg shadow-indigo-500/15 ring-2 ring-indigo-500/40'
                                    : 'bg-zinc-900/30 border-zinc-900/80 hover:bg-zinc-900/50'
                                }`}
                              >
                                {casualMatch && (
                                  <div className="absolute right-2 top-2 flex items-center gap-1 text-[8px] font-mono uppercase bg-indigo-500 text-white font-bold px-1.5 py-0.5 rounded shadow">
                                    <Check className="w-2.5 h-2.5" /> Match
                                  </div>
                                )}
                                <span className="text-lg font-bold font-jp-serif text-zinc-100 block tracking-wide">
                                  {row.casual}
                                </span>
                              </div>
                            </td>

                            {/* Formal / Polite form cell */}
                            <td className="py-3 px-3 align-top">
                              <div
                                className={`p-3.5 rounded-xl border transition-all duration-300 flex flex-col justify-center h-full relative overflow-hidden ${
                                  politeMatch
                                    ? 'bg-purple-500/15 border-purple-400 shadow-lg shadow-purple-500/15 ring-2 ring-purple-500/40'
                                    : 'bg-zinc-900/30 border-zinc-900/80 hover:bg-zinc-900/50'
                                }`}
                              >
                                {politeMatch && (
                                  <div className="absolute right-2 top-2 flex items-center gap-1 text-[8px] font-mono uppercase bg-purple-500 text-white font-bold px-1.5 py-0.5 rounded shadow">
                                    <Check className="w-2.5 h-2.5" /> Match
                                  </div>
                                )}
                                <span className="text-lg font-bold font-jp-serif text-zinc-100 block tracking-wide">
                                  {row.polite}
                                </span>
                              </div>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-16 text-center text-zinc-500">
                  <HelpCircle className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <p className="text-sm font-sans">
                    Please search for or select a word to view its conjugation matrix.
                  </p>
                </div>
              )}
            </div>

            {/* Sub-legend / Quick Explanation of Highlighting */}
            {query && (
              <div className="bg-indigo-950/10 border border-indigo-900/30 rounded-xl p-4 text-xs text-indigo-300/80 leading-relaxed flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-indigo-400 flex-shrink-0 animate-pulse" />
                <p className="font-sans">
                  <strong>Active Search Term Match:</strong> The app analyzed your search <code className="bg-indigo-950/60 px-1.5 py-0.5 rounded text-indigo-300 text-[11px] border border-indigo-900/40">"{query}"</code> using reverse stemming. Correct dictionary origin has been selected, and any identical conjugated cells are automatically highlighted in glowing colors!
                </p>
              </div>
            )}

          </div>

        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900/80 bg-zinc-950/20 py-8 px-6 mt-12 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-sans">
            Designed for local Japanese NLP exploration. Powered by React, Vite, Tailwind CSS 4, and WebAssembly SQLite.
          </p>
          <p className="font-mono text-[10px] text-zinc-600">
            No file uploads • 100% Client-side sandbox
          </p>
        </div>
      </footer>
    </div>
  );
}
