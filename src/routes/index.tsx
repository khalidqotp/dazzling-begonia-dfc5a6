import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useDbStore } from '../store/useDbStore';
import { generateConjugationMatrix } from '../lib/conjugation';
import { Search, Sparkles, HelpCircle, BookOpen, Layers, Info, Check, Globe, Copy } from 'lucide-react';

export const Route = createFileRoute('/')({
  component: ConjugationExplorer,
});

// --- Translations Dictionary ---
const translations = {
  en: {
    appTitle: "日本語活用探検家",
    appVersion: "v1.0",
    appSubtitle: "Japanese Conjugation Explorer • WebAssembly SQLite Edition",
    statusActive: "local-wasm-db: active",
    searchTitle: "Seek Lemma or Conjugated Word",
    searchDesc: "Enter any Japanese verb, adjective, or conjugated form (e.g. 行けば, 飲まない, 寒かった)",
    searchPlaceholder: "Type in Kanji, Hiragana or English definitions...",
    clearBtn: "Clear",
    quickTry: "Quick Try",
    matchCore: "Matching Core Entries",
    clickView: "Click to view conjugation matrix",
    seq: "SEQ #",
    score: "Score:",
    furigana: "FURIGANA",
    lingCat: "Linguistic Category",
    dictTags: "Dictionary Tags",
    engDefs: "English Definitions",
    noMatch: "No matching dictionary entry selected.",
    guideTitle: "Conjugation Guide",
    guideLine1: "Japanese verbs are categorized into three groups:",
    guideLine2: "Ichidan (v1): Verbs ending in 'eru'/'iru' that drop 'ru' to conjugate.",
    guideLine3: "Godan (v5*): Verbs that conjugate across the 5 rows of the kana chart.",
    guideLine4: "Irregulars (vk, vs): 'Kuru' (to come) and 'Suru' (to do) have completely custom rules.",
    matrixTitle: "Comparative Conjugation Matrix",
    sideBySide: "Side-by-Side View",
    colMode: "Conjugation Mode",
    colCasual: "Casual / Plain (口語)",
    colPolite: "Formal / Polite (丁寧語)",
    matchTag: "Match",
    copiedTag: "Copied!",
    clickToCopy: "Click to copy",
    noMatrixInfo: "Please search for or select a word to view its conjugation matrix.",
    activeMatch: "Active Search Term Match:",
    activeMatchP1: "The app analyzed your search",
    activeMatchP2: "using reverse stemming. Correct dictionary origin has been selected, and any identical conjugated cells are automatically highlighted in glowing colors!",
    footer1: "Designed for local Japanese NLP exploration. Powered by React, Vite, Tailwind CSS 4, and WebAssembly SQLite.",
    footer2: "No file uploads • 100% Client-side sandbox",
    loadingTitle: "Loading Japanese Dictionary Core...",
    loadingSub: "WASM Engine & SQLite Dictionary Initializing",
    errorTitle: "Database Load Error",
    errorBtn: "Retry Loading",
  },
  ar: {
    appTitle: "مستكشف تصريف الأفعال اليابانية",
    appVersion: "١.٠",
    appSubtitle: "نسخة ويب أسمبلي - قواعد بيانات SQLite المحلية",
    statusActive: "قاعدة البيانات: متصلة",
    searchTitle: "ابحث عن الكلمة الأصلية أو المُصرّفة",
    searchDesc: "أدخل أي فعل، صفة، أو صيغة مُصرّفة (مثل: 行けば, 飲まない, 寒かった)",
    searchPlaceholder: "اكتب بالكانجي، الهيراغانا، أو المعنى الإنجليزي...",
    clearBtn: "مسح",
    quickTry: "تجربة سريعة",
    matchCore: "النتائج المطابقة",
    clickView: "اضغط لعرض جدول التصريفات",
    seq: "تسلسل #",
    score: "التقييم:",
    furigana: "النطق (فوريغانا)",
    lingCat: "التصنيف اللغوي",
    dictTags: "علامات القاموس",
    engDefs: "المعاني بالإنجليزية",
    noMatch: "لم يتم تحديد أي كلمة من القاموس لعرضها.",
    guideTitle: "دليل التصريفات الأساسي",
    guideLine1: "تُقسم الأفعال اليابانية إلى ثلاث مجموعات رئيسية:",
    guideLine2: "إيتشيدان (v1): الأفعال المنتهية بـ eru/iru وتُحذف منها ru عند التصريف.",
    guideLine3: "غودان (v5*): الأفعال التي تُصرف عبر الصفوف الخمسة لجدول الكانا.",
    guideLine4: "أفعال شاذة (vk, vs): فعلي Kuru (يأتي) و Suru (يفعل) لهما قواعد خاصة تماماً.",
    matrixTitle: "جدول التصريفات المقارن",
    sideBySide: "عرض جنباً إلى جنب",
    colMode: "صيغة التصريف",
    colCasual: "صيغة عادية / غير رسمية (口語)",
    colPolite: "صيغة مهذبة / رسمية (丁寧語)",
    matchTag: "تطابق",
    copiedTag: "تم النسخ!",
    clickToCopy: "اضغط للنسخ",
    noMatrixInfo: "يرجى البحث أو اختيار كلمة لعرض جدول التصريفات الخاص بها.",
    activeMatch: "تطابق دقيق لكلمة البحث:",
    activeMatchP1: "قام التطبيق بتحليل الكلمة التي بحثت عنها",
    activeMatchP2: "باستخدام البحث العكسي. تم استخراج الجذر الصحيح، وتم تظليل أي تصريفات مطابقة بألوان مضيئة تلقائياً!",
    footer1: "مُصمم لاستكشاف اللغة اليابانية برمجياً بشكل محلي. مبني بواسطة React, Vite, Tailwind.",
    footer2: "بدون رفع ملفات • تعمل بالكامل داخل متصفحك",
    loadingTitle: "جاري تحميل قاموس اللغة اليابانية...",
    loadingSub: "تهيئة محرك WASM وقاعدة البيانات",
    errorTitle: "خطأ في تحميل قاعدة البيانات",
    errorBtn: "إعادة المحاولة",
  }
};

