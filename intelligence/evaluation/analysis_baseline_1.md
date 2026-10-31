# First Evaluation: Baseline Analysis

## Purpose and evidence

I used this first evaluation to establish a starting point for the Financial Copilot. The ten questions cover monthly summaries, category spending, transaction retrieval, Savings interpretation, month-to-month comparisons, clarification, out-of-scope requests and web search.

The analysis uses the recorded answers, tool arguments, tool outputs and Jev ratings in [baseline_results_1.json](baseline_results_1.json), together with the expectations in [small_eval_dataset.json](small_eval_dataset.json). Financial calculations below were checked against the saved tool outputs. The web-search case was reviewed against its captured search results; this review did not independently verify live inflation data.

## Run configuration

| Setting | Recorded value |
| --- | --- |
| Evaluation ID | `001` |
| Evaluation date | 2026-10-31 |
| Dataset | `small_eval_dataset.json` |
| Number of questions | 10 |
| Financial Copilot model | `qwen3.5:9b` |
| Context window (`num_ctx`) | 16,384 tokens |
| Temperature | `0.0` |
| Reasoning | Enabled |
| Answer-quality judge | Jev |

These model settings describe the Financial Copilot, not the Jev judge. The baseline metadata does not record a judge model version, prompt revision, source-code commit or database snapshot identifier.

Each case starts an independent conversation. Tool callbacks record executed tools, arguments, outputs and errors. An algorithm compares tool names and call counts with the dataset expectations. Jev receives the question, answer, expected context, route and recorded tool evidence, and assigns an answer-quality rating.

## Recorded results

| Measurement | Result |
| --- | --- |
| Jev: `full answer` | 8/10 (80%) |
| Jev: `partly answer` | 1/10 (10%) |
| Jev: `wrong answer` | 1/10 (10%) |
| Exact match of expected tool names and call counts | 9/10 (90%) |
| Routes matching the dataset expectations, checked manually | 10/10 |
| Recorded case-level errors | 0 |
| Recorded tool errors | 0 |

The 80% figure is the proportion of these ten answers rated `full answer` by Jev. It is not an estimate of general agent accuracy. Tool matching measures names and counts only; it does not establish argument correctness, successful reasoning or factual accuracy.

| Case | Task | Recorded Jev rating | Exact tool match |
| --- | --- | --- | --- |
| `se-1` | September 2026 income, expenses and monthly balance | `full answer` | Yes |
| `se-2` | August 2025 grocery spending | `wrong answer` | No |
| `se-3` | Three largest expense categories in July 2026 | `full answer` | Yes |
| `se-4` | Five most recent expenses in September 2026 | `full answer` | Yes |
| `se-5` | Five most recent grocery expenses in May 2026 | `full answer` | Yes |
| `se-6` | July 2025 balance before and after Savings | `full answer` | Yes |
| `se-7` | July versus August 2026 income and expenses | `full answer` | Yes |
| `se-8` | Ambiguous request without conversation history | `full answer` | Yes; no tools expected |
| `se-9` | Out-of-scope cooking question | `full answer` | Yes; no tools expected |
| `se-10` | Latest euro-area inflation with official sources | `partly answer` | Yes |

## Detailed finding: `se-2`

**Question:** “How much did I spend on groceries in August 2025?”

The expected approach was one `get_monthly_summary(year=2025, month=8)` call, followed by reading the Groceries total from `expenses_by_category`.

Instead, the agent called `list_categories`, then `search_transactions` for August 2025 with the Groceries UUID, `transaction_type=expense` and `limit=50`. The result contained 21 EUR transactions and reported `has_more=false`. The agent returned the correct overall total of **EUR 652.33**, but also supplied an unrequested merchant breakdown with several incorrect amounts.

| Merchant | Agent's reported amount (EUR) | Total from saved transactions (EUR) |
| --- | --- | --- |
| REWE | 348.79 | 313.23 |
| Lidl | 178.55 | 170.52 |
| EDEKA | 90.33 | 90.33 |
| Neighbourhood Market | 106.77 | 50.95 |
| Daily Bread Bakery | 27.38 | 27.30 |

