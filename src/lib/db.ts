import initSqlJs, { Database } from 'sql.js';
// 1. اطلب من Vite جلب مسار ملف الـ WASM مباشرة من الـ node_modules كـ URL
import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url'; 
import { WordEntry, reverseStem } from './conjugation';

let dbInstance: Database | null = null;

/**
 * Initializes the WASM sql.js engine and loads the dictionary database.
 */
export async function initDatabase(): Promise<Database> {
  if (dbInstance) return dbInstance;

  try {
    // 2. اجعل الخيار locateFile يعود بمسار الـ URL الذي وفره Vite تلقائياً
    const SQL = await initSqlJs({
      locateFile: () => sqlWasmUrl,
    });

    const response = await fetch('/dictionary.sqlite');
    if (!response.ok) {
      throw new Error(`Failed to fetch /dictionary.sqlite: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    dbInstance = new SQL.Database(new Uint8Array(buffer));
    return dbInstance;
  } catch (err) {
    console.error('Database initialization failed:', err);
    throw err;
  }
}

/**
 * Normalizes query and performs search.
 * It does the following:
 * 1. Checks for exact or prefix matches in the database.
 * 2. If nothing is found or alongside it, runs reverse-stemming on the query to find candidates and searches for those.
 * 3. Returns a ranked list of matched WordEntry items.
 */
export async function searchDictionary(db: Database, query: string): Promise<WordEntry[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    // If empty query, return top 20 popular words
    return executeQuery(db, `SELECT * FROM entries ORDER BY score DESC LIMIT 20`);
  }

  // 1. Get reverse-stemming candidates
  const candidates = reverseStem(trimmed);
  
  // 2. Formulate sql queries
  // We'll search for exact matches on term or reading, as well as prefix matches.
  // We also search for any matches on the candidate lemmas.
  
  const candidateLemmas = candidates.map(c => c.lemma);
  
  let results: WordEntry[] = [];
  
  // Query 1: Exact matches first
  const exactResults = executeQuery(
    db, 
    `SELECT * FROM entries WHERE term = ? OR reading = ?`, 
    [trimmed, trimmed]
  );
  results.push(...exactResults);

  // Query 2: Candidate Lemmas from reverse stemming
  if (candidateLemmas.length > 0) {
    const placeholders = candidateLemmas.map(() => '?').join(',');
    const lemmaResults = executeQuery(
      db,
      `SELECT * FROM entries WHERE term IN (${placeholders}) OR reading IN (${placeholders})`,
      [...candidateLemmas, ...candidateLemmas]
    );
    results.push(...lemmaResults);
  }

  // Query 3: Prefix/substring matching for autocomplete
  const wildcardQuery = `%${trimmed}%`;
  const prefixResults = executeQuery(
    db,
    `SELECT * FROM entries WHERE term LIKE ? OR reading LIKE ? OR definitions LIKE ? ORDER BY score DESC LIMIT 15`,
    [wildcardQuery, wildcardQuery, wildcardQuery]
  );
  results.push(...prefixResults);

  // Deduplicate results based on sequence ID, maintaining ranking order
  const seenIds = new Set<number>();
  const uniqueResults: WordEntry[] = [];

  for (const entry of results) {
    if (!seenIds.has(entry.sequence)) {
      seenIds.add(entry.sequence);
      uniqueResults.push(entry);
    }
  }

  // Sort: Exact matching term first, then higher score
  return uniqueResults.sort((a, b) => {
    const aExact = a.term === trimmed || a.reading === trimmed;
    const bExact = b.term === trimmed || b.reading === trimmed;
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    return b.score - a.score;
  });
}

/**
 * Safe SQL Query Executor with Type Mapping
 */
function executeQuery(db: Database, sql: string, params: any[] = []): WordEntry[] {
  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);

    const rows: WordEntry[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      
      // Safe parse definitions
      let definitions: string[] = [];
      try {
        if (typeof row.definitions === 'string') {
          definitions = JSON.parse(row.definitions);
        }
      } catch (e) {
        definitions = [row.definitions as string];
      }

      rows.push({
        sequence: Number(row.sequence),
        term: String(row.term),
        reading: String(row.reading),
        pos: String(row.pos),
        score: Number(row.score),
        tags: String(row.tags || ''),
        definitions,
        notes: typeof row.notes === 'string' ? row.notes : undefined,
        forms: typeof row.forms === 'string' ? row.forms : undefined,
      });
    }
    stmt.free();
    return rows;
  } catch (err) {
    console.error('SQL query execution failed:', err);
    return [];
  }
}
