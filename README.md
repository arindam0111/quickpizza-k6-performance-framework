# QuickPizza k6 API Performance Testing Framework 🍕

A reusable **API performance testing framework** built with **Grafana k6 and JavaScript**, using the public **QuickPizza** application.

The project demonstrates practical performance-testing concepts including **end-to-end API workflows, authentication, custom metrics, thresholds, configurable load profiles, reusable utilities, and structured test scenarios**.

> **Project status:** Iteration 8 completed.
> This project is a hands-on learning and portfolio project focused on building a maintainable k6 performance-testing framework incrementally.

---

## 🎯 Project Overview

QuickPizza is a demo application provided by Grafana for learning and demonstrating k6 performance testing and observability.

This project uses the public QuickPizza environment:

```text
https://quickpizza.grafana.com
```

The objective is not simply to create individual k6 scripts, but to progressively transform a working k6 test into a **structured and reusable performance-testing framework**.

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
* Authentication handling
* Reusable API utilities
* Centralized configuration
* Environment-based `BASE_URL`
* Custom Trend metrics
* Counter metrics
* Rate metrics
* Gauge metrics
* Performance thresholds
* Configurable load profiles
* Randomized test data
* Scenario-based execution
* Structured test organization
* Iterative framework development
* k6 result validation
* Business-level success metrics

---

# 🏗️ Framework Architecture

The framework separates API communication, configuration, utilities, scenarios, and test execution.

```text
                    Test
                     │
                     ▼
             E2E Test Workflow
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
       Scenarios              Config
          │                     │
          ▼                     ▼
     API Utilities        Environment
          │
          ▼
     QuickPizza API
```

The purpose of this structure is to keep individual test files focused on **what is being tested**, while reusable components handle **how API operations are performed**.

---

# 📁 Project Structure

```text
quickpizza-k6-performance-framework/
│
├── api/
│   └── apiClient.js
│
├── config/
│   └── config.js
│
├── tests/
│   └── quickPizzaE2E.js
│
├── utils/
│   └── ...
│
├── .gitignore
└── README.md
```

> The structure will continue to evolve as additional framework iterations are implemented.

---

# 🔄 End-to-End Workflow

The current E2E workflow validates the QuickPizza API from authentication through order creation.

```text
Generate User
      ↓
Authenticate
      ↓
Create Order
      ↓
Validate Response
      ↓
Record Metrics
```

The workflow is designed so that the complete business transaction can be executed repeatedly by k6 virtual users.

---

# 🔐 Authentication

The test workflow includes authentication as part of the end-to-end transaction.

The authentication flow is separated from the main business workflow so that authentication logic can be reused as the framework evolves.

The authentication result is also measured using a dedicated metric.

---

# 📊 Custom Metrics

The framework uses custom k6 metrics to measure business-level performance.

## Transaction Time

```text
transaction_time
```

A `Trend` metric used to measure the duration of the end-to-end transaction.

This provides more meaningful visibility than relying only on the standard `http_req_duration` metric.

---

## Successful Orders

```text
successful_orders
```

A `Counter` used to track successfully completed order transactions.

This provides a business-level measurement of successful order creation.

---

## Authentication Rate

```text
authentication_rate
```

A `Rate` used to measure the proportion of successful authentication attempts.

This helps distinguish authentication failures from downstream API failures.

---

## Active Users

```text
active_users
```

A `Gauge` used to represent the active-user value recorded during test execution.

---

# 🎯 Performance Thresholds

The framework uses k6 thresholds to define pass/fail criteria for important metrics.

Thresholds allow performance expectations to be expressed directly in the test configuration instead of relying only on manual analysis of test output.

The exact thresholds are maintained in the test configuration and may evolve as the framework is refined.

> Thresholds in this project are **test-environment validation criteria** and should not be interpreted as production SLAs.

---

# 📈 Load Profile

The framework uses k6 scenarios/options to control the workload generated against QuickPizza.

The load profile is intentionally kept controlled because the public QuickPizza environment is a shared demo service.

The official QuickPizza project states that `quickpizza.grafana.com` is intended for small-scale performance tests.

This project therefore focuses on:

* Framework design
* Test workflow implementation
* Metric collection
* Threshold validation
* Load-model learning
* Performance-result analysis

rather than attempting to determine the capacity of the public service.

---

# 🧪 Test Execution

The primary test is:

```text
tests/quickPizzaE2E.js
```

Run the test with:

```bash
k6 run tests/quickPizzaE2E.js
```

---

# 🌐 Using a Different Base URL

The application URL is configurable through an environment variable.

Example:

```bash
k6 run -e BASE_URL=https://quickpizza.grafana.com tests/quickPizzaE2E.js
```

This allows the same test framework to be used against another compatible QuickPizza environment without changing the test implementation.

---

# 📋 Example k6 Execution

A typical execution provides:

```text
execution: local

scenarios:
  default

checks:
  ✓ response status
  ✓ response body
  ✓ business validation

custom metrics:
  transaction_time
  successful_orders
  authentication_rate
  active_users
```

