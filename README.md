# QuickPizza k6 API Performance Testing Framework 🍕

A reusable **API performance testing framework** built with **Grafana k6 and JavaScript**, using the public **QuickPizza** application.

The project demonstrates practical performance-testing engineering concepts including **end-to-end API workflows, authentication, custom metrics, thresholds, configurable load profiles, negative API testing, reusable utilities, environment configuration, scenario-based execution, structured test organization, automated result analysis, baseline comparison, performance regression detection, and CI/CD quality gates**.

> **Project status:** Iteration 25 completed.

> This project is a hands-on learning and portfolio project focused on progressively building a maintainable k6 API performance-testing framework, from test execution and metrics collection through automated analysis, regression detection, and CI/CD validation.

---

## 🚀 Key Features

* k6 API performance testing
* End-to-end API workflow
* User registration
* Authentication handling
* Rating API operations
* Negative API scenarios
* Reusable API functions
* Centralized environment configuration
* Runtime `BASE_URL` configuration
* Runtime `PASSWORD` configuration
* Configurable execution mode
* Configurable load profile
* Scenario-based execution
* Randomized test data
* Custom Trend metrics
* Custom Counter metrics
* Custom Rate metrics
* Scenario execution metrics
* Performance thresholds
* Group-level validation
* Endpoint-level thresholds
* Business-level success metrics
* Native k6 JSON result reporting
* Automated performance result analysis
* Scenario-aware analyzer thresholds
* Version-controlled smoke baseline
* Automated baseline comparison
* Performance regression detection
* CI performance quality gate
* GitHub Actions CI/CD
* Automated smoke performance execution
* Structured test organization
* Incremental framework development

---

## 🛠️ Tech Stack

| Technology                      | Purpose                                  |
| ------------------------------- | ---------------------------------------- |
| **Grafana k6**                  | API performance testing                  |
| **JavaScript**                  | Test implementation                      |
| **QuickPizza API**              | Application under test                   |
| **Node.js**                     | Report analysis and comparison utilities |
| **Git**                         | Version control                          |
| **GitHub**                      | Source control and portfolio             |
| **GitHub Actions**              | CI/CD execution                          |
| **VS Code / GitHub Codespaces** | Development environment                  |

---

## 📋 Project Overview

The purpose of this project is to build a maintainable API performance-testing framework rather than a collection of standalone k6 scripts.

The framework progressively demonstrates:

1. API test implementation
2. Reusable API abstractions
3. Centralized configuration
4. Test-data management
5. Custom performance metrics
6. Scenario configuration
7. Performance thresholds
8. Negative API testing
9. Native JSON result generation
10. Automated performance-result analysis
11. Version-controlled performance baselines
12. Regression detection
13. CI/CD quality gates

---

# 🏗️ Framework Architecture

```text
                         QuickPizza API
                              │
                              ▼
                    ┌───────────────────┐
                    │   k6 Test Layer   │
                    │ quickPizzaE2E.js  │
                    └─────────┬─────────┘
                              │
              ┌───────────────┼────────────────┐
              ▼               ▼                ▼
        Positive E2E     Negative API     Custom Metrics
              │               │                │
              └───────────────┼────────────────┘
                              ▼
                       k6 Execution
                              │
                              ▼
                    Native JSON Result
                              │
                              ▼
                    analyzeReport.js
                              │
                              ▼
                       Summary JSON
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
              Thresholds          Baseline Summary
                    │                   │
                    └─────────┬─────────┘
                              ▼
                     compareReports.js
                              │
                              ▼
                  Regression Detection
                              │
                       ┌──────┴──────┐
                       ▼             ▼
                     PASS           FAIL
                             
                             
                    GitHub Actions CI
                              │
                              ▼
                    Automated Smoke Test
                              │
                              ▼
                    Analyzer + Comparison
                              │
                              ▼
                     Quality Gate
```

---

# 📁 Project Structure

