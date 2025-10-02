//
// PUBLIC_INTERFACE
// buildNotesQuery: Builds a Supabase query for the 'notes' table with search, filters, sorting, and pagination.
//
/**
 * PUBLIC_INTERFACE
 * buildNotesQuery configures a Supabase query for the 'notes' table.
 * Options:
 * - search: string to search across title, description, tags
 * - subject: filter by subject (exact match)
 * - level: filter by level/grade (exact match)
 * - sortBy: 'newest' | 'popular' | 'trending' | 'title'
 * - limit: number of records to fetch
 * - offset: starting offset (for pagination)
 *
 * Note: This function mutates and returns the provided query builder instance.
 */
export function buildNotesQuery(supabase, {
  search = '',
  subject = '',
  level = '',
  sortBy = 'newest',
  limit = 20,
  offset = 0,
} = {}) {
  const qb = supabase
    .from('notes')
    .select('*', { count: 'exact' });

  // Basic filters
  if (subject) qb.eq('subject', subject);
  if (level) qb.eq('level', level);

  // Search across a few text columns
  if (search && search.trim().length > 0) {
    const term = `%${search.trim()}%`;
    // Use ilike for case-insensitive pattern search
    qb.or([
      `title.ilike.${term}`,
      `description.ilike.${term}`,
      `tags.ilike.${term}`
    ].join(','));
  }

  // Sorting
  switch (sortBy) {
    case 'popular':
      // Sort by likes then downloads then created_at
      qb.order('likes', { ascending: false, nullsFirst: false })
        .order('downloads', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false, nullsFirst: false });
      break;
    case 'trending':
      // We'll compute a trending_score in the hook. Default sort by created_at desc here.
      qb.order('created_at', { ascending: false, nullsFirst: false });
      break;
    case 'title':
      qb.order('title', { ascending: true, nullsFirst: true });
      break;
    case 'newest':
    default:
      qb.order('created_at', { ascending: false, nullsFirst: false });
      break;
  }

  // Pagination
  if (typeof limit === 'number') {
    const from = offset || 0;
    const to = from + Math.max(0, limit) - 1;
    qb.range(from, to);
  }

  return qb;
}

/**
 * PUBLIC_INTERFACE
 * calculateTrendingScore computes a simple trending score with time decay.
 * We weight interactions (likes, downloads, bookmarks) and apply decay by age in hours.
 * score = (likes*4 + downloads*2 + bookmarks*3) / (1 + ageHours/24)
 */
export function calculateTrendingScore(note) {
  // Defensive defaults
  const likes = Number(note.likes || 0);
  const downloads = Number(note.downloads || 0);
  const bookmarks = Number(note.bookmarks || 0);
  const createdAt = note.created_at ? new Date(note.created_at) : new Date();

  const ageMs = Date.now() - createdAt.getTime();
  const ageHours = Math.max(1, ageMs / (1000 * 60 * 60));

  const base = likes * 4 + downloads * 2 + bookmarks * 3;
  const decay = 1 + (ageHours / 24); // decay over days
  const score = base / decay;

  return score;
}

/**
 * PUBLIC_INTERFACE
 * sortNotesByTrending sorts a list of notes in-place by the calculated trending score desc.
 */
export function sortNotesByTrending(notes) {
  return notes.sort((a, b) => {
    const sa = calculateTrendingScore(a);
    const sb = calculateTrendingScore(b);
    return sb - sa;
  });
}
