# QuickPizza k6 API Performance Testing Framework 🍕

A reusable **API performance testing framework** built with **Grafana k6 and JavaScript**, using the public **QuickPizza** application.

The project demonstrates practical performance-testing concepts including **end-to-end API workflows, authentication, custom metrics, thresholds, configurable load profiles, negative API testing, reusable utilities, environment configuration, scenario-based execution, and structured test organization**.

> **Project status:** Iteration 21 completed through reporting setup and execution documentation review.

> This project is a hands-on learning and portfolio project focused on building a maintainable k6 performance-testing framework incrementally.

---

# 🎯 Project Overview

QuickPizza is a demo application provided by Grafana for learning and demonstrating k6 performance testing and observability.

This project uses the public QuickPizza environment:

```text
https://quickpizza.grafana.com
```

The objective is not simply to create individual k6 scripts, but to progressively transform a working k6 test into a **structured, reusable, and maintainable performance-testing framework**.

The framework currently supports:

* Positive end-to-end API testing
* User registration
* Authentication
* Rating creation and retrieval
* Rating listing
* Rating deletion
* Negative API testing
* Configurable smoke and load scenarios
* Runtime environment configuration
* Custom business-level metrics
* Performance thresholds
* Native k6 JSON result reporting

> The public QuickPizza environment is a shared demo service. Performance testing should therefore remain controlled and should not be treated as a capacity test of the public service.

---

# 🛠️ Tech Stack

| Technology                      | Usage                                  |
| ------------------------------- | -------------------------------------- |
| **Grafana k6**                  | API performance testing                |
| **JavaScript**                  | Test scripts and framework development |
| **QuickPizza**                  | Application under test                 |
| **Git**                         | Version control                        |
| **GitHub**                      | Source code repository                 |
| **VS Code / GitHub Codespaces** | Development environment                |

---

# 🚀 Key Features

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
* Native k6 JSON reporting
* Structured test organization
* Incremental framework development

---

# 🏗️ Framework Architecture

The framework separates API communication, configuration, test data, utilities, scenarios, and test execution.

```text
                         k6 Test Execution
                                │
                ┌───────────────┴───────────────┐
                │                               │
                ▼                               ▼
        Positive E2E Test                Negative API Test
        quickPizzaE2E.js               ratingNegativeTest.js
                │                               │
                └───────────────┬───────────────┘
                                │
                                ▼
                         API Layer
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
                userApi.js             ratingApi.js
                    │                       │
                    └───────────┬───────────┘
                                │
                                ▼
                         QuickPizza API
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
   Configuration            Test Data              Utilities
        │                       │                       │
        ▼                       ▼                       ▼
      env.js              testData.js          request.js
   scenarios.js
  loadProfile.js
 thresholds.js
negativeThresholds.js
```

The purpose of this structure is to keep individual test files focused on **what is being tested**, while reusable components handle **how API operations, configuration, metrics, and test data are managed**.

---

# 📁 Project Structure

```text
quickpizza-k6-performance-framework/
│
├── api/
│   ├── userApi.js
│   └── ratingApi.js
│
├── config/
│   ├── env.js
│   ├── loadProfile.js
│   ├── negativeThresholds.js
│   ├── scenarios.js
│   └── thresholds.js
│
├── data/
│   └── testData.js
│
├── tests/
│   ├── quickPizzaE2E.js
│   └── negative/
│       └── ratingNegativeTest.js
│
├── utils/
│   ├── helpers.js
│   ├── metrics.js
│   └── request.js
│
├── reports/
│   └── .gitkeep
│
├── .gitignore
└── README.md
```

Generated performance result files are intentionally excluded from Git tracking.

The `reports/.gitkeep` file keeps the reports directory available in the repository while generated result files remain local.

---

# 🔄 Positive End-to-End Workflow

The main E2E workflow validates the QuickPizza API through a complete business transaction.

```text
Generate Unique User
        ↓
Register User
        ↓
Authenticate
        ↓
Create Rating
        ↓
Get Rating
        ↓
Verify Rating
        ↓
List Ratings
        ↓
Delete Rating
        ↓
Verify Deletion
        ↓
Record Metrics
```