```text
quickpizza-k6-performance-framework/
│
├── analyzer/
│   ├── analyzeReport.js
│   ├── thresholds.js
│   └── compareReports.js
│
├── api/
│   ├── userApi.js
│   └── ratingApi.js
│
├── config/
│   ├── env.js
│   ├── loadProfile.js
│   ├── scenarios.js
│   ├── thresholds.js
│   ├── negativeThresholds.js
│   └── smokeThresholds.js
│
├── data/
│   └── testData.js
│
├── utils/
│   ├── helpers.js
│   ├── metrics.js
│   └── request.js
│
├── tests/
│   ├── quickPizzaE2E.js
│   └── negative/
│       └── ratingNegativeTest.js
│
├── reports/
│   ├── .gitkeep
│   ├── smoke/
│   ├── load/
│   ├── negative/
│   └── baselines/
│       └── smoke/
│           └── smoke-baseline-summary.json
│
├── docs/
│   ├── analyzer.md
│   ├── performance-report-analysis.md
│   └── performance-comparison.md
│
├── .github/
│   └── workflows/
│       └── quickpizza-performance.yml
│
├── .gitignore
└── README.md
```

> Generated k6 result files are excluded from Git, while the smoke baseline summary is intentionally version-controlled.

---

# 🔄 Positive E2E Workflow

The main positive workflow validates a complete QuickPizza API transaction:

```text
User Registration
       ↓
Authentication
       ↓
Create Order
       ↓
Get Order
       ↓
List Orders
       ↓
Verify Order
       ↓
Delete Order
       ↓
Cleanup
```

The workflow uses reusable API functions and custom metrics to capture both technical and business-level performance information.

---

# 🔐 Authentication

Authentication is handled through reusable API utilities.

The framework supports:

* User registration
* Login
* Authentication token handling
* Authenticated API requests
* Runtime password configuration

Credentials are supplied through environment variables rather than hard-coded values.

---

# 🔌 API Layer

API operations are separated from test-flow logic.

### `api/userApi.js`

Responsible for user-related operations such as:

* Registration
* Login

### `api/ratingApi.js`

Responsible for QuickPizza API operations such as:

* Creating orders
* Retrieving orders
* Listing orders
* Verifying orders
* Deleting orders

This separation improves reuse and keeps the test scenarios focused on business flows.

---

# ❌ Negative API Testing

Negative API scenarios are maintained separately from the positive E2E workflow.

Current negative testing includes validation of API behavior for invalid request conditions.

Example:

```text
Negative API Scenario
        ↓
Invalid Request
        ↓
API Response
        ↓
Status Validation
        ↓
Response Validation
        ↓
Performance Measurement
```

Negative tests are intentionally handled separately because their expected behavior and thresholds differ from positive performance scenarios.

---

# 📊 Custom Metrics

The framework uses custom k6 metrics to measure business and technical behavior.

### Trend Metrics

Used for measuring transaction duration and other continuous performance values.

### Counter Metrics

Used to count successful business operations.

### Rate Metrics

Used to measure reliability indicators such as:

* Login success rate
* Failure rate

### Scenario Execution Metrics

The framework also tracks scenario execution information to make test results easier to analyze.

---

# 🎯 Performance Thresholds

Performance thresholds are centralized rather than being distributed across individual tests.

The framework supports thresholds for:

* HTTP request duration
* HTTP request failure rate
* Check success rate
* Transaction duration
* Login success rate
* Successful business operations
* Endpoint-specific response times
* Group-level performance

Example:

```text
HTTP request p95
        ↓
Threshold evaluation
        ↓
PASS / FAIL
```

---

# 🧪 Scenario-Based Thresholds

Different scenarios have different performance expectations.

The framework currently distinguishes between:

### Smoke Test

Used for lightweight CI validation.

Smoke thresholds focus on stable indicators such as:

* HTTP response time
* HTTP failure rate
* Check success rate
* Transaction time
* Login success rate

### Load Test

Used for broader performance validation.

Load thresholds additionally include business-volume validation such as successful orders.

### Negative Test

Negative scenarios use separate validation logic and do not use the positive-test threshold set.

---

# ⚙️ Load Profile

Load behavior is configurable through:

```text
config/loadProfile.js
```

This allows the framework to separate:

* Test logic
* Load configuration
* Scenario configuration
* Threshold configuration

The framework can therefore evolve from lightweight validation to longer performance runs without rewriting the test workflow.

---

# 🎬 Scenario Configuration

Scenario definitions are centralized in:

```text
config/scenarios.js
```

The framework currently supports scenario-based execution including:

* Smoke testing
* Load testing
* Negative testing

The selected scenario controls the appropriate execution configuration and threshold strategy.

---

# 🔧 Environment Configuration

Runtime environment configuration is centralized in:

```text
config/env.js
```

The framework supports environment variables such as:

```text
BASE_URL
PASSWORD
TEST_SCENARIO
```

