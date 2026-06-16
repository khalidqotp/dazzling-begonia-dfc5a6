/**
 * Japanese Conjugation & NLP Engine
 * Handcrafted rules for Ichidan, Godan (all subdivisions), Irregulars, and i-Adjectives.
 */

export interface ConjugationRow {
  formName: string;
  casual: string;
  polite: string;
  description: string;
}

export interface WordEntry {
  sequence: number;
  term: string;
  reading: string;
  pos: string;
  score: number;
  tags: string;
  definitions: string[];
  notes?: string;
  forms?: string;
}

// Check verb/adjective type from POS space-separated string
export function isIchidan(pos: string): boolean {
  return pos.split(' ').some(p => p === 'v1');
}

export function isGodan(pos: string): { type: string } | null {
  const parts = pos.split(' ');
  const godanPart = parts.find(p => p.startsWith('v5'));
  if (godanPart) {
    return { type: godanPart };
  }
  return null;
}

export function isIrregular(pos: string, term: string): 'vk' | 'vs' | null {
  const parts = pos.split(' ');
  if (parts.includes('vk') || term === '来る' || term === 'くる') return 'vk';
  if (parts.includes('vs') || term.endsWith('する')) return 'vs';
  return null;
}

export function isIAdjective(pos: string): boolean {
  return pos.split(' ').some(p => p === 'adj-i');
}

// 5-row hiragana charts for Godan conjugations
// Map final syllable of dictionary form to its a, i, u, e, o row syllables
const GODAN_CHART: Record<string, { a: string; i: string; u: string; e: string; o: string }> = {
  'く': { a: 'か', i: 'き', u: 'く', e: 'け', o: 'こ' },
  'ぐ': { a: 'が', i: 'ぎ', u: 'ぐ', e: 'げ', o: 'ご' },
  'す': { a: 'さ', i: 'し', u: 'す', e: 'せ', o: 'そ' },
  'つ': { a: 'た', i: 'ち', u: 'つ', e: 'て', o: 'と' },
  'ぬ': { a: 'な', i: 'に', u: 'ぬ', e: 'ね', o: 'の' },
  'む': { a: 'ま', i: 'み', u: 'む', e: 'め', o: 'も' },
  'る': { a: 'ら', i: 'り', u: 'る', e: 'れ', o: 'ろ' },
  'う': { a: 'わ', i: 'い', u: 'う', e: 'え', o: 'お' },
  'ぶ': { a: 'ば', i: 'び', u: 'ぶ', e: 'べ', o: 'ぼ' },
};

// Helper to replace the last character of a string
function replaceLastChar(str: string, newChar: string): string {
  if (str.length === 0) return '';
  return str.slice(0, -1) + newChar;
}

/**
 * Forward Conjugation Generator
 * Generates Plain vs Polite side-by-side forms
 */