The workflow is executed repeatedly by k6 virtual users during the configured load scenario.

---

# 🔐 Authentication

The framework includes authentication as part of the end-to-end transaction.

The authentication functionality is separated into reusable API functions:

```text
api/userApi.js
```

The login operation uses the returned authentication token for subsequent protected API requests.

Authentication performance is also measured through the custom:

```text
login_success_rate
```

metric.

---

# 🧩 API Layer

The API layer contains reusable functions for interacting with QuickPizza endpoints.

## User API

`api/userApi.js`

Provides:

* User registration
* User authentication

Example operations:

```text
registerUser()
loginUser()
```

## Rating API

`api/ratingApi.js`

Provides:

* Create rating
* Get rating
* List ratings
* Delete rating

Example operations:

```text
createRating()
getRating()
listRatings()
deleteRating()
```

The historical internal naming of some transaction tags such as `create_order` and `get_order` is intentionally preserved for framework consistency.

---

# 🧪 Negative API Testing

Negative API scenarios are maintained separately from the positive E2E workflow.

Test file:

```text
tests/negative/ratingNegativeTest.js
```

Current negative scenarios include:

### Invalid Rating ID

Attempts to retrieve a non-existent rating.

Expected response:

```text
404
```

### Invalid Authentication

Uses an invalid authentication token.

Expected response:

```text
401
```

### Invalid Rating Data

Sends invalid rating data.

Expected response:

```text
400
```

The negative test verifies these expected error responses through k6 checks.

> Expected HTTP error responses in negative testing can contribute to k6's `http_req_failed` metric. The negative scenario therefore focuses on explicit response validation rather than treating expected application errors as unexpected test failures.

---

# 📊 Custom Metrics

The framework uses custom k6 metrics to measure both technical performance and business-level behavior.

## Transaction Time

```text
transaction_time
```

A `Trend` metric used to measure the duration of the complete business transaction.

This provides additional visibility beyond individual HTTP request timings.

---

## Successful Orders

```text
successful_orders
```

A `Counter` used to track successfully completed business transactions.

The historical metric name `successful_orders` is retained for framework consistency even though the current QuickPizza workflow uses rating APIs.

---

## Login Success Rate

```text
login_success_rate
```

A `Rate` used to measure the proportion of successful authentication attempts.

This helps identify authentication failures separately from downstream API failures.

---

## Scenario Executions

```text
scenario_executions
```

A `Counter` used to track completed framework executions with scenario tags.

Example scenario tag:

```text
scenario=smoke_test
```

or:

```text
scenario=load_test
```

This provides additional visibility into which configured execution mode generated the metrics.

---

# 🎯 Performance Thresholds

The framework uses k6 thresholds to define validation criteria for important metrics.

Thresholds are centralized in:

```text
config/thresholds.js
```

Examples include:

```text
http_req_duration
http_req_failed
checks
iteration_duration
transaction_time
successful_orders
login_success_rate
```

Endpoint-level thresholds are also defined for API operations such as:

```text
register
login
create_order
get_order
list_orders
verify_order
delete_order
```

Group-level thresholds are used for logical workflow sections such as:

```text
User Registration
Authentication
Order Management
Order Verification
Cleanup
```

Negative-test thresholds are maintained separately in:

```text
config/negativeThresholds.js
```

> Thresholds in this project are **test-environment validation criteria** and should not be interpreted as production SLAs.

---

# 📈 Load Profile

The configured load profile is maintained in:

```text
config/loadProfile.js
```

Current profile:

```text
30s  →  5 VUs
1m   → 10 VUs
2m   → 15 VUs
1m   → 10 VUs
30s  →  0 VUs
```

Visually:

```text
0
│
│       ┌───────────────┐
│       │               │
│   5 ──┘               │
│                       │
│              ┌────────┘
│             15
│        ┌───────────────┐
│       10               │
│                       └────
│
└──────────────────────────────
       30s  1m  2m  1m  30s
```