Example:

```powershell
$env:BASE_URL="https://quickpizza.grafana.com"
$env:PASSWORD="your-password"
$env:TEST_SCENARIO="smoke_test"
```

This allows the same framework to be executed against different environments without modifying the test source code.

---

# 📝 Test Data

Test data is centralized in:

```text
data/testData.js
```

This keeps test data separate from test-flow logic and makes future data expansion easier.

---

# ▶️ Test Execution

## Smoke Test

```powershell
$env:TEST_SCENARIO="smoke_test"
k6 run --insecure-skip-tls-verify tests/quickPizzaE2E.js
```

## Load Test

```powershell
$env:TEST_SCENARIO="load_test"
k6 run --insecure-skip-tls-verify tests/quickPizzaE2E.js
```

## Negative Test

```powershell
k6 run --insecure-skip-tls-verify tests/negative/ratingNegativeTest.js
```

---

# 📦 JSON Result Reporting

k6 native JSON output is used as the raw performance-test result.

Example:

```powershell
k6 run --insecure-skip-tls-verify `
  --out json=reports/smoke/smoke-result.json `
  tests/quickPizzaE2E.js
```

The resulting JSON is then processed by the framework analyzer.

```text
k6 JSONL Result
       ↓
analyzeReport.js
       ↓
Structured Summary JSON
```

The raw k6 result is intentionally treated as the execution-level data source, while the summary JSON provides a stable structure for analysis and comparison.

---

# 📈 Automated Performance Result Analysis

The framework includes an automated report analyzer:

```text
analyzer/analyzeReport.js
```

Its responsibilities include:

* Reading native k6 JSON results
* Aggregating performance metrics
* Calculating summary statistics
* Extracting reliability information
* Extracting endpoint metrics
* Extracting business metrics
* Evaluating scenario-specific thresholds
* Producing structured summary JSON

Execution:

```powershell
node analyzer/analyzeReport.js reports/smoke/smoke-result.json
```

Output:

```text
reports/smoke/smoke-summary.json
```

---

# 🎯 Analyzer Thresholds

Analyzer thresholds are centralized in:

```text
analyzer/thresholds.js
```

The analyzer selects thresholds according to the executed scenario.

```text
Scenario
   │
   ├── smoke_test → smoke thresholds
   │
   ├── load_test  → load thresholds
   │
   └── negative_test → negative analysis
```

This prevents load-specific business-volume thresholds from incorrectly failing lightweight smoke tests.

---

# 🧮 Performance Result Comparison

The framework compares the current performance summary against a version-controlled baseline.

Comparison utility:

```text
analyzer/compareReports.js
```

Execution:

```powershell
node analyzer/compareReports.js `
  reports/baselines/smoke/smoke-baseline-summary.json `
  reports/smoke/smoke-summary.json
```

The comparison evaluates:

* Performance metrics
* Reliability metrics
* Endpoint metrics
* Business metrics
* Scenario compatibility

---

# 🚨 Performance Regression Detection

The framework uses a **5% tolerance** for regression detection.

```text
Version-Controlled Baseline
            ↓
      Current Summary
            ↓
      Metric Comparison
            ↓
        5% Tolerance
            ↓
    ┌───────┴────────┐
    ↓                ↓
No Regression     Regression
    ↓                ↓
   PASS             FAIL
```

Comparison results classify metrics as:

* `IMPROVEMENT`
* `REGRESSION`
* `NO_CHANGE`
* `NOT_COMPARABLE`
* `NOT_AVAILABLE`

The comparison utility returns a non-zero exit code when a regression is detected, allowing CI/CD to enforce the performance quality gate.

---

# 🧱 Performance Baseline

The smoke baseline is stored in:

```text
reports/baselines/smoke/smoke-baseline-summary.json
```

Only the structured summary is version-controlled.

Generated raw performance results remain excluded from Git.

This provides a lightweight approach to performance regression tracking without requiring a database or external performance platform.

> The baseline is intentionally not overwritten automatically after every CI execution. Updating the baseline is a deliberate repository change.

---

# 🔄 CI/CD with GitHub Actions

The framework includes:

```text
.github/workflows/quickpizza-performance.yml
```

The CI pipeline performs:

```text
Git Push / Pull Request / Manual Run
                ↓
       GitHub Actions Runner
                ↓
        Checkout Repository
                ↓
           Install k6
                ↓
      Run QuickPizza Smoke Test
                ↓
        Generate JSON Result
                ↓
       Analyze Performance Result
                ↓
        Generate Summary JSON
                ↓
       Compare Against Baseline
                ↓
       Regression Detection
                ↓
          Quality Gate
```

The workflow uploads the generated smoke-test artifacts for inspection.

---

# 🚦 CI Performance Quality Gate

The CI pipeline fails when the smoke performance comparison detects a regression.

This makes performance testing part of the CI validation process rather than an isolated manual activity.

The quality-gate flow is:

```text
Smoke Test
    ↓
Analyzer
    ↓
Summary
    ↓
Baseline Comparison
    ↓
Regression Detection
    ↓
┌───────────────┐
│               │
PASS            FAIL
│               │
CI Continues    CI Fails
```

---

# 📊 Performance Metrics

The framework captures multiple categories of metrics.

### HTTP Metrics

* Request duration
* Request failure rate
* Request count

### Reliability Metrics

* Check success rate
* Login success rate
* HTTP failure rate

### Transaction Metrics

* Transaction duration
* Scenario execution metrics

### Endpoint Metrics

Metrics can be analyzed for individual operations such as:

```text
register
login
create_order
get_order
list_orders
verify_order
delete_order
```

### Business Metrics

Examples include:

```text
successful_orders
```

Historical internal metric and transaction names are intentionally preserved for framework consistency.

---

# 🧪 Validation Strategy

The framework validates both functional and performance behavior.

Validation includes:

* HTTP status checks
* Response checks
* Business checks
* Authentication validation
* Endpoint performance
* Transaction performance
* Scenario execution
* Threshold evaluation
* Negative API behavior
* Regression comparison

---

# 🧩 Framework Components

| Component            | Responsibility                                      |
| -------------------- | --------------------------------------------------- |
| `api/`               | Reusable API operations                             |
| `config/`            | Runtime, scenario, load and threshold configuration |
| `data/`              | Centralized test data                               |
| `utils/`             | Shared helpers, metrics and request utilities       |
| `tests/`             | Performance and negative test scenarios             |
| `analyzer/`          | Result analysis and comparison                      |
| `reports/`           | Generated reports and version-controlled baselines  |
| `docs/`              | Framework documentation                             |
| `.github/workflows/` | CI/CD automation                                    |

---

# 🧱 Framework Design Principles

The framework follows several maintainability principles:

### Separation of Concerns

API operations, configuration, test data, utilities, analysis and test execution are separated.

### Reusability

Common operations are implemented as reusable functions.

### Centralized Configuration

Environment variables, scenarios, thresholds and load profiles are centralized.

### Scenario Awareness

Smoke, load and negative scenarios use appropriate execution and validation strategies.

### Automation

Performance result analysis and regression detection are automated.

### CI/CD Integration

Smoke performance validation is integrated into GitHub Actions.

### Version-Controlled Baseline

Performance regression detection uses a deliberate, version-controlled baseline rather than automatically changing the expected performance after every run.

---

# 📚 Development Iteration History

| Iteration | Description                                                | Status |
| --------- | ---------------------------------------------------------- | ------ |
| 1         | Initialize k6 performance framework                        | ✅      |
| 2         | Centralize environment configuration                       | ✅      |
| 3         | Add reusable test data utilities                           | ✅      |
| 4         | Centralize custom k6 metrics                               | ✅      |
| 5         | Extract user API operations                                | ✅      |
| 6         | Extract rating API operations                              | ✅      |
| 7         | Centralize API request headers                             | ✅      |
| 8         | Add configurable load profile                              | ✅      |
| 9         | Add configurable performance scenarios                     | ✅      |
| 10        | Add smoke test scenario                                    | ✅      |
| 11        | Validate performance test scenario                         | ✅      |
| 12        | Centralize performance thresholds                          | ✅      |
| 13        | Centralize test data                                       | ✅      |
| 14        | Add negative API scenarios                                 | ✅      |
| 15        | Add scenario execution metrics                             | ✅      |
| 16        | Add scenario tags to transaction metrics                   | ✅      |
| 17        | Expand negative API coverage                               | ✅      |
| 18        | Centralize negative test data                              | ✅      |
| 19        | Externalize environment configuration                      | ✅      |
| 20        | Framework validation and cleanup                           | ✅      |
| 21        | Configure performance report storage                       | ✅      |
| 22        | Add performance result analysis strategy                   | ✅      |
| 23        | Add automated k6 report analyzer                           | ✅      |
| 24        | Add performance result comparison and regression detection | ✅      |
| 25        | Add GitHub Actions CI/CD and performance quality gate      | ✅      |