function ConjugationExplorer() {
  const { loading, error, query, setQuery, results, selectedEntry, setSelectedEntry } = useDbStore();
  
  // States for localization and copy feedback
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [copiedCell, setCopiedCell] = useState<string | null>(null);
  
  const t = translations[lang];

  // Copy to clipboard handler
  const handleCopy = (text: string, cellId: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedCell(cellId);
    setTimeout(() => {
      setCopiedCell(null);
    }, 1500);
  };

  const examples = [
    { text: '行けば', label: lang === 'ar' ? 'شرط الفعل يذهب' : 'Conditional of to go' },
    { text: '忘れた', label: lang === 'ar' ? 'ماضي الفعل ينسى' : 'Past of to forget' },
    { text: '寒くない', label: lang === 'ar' ? 'نفي صفة بارد' : 'Negative of cold' },
    { text: '来ます', label: lang === 'ar' ? 'صيغة الاحترام للفعل يأتي' : 'Polite of to come' },
    { text: '勉強する', label: lang === 'ar' ? 'المصدر من فعل يدرس' : 'Dictionary of to study' },
    { text: '泳いだ', label: lang === 'ar' ? 'ماضي الفعل يسبح' : 'Past of to swim' },
  ];

  const formatPos = (pos: string) => {
    const parts = pos.split(' ');
    const displayParts = parts.map((p) => {
      if (lang === 'en') {
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
      } else {
        switch (p) {
          case 'v1': return 'إيتشيدان (المجموعة ٢)';
          case 'v5k': return 'غودان (-ku)';
          case 'v5g': return 'غودان (-gu)';
          case 'v5s': return 'غودان (-su)';
          case 'v5t': return 'غودان (-tsu)';
          case 'v5n': return 'غودان (-nu)';
          case 'v5m': return 'غودان (-mu)';
          case 'v5r': return 'غودان (-ru)';
          case 'v5w': return 'غودان (-u)';
          case 'v5u': return 'غودان (-u)';
          case 'v5b': return 'غودان (-bu)';
          case 'vk': return 'فعل شاذ (Kuru)';
          case 'vs': return 'فعل شاذ (Suru)';
          case 'adj-i': return 'صفة (i)';
          case 'vi': return 'فعل لازم';
          case 'vt': return 'فعل متعدي';
          case 'n': return 'اسم';
          default: return p;
        }
      }
    });
    return displayParts.join(' • ');
  };

  const getLocalizedRowDesc = (rowName: string, originalDesc: string) => {
    if (lang === 'en') return { name: rowName, desc: originalDesc };
    const map: Record<string, {name: string, desc: string}> = {
      'Present / Dictionary': { name: 'المضارع / القاموس', desc: 'مضارع عادي (غير ماضي).' },
      'Negative': { name: 'النفي', desc: 'صيغة النفي ("لا يفعل...").' },
      'Past': { name: 'الماضي', desc: 'صيغة الماضي ("فعل...").' },
      'Te-form (Conjunctive)': { name: 'صيغة Te (الربط)', desc: 'صيغة الربط ("و..." ، "يفعل...").' },
      'Conditional (-ba)': { name: 'الشرط (-ba)', desc: 'الشرط الافتراضي ("إذا...").' },
      'Potential': { name: 'القدرة', desc: 'صيغة القدرة ("يمكنه...").' },
      'Passive': { name: 'المبني للمجهول', desc: 'يُفعل به.' },
      'Causative': { name: 'السببية', desc: 'يجعله / يدعه يفعل.' },
      'Imperative': { name: 'الأمر', desc: 'أمر مباشر.' },
      'Volitional': { name: 'الإرادة / النية', desc: 'النية أو الاقتراح ("دعونا...").' }
    };
    return map[rowName] ? map[rowName] : { name: rowName, desc: originalDesc };
  };

  const isCellMatched = (cellText: string) => {
    if (!query.trim()) return false;
    const cleanQuery = query.trim();
    const options = cellText.split(/[,，、\s]+/).map(o => o.trim());
    return options.some(opt => opt === cleanQuery);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] bg-radial-glow flex flex-col items-center justify-center p-6 text-[#f3f4f6]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="relative flex flex-col items-center">
          <div className="absolute w-40 h-40 rounded-full bg-indigo-500/20 blur-3xl animate-pulse"></div>
          <Sparkles className="w-12 h-12 text-indigo-400 animate-spin mb-4 duration-3000" />
          <h2 className="text-xl font-semibold tracking-tight font-jp-serif text-indigo-100">{t.loadingTitle}</h2>
          <p className="text-sm text-zinc-500 mt-2 font-mono">{t.loadingSub}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center p-6 text-[#f3f4f6]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="max-w-md w-full p-6 rounded-2xl bg-red-950/10 border border-red-500/30 text-center">
          <HelpCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-red-200">{t.errorTitle}</h2>
          <p className="text-sm text-zinc-400 mt-2">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-6 px-4 py-2 bg-red-900/30 hover:bg-red-900/50 border border-red-500/40 text-red-200 rounded-lg text-sm transition">
            {t.errorBtn}
          </button>
        </div>
      </div>
    );
  }

  const matrixRows = selectedEntry ? generateConjugationMatrix(selectedEntry) : [];

  return (
    <div className="min-h-screen bg-[#050508] bg-radial-glow flex flex-col text-[#f3f4f6]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="border-b border-zinc-900/80 bg-zinc-950/40 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/10">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-jp-serif tracking-wide bg-gradient-to-r from-indigo-200 via-purple-200 to-indigo-100 bg-clip-text text-transparent">
                {t.appTitle} <span className="font-sans font-medium text-sm text-indigo-400">{t.appVersion}</span>
              </h1>
              <p className="text-xs text-zinc-500 tracking-tight font-sans">
                {t.appSubtitle}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-300 transition"
            >
              <Globe className="w-4 h-4 text-indigo-400" />
              {lang === 'en' ? 'العربية' : 'English'}
            </button>
            <div className="text-xs text-zinc-500 font-mono flex items-center gap-2 bg-zinc-900/40 px-3 py-1.5 rounded-lg border border-zinc-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {t.statusActive}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        <section className="bg-zinc-950/60 border border-zinc-900/80 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none"></div>
          
          <div className="max-w-2xl mx-auto text-center mb-6">
            <h2 className="text-2xl font-bold font-jp-serif tracking-tight text-zinc-100">
              {t.searchTitle}
            </h2>
            <p className="text-sm text-zinc-400 mt-1 font-sans">
              {t.searchDesc}
            </p>
          </div>

          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-20 group-focus-within:opacity-40 transition duration-300"></div>
            
            <div className="relative flex items-center">
              <Search className={`w-5 h-5 text-zinc-500 absolute pointer-events-none group-focus-within:text-indigo-400 transition ${lang === 'ar' ? 'right-4' : 'left-4'}`} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className={`w-full py-3.5 bg-zinc-900/80 hover:bg-zinc-900/95 border border-zinc-800/80 focus:border-indigo-500/80 focus:ring-0 focus:outline-none rounded-xl text-[#f3f4f6] text-lg font-sans transition placeholder-zinc-600 shadow-inner ${lang === 'ar' ? 'pr-12 pl-12' : 'pl-12 pr-12'}`}
              />
              
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className={`absolute text-zinc-500 hover:text-zinc-300 font-sans text-sm bg-zinc-800 hover:bg-zinc-700 px-1.5 py-0.5 rounded transition ${lang === 'ar' ? 'left-4' : 'right-4'}`}
                >
                  {t.clearBtn}
                </button>
              )}
            </div>
          </div>

          <div className="max-w-3xl mx-auto mt-5 flex flex-wrap justify-center gap-2 items-center">
            <span className={`text-xs text-zinc-500 font-medium flex items-center gap-1 ${lang === 'ar' ? 'ml-1' : 'mr-1'}`}>
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> {t.quickTry}:
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

        {results.length > 1 && (
          <section className="bg-zinc-950/40 border border-zinc-900/60 rounded-xl p-3 flex flex-col gap-2 max-h-48 overflow-y-auto">
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider px-2 flex items-center justify-between">
              <span>{t.matchCore} ({results.length})</span>
              <span>{t.clickView}</span>
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
                  <span className={`font-jp-serif font-semibold text-sm truncate ${lang === 'ar' && 'text-right'}`}>{entry.term}</span>
                  <span className={`text-[10px] font-mono text-zinc-500 truncate ${lang === 'ar' && 'text-right'}`}>{entry.reading}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 flex flex-col gap-6">
            {selectedEntry ? (
              <div className="bg-zinc-950/70 border border-zinc-900/80 rounded-2xl p-6 backdrop-blur-xl flex flex-col shadow-xl relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-32 h-32 bg-purple-500/5 blur-2xl rounded-full pointer-events-none"></div>
                
                <div className="flex items-center justify-between text-xs border-b border-zinc-900/60 pb-4 mb-5">
                  <span className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800/80 text-zinc-400 font-mono text-[10px]">
                    {t.seq}{selectedEntry.sequence}
                  </span>
                  <span className="text-zinc-500 font-sans flex items-center gap-1">
                    {t.score} <strong className="text-indigo-400 font-mono">{selectedEntry.score}</strong>
                  </span>
                </div>

                <div className="text-center py-6 border-b border-zinc-900/60 mb-5">
                  <span className="text-xs text-zinc-500 font-mono block mb-1 tracking-widest">{t.furigana}</span>
                  <span className="text-lg font-jp-serif text-zinc-400 tracking-wide block mb-1">
                    {selectedEntry.reading}
                  </span>
                  <h3 className="text-5xl font-bold font-jp-serif text-zinc-100 hover:scale-105 transition duration-300 inline-block cursor-default">
                    {selectedEntry.term}
                  </h3>
                </div>

                <div className="flex flex-col gap-4 mb-5">
                  <div>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1.5">
                      {t.lingCat}
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
                        {t.dictTags}
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

                <div className="flex-1 border-t border-zinc-900/60 pt-5">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-3">
                    {t.engDefs}
                  </span>
                  <ul className="space-y-2.5">
                    {selectedEntry.definitions.map((def, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start text-sm text-zinc-300 leading-relaxed font-sans" dir="ltr">
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
                <p className="text-sm font-sans">{t.noMatch}</p>
              </div>
            )}

            <div className="bg-zinc-950/40 border border-zinc-900/60 rounded-2xl p-5 backdrop-blur-xl">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-purple-400" /> {t.guideTitle}
              </h4>
              <p className="text-xs text-zinc-500 leading-relaxed font-sans">
                {t.guideLine1}<br/>
                <span className="block mt-1">• <strong>{t.guideLine2.split(':')[0]}:</strong> {t.guideLine2.split(':')[1]}</span>
                <span className="block mt-1">• <strong>{t.guideLine3.split(':')[0]}:</strong> {t.guideLine3.split(':')[1]}</span>
                <span className="block mt-1">• <strong>{t.guideLine4.split(':')[0]}:</strong> {t.guideLine4.split(':')[1]}</span>
              </p>
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-zinc-950/70 border border-zinc-900/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900/60 pb-4 mb-6 gap-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-lg font-bold tracking-tight font-sans text-zinc-100">
                    {t.matrixTitle}
                  </h3>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono bg-indigo-950/20 px-2.5 py-1 rounded-md border border-indigo-900/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                  {t.sideBySide}
                </div>
              </div>

              {selectedEntry ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse border-spacing-0" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                    <thead>
                      <tr className="border-b border-zinc-900 text-xs text-zinc-400 font-bold uppercase tracking-wider bg-zinc-900/10">
                        <th className={`py-3 px-4 font-sans w-1/4 ${lang === 'ar' && 'text-right'}`}>{t.colMode}</th>
                        <th className={`py-3 px-4 font-sans w-3/8 ${lang === 'ar' && 'text-right'}`}>{t.colCasual}</th>
                        <th className={`py-3 px-4 font-sans w-3/8 ${lang === 'ar' && 'text-right'}`}>{t.colPolite}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/60 text-sm">
                      {matrixRows.map((row) => {
                        const casualMatch = isCellMatched(row.casual);
                        const politeMatch = isCellMatched(row.polite);
                        const locData = getLocalizedRowDesc(row.formName, row.description);

                        return (
                          <tr key={row.formName} className="hover:bg-zinc-900/20 transition-all duration-150">
                            <td className="py-4 px-4 align-top">
                              <span className="font-bold text-zinc-200 block mb-0.5 text-xs tracking-wide">
                                {locData.name}
                              </span>
                              <span className="text-[10px] text-zinc-500 leading-relaxed block max-w-[160px] font-sans">
                                {locData.desc}
                              </span>
                            </td>

                            <td className="py-3 px-3 align-top">
                              <div
                                onClick={() => handleCopy(row.casual, `${row.formName}-casual`)}
                                className={`cursor-pointer group p-3.5 rounded-xl border transition-all duration-300 flex flex-col justify-center h-full relative overflow-hidden ${
                                  casualMatch
                                    ? 'bg-indigo-500/15 border-indigo-400 shadow-lg shadow-indigo-500/15 ring-2 ring-indigo-500/40'
                                    : 'bg-zinc-900/30 border-zinc-900/80 hover:bg-zinc-900/50'
                                }`}
                              >
                                {casualMatch && (
                                  <div className={`absolute top-2 flex items-center gap-1 text-[8px] font-mono uppercase bg-indigo-500 text-white font-bold px-1.5 py-0.5 rounded shadow ${lang === 'ar' ? 'left-2' : 'right-2'}`}>
                                    <Check className="w-2.5 h-2.5" /> {t.matchTag}
                                  </div>
                                )}
                                
                                {copiedCell === `${row.formName}-casual` && (
                                  <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-sm flex items-center justify-center z-10 transition-all duration-300">
                                    <span className="text-emerald-300 text-xs font-bold px-2 py-1 bg-emerald-950/80 rounded border border-emerald-500/50 shadow-lg flex items-center gap-1">
                                      <Check className="w-3 h-3" /> {t.copiedTag}
                                    </span>
                                  </div>
                                )}
                                
                                <div className={`absolute top-2 opacity-0 group-hover:opacity-100 transition-opacity ${lang === 'ar' ? 'right-2' : 'left-2'}`}>
                                  <span className="flex items-center gap-1 text-[9px] text-zinc-400 font-sans bg-zinc-800/80 px-1.5 py-0.5 rounded">
                                    <Copy className="w-2.5 h-2.5" /> {t.clickToCopy}
                                  </span>
                                </div>

                                <span className="text-lg font-bold font-jp-serif text-zinc-100 block tracking-wide text-center">
                                  {row.casual}
                                </span>
                              </div>
                            </td>

                            <td className="py-3 px-3 align-top">
                              <div
                                onClick={() => handleCopy(row.polite, `${row.formName}-polite`)}
                                className={`cursor-pointer group p-3.5 rounded-xl border transition-all duration-300 flex flex-col justify-center h-full relative overflow-hidden ${
                                  politeMatch
                                    ? 'bg-purple-500/15 border-purple-400 shadow-lg shadow-purple-500/15 ring-2 ring-purple-500/40'
                                    : 'bg-zinc-900/30 border-zinc-900/80 hover:bg-zinc-900/50'
                                }`}
                              >
                                {politeMatch && (
                                  <div className={`absolute top-2 flex items-center gap-1 text-[8px] font-mono uppercase bg-purple-500 text-white font-bold px-1.5 py-0.5 rounded shadow ${lang === 'ar' ? 'left-2' : 'right-2'}`}>
                                    <Check className="w-2.5 h-2.5" /> {t.matchTag}
                                  </div>
                                )}

                                {copiedCell === `${row.formName}-polite` && (
                                  <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-sm flex items-center justify-center z-10 transition-all duration-300">
                                    <span className="text-emerald-300 text-xs font-bold px-2 py-1 bg-emerald-950/80 rounded border border-emerald-500/50 shadow-lg flex items-center gap-1">
                                      <Check className="w-3 h-3" /> {t.copiedTag}
                                    </span>
                                  </div>
                                )}
                                
                                <div className={`absolute top-2 opacity-0 group-hover:opacity-100 transition-opacity ${lang === 'ar' ? 'right-2' : 'left-2'}`}>
                                  <span className="flex items-center gap-1 text-[9px] text-zinc-400 font-sans bg-zinc-800/80 px-1.5 py-0.5 rounded">
                                    <Copy className="w-2.5 h-2.5" /> {t.clickToCopy}
                                  </span>
                                </div>

                                <span className="text-lg font-bold font-jp-serif text-zinc-100 block tracking-wide text-center">
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
                    {t.noMatrixInfo}
                  </p>
                </div>
              )}
            </div>

            {query && (
              <div className="bg-indigo-950/10 border border-indigo-900/30 rounded-xl p-4 text-xs text-indigo-300/80 leading-relaxed flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-indigo-400 flex-shrink-0 animate-pulse" />
                <p className="font-sans">
                  <strong>{t.activeMatch}</strong> {t.activeMatchP1} <code className="bg-indigo-950/60 px-1.5 py-0.5 rounded text-indigo-300 text-[11px] border border-indigo-900/40">{query}</code> {t.activeMatchP2}
                </p>
              </div>
            )}

          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-900/80 bg-zinc-950/20 py-8 px-6 mt-12 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-sans">
            {t.footer1}
          </p>
          <p className="font-mono text-[10px] text-zinc-600">
            {t.footer2}
          </p>
        </div>
      </footer>
    </div>
  );
}