export function generateConjugationMatrix(entry: WordEntry): ConjugationRow[] {
  const { term, pos } = entry;
  const matrix: ConjugationRow[] = [];

  if (isIAdjective(pos)) {
    // I-Adjective Conjugation Rules
    if (!term.endsWith('い')) return [];
    const stem = term.slice(0, -1);

    // Present
    matrix.push({
      formName: 'Present / Dictionary',
      casual: term,
      polite: `${term}です`,
      description: 'Non-past form used for current/future states.'
    });

    // Negative
    matrix.push({
      formName: 'Negative',
      casual: `${stem}くない`,
      polite: `${stem}くありません / ${stem}くないです`,
      description: 'Negation ("is not ...").'
    });

    // Past
    matrix.push({
      formName: 'Past',
      casual: `${stem}かった`,
      polite: `${stem}かったです`,
      description: 'Past state ("was ...").'
    });

    // Te-form
    matrix.push({
      formName: 'Te-form (Conjunctive)',
      casual: `${stem}くて`,
      polite: `${stem}くてですね`,
      description: 'Connects adjectives or indicates a cause.'
    });

    // Conditional (-ba)
    matrix.push({
      formName: 'Conditional (-ba)',
      casual: `${stem}ければ`,
      polite: `${stem}かったら (Polite)`,
      description: 'Hypothetical ("if it is ...").'
    });

    return matrix;
  }

  // Verb processing
  const godan = isGodan(pos);
  const irregular = isIrregular(pos, term);
  const ichidan = isIchidan(pos);

  if (!godan && !irregular && !ichidan) {
    return []; // Not a recognized verb class
  }

  let stem = '';
  let politeStem = '';
  let negativeStem = '';
  let potentialStem = '';
  let passiveStem = '';
  let causativeStem = '';
  let imperative = '';
  let plainPast = '';
  let plainTe = '';

  if (irregular === 'vs') {
    // する or compound verb (e.g. 勉強する)
    const prefix = term.slice(0, -2); // Get everything before 'する'
    stem = prefix + 'し';
    politeStem = prefix + 'し';
    negativeStem = prefix + 'し';
    potentialStem = prefix + 'でき'; // potential of する is できる
    passiveStem = prefix + 'され';
    causativeStem = prefix + 'させ';
    imperative = prefix + 'しろ / せよ';
    plainPast = prefix + 'した';
    plainTe = prefix + 'して';

    matrix.push({
      formName: 'Present / Dictionary',
      casual: term,
      polite: `${politeStem}ます`,
      description: 'Non-past plain vs polite.'
    });

    matrix.push({
      formName: 'Negative',
      casual: `${negativeStem}ない`,
      polite: `${politeStem}ません`,
      description: 'Negative form ("does not do").'
    });

    matrix.push({
      formName: 'Past',
      casual: plainPast,
      polite: `${politeStem}ました`,
      description: 'Past form ("did").'
    });

    matrix.push({
      formName: 'Te-form (Conjunctive)',
      casual: plainTe,
      polite: `${politeStem}まして`,
      description: 'Connective form ("and do", "doing").'
    });

    matrix.push({
      formName: 'Conditional (-ba)',
      casual: `${prefix}すれば`,
      polite: `${politeStem}ましたら`,
      description: 'Conditional ("if ... does").'
    });

    matrix.push({
      formName: 'Potential',
      casual: `${potentialStem}る`,
      polite: `${potentialStem}ます`,
      description: 'Ability ("can do").'
    });

    matrix.push({
      formName: 'Passive',
      casual: `${passiveStem}る`,
      polite: `${passiveStem}ます`,
      description: 'Passive action ("is done").'
    });

    matrix.push({
      formName: 'Causative',
      casual: `${causativeStem}る`,
      polite: `${causativeStem}ます`,
      description: 'Causative ("make/let do").'
    });

    matrix.push({
      formName: 'Imperative',
      casual: imperative,
      polite: `${plainTe}ください`,
      description: 'Command or polite request.'
    });

    return matrix;
  }

  if (irregular === 'vk') {
    // 来る (くる)
    const isKanji = term.startsWith('来');
    const root = isKanji ? '来' : 'こ';
    
    politeStem = isKanji ? '来' : 'き'; // きます
    negativeStem = isKanji ? '来' : 'こ'; // こない
    potentialStem = isKanji ? '来られ' : 'こられ'; // こられる
    passiveStem = isKanji ? '来られ' : 'こられ'; // こられる
    causativeStem = isKanji ? '来させ' : 'こさせ'; // こさせる
    imperative = isKanji ? '来い' : 'こい';
    plainPast = isKanji ? '来た' : 'きた';
    plainTe = isKanji ? '来て' : 'きて';

    matrix.push({
      formName: 'Present / Dictionary',
      casual: term,
      polite: `${politeStem}ます`,
      description: 'Non-past plain vs polite ("come").'
    });

    matrix.push({
      formName: 'Negative',
      casual: `${negativeStem}ない`,
      polite: `${politeStem}ません`,
      description: 'Negative form ("does not come").'
    });

    matrix.push({
      formName: 'Past',
      casual: plainPast,
      polite: `${politeStem}ました`,
      description: 'Past form ("came").'
    });

    matrix.push({
      formName: 'Te-form (Conjunctive)',
      casual: plainTe,
      polite: `${politeStem}まして`,
      description: 'Connective form ("and come").'
    });

    matrix.push({
      formName: 'Conditional (-ba)',
      casual: isKanji ? '来れば' : 'くれば',
      polite: `${politeStem}ましたら`,
      description: 'Conditional ("if ... comes").'
    });

    matrix.push({
      formName: 'Potential',
      casual: `${potentialStem}る`,
      polite: `${potentialStem}ます`,
      description: 'Ability ("can come").'
    });

    matrix.push({
      formName: 'Passive',
      casual: `${passiveStem}る`,
      polite: `${passiveStem}ます`,
      description: 'Passive action ("is visited/affected").'
    });

    matrix.push({
      formName: 'Causative',
      casual: `${causativeStem}る`,
      polite: `${causativeStem}ます`,
      description: 'Causative ("make/let come").'
    });

    matrix.push({
      formName: 'Imperative',
      casual: imperative,
      polite: `${plainTe}ください`,
      description: 'Command or polite request.'
    });

    return matrix;
  }

  if (ichidan) {
    if (!term.endsWith('る')) return [];
    stem = term.slice(0, -1);
    politeStem = stem;
    negativeStem = stem;
    potentialStem = `${stem}られ`;
    passiveStem = `${stem}られ`;
    causativeStem = `${stem}させ`;
    imperative = `${stem}ろ`;
    plainPast = `${stem}た`;
    plainTe = `${stem}て`;

    matrix.push({
      formName: 'Present / Dictionary',
      casual: term,
      polite: `${politeStem}ます`,
      description: 'Non-past plain vs polite.'
    });

    matrix.push({
      formName: 'Negative',
      casual: `${negativeStem}ない`,
      polite: `${politeStem}ません`,
      description: 'Negative ("does not ...").'
    });

    matrix.push({
      formName: 'Past',
      casual: plainPast,
      polite: `${politeStem}ました`,
      description: 'Past form ("did ...").'
    });

    matrix.push({
      formName: 'Te-form (Conjunctive)',
      casual: plainTe,
      polite: `${politeStem}まして`,
      description: 'Connective ("and ...", "doing ...").'
    });

    matrix.push({
      formName: 'Conditional (-ba)',
      casual: `${stem}れば`,
      polite: `${politeStem}ましたら`,
      description: 'Hypothetical conditional ("if ...").'
    });

    matrix.push({
      formName: 'Potential',
      casual: `${potentialStem}る`,
      polite: `${potentialStem}ます`,
      description: 'Ability ("can do ...").'
    });

    matrix.push({
      formName: 'Passive',
      casual: `${passiveStem}る`,
      polite: `${passiveStem}ます`,
      description: 'Passive ("is done to").'
    });

    matrix.push({
      formName: 'Causative',
      casual: `${causativeStem}る`,
      polite: `${causativeStem}ます`,
      description: 'Causative ("makes/lets do ...").'
    });

    matrix.push({
      formName: 'Imperative',
      casual: imperative,
      polite: `${plainTe}ください`,
      description: 'Command or request.'
    });

    return matrix;
  }

  if (godan) {
    const finalChar = term.slice(-1);
    const row = GODAN_CHART[finalChar];
    if (!row) return [];

    const base = term.slice(0, -1);
    politeStem = base + row.i;
    negativeStem = base + row.a;
    potentialStem = base + row.e;
    passiveStem = base + row.a + 'れ';
    causativeStem = base + row.a + 'せ';
    imperative = base + row.e;

    // Past & Te-form logic depending on verb class
    if (term === '行く' || term === 'いく') {
      plainPast = base + 'った';
      plainTe = base + 'って';
    } else {
      switch (finalChar) {
        case 'く':
          plainPast = base + 'いた';
          plainTe = base + 'いて';
          break;
        case 'ぐ':
          plainPast = base + 'いだ';
          plainTe = base + 'いで';
          break;
        case 'す':
          plainPast = base + 'した';
          plainTe = base + 'して';
          break;
        case 'つ':
        case 'る':
        case 'う':
          plainPast = base + 'った';
          plainTe = base + 'って';
          break;
        case 'ぬ':
        case 'む':
        case 'ぶ':
          plainPast = base + 'んだ';
          plainTe = base + 'んで';
          break;
        default:
          plainPast = term;
          plainTe = term;
      }
    }

    matrix.push({
      formName: 'Present / Dictionary',
      casual: term,
      polite: `${politeStem}ます`,
      description: 'Non-past plain vs polite.'
    });

    matrix.push({
      formName: 'Negative',
      casual: `${negativeStem}ない`,
      polite: `${politeStem}ません`,
      description: 'Negative ("does not ...").'
    });

    matrix.push({
      formName: 'Past',
      casual: plainPast,
      polite: `${politeStem}ました`,
      description: 'Past form ("did ...").'
    });

    matrix.push({
      formName: 'Te-form (Conjunctive)',
      casual: plainTe,
      polite: `${politeStem}まして`,
      description: 'Connective ("and ...", "doing ...").'
    });

    matrix.push({
      formName: 'Conditional (-ba)',
      casual: `${base}${row.e}ば`,
      polite: `${politeStem}ましたら`,
      description: 'Hypothetical conditional ("if ...").'
    });

    matrix.push({
      formName: 'Potential',
      casual: `${potentialStem}る`,
      polite: `${potentialStem}ます`,
      description: 'Ability ("can do ...").'
    });

    matrix.push({
      formName: 'Passive',
      casual: `${passiveStem}る`,
      polite: `${passiveStem}ます`,
      description: 'Passive ("is done to").'
    });

    matrix.push({
      formName: 'Causative',
      casual: `${causativeStem}る`,
      polite: `${causativeStem}ます`,
      description: 'Causative ("makes/lets do ...").'
    });

    matrix.push({
      formName: 'Imperative',
      casual: imperative,
      polite: `${plainTe}ください`,
      description: 'Command or request.'
    });

    return matrix;
  }

  return [];
}

