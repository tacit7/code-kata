# LeetCode API Reference

This project uses LeetCode data only as metadata/reference input for seed kata
maintenance. LeetCode does not publish a stable public API contract for these
calls; the GraphQL shapes below are current as of 2026-08-10 and may change.

Do not bundle LeetCode's problem statements verbatim. Problem text, hints, and
editorial material are LeetCode-owned content. Use fetched statements as a
scratch reference, then write original kata descriptions and tests.

## Endpoint

Use LeetCode's GraphQL endpoint:

```text
POST https://leetcode.com/graphql
content-type: application/json
referer: https://leetcode.com/problem-list/<slug>/
```

Public list metadata usually works without auth. Private lists, user status,
submission status, and premium-only details may require browser cookies:

- `LEETCODE_SESSION`
- `csrftoken`
- `x-csrftoken: <csrftoken>`

Prefer unauthenticated calls for public lists. Do not commit cookies, session
tokens, downloaded HTML statements, or scratch API dumps.

## Public Custom/Favorite Lists

For URLs like:

```text
https://leetcode.com/problem-list/plakya4j/
```

the slug is `plakya4j`, and the useful GraphQL operation is
`favoriteQuestionList`.

```bash
curl -sS 'https://leetcode.com/graphql' \
  -H 'content-type: application/json' \
  -H 'referer: https://leetcode.com/problem-list/plakya4j/' \
  --data-binary '{
    "operationName": "favoriteQuestionList",
    "query": "query favoriteQuestionList($favoriteSlug: String!, $skip: Int!, $limit: Int!, $filtersV2: QuestionFilterInput) { favoriteQuestionList(favoriteSlug: $favoriteSlug, skip: $skip, limit: $limit, filtersV2: $filtersV2) { totalLength questions { id title titleSlug questionFrontendId difficulty paidOnly topicTags { name slug } status acRate } } }",
    "variables": {
      "favoriteSlug": "plakya4j",
      "skip": 0,
      "limit": 200,
      "filtersV2": { "filterCombineType": "ALL" }
    }
  }'
```

The `plakya4j` list currently returns `totalLength: 150`.

Important fields:

- `questionFrontendId`: visible LeetCode problem number, such as `"1"`.
- `title`: display title.
- `titleSlug`: canonical problem slug for URLs and detail queries.
- `difficulty`: current API values are uppercase, e.g. `EASY`, `MEDIUM`, `HARD`.
- `paidOnly`: whether the problem is premium.
- `topicTags[].slug`: useful for category/tag mapping.
- `status`: user-specific solve status when authenticated; often null/empty when unauthenticated.
- `acRate`: acceptance rate.

Use pagination for larger lists:

```json
{
  "favoriteSlug": "plakya4j",
  "skip": 0,
  "limit": 100,
  "filtersV2": { "filterCombineType": "ALL" }
}
```

Increment `skip` by `limit` until `skip + questions.length >= totalLength`.

## General Problem Set Lists

For built-in category-style lists, use `problemsetQuestionListV2` with
`categorySlug`. This is useful for the global problemset or official topic
lists, not custom favorite lists.

```bash
curl -sS 'https://leetcode.com/graphql' \
  -H 'content-type: application/json' \
  --data-binary '{
    "operationName": "problemsetQuestionListV2",
    "query": "query problemsetQuestionListV2($filters: QuestionFilterInput, $limit: Int, $searchKeyword: String, $skip: Int, $sortBy: QuestionSortByInput, $categorySlug: String) { problemsetQuestionListV2(filters: $filters, limit: $limit, searchKeyword: $searchKeyword, skip: $skip, sortBy: $sortBy, categorySlug: $categorySlug) { questions { id titleSlug title questionFrontendId paidOnly difficulty topicTags { name slug } status isInMyFavorites frequency acRate contestPoint } totalLength hasMore } }",
    "variables": {
      "skip": 0,
      "limit": 100,
      "categorySlug": "all-code-essentials",
      "filters": { "filterCombineType": "ALL" },
      "searchKeyword": "",
      "sortBy": { "sortField": "CUSTOM", "sortOrder": "ASCENDING" }
    }
  }'
```