This case exposes two separate failures:

1. **Tool selection:** the agent retrieved raw transactions instead of using the available monthly aggregate, despite instructions to prefer that aggregate.
2. **Answer reliability:** the agent introduced incorrect arithmetic while expanding the response beyond the requested total. The merchant amounts in its answer do not reconcile with the stated overall total.

The raw result happened to contain the complete matching history in this case. Therefore, an incomplete transaction page was not the cause of the numerical errors. However, this retrieval strategy is less reliable for monthly statistics because other searches may be paginated or include currencies outside the monthly summary's scope.

**Manual assessment:** `partly answer` appears more consistent with the rubric than `wrong answer`, because the requested overall total is correct but the supporting breakdown is materially inaccurate. Jev did not return a rationale, so its exact reason for the rating is unknown. The original `wrong answer` label is preserved in the baseline rather than replaced by this assessment.

## Detailed finding: `se-10`

The agent correctly selected the financial route and called `web_search`. Its answer cited a returned Eurostat URL and reported **3.2% annual inflation for August 2026**, a figure supported by the captured Eurostat excerpt.

However, the answer did not fully establish the requested facts:

1. **Latest available period was not verified.** The evaluation date was October 31, while the cited excerpt concerned August, was extracted on September 17 and announced a planned update on October 2. This was a reason to investigate further, not sufficient evidence that August was still the latest available period.
2. **Final-release status was inferred.** The answer relied on a typical publication schedule and extraction date to label the figure final. The captured Eurostat excerpt did not explicitly establish that status.
3. **Conflicting evidence remained unresolved.** The captured ECB excerpt reported 3.3% for August, while the Eurostat excerpt reported 3.2%. The answer mentioned both values without explaining or resolving the discrepancy.

**Manual assessment:** `partly answer` is justified. The agent retrieved relevant evidence and answered part of the question, but overstated what that evidence established. A stronger response would perform another focused search or clearly state that recency, release status or conflicting figures could not be verified.

The inflation values above describe the saved evaluation evidence only; they are not presented as independently verified current economic statistics.

## Successful behavior worth preserving

- `se-7` used two separate `get_monthly_summary` calls with the correct July and August 2026 arguments. It reported the recorded totals and correctly identified July as the month with higher expenses.
- `se-8` asked for clarification without inventing prior context or calling tools.
- `se-9` redirected an out-of-scope request without calling tools.
- My manual review of the other eight answers did not reveal issues with the requested results.

The contrast between `se-2` and `se-7` suggests inconsistent selection of the aggregation tool across question types, rather than a general inability to use it or call it multiple times.

## Limitations

- Ten questions and one run per question provide limited coverage and do not measure repeatability.
- These independent first-turn cases do not test follow-up questions or conversation memory.
- Automated tool checks do not yet validate dates, category identifiers, transaction types or other arguments.
- Jev returns a rating without an explanation. Its labels require human review, as illustrated by `se-2`.
- Live search results change over time. Repeating `se-10` may produce different evidence independently of agent changes.
- No agent latency, token usage or cost measurements were stored in this baseline.
- No deliberate tool-failure, timeout or recovery scenarios are covered.

## What I took from this run

The biggest issue was not access to the data, but how the agent chose to use it. In `se-2`, a monthly aggregate was already available, yet the agent took a longer route and introduced errors while adding details the question did not ask for. This gave me a concrete reason to make the distinction between summary tools and transaction tools clearer.

For the next iteration, I focused on the system prompt and tool descriptions. My expectation was that clearer guidance would make monthly category questions use `get_monthly_summary` directly. I also wanted to make the web-search instructions more explicit about publication dates, conflicting sources and release status. Supplying the current date was another change worth testing, since “latest” needs a reference point.

I kept these results as the original baseline and used the same ten questions for the next comparison. This made it possible to look for both improvements and regressions, rather than judging the changes from one successful example.

The evaluation itself also has room to grow. Short explanations from Jev, checks on tool arguments and response-time measurements would make future results easier to interpret. For this first run, the main value was finding specific failure modes that I could investigate and address.
