# k6 Performance Report Analyzer

## 1. Overview

The Performance Report Analyzer is a lightweight Node.js utility that processes native k6 JSON reports and generates a structured JSON summary.

It is designed to make k6 performance results easier to review, validate, and use for future reporting or CI/CD integration.

The analyzer currently supports:

- Smoke test reports
- Load test reports
- Negative API test reports
- Performance metrics
- Reliability metrics
- Business metrics
- Endpoint-level response-time analysis
- Threshold evaluation
- Negative-test response analysis

## 2. Analyzer Location

The analyzer is located in:

analyzer/
- analyzeReport.js
- thresholds.js

### analyzeReport.js

Main analyzer implementation.

Responsibilities:

- Reading native k6 JSONL reports
- Extracting metrics
- Aggregating metrics
- Calculating statistics
- Detecting the test scenario
- Evaluating configured thresholds
- Generating the final summary
- Performing negative-test analysis

### thresholds.js

Contains the primary threshold definitions used by the analyzer.

## 3. Prerequisites

The analyzer requires Node.js.

No external npm packages are required.

The analyzer uses Node.js built-in modules:

- fs
- path

## 4. Input Report

The analyzer consumes a native k6 JSON output file.

Example:

reports/smoke/smoke-result.json

The native k6 JSON output is JSONL (JSON Lines).

Each line represents an individual k6 metric record.

## 5. Generating a k6 Report

### Smoke Test

$env:TEST_SCENARIO="smoke_test"

k6 run --insecure-skip-tls-verify --out json=reports/smoke/smoke-result.json tests/quickPizzaE2E.js

### Load Test

$env:TEST_SCENARIO="load_test"

k6 run --insecure-skip-tls-verify --out json=reports/load/load-result.json tests/quickPizzaE2E.js

### Negative Test

k6 run --insecure-skip-tls-verify --out json=reports/negative/negative-result.json tests/negative/ratingNegativeTest.js

## 6. Running the Analyzer

### Smoke Test

node analyzer/analyzeReport.js reports/smoke/smoke-result.json

### Load Test

node analyzer/analyzeReport.js reports/load/load-result.json

### Negative Test

node analyzer/analyzeReport.js reports/negative/negative-result.json

Example output:

Report: reports/load/load-result.json
Records read: 61592
Summary written: reports\load\load-summary.json

## 7. Output

The analyzer creates a summary file in the same directory as the input report.

The original k6 report is not modified.

Smoke:

reports/smoke/smoke-result.json
reports/smoke/smoke-summary.json

Load:

reports/load/load-result.json
reports/load/load-summary.json

Negative:

reports/negative/negative-result.json
reports/negative/negative-summary.json

## 8. Summary Structure

The generated summary contains:

- report
- execution
- reliability
- performance
- endpoints
- business
- thresholds

Negative tests additionally contain:

- negativeAnalysis

## 9. Execution Metrics

The execution section contains:

- Scenario name
- Minimum VUs
- Maximum VUs
- Iteration count
- HTTP request count

Example:

scenario: load_test
minimum VUs: 0
maximum VUs: 15
iterations: 687
HTTP requests: 4795

The analyzer detects the scenario from the scenario tag stored in the k6 report.

Supported scenarios:

- smoke_test
- load_test
- negative_test

## 10. Reliability Metrics

The reliability section contains:

- checks
- http_req_failed
- login_success_rate

### Checks

Represents the overall k6 check success rate.

A rate of 1 represents 100 percent check success.

### HTTP Request Failures

Represents the k6 http_req_failed metric.

For negative tests, HTTP 4xx responses are intentionally expected. Therefore, a higher http_req_failed value does not automatically mean that the negative test failed.

### Login Success Rate

The analyzer supports the custom login_success_rate metric.

## 11. Performance Metrics

The analyzer aggregates Trend metrics into:

- Count
- Average
- Minimum
- Maximum
- p95

Currently supported:

- http_req_duration
- transaction_time
- iteration_duration

The p95 calculation uses linear interpolation over the recorded metric values.

## 12. Endpoint Analysis

The analyzer provides response-time statistics for configured API endpoints.

Current endpoint names:

- register
- login
- create_order
- get_order
- list_orders
- verify_order
- delete_order

Each endpoint contains:

- Count
- Average
- Minimum
- Maximum
- p95

The endpoint names currently follow the historical naming used by the existing framework.

## 13. Business Metrics

The analyzer reports:

- successful_orders
- scenario_executions

These metrics provide business-level context in addition to technical performance measurements.

## 14. Threshold Evaluation

For normal performance scenarios, the analyzer evaluates the primary thresholds.

Current thresholds:

Metric | Condition
http_req_duration | p95 < 2000 ms
http_req_failed | rate < 0.05
checks | rate > 0.95
transaction_time | p95 < 25000 ms
login_success_rate | rate > 0.98
successful_orders | count > 20