The load profile is intentionally controlled because the public QuickPizza environment is a shared demo service.

The objective is to practice:

* Load modeling
* Virtual-user behavior
* Scenario configuration
* Performance measurement
* Threshold validation
* Result analysis

rather than attempting to determine the capacity of the public service.

---

# ⚙️ Scenario Configuration

Scenario definitions are centralized in:

```text
config/scenarios.js
```

The framework currently supports:

## Smoke Scenario

```text
executor: shared-iterations
VUs: 1
iterations: 1
maxDuration: 1m
```

## Load Scenario

```text
executor: ramping-vus
startVUs: 0
configured load stages
gracefulRampDown: 30s
```

The test scenario is selected at runtime using:

```text
TEST_SCENARIO
```

Supported values:

```text
smoke_test
load_test
```

Invalid scenario values are rejected before test execution.

---

# 🧪 Test Execution

The primary positive test is:

```text
tests/quickPizzaE2E.js
```

The negative API test is:

```text
tests/negative/ratingNegativeTest.js
```

---

## Smoke Test

The smoke scenario performs a single end-to-end execution using one VU and one iteration.

PowerShell:

```powershell
$env:TEST_SCENARIO="smoke_test"
k6 run --insecure-skip-tls-verify tests/quickPizzaE2E.js
```

The execution output includes:

```text
Execution Mode  : smoke_test
```

---

## Load Test

The load scenario uses the configured ramping-VUs profile.

PowerShell:

```powershell
$env:TEST_SCENARIO="load_test"
k6 run --insecure-skip-tls-verify tests/quickPizzaE2E.js
```

The execution output includes:

```text
Execution Mode  : load_test
```

This command runs the framework's configured performance scenario rather than replacing it with an ad-hoc `--vus` or `--duration` configuration.

---

## Negative API Test

Run the negative test independently:

```powershell
k6 run --insecure-skip-tls-verify tests/negative/ratingNegativeTest.js
```

This validates:

```text
Invalid Rating ID
        ↓
404

Invalid Authentication
        ↓
401

Invalid Rating Data
        ↓
400
```

---

# 🌐 Environment Configuration

Environment configuration is centralized in:

```text
config/env.js
```

The framework supports runtime overrides using k6 environment variables.

## Base URL

Example:

```powershell
$env:BASE_URL="https://quickpizza.grafana.com"
```

## Password

Example:

```powershell
$env:PASSWORD="your-password"
```

The same framework can therefore be executed against another compatible QuickPizza environment without changing the test implementation.

---

# 📊 JSON Result Reporting

k6 provides native JSON result output.

The framework has a dedicated:

```text
reports/
```

directory for performance-test result artifacts.

Example smoke-test report:

```powershell
$env:TEST_SCENARIO="smoke_test"
k6 run --insecure-skip-tls-verify --out json=reports/smoke/smoke-result.json tests/quickPizzaE2E.js
```

The generated JSON contains detailed metric information including:

* Metric definitions
* Metric values
* Timestamps
* Threshold definitions
* Scenario information
* HTTP methods
* HTTP status codes
* Endpoint tags
* Group tags
* Request performance data
* Custom metrics

Example structure:

```text
reports/
├── .gitkeep
├── smoke/
├── load/
└── negative/
```

Generated performance result files are ignored by Git.

This keeps the repository focused on framework source code and documentation rather than individual execution artifacts.

---

# 📋 Example k6 Execution

A configured smoke execution provides output similar to:

```text
execution: local

scenarios:
  smoke_test

Execution Mode:
  smoke_test

checks:
  response validation
  business validation
  workflow validation

custom metrics:
  transaction_time
  successful_orders
  login_success_rate
  scenario_executions
```

A configured load execution uses:

```text
scenario:
  load_test

profile:
  0 → 5 → 10 → 15 → 10 → 0 VUs
```

The actual number of iterations, requests, response times, and metric values depend on the selected scenario, configured load profile, network conditions, and execution environment.

---

# 🔍 Validation Strategy

The framework validates more than HTTP response status.

Validation can be divided into multiple levels.

## 1. HTTP Validation

```text
HTTP status
```

Confirms that the API request received the expected HTTP response.

---

## 2. Response Validation

```text
Response body
Response fields
Authentication token
```

Confirms that the returned API response contains expected information.

---

## 3. Business Validation

```text
Successful transaction
Rating creation
Rating retrieval
Rating deletion
```

Confirms that the complete business workflow behaves as expected.

---

## 4. Performance Validation

```text
Response time
Transaction time
Iteration duration
Threshold compliance
```

Confirms that execution remains within configured performance criteria.

---

## 5. Negative Validation

```text
Invalid input
Invalid authentication
Invalid resource
```

Confirms that expected application error responses are correctly handled.

---

# 🧩 Framework Components

## API Layer

The API layer contains reusable communication functions for interacting with QuickPizza endpoints.

```text
api/
├── userApi.js
└── ratingApi.js
```

This keeps raw HTTP communication separate from test scenarios.

---

## Configuration Layer

The configuration layer centralizes:

* Environment settings
* Base URL
* Password override
* Load profiles
* Scenario configuration
* Performance thresholds
* Negative-test thresholds

```text
config/
├── env.js
├── loadProfile.js
├── negativeThresholds.js
├── scenarios.js
└── thresholds.js
```

---

## Test Data Layer

Test data is centralized in:

```text
data/testData.js
```

The file contains reusable positive and negative test data.

Examples include:

```text
ratingData
negativeRatingData
```

---

## Test Layer

The test layer contains the actual k6 test entry points.

```text
tests/
├── quickPizzaE2E.js
└── negative/
    └── ratingNegativeTest.js
```

The test workflow focuses primarily on:

```text
Arrange
   ↓
Execute
   ↓
Validate
   ↓
Record Metrics
```

---

## Utility Layer

Reusable helper functionality is maintained under:

```text
utils/
```

Current utilities include:

```text
helpers.js
metrics.js
request.js
```

These utilities keep common functionality out of the main test workflow.

---

# 🧠 Framework Design Principles

## Separation of Concerns

API communication, configuration, test data, utilities, and test execution are separated.

## Reusability

Common API operations and utilities are implemented once and reused across scenarios.

## Maintainability

Centralized configuration and reusable API functions make it easier to extend the framework.

## Observability

Custom metrics provide visibility into technical performance and business-level behavior.

## Scenario-Based Execution

Different test purposes are represented by explicit execution scenarios.

## Incremental Development

The framework is intentionally built through small iterations rather than attempting to create a large framework in one step.

## Controlled Performance Testing

The project uses controlled load levels when testing the public QuickPizza environment.

---

# 📚 Development Iteration History

The framework has been developed incrementally through multiple iterations.

### Iterations 1–7

Initial framework organization, API workflow development, configuration, utilities, and reusable components were introduced.

### Iteration 8

Improved the E2E framework structure, workflow execution, validation, and metrics.

### Iterations 9–13

Improved:

* Load configuration
* Scenario management
* Performance thresholds
* Test data organization
* Framework configuration

### Iteration 14

Added negative API scenarios.

### Iteration 15

Added scenario execution metrics.

### Iteration 16

Added scenario tags to transaction metrics.

### Iteration 17

Expanded negative API coverage.

### Iteration 18

Centralized negative test data.

### Iteration 19

Externalized runtime environment configuration.

### Iteration 20

Completed execution-model validation for:

* Smoke testing
* Configured load testing
* Negative API testing
* Regression validation

### Iteration 21

Improved execution control and reporting preparation.

Completed work includes:

* Execution-mode metadata
* Smoke execution validation
* Full configured load validation
* Negative execution validation
* Runtime configuration review
* Native k6 JSON reporting validation
* JSON result structure inspection
* Report storage configuration
* Generated-report Git exclusion
* Report directory preservation
* Execution documentation review

> The iteration history represents the learning and development progression of the project.

---

# 📊 Current Framework Status

| Capability                         | Status |
| ---------------------------------- | ------ |
| k6 API Testing                     | ✅      |
| QuickPizza E2E Workflow            | ✅      |
| User Registration                  | ✅      |
| Authentication                     | ✅      |
| Rating API Operations              | ✅      |
| Negative API Testing               | ✅      |
| API Utilities                      | ✅      |
| Centralized Configuration          | ✅      |
| Runtime Environment Configuration  | ✅      |
| Custom Trend Metric                | ✅      |
| Custom Counter Metric              | ✅      |
| Custom Rate Metric                 | ✅      |
| Scenario Execution Metric          | ✅      |
| Checks                             | ✅      |
| Performance Thresholds             | ✅      |
| Negative-Test Thresholds           | ✅      |
| Configurable Load Profile          | ✅      |
| Smoke Scenario                     | ✅      |
| Load Scenario                      | ✅      |
| Negative Scenario                  | ✅      |
| Scenario Validation                | ✅      |
| Native JSON Reporting              | ✅      |
| Report Storage Structure           | ✅      |
| Git Exclusion of Generated Reports | ✅      |
| Advanced HTML Reporting            | ⏳      |
| GitHub Actions CI/CD               | ⏳      |
| Automated Performance Execution    | ⏳      |
| Historical Result Tracking         | ⏳      |
| Result Visualization               | ⏳      |

---

# 🧪 Performance Testing Scope

This project demonstrates practical performance-testing concepts including:

* Baseline testing
* Load modeling
* Virtual users
* Iterations
* Ramp-up and ramp-down
* Response-time measurement
* End-to-end transaction measurement
* Custom metrics
* Thresholds
* Business transaction measurement
* Authentication performance
* API workflow performance
* Negative API validation
* Scenario-based execution
* Result collection

The project is intended to strengthen practical understanding of k6 and performance-test framework development.

---

# ⚠️ Test Environment Disclaimer

This project uses the **public QuickPizza demo environment**.

Performance results can be influenced by factors such as:

* Shared public infrastructure
* Network conditions
* Service availability
* Test load
* Execution environment
* Temporary service variability

Therefore, results generated from the public environment should **not be interpreted as production capacity benchmarks or production SLAs**.

The framework is primarily intended for:

```text
Framework Development
        ↓
Performance Testing Practice
        ↓
Metric Collection
        ↓
Threshold Validation
        ↓
Result Analysis
```

---

# 🎓 Learning Objectives

This project is being developed to strengthen practical skills in:

* Grafana k6
* JavaScript
* API testing
* Performance testing
* Load modeling
* Virtual-user modeling
* Custom metrics
* Thresholds
* Negative testing
* Test architecture
* Reusable framework design
* Environment configuration
* Git and GitHub
* Performance-result analysis

---

# 🔮 Planned Enhancements

Future improvements may include:

* Additional API workflows
* More structured scenario configuration
* Additional load profiles
* HTML performance reports
* Automated report generation
* GitHub Actions integration
* Automated performance-test execution
* Historical result comparison
* Improved result visualization
* Performance trend analysis

These enhancements will be implemented incrementally rather than adding unnecessary framework complexity.

---

# 👨‍💻 Author

**Arindam Chowdhury**

QA Automation Engineer / SDET

### Areas of Focus

* UI Test Automation
* Selenium WebDriver
* Playwright
* API Testing
* k6 Performance Testing
* Java
* JavaScript / TypeScript
* TestNG
* CI/CD
* Automation Framework Development

---

# ⭐ Project Goal

The goal of this project is to demonstrate the ability to progressively:

```text
Design
  ↓
Structure
  ↓
Automate
  ↓
Execute
  ↓
Measure
  ↓
Validate
  ↓
Analyze
  ↓
Improve
```

Rather than focusing only on individual k6 scripts, the project emphasizes the development of a **maintainable API performance-testing framework** with reusable components, configurable scenarios, meaningful metrics, validation criteria, and controlled execution.

This project is part of my ongoing learning journey toward stronger **QA Automation / SDET / Performance Testing** capabilities.