---

# 📌 Current Framework Status

| Capability                            | Status |
| ------------------------------------- | ------ |
| k6 API Testing                        | ✅      |
| QuickPizza E2E Workflow               | ✅      |
| User Registration                     | ✅      |
| Authentication                        | ✅      |
| Rating API Operations                 | ✅      |
| Negative API Testing                  | ✅      |
| API Utilities                         | ✅      |
| Centralized Configuration             | ✅      |
| Runtime Environment Configuration     | ✅      |
| Custom Trend / Counter / Rate Metrics | ✅      |
| Scenario Execution Metrics            | ✅      |
| Performance Thresholds                | ✅      |
| Negative-Test Validation              | ✅      |
| Configurable Load Profile             | ✅      |
| Smoke / Load / Negative Scenarios     | ✅      |
| Scenario Validation                   | ✅      |
| Native JSON Reporting                 | ✅      |
| Report Storage Structure              | ✅      |
| Automated Result Analysis             | ✅      |
| Scenario-Aware Analyzer Thresholds    | ✅      |
| Version-Controlled Smoke Baseline     | ✅      |
| Baseline Comparison                   | ✅      |
| Performance Regression Detection      | ✅      |
| GitHub Actions CI/CD                  | ✅      |
| Automated Smoke Performance Execution | ✅      |
| CI Performance Quality Gate           | ✅      |
| HTML Performance Reporting            | ⏳      |
| Historical Performance Trend Tracking | ⏳      |
| Result Visualization                  | ⏳      |
| Scheduled Heavy Performance Runs      | ⏳      |

---

# 📈 Performance Testing Scope

The framework currently focuses on API performance testing using k6.

The primary goals are:

* Response-time validation
* Reliability measurement
* Transaction performance
* Endpoint-level performance
* Business-level performance indicators
* Smoke performance validation
* Load-test execution
* Negative API performance behavior
* Regression detection

The framework is intentionally designed so additional performance scenarios and reporting capabilities can be added incrementally.

---

# ⚠️ Test Environment Disclaimer

QuickPizza is a public application used for learning and portfolio demonstration.

Performance results can vary depending on:

* Network conditions
* Server-side workload
* Test execution environment
* Geographic location
* Time of execution
* Public service availability

Therefore, individual test results should be interpreted as observations from a specific test execution rather than permanent performance characteristics of the application.

---

# 🎯 Learning Objectives

This project demonstrates practical experience with:

* k6 API performance testing
* JavaScript-based performance automation
* API workflow design
* Authentication handling
* Test-data management
* Custom k6 metrics
* Performance thresholds
* Load profiles
* Scenario configuration
* Negative API testing
* JSON result processing
* Performance-result analysis
* Baseline comparison
* Regression detection
* CI/CD integration
* Performance quality gates
* Framework architecture
* Maintainable test automation design

---

# 🔮 Planned Enhancements

The following improvements are intentionally kept as future work:

* Additional QuickPizza API workflows
* Additional load profiles
* Expanded stress-testing scenarios
* Soak-testing scenarios
* HTML performance reports
* Improved result visualization
* Performance trend tracking
* Scheduled performance executions
* Additional CI performance scenarios
* Enhanced historical baseline management

The project will continue to evolve incrementally as new performance-engineering capabilities are added.

---

# 👨‍💻 Author

**Arindam Chowdhury**

QA Automation Engineer / SDET

GitHub:
https://github.com/arindam0111

---

# 🎯 Project Goal

The goal of this project is to demonstrate how a **maintainable API performance-testing framework** can evolve from basic k6 test scripts into an engineering-oriented solution with:

```text
Reusable API Layer
        ↓
Configurable Test Scenarios
        ↓
Custom Performance Metrics
        ↓
Performance Thresholds
        ↓
Native JSON Results
        ↓
Automated Result Analysis
        ↓
Version-Controlled Baseline
        ↓
Regression Detection
        ↓
CI/CD Quality Gate
```

This project is designed as a practical portfolio demonstration of **QA Automation, API Testing, Performance Testing, JavaScript, k6, CI/CD, and SDET engineering practices**.