Avoid requesting `finishedLength` for custom/problem-list contexts. LeetCode's
current schema may mark it non-null while returning null, which causes the whole
GraphQL response to fail.

## Problem Details

After collecting `titleSlug`, fetch individual problem details only as reference
material.

```bash
curl -sS 'https://leetcode.com/graphql' \
  -H 'content-type: application/json' \
  -H 'referer: https://leetcode.com/problems/two-sum/' \
  --data-binary '{
    "operationName": "questionData",
    "query": "query questionData($titleSlug: String!) { question(titleSlug: $titleSlug) { questionId questionFrontendId title titleSlug difficulty isPaidOnly content topicTags { name slug } hints codeSnippets { lang langSlug code } exampleTestcaseList metaData } }",
    "variables": { "titleSlug": "two-sum" }
  }'
```

Useful fields:

- `questionFrontendId`: display number.
- `questionId`: backend ID used by some submit/run APIs.
- `titleSlug`: canonical URL slug.
- `difficulty`, `isPaidOnly`, `topicTags`: metadata.
- `content`: HTML statement. Reference only; do not commit.
- `hints`: reference only; do not commit verbatim.
- `codeSnippets`: starter templates by language.
- `exampleTestcaseList`, `metaData`: useful when designing original tests.

Premium-only problems may omit statement content unless authenticated with a
premium account. Even when accessible, keep premium content out of this repo.

## Node Fetch Helper

For local one-off list snapshots, use Node 18+ `fetch`:

```js
const query = `
  query favoriteQuestionList(
    $favoriteSlug: String!
    $skip: Int!
    $limit: Int!
    $filtersV2: QuestionFilterInput
  ) {
    favoriteQuestionList(
      favoriteSlug: $favoriteSlug
      skip: $skip
      limit: $limit
      filtersV2: $filtersV2
    ) {
      totalLength
      questions {
        questionFrontendId
        title
        titleSlug
        difficulty
        paidOnly
        topicTags { name slug }
      }
    }
  }
`;

async function fetchFavoriteList(favoriteSlug) {
  const pageSize = 100;
  let skip = 0;
  let total = Infinity;
  const questions = [];

  while (skip < total) {
    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "referer": `https://leetcode.com/problem-list/${favoriteSlug}/`,
      },
      body: JSON.stringify({
        operationName: "favoriteQuestionList",
        query,
        variables: {
          favoriteSlug,
          skip,
          limit: pageSize,
          filtersV2: { filterCombineType: "ALL" },
        },
      }),
    });

    const payload = await response.json();
    if (payload.errors) throw new Error(JSON.stringify(payload.errors));

    const page = payload.data.favoriteQuestionList;
    total = page.totalLength;
    questions.push(...page.questions);
    skip += page.questions.length;
    if (page.questions.length === 0) break;
  }

  return questions;
}

const rows = await fetchFavoriteList("plakya4j");
console.log(rows.map((q) => `${q.questionFrontendId}. ${q.title}`));
```

## Mapping Into This App

When adding LeetCode-backed kata content:

1. Use `questionFrontendId` for `src/lib/leetcode-numbers.ts`.
2. Use `titleSlug` for `LEETCODE_SLUGS`.
3. Preserve list tags such as `neetcode` or `blind75` in kata seed metadata.
4. Convert LeetCode difficulty to this app's lowercase difficulty strings.
5. Write original `description`, `usage`, tests, and solutions.
6. Keep `solutionVariants` aligned across maintained language apps when the
   problem is language-agnostic.

Recommended scratch output shape:

```json
{
  "number": 1,
  "title": "Two Sum",
  "titleSlug": "two-sum",
  "difficulty": "easy",
  "paidOnly": false,
  "tags": ["array", "hash-table"]
}
```

## Operational Notes

- Keep requests throttled. For list metadata, one page at a time is enough.
- Prefer `limit: 100` for pagination; use a larger limit only for small known
  lists.
- Cloudflare may block direct HTML page fetches while GraphQL still works.
- GraphQL introspection may be disabled with `Query unavailable`; rely on known
  query shapes and small probes.
- If a query suddenly fails, first remove optional fields and retry. LeetCode
  occasionally changes field names or nullability.
- Do not depend on user-specific `status` for seed generation.