The actual number of iterations, requests, response times, and metric values depend on the selected load profile and execution environment.

---

# 🔍 Validation Strategy

The framework validates more than HTTP response status.

Validation can be divided into three levels:

### 1. HTTP Validation

```text
HTTP status
```

Confirms that the API request received an expected HTTP response.

### 2. Response Validation

```text
Response body
Response fields
```

Confirms that the returned API response contains the expected data.

### 3. Business Validation

```text
Successful order
Successful transaction
```

Confirms that the complete business workflow succeeded.

This layered validation helps distinguish between:

```text
HTTP request succeeded
        ≠
Business transaction succeeded
```

---

# 🧩 Framework Components

## API Layer

The API layer contains reusable communication functions for interacting with QuickPizza endpoints.

This keeps raw HTTP communication separate from test scenarios.

---

## Configuration Layer

The configuration layer centralizes values such as:

* Base URL
* Environment settings
* Timeout-related configuration
* Test execution configuration

---

## Test Layer

The test layer contains the actual k6 test entry point.

The test should focus primarily on:

```text
Arrange
   ↓
Execute workflow
   ↓
Validate
   ↓
Record metrics
```

---

## Utility Layer

The utility layer contains reusable helper functions that do not belong directly inside the test workflow.

This structure allows the framework to grow without turning the main test file into a large monolithic script.

---

# 🧠 Framework Design Principles

## Separation of Concerns

API communication, configuration, utilities, and test execution are separated.

## Reusability

Common operations are implemented once and reused by different test scenarios.

## Maintainability

The framework structure allows additional workflows and scenarios to be added without rewriting the existing API layer.

## Observability

Custom metrics provide visibility into both technical performance and business-level results.

## Incremental Development

The framework is intentionally built through small iterations rather than attempting to create a large framework in one step.

---

# 📚 Iteration History

The framework has been developed incrementally.

### Iteration 1

Initial QuickPizza k6 E2E test structure.

### Iteration 2

Introduced framework-level organization and reusable components.

### Iteration 3

Improved API interaction and test workflow handling.

### Iteration 4

Added configuration and reusable utilities.

### Iteration 5

Introduced custom metrics and performance measurements.

### Iteration 6

Improved validation and threshold handling.

### Iteration 7

Improved framework organization and execution flow.

### Iteration 8

Completed the current E2E framework iteration with improved workflow execution, validation, metrics, and framework structure.

> The iteration history represents the learning and development progression of the project.

---

# 📊 Current Framework Status

| Capability                 | Status |
| -------------------------- | ------ |
| k6 API Testing             | ✅      |
| QuickPizza E2E Workflow    | ✅      |
| Authentication             | ✅      |
| API Utilities              | ✅      |
| Centralized Configuration  | ✅      |
| Custom Trend Metric        | ✅      |
| Custom Counter Metric      | ✅      |
| Custom Rate Metric         | ✅      |
| Custom Gauge Metric        | ✅      |
| Checks                     | ✅      |
| Thresholds                 | ✅      |
| Configurable Base URL      | ✅      |
| Structured Framework       | ✅      |
| Iterative Development      | ✅      |
| Multiple Load Profiles     | 🔄     |
| Advanced Reporting         | ⏳      |
| GitHub Actions CI/CD       | ⏳      |
| Historical Result Tracking | ⏳      |

---

# 🧪 Performance Testing Scope

This project demonstrates the following performance-testing concepts:

* Baseline testing
* Load modeling
* Virtual users
* Iterations
* Response-time measurement
* Custom metrics
* Thresholds
* Business transaction measurement
* Authentication performance
* API workflow performance

The project is intended to strengthen practical understanding of k6 and performance-test framework development.

---

# ⚠️ Test Environment Disclaimer

This project uses the **public QuickPizza demo environment**.

The results generated by this framework are influenced by factors such as:

* Shared public infrastructure
* Network conditions
* Test load
* Service availability
* Environment variability

Therefore, the results should **not be interpreted as production capacity benchmarks or SLAs**.

The official QuickPizza project describes the public environment as suitable for small-scale performance tests.

---

# 🎓 Learning Objectives

This project is being developed to strengthen practical skills in:

* k6
* JavaScript
* API testing
* Performance testing
* Load modeling
* Custom metrics
* Thresholds
* Test architecture
* Reusable framework design
* Git and GitHub
* Performance-result analysis

---

# 🔮 Planned Enhancements

Future improvements may include:

* Additional API workflows
* More structured scenario configuration
* Additional load profiles
* HTML performance reports
* GitHub Actions integration
* Automated performance-test execution
* Historical result comparison
* Improved result visualization

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

## ⭐ Project Goal

The goal of this project is to demonstrate the ability to **progressively design, structure, execute, analyze, and improve a k6 API performance-testing framework**.

Rather than focusing only on individual scripts, the project emphasizes:

```text
Test
 ↓
Framework
 ↓
Metrics
 ↓
Validation
 ↓
Analysis
 ↓
Continuous Improvement
```

This project is part of my ongoing learning journey toward stronger **QA Automation / SDET / Performance Testing** capabilities.
