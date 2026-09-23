/**
 * The collections that attest Estonian, and where each comes from.
 *
 * Estonian has the largest candidate list in this batch, 589,422 words, because a Hunspell
 * dictionary for a language with fourteen cases generates every one of them. Its collections are
 * modest: a 300MB Wikipedia, Leipzig news crawls, a New Testament, a Tatoeba of a few thousand
 * sentences and a single Gutenberg text. Expect a low share and a drop list of forms nobody wrote.
 *
 * Every URL here was probed before it was written down. A collection that 404s does not fail
 * loudly; the build skips it with a warning and reports a healthy number over fewer families.
 */
import { createReadStream, existsSync, readFileSync, readdirSync } from 'node:fs'
import { createInterface } from 'node:readline'
import {
  fileDocuments,
  fineweb2Documents,
  gutenbergBody,
  harvestDocuments,
  leipzigLocators,
  leipzigSentences,
  tatoebaDocuments,
  verseDocuments,
  wikiDocuments,
} from '@blinkered/attestation'

export const LANGUAGE = 'et'

const CACHE = new URL('.cache/raw/', import.meta.url).pathname

/** A Leipzig package, with its sentence-to-URL index resolved up front. */
function leipzig(pkg) {
  const base = `${CACHE}${pkg}/${pkg}`
  // A few crawled URLs contain a literal space, and the evidence format spends spaces as
  // separators, so the build refuses them. Percent-encoded they name the same page.
  const locators = leipzigLocators(
    readFileSync(`${base}-inv_so.txt`, 'utf8'),
    readFileSync(`${base}-sources.txt`, 'utf8').replaceAll(' ', '%20'),
  )
  const lines = createInterface({
    input: createReadStream(`${base}-sentences.txt`),
    crlfDelay: Infinity,
  })
  return leipzigSentences(lines, locators)
}

// News only. The Leipzig Wikipedia packages are deliberately absent: they are Wikipedia text
// wearing a Leipzig label, so including one would corroborate `wiki:et` while looking like
// another family. The newest 1M Estonian package is a 2017 news crawl; 2022 news is 300K.
const LEIPZIG = ['est_newscrawl_2017_1M', 'est_news_2022_300K']

// The ISO code only. Among the most downloaded items the Archive files under the English name
// "Estonian", none of the top fifteen was Estonian: they are Hindi, Urdu and Arabic uploads, and
// the name is apparently what an upload form offers by default. `est` is chosen on purpose.
const ARCHIVE_QUERY = 'language:est AND mediatype:texts'

const ALL = [
  {
    id: 'wiki:et',
    what: 'Estonian Wikipedia; modern encyclopedic prose',
    needs: `${CACHE}etwiki.xml.bz2`,
    documents: () => wikiDocuments(`${CACHE}etwiki.xml.bz2`),
  },
  {
    id: 'wikisource:et',
    what: 'Estonian Wikisource; same Wikimedia family, so it corroborates rather than counts',
    needs: `${CACHE}etwikisource.xml.bz2`,
    documents: () => wikiDocuments(`${CACHE}etwikisource.xml.bz2`),
  },
  ...LEIPZIG.map((pkg) => ({
    id: `lz:${pkg}`,
    from: `https://downloads.wortschatz-leipzig.de/corpora/${pkg}.tar.gz`,
    what: `Leipzig ${pkg}; modern news, cited by the page each sentence came from`,
    needs: `${CACHE}${pkg}`,
    documents: () => leipzig(pkg),
  })),
  {
    id: 'tat',
    from: 'https://downloads.tatoeba.org/exports/per_language/est/est_sentences.tsv.bz2',
    what: 'Tatoeba Estonian; contemporary and conversational',
    needs: `${CACHE}est_sentences.tsv`,
    documents: () => tatoebaDocuments(`${CACHE}est_sentences.tsv`),
  },
  {
    id: 'fw2',
    from: 'https://huggingface.co/datasets/HuggingFaceFW/fineweb-2/resolve/main/data/ekk_Latn/train/000_00000.parquet',
    what: 'FineWeb-2 Estonian; a web crawl nobody here made',
    needs: `${CACHE}fineweb2-ekk.parquet`,
    documents: () => fineweb2Documents(`${CACHE}fineweb2-ekk.parquet`),
  },
  {
    id: 'gut',
    from: 'https://www.gutenberg.org/cache/epub/feeds/pg_catalog.csv',
    what: 'Project Gutenberg Estonian',
    needs: `${CACHE}gutenberg-et`,
    documents: () => {
      const dir = `${CACHE}gutenberg-et`
      const books = readdirSync(dir)
        .filter((file) => file.endsWith('.txt'))
        .map((file) => ({ locator: file.replace('.txt', ''), path: `${dir}/${file}` }))
      return fileDocuments(books, async (path) => gutenbergBody(readFileSync(path, 'utf8')))
    },
  },
  {
    id: 'ebible:ekk',
    from: 'https://ebible.org/Scriptures/ekk_vpl.zip',
    what: 'Pühakiri kaasaegses eesti keeles, a modern Estonian New Testament; a family nothing else here belongs to',
    needs: `${CACHE}ebible-ekk/ekk_vpl.txt`,
    documents: () => verseDocuments(`${CACHE}ebible-ekk/ekk_vpl.txt`),
  },
  {
    id: 'ia',
    // Scanned books are OCR, and OCR fails in a way that looks like text. Clean Gutenberg scores
    // a median 52% known words and never below 36%; below this floor a book is not legible
    // enough to attest anything.
    legible: 0.35,
    what: 'Internet Archive Estonian books; literature, and the register a newspaper never reaches',
    needs: `${CACHE}archive-et`,
    from: `https://archive.org/search?query=${encodeURIComponent(ARCHIVE_QUERY)}`,
    documents: () => {
      const dir = `${CACHE}archive-et`
      // A locator names the text, not the item: the catalogue page holds no word of the book.
      const named = new Map(
        readFileSync(`${dir}/files.tsv`, 'utf8')
          .split('\n')
          .filter(Boolean)
          .map((line) => line.split('\t')),
      )
      const books = readdirSync(dir)
        .filter((file) => file.endsWith('.txt'))
        .map((file) => file.replace('.txt', ''))
        .filter((id) => named.has(id))
        // Percent-encoded: two thirds of Archive filenames contain spaces, and the evidence
        // format spends spaces as separators.
        .map((id) => ({
          locator: `${id}/${encodeURIComponent(named.get(id))}`,
          path: `${dir}/${id}.txt`,
        }))
      return fileDocuments(books, async (path) => readFileSync(path, 'utf8'))
    },
  },
]

export const SOURCES = ALL.filter((source) => {
  if (source.needs === undefined || existsSync(source.needs)) return true
  process.stderr.write(`  (skipping ${source.id}: ${source.needs} is not in .cache/raw)\n`)
  return false
})

/**
 * Estonian publishers, for the harvest.
 *
 * Chosen because they publish in Estonian rather than because they are large. A harvester reads
 * whatever it fetches and has no idea what language it is in, so a domain that publishes mostly
 * in another language would attest that language's words against these candidates.
 */
export const DOMAINS = [
  'err.ee', 'postimees.ee', 'delfi.ee', 'ohtuleht.ee', 'aripaev.ee',
  'sirp.ee', 'looming.ee', 'eestinaine.ee', 'lounaeestlane.ee', 'pealinn.ee',
]

export const HARVEST = existsSync(new URL('searched.tsv', import.meta.url).pathname)
  ? () => harvestDocuments(new URL('searched.tsv', import.meta.url).pathname)
  : undefined

/** Carried over from Blinkered's calibration; must be re-measured before anything ships. */
export const COMMON_CUT = 17000