/**
 * Reverse Stemming Rules
 * Given a search term, maps suffixes back to possible lemmas.
 * Returns an array of objects containing the potential lemma and its expected POS class.
 */
export function reverseStem(query: string): Array<{ lemma: string; expectedPos: string }> {
  const candidates: Array<{ lemma: string; expectedPos: string }> = [];

  if (!query || query.trim() === '') return candidates;

  const q = query.trim();

  // 1. Exact match (it is its own lemma)
  candidates.push({ lemma: q, expectedPos: '' });

  // 2. Adjective rules
  if (q.endsWith('くない')) {
    candidates.push({ lemma: replaceLastChar(q.slice(0, -3), 'い'), expectedPos: 'adj-i' });
  }
  if (q.endsWith('かった')) {
    candidates.push({ lemma: replaceLastChar(q.slice(0, -3), 'い'), expectedPos: 'adj-i' });
  }
  if (q.endsWith('くて')) {
    candidates.push({ lemma: replaceLastChar(q.slice(0, -2), 'い'), expectedPos: 'adj-i' });
  }
  if (q.endsWith('ければ')) {
    candidates.push({ lemma: replaceLastChar(q.slice(0, -3), 'い'), expectedPos: 'adj-i' });
  }

  // 3. Verb polite rules (ます, ました, ません, ましょう)
  const politeEndings = ['ましょう', 'ましたら', 'ます', 'ました', 'ません', 'まして'];
  for (const end of politeEndings) {
    if (q.endsWith(end)) {
      const stem = q.slice(0, -end.length);
      
      // Ichidan Candidate
      candidates.push({ lemma: stem + 'る', expectedPos: 'v1' });

      // Irregular 'suru' candidate
      if (stem.endsWith('し')) {
        const nounBase = stem.slice(0, -1);
        candidates.push({ lemma: nounBase + 'する', expectedPos: 'vs' });
        // Could be v5s (話す -> 話します)
        candidates.push({ lemma: nounBase + 'す', expectedPos: 'v5s' });
      }

      // Irregular 'kuru' candidate
      if (stem === '来' || stem === 'き') {
        candidates.push({ lemma: '来る', expectedPos: 'vk' });
        candidates.push({ lemma: 'くる', expectedPos: 'vk' });
      }

      // Godan candidates based on i-row ending
      const last = stem.slice(-1);
      const base = stem.slice(0, -1);
      if (last === 'き') candidates.push({ lemma: base + 'く', expectedPos: 'v5k' });
      if (last === 'ぎ') candidates.push({ lemma: base + 'ぐ', expectedPos: 'v5g' });
      if (last === 'し') candidates.push({ lemma: base + 'す', expectedPos: 'v5s' });
      if (last === 'ち') candidates.push({ lemma: base + 'つ', expectedPos: 'v5t' });
      if (last === 'に') candidates.push({ lemma: base + 'ぬ', expectedPos: 'v5n' });
      if (last === 'み') candidates.push({ lemma: base + 'む', expectedPos: 'v5m' });
      if (last === 'り') candidates.push({ lemma: base + 'る', expectedPos: 'v5r' });
      if (last === 'い') candidates.push({ lemma: base + 'う', expectedPos: 'v5w' }); // v5w or v5u
      if (last === 'び') candidates.push({ lemma: base + 'ぶ', expectedPos: 'v5b' });
    }
  }

  // 4. Conditional "-ba" (ば) rules (行けば, 忘れれば)
  if (q.endsWith('ば')) {
    const withoutBa = q.slice(0, -1); // e.g. 行け, 忘れれ
    const last = withoutBa.slice(-1);
    const base = withoutBa.slice(0, -1);

    if (last === 'れ') {
      // Ichidan
      candidates.push({ lemma: base + 'る', expectedPos: 'v1' });
      // Godan v5r (走れば -> 走る)
      candidates.push({ lemma: base + 'る', expectedPos: 'v5r' });
    }
    if (last === 'け') candidates.push({ lemma: base + 'く', expectedPos: 'v5k' });
    if (last === 'げ') candidates.push({ lemma: base + 'ぐ', expectedPos: 'v5g' });
    if (last === 'せ') candidates.push({ lemma: base + 'す', expectedPos: 'v5s' });
    if (last === 'て') candidates.push({ lemma: base + 'つ', expectedPos: 'v5t' });
    if (last === 'ね') candidates.push({ lemma: base + 'ぬ', expectedPos: 'v5n' });
    if (last === 'め') candidates.push({ lemma: base + 'む', expectedPos: 'v5m' });
    if (last === 'え') candidates.push({ lemma: base + 'う', expectedPos: 'v5w' });
    if (last === 'べ') candidates.push({ lemma: base + 'ぶ', expectedPos: 'v5b' });
  }

  // 5. Negative "ない" rules
  if (q.endsWith('ない')) {
    const withoutNai = q.slice(0, -2); // e.g., 行かな, 忘れ, し, こ
    
    // Ichidan
    candidates.push({ lemma: withoutNai + 'る', expectedPos: 'v1' });

    // Suru
    if (withoutNai.endsWith('し') || withoutNai === 'し') {
      const nounBase = withoutNai === 'し' ? '' : withoutNai.slice(0, -1);
      candidates.push({ lemma: nounBase + 'する', expectedPos: 'vs' });
      candidates.push({ lemma: nounBase + 'す', expectedPos: 'v5s' });
    }

    // Kuru
    if (withoutNai === 'こ' || withoutNai === '来') {
      candidates.push({ lemma: '来る', expectedPos: 'vk' });
      candidates.push({ lemma: 'くる', expectedPos: 'vk' });
    }

    // Godan ending in a-row
    const last = withoutNai.slice(-1);
    const base = withoutNai.slice(0, -1);
    if (last === 'か') candidates.push({ lemma: base + 'く', expectedPos: 'v5k' });
    if (last === 'が') candidates.push({ lemma: base + 'ぐ', expectedPos: 'v5g' });
    if (last === 'さ') candidates.push({ lemma: base + 'す', expectedPos: 'v5s' });
    if (last === 'た') candidates.push({ lemma: base + 'つ', expectedPos: 'v5t' });
    if (last === 'な') candidates.push({ lemma: base + 'ぬ', expectedPos: 'v5n' });
    if (last === 'ま') candidates.push({ lemma: base + 'む', expectedPos: 'v5m' });
    if (last === 'ら') candidates.push({ lemma: base + 'る', expectedPos: 'v5r' });
    if (last === 'わ') candidates.push({ lemma: base + 'う', expectedPos: 'v5w' });
    if (last === 'ば') candidates.push({ lemma: base + 'ぶ', expectedPos: 'v5b' });
  }

  // 6. Past "た" / "だ" rules
  if (q.endsWith('た') || q.endsWith('だ')) {
    const isDa = q.endsWith('だ');
    const stem = q.slice(0, -1); // without た/だ

    // Ichidan past (e.g. 忘れた -> 忘れる)
    if (!isDa) {
      candidates.push({ lemma: stem + 'る', expectedPos: 'v1' });
      // Irregular vk past (来た -> 来る)
      if (stem === '来' || stem === 'き') {
        candidates.push({ lemma: '来る', expectedPos: 'vk' });
        candidates.push({ lemma: 'くる', expectedPos: 'vk' });
      }
      // Irregular vs past (した -> する)
      if (stem.endsWith('し') || stem === 'し') {
        const nounBase = stem === 'し' ? '' : stem.slice(0, -1);
        candidates.push({ lemma: nounBase + 'する', expectedPos: 'vs' });
        candidates.push({ lemma: nounBase + 'す', expectedPos: 'v5s' });
      }
    }

    // Double-consonant past "った"
    if (q.endsWith('った')) {
      const base = q.slice(0, -2);
      // Exception: 行った -> 行く
      if (q === '行った' || q === 'いった') {
        candidates.push({ lemma: '行く', expectedPos: 'v5k' });
        candidates.push({ lemma: 'いく', expectedPos: 'v5k' });
      }
      candidates.push({ lemma: base + 'う', expectedPos: 'v5w' });
      candidates.push({ lemma: base + 'つ', expectedPos: 'v5t' });
      candidates.push({ lemma: base + 'る', expectedPos: 'v5r' });
    }

    // Nasal-consonant past "んだ" (for v5b, v5m, v5n)
    if (q.endsWith('んだ')) {
      const base = q.slice(0, -2);
      candidates.push({ lemma: base + 'ぬ', expectedPos: 'v5n' });
      candidates.push({ lemma: base + 'む', expectedPos: 'v5m' });
      candidates.push({ lemma: base + 'ぶ', expectedPos: 'v5b' });
    }

    // "いた" or "いだ"
    if (q.endsWith('いた')) {
      const base = q.slice(0, -2);
      candidates.push({ lemma: base + 'く', expectedPos: 'v5k' });
    }
    if (q.endsWith('いだ')) {
      const base = q.slice(0, -2);
      candidates.push({ lemma: base + 'ぐ', expectedPos: 'v5g' });
    }
  }

  // 7. Te-form "て" / "で" rules
  if (q.endsWith('て') || q.endsWith('で')) {
    const isDe = q.endsWith('で');
    const stem = q.slice(0, -1);

    // Ichidan / vk / vs
    if (!isDe) {
      candidates.push({ lemma: stem + 'る', expectedPos: 'v1' });
      if (stem === '来' || stem === 'き') {
        candidates.push({ lemma: '来る', expectedPos: 'vk' });
        candidates.push({ lemma: 'くる', expectedPos: 'vk' });
      }
      if (stem.endsWith('し') || stem === 'し') {
        const nounBase = stem === 'し' ? '' : stem.slice(0, -1);
        candidates.push({ lemma: nounBase + 'する', expectedPos: 'vs' });
        candidates.push({ lemma: nounBase + 'す', expectedPos: 'v5s' });
      }
    }

    if (q.endsWith('って')) {
      const base = q.slice(0, -2);
      if (q === '行って' || q === 'いって') {
        candidates.push({ lemma: '行く', expectedPos: 'v5k' });
        candidates.push({ lemma: 'いく', expectedPos: 'v5k' });
      }
      candidates.push({ lemma: base + 'う', expectedPos: 'v5w' });
      candidates.push({ lemma: base + 'つ', expectedPos: 'v5t' });
      candidates.push({ lemma: base + 'る', expectedPos: 'v5r' });
    }

    if (q.endsWith('んで')) {
      const base = q.slice(0, -2);
      candidates.push({ lemma: base + 'ぬ', expectedPos: 'v5n' });
      candidates.push({ lemma: base + 'む', expectedPos: 'v5m' });
      candidates.push({ lemma: base + 'ぶ', expectedPos: 'v5b' });
    }

    if (q.endsWith('いて')) {
      const base = q.slice(0, -2);
      candidates.push({ lemma: base + 'く', expectedPos: 'v5k' });
    }
    if (q.endsWith('いで')) {
      const base = q.slice(0, -2);
      candidates.push({ lemma: base + 'ぐ', expectedPos: 'v5g' });
    }
  }

  // 8. Potential & passive forms (e.g. 行ける, 話せる, 待てる, 買える, 忘れる)
  if (q.endsWith('える') || q.endsWith('える')) {
    const base = q.slice(0, -2);
    // Potential Godan
    candidates.push({ lemma: base + 'う', expectedPos: 'v5w' });
  }

  // Deduplicate candidates, preserving order
  const seen = new Set<string>();
  return candidates.filter(c => {
    const key = `${c.lemma}:${c.expectedPos}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
