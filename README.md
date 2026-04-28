# FairMind: How It Works

FairMind is a full-stack AI fairness and bias detection platform. This document explains the exact technical architecture, the flow of data, and the mathematical logic running under the hood to detect and mitigate bias in machine learning models.

---

## 🛠️ 1. The Technology Stack

FairMind uses a modern, decoupled dual-stack architecture:

### Frontend (User Interface)
* **React 19 + Vite:** Blazing fast modern JavaScript framework.
* **Tailwind CSS v4:** Utility-first CSS for the premium, responsive UI.
* **Recharts:** Used for rendering the dynamic Bar Charts and data visualizations.
* **Lucide React:** Iconography.

### Backend (ML Engine & API)
* **FastAPI:** High-performance Python web framework to handle API requests.
* **Pandas:** Used for data ingestion, CSV parsing, and metadata extraction.
* **Scikit-Learn:** Used to train the baseline (biased) `RandomForestClassifier` on the fly.
* **Fairlearn (Microsoft):** The core algorithmic engine used to mathematically measure bias metrics and perform model mitigation (re-weighting).

---

## 🔄 2. The Application Flow

1. **Data Ingestion (`POST /api/v1/datasets/upload`)**
   * The user uploads a CSV file via the React UI, specifying the `Target Column` (what to predict) and the `Protected Attribute` (the sensitive demographic, like Gender or Education).
   * FastAPI uses Pandas to parse the file in memory, count the distributions, and check for missing values.

2. **Baseline Model Training & Auditing (`POST /api/v1/audits/run`)**
   * The backend cleans the data (drops NaNs, selects numeric columns) and trains a baseline `RandomForestClassifier`.
   * It generates predictions (`y_pred`) for every row.
   * It then mathematically compares how the model treated the different groups within the `Protected Attribute`.

3. **Bias Mitigation (`POST /api/v1/audits/mitigate`)**
   * If the model is biased, the user triggers the Mitigation Engine.
   * The backend wraps the Random Forest model in Fairlearn's `ExponentiatedGradient` algorithm, mathematically forcing it to learn fair rules.
   * It generates a new set of predictions and returns the cleaned metrics.

4. **Data Export (`GET /api/v1/datasets/download_mitigated`)**
   * The user downloads a pre-processed CSV where every row is assigned a mathematical `fairness_weight` so they can train fair models externally.

---

## 🧮 3. The Math & Logic Explained

### A. Proxy Detection
* **What it does:** Finds harmless-looking variables (like Zip Code) that secretly correlate with protected attributes (like Race).
* **The Math:** Pearson Correlation Coefficient. The backend calculates `df.corr()` for all numeric columns against the protected attribute. Anything with a correlation `> 0.15` is flagged as a potential proxy.

### B. Demographic Parity
* **What it does:** Asks, *"Are both groups being approved at the exact same rate?"*
* **The Math:** 
  * `Rate A = P(Y_pred = 1 | Group = A)`
  * `Rate B = P(Y_pred = 1 | Group = B)`
  * `Metric = Rate B - Rate A`
* **Goal:** The difference should be as close to `0.0` as possible.

### C. Equal Opportunity
* **What it does:** Asks, *"Out of the people who ACTUALLY deserved the loan (True Positives), did the model approve them equally across groups?"*
* **The Math:** 
  * `TPR A = P(Y_pred = 1 | Y_true = 1, Group = A)`
  * `TPR B = P(Y_pred = 1 | Y_true = 1, Group = B)`
  * `Metric = TPR B - TPR A`
* **Goal:** The True Positive Rates should be identical (difference of `0.0`).

### D. Disparate Impact (The 80% Rule)
* **What it does:** The US legal standard for discrimination (e.g., ECOA). It checks the ratio of approval rates between the minority and majority groups.
* **The Math:** 
  * `Metric = Rate B / Rate A`
* **Goal:** If the ratio falls below `0.80`, it is legally considered disparate impact. The UI turns red if this threshold is failed.

### E. The Mitigation Engines

FairMind uses two distinct mitigation techniques:

**1. In-Processing (Fixing the Model)**
* Used when you click the "Run Mitigation Engine" button.
* Uses Fairlearn's `ExponentiatedGradient`. It treats fairness as a constrained optimization problem. It trains a sequence of Random Forest models, tweaking the sample weights each time to minimize the Demographic Parity difference while maximizing accuracy.

**2. Pre-Processing (Fixing the Data)**
* Used when you click the "Export Data" button.
* Uses **Inverse Frequency Reweighting**. 
* **The Math:** If a group represents only 10% of the dataset, their weight becomes `1 / 0.10 = 10`. If another group is 90%, their weight is `1 / 0.90 = 1.11`. 
* These weights are normalized and appended to the CSV as `fairness_weight`. When a Data Scientist trains a model using these weights, the model is penalized 10x more for getting a minority prediction wrong, effectively balancing the dataset without deleting any rows.