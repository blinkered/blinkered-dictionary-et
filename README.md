# Blinkered dictionary: Estonian

The Estonian word list, and the evidence for every word in it.

Built by [`blinkered-attestation`](https://github.com/blinkered/blinkered-attestation). The rule,
the evidence format and the reasoning live there; what lives here is Estonian.

**100,784 of 589,422 candidates proved: 17.1%**, across 16 independent
families, 15 of which a stranger could check by fetching.

## What is in this repository

```
sources.mjs        which collections attest Estonian, and why those
attestations/      the evidence: every candidate, what saw it, and where
words.txt          what survived, in Blinkered's own format
dropped.tsv        what did not, and how close it came
SATURATION.md      what each family was worth, measured from the evidence
COLLECTIONS.md     every collection read, and where to get it again
status.json        the numbers, whether this ships, and what the list is under
```

The evidence is a **directory** rather than one file because this language's runs past the fifty
megabytes GitHub warns at. Each shard is a complete, independently valid evidence file with its
own header and digest; `readEvidence` puts them back together and refuses a repository that
somehow holds both layouts. Nothing reads them by globbing.

`.cache/` holds the downloaded collections and is not tracked. Everything here is regenerable
with `pnpm build`.

## Where the words come from

Candidates come from Blinkered's Estonian list, which lives in
[`blinkered-attestation/candidates/et`](https://github.com/blinkered/blinkered-attestation/tree/main/candidates/et).
The dictionaries that built it are demoted to **proposing words worth looking up**. What earns a
word its place here is evidence that it occurs in the world: three independent collections, each
recorded with a locator somebody else can fetch.

`SATURATION.md` says what each family was worth. `COLLECTIONS.md` names every collection read and
where to get it again, which is what makes the downloads disposable.

## What is particular to Estonian

**The candidate list is 589,422 words, and that is the whole story of the number.** Estonian has
fourteen cases and productive compounding, and its Hunspell dictionary generates the forms. The
Wikipedia sees 291,995 of them and Leipzig 105,493; after that every family is small, so most words
stop at two. 88,578 of the dropped words are one family short.

**The ready-made families ran out at 2.8%.** Built from Wikipedia, Leipzig, Tatoeba (a few thousand
sentences), a New Testament, one Gutenberg text and a near-empty Archive shelf, the list kept
16,311 words. A harvest of ten Estonian publishers took it to 12.9%, and 117 Archive books to
17.1%. Among the publishers the literary and cultural weeklies were worth the most, as they have
been elsewhere: *Looming* and *Sirp* rescue 14,000 words between them, the news sites a thousand or
so each. Each publisher is its own family, which is why this repository has sixteen. `searched.tsv`
records counts per page, never text.

**The Archive shelf is queried by ISO code.** Among the most downloaded items the Archive files
under the English name "Estonian", none of the top fifteen was Estonian; they are Hindi, Urdu and
Arabic uploads. `language:est` finds University of Toronto scans and Estonian literature, and also
a good deal of other languages' uploads. The shelf was weeded by function words, which left 117
books of 265 fetched, and a dictionary is removed by name: a dictionary prints the candidate list
back as headwords, which is not usage.

**Š and Ž do not appear in the shipped list, by design twice over.** The engine folds them onto S
and Z because they occur only in borrowings and are not tiles. The candidate list carries their
spelling as a display form (ATASEE shown as ATAŠEE, MATSI as MATŠI), and the shared build writes
only the key, so the display form is dropped here as it is in every language. The words ship:
ATASEE and MATSI are both in `words.txt`. Every tile of the Estonian alphabet spells something
except **Q**. That is not a fold bug: the 34 candidates containing it are names and borrowings
(TEQUILAT, ALBUQUERQUEST) and none reached three families. X ships only in names (FOXI, NIXONI).

**Some Wikipedia markup reads as words.** NAME is seen 520,861 times in the Wikipedia, which is the
`name=` of citation tags rather than Estonian, and PAGES 2,231 times in Wikisource, which is its
`<pages>` transclusion tag. Both still reached three families (a book and a harvested page each),
and both rank far higher than any Estonian reader would put them. The fix belongs in the shared
Wikipedia reader.

**No FineWeb-2.** A Common Crawl family is the one collection big enough to move a list this size,
and its 4.8GB shard was not fetched because the disk was nearly full. It is declared in
`sources.mjs` and skipped when absent.

Of the 488,638 dropped candidates, 88,578 were seen by two families and are one short;
140,845 were seen by one, and 259,215 by none at all.

## Rebuilding

```
pnpm install
pnpm build        # reads whatever collections are in .cache/raw, reuses the record for the rest
pnpm conform      # the list says only what the evidence supports
pnpm saturation   # recomputes the curve and status.json
```

A collection that is not on disk is skipped with a warning and its recorded testimony is reused,
so a rebuild after more books arrive is short rather than a re-read of everything.

## Before this ships

Nobody has played this list yet. `status.json` says `"ships": "pending"`, and it stays that way
until somebody has checked the boards it deals against Blinkered's usability floor and decided.
`COMMON_CUT` in `sources.mjs` is carried over from Blinkered's old calibration against a
differently sized list, and has to be re-measured before this list reaches the game.

## Licensing

Three kinds of thing live here and they do not share terms. The distinction is the project: a
licence that claimed more than we can support would undo the argument the evidence is here to
make. [NOTICE](NOTICE) is the authority; this is the summary.

| | terms | what |
| --- | --- | --- |
| **Code and docs** | [Apache-2.0](LICENSE) | `build.mjs`, `sources.mjs`, `harvest.mjs`, `conform.mjs`, `saturation.mjs`, and the Markdown |
| **The list and its evidence** | [CC0-1.0](https://creativecommons.org/publicdomain/zero/1.0/) | `words.txt`, the evidence, `status.json`, `SATURATION.md`, `COLLECTIONS.md`, `searched.tsv` |
| **The words we could not prove** | `LGPL-2.1-or-later` | `dropped.tsv`; **not ours to license** |

**Why the list is CC0.** A word ships because three independent collections of text were found to
contain it. The record of which collections, and where in them, is a statement of fact about those
texts rather than a copy of them, and nothing a licence governs was taken from the dictionary that
proposed the candidates.

**Why `dropped.tsv` is not.** It is the candidates that failed, and a candidate that failed is a
word we have nothing to say about except that somebody's dictionary proposed it. That makes the
file a subset of that dictionary and it carries that dictionary's terms: here `LGPL-2.1-or-later`.