Each threshold result contains:

- Metric
- Operator
- Configured threshold
- Actual value
- PASS or FAIL status
- Unit

The analyzer does not replace k6 native threshold evaluation.

k6 remains the execution-time authority for threshold enforcement.

## 15. Smoke-Test Threshold Behavior

The smoke test executes only one iteration.

Therefore:

successful_orders: count > 20

is expected to fail during a single-iteration smoke execution.

For example:

successful_orders = 1
threshold = count > 20
result = FAIL

This is expected because the smoke scenario is designed for short validation.

The threshold should not be changed merely to make the smoke test pass.

The same threshold is useful during the configured load test where multiple successful transactions are expected.

## 16. Negative Test Analysis

Negative API tests are analyzed differently from normal performance tests.

When the detected scenario is negative_test, the analyzer generates negativeAnalysis and does not evaluate the normal positive-test thresholds.

### Expected Failure Statuses

The current negative analyzer recognizes:

- 400
- 401
- 404

### Negative Analysis Output

The negative analysis contains:

- Expected failure count
- Expected status codes observed
- Check results
- HTTP status distribution

The presence of HTTP 4xx responses should be interpreted together with the test scenario and k6 checks.

## 17. Supported Scenarios

Scenario | Analyzer Behavior
smoke_test | Performance, reliability, business and threshold analysis
load_test | Performance, reliability, business and threshold analysis
negative_test | Negative API analysis without positive-test thresholds

## 18. Error Handling

The analyzer reports an error when:

- No report path is provided
- The report file does not exist
- A report contains invalid JSON
- The report is empty
- An unsupported threshold operator is configured

Usage:

node analyzer/analyzeReport.js <report-path>

## 19. Example End-to-End Workflow

### Step 1 - Execute k6 Test

$env:TEST_SCENARIO="load_test"

k6 run --insecure-skip-tls-verify --out json=reports/load/load-result.json tests/quickPizzaE2E.js

### Step 2 - Analyze Result

node analyzer/analyzeReport.js reports/load/load-result.json

### Step 3 - Inspect Summary

Get-Content reports/load/load-summary.json

Workflow:

k6 Test
|
v
Native JSONL Report
|
v
analyzeReport.js
|
v
Structured JSON Summary
|
v
Performance / Reliability / Business Analysis

## 20. Current V1 Scope

The analyzer currently focuses on structured JSON-based automated analysis.

The current V1 implementation does not provide:

- HTML reports
- Charts
- Dashboard UI
- Historical trend storage
- CI/CD integration
- Automatic report comparison
- Automated capacity analysis
- Endpoint-specific threshold evaluation
- Group-specific threshold evaluation
- Iteration-specific threshold evaluation

These can be considered future enhancements.

## 21. Known Design Considerations

### Iteration Count

The analyzer derives iteration-related information from raw metric records.

Because k6 JSON output contains multiple metric records associated with execution activity, the analyzer's raw iteration metric count may not always exactly match the final iteration count displayed by the k6 console summary.

Therefore, the analyzer should not currently be treated as a replacement for k6's final execution summary for exact iteration accounting.

### Threshold Coverage

The V1 analyzer evaluates only the primary global thresholds.

It does not currently evaluate every threshold defined in config/thresholds.js.

Endpoint-specific, group-specific and other detailed threshold dimensions are outside the current V1 evaluator scope.

### Negative-Test HTTP Failures

Negative tests intentionally generate expected HTTP error responses.

Therefore, http_req_failed must be interpreted according to the test scenario.

A non-zero HTTP failure rate in a negative test does not automatically represent a test failure.

## 22. Design Principles

The analyzer follows these principles:

1. Keep the implementation lightweight.
2. Avoid external dependencies where possible.
3. Preserve the original k6 report.
4. Generate machine-readable JSON summaries.
5. Separate extraction, aggregation and evaluation logic.
6. Treat negative tests differently from positive performance tests.
7. Keep threshold definitions explicit.
8. Support future CI/CD integration.
9. Avoid changing existing performance thresholds merely for reporting convenience.
10. Keep the analyzer focused on post-execution result analysis.

## 23. Related Files

Analyzer:

analyzer/analyzeReport.js

Analyzer thresholds:

analyzer/thresholds.js

k6 thresholds:

config/thresholds.js

Negative thresholds:

config/negativeThresholds.js

Performance analysis strategy:

docs/performance-report-analysis.md

## 24. Analyzer Version

Current analyzer version:

V1

The V1 analyzer provides structured JSON analysis for:

- Smoke
- Load
- Negative API

Future versions may extend the analyzer with:

- Historical comparison
- Baseline comparison
- CI/CD integration
- Rich reporting
- Charts
- Additional threshold dimensions

These features are outside the current V1 implementation.