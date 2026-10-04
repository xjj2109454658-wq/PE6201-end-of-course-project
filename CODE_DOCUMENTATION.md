# Code Documentation

## 1. Project Overview

This project implements an AI-assisted house price estimation prototype for residential properties in Ames, Iowa.

The system combines a React-based frontend with a Python/Jupyter Notebook-based machine learning and AI processing workflow. Users can describe a property in natural language, including English or Chinese descriptions and different area units. The system extracts a predefined set of housing features, allows the user to review the extracted values, validates the inputs, and then generates an estimated sale price using a trained Random Forest regression model.

The implementation separates the roles of language understanding and numerical prediction. The language model is used for structured feature extraction, while the locally trained machine learning model performs the final price prediction.

The main code components are:

- `house_price_project.ipynb` — Python data processing, model training, LLM feature extraction, validation, prediction, and evaluation.
- `frontend/src/App.jsx` — main React application and user interaction logic.
- `frontend/src/main.jsx` — React application entry point.
- `frontend/src/App.css` — component-level interface styling.
- `frontend/src/index.css` — global frontend styling.
- `frontend/package.json` — frontend dependencies and scripts.
- `frontend/vite.config.js` — Vite development and build configuration.

---

## 2. Repository Structure

```text
PE6201-end-of-course-project/
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── house-prices-advanced-regression-techniques/
│   ├── data_description.txt
│   ├── data_readme.md
│   ├── sample_submission.csv
│   ├── test.csv
│   └── train.csv
│
├── house_price_project.ipynb
├── train.csv
├── README.md
├── DATA_README.md
├── EVAL_README.md
└── CODE_DOCUMENTATION.md
```

Generated dependency directories such as `node_modules` and the local Python virtual environment are excluded from version control.

---

# 3. Python and Machine Learning Implementation

## 3.1 `house_price_project.ipynb`

The notebook contains the main Python implementation of the machine learning and AI processing workflow.

It covers:

1. Dataset loading and inspection.
2. Feature selection.
3. Train/test splitting.
4. Regression model training.
5. Model evaluation using RMSE.
6. LLM-based property feature extraction.
7. Unit conversion.
8. Input validation.
9. Price prediction.
10. End-to-end evaluation cases.

The notebook is therefore the main implementation reference for the project's Python-side processing.

---

## 3.2 Dataset Loading and Feature Selection

The notebook loads the Ames housing training data from `train.csv`.

The prediction target is:

```text
SalePrice
```

Seven housing features are selected for the prediction model:

```text
GrLivArea
OverallQual
YearBuilt
TotalBsmtSF
FullBath
BedroomAbvGr
GarageCars
```

These features represent:

- above-ground living area;
- overall house quality;
- construction year;
- basement area;
- number of full bathrooms;
- number of bedrooms above ground;
- garage capacity.

The model intentionally uses a limited set of features rather than the complete Ames dataset. This keeps the prototype's input requirements manageable and makes the natural-language extraction process easier to explain.

---

## 3.3 Train/Test Split

The dataset is divided into training and held-out test sets using an 80/20 split.

The split uses:

```text
random_state = 42
```

This fixed random seed makes the model evaluation reproducible.

The held-out test set contains 292 homes.

---

## 3.4 Regression Models

Two regression models are trained using the same seven features and the same train/test split.

### Linear Regression

Linear Regression is used as an interpretable baseline.

Its recorded held-out test RMSE is approximately:

```text
$38,999
```

### Random Forest Regressor

Random Forest is used as the selected model for the prototype.

The configuration includes:

```text
n_estimators = 200
min_samples_leaf = 2
random_state = 42
n_jobs = -1
```

Its recorded held-out test RMSE is approximately:

```text
$29,941
```

The Random Forest model therefore provides the lower RMSE among the two tested regressors and is used for the prototype's final price estimation.

The test-set mean sale price is approximately:

```text
$178,840
```

These metrics describe performance on the historical held-out test set. They should not be interpreted as a guaranteed error range for an individual property or as evidence of current market valuation accuracy.

---

# 4. LLM-Based Feature Extraction

## 4.1 `extract_features(description)`

The `extract_features()` function converts a user's natural-language property description into structured housing features.

The function sends the description to an LLM through OpenRouter using the `openai/gpt-4.1-mini` model.

The extraction prompt defines the required seven fields and specifies how the model should handle different input situations.

The expected output is a JSON object containing:

```text
GrLivArea
OverallQual
YearBuilt
TotalBsmtSF
FullBath
BedroomAbvGr
GarageCars
```

The response is parsed using JSON before the extracted values are passed to the validation stage.

The API request uses deterministic settings, including:

```text
temperature = 0
```

This reduces unnecessary variation in structured extraction results.

---

## 4.2 Unit Conversion

The extraction process supports property descriptions using different area units.

When a description provides square metres, the LLM extraction process converts the area into square feet so that the resulting value is consistent with the model's training data.

The conversion uses:

```text
1 square metre ≈ 10.7639 square feet
```

This allows users to describe properties naturally without having to manually convert measurements before using the estimator.

---

## 4.3 Missing and Conflicting Information

The extraction prompt is designed to return `null` when a required value cannot be reliably determined.

This is important for cases where:

- a required feature is not mentioned;
- two values for the same feature conflict;
- the available description does not provide enough information to determine the value confidently.

Returning `null` allows the later validation layer to block the prediction instead of silently using an unreliable value.

---

## 4.4 API Key Handling

The OpenRouter API key is loaded from an environment variable rather than being hard-coded into the source code.

The notebook uses:

```python
load_dotenv(".env")
api_key = os.getenv("OPENROUTER_API_KEY")
```

The `.env` file is excluded through `.gitignore`, so the secret API key is not committed to GitHub.

---

# 5. Validation and Prediction

## 5.1 `check_and_estimate(values)`

The `check_and_estimate()` function is responsible for validating extracted features before generating a prediction.

The function performs two main levels of validation.

### Required-field validation

The function first checks whether any of the seven required features is missing.

If one or more required fields are `None`, the system returns a blocked result instead of attempting a prediction.

### Range and type validation

For each feature, the function checks that:

- the value is numeric;
- the value is not a boolean;
- the value is within the minimum and maximum range observed in the training data.

This prevents unsupported values from being passed directly to the model.

For example, the training data contains construction years from 1872 to 2010. A property with `YearBuilt = 2022` is therefore blocked by the validation layer.

---

## 5.2 Prediction

After all validation checks pass, the seven feature values are placed into a one-row pandas DataFrame.

The data is then passed to the trained Random Forest model.

The predicted sale price is converted to a standard floating-point value and rounded to the nearest whole dollar.

The function returns a structured result containing:

```text
status
reason
estimated_price
```

For blocked inputs, `estimated_price` is returned as `None` and the reason explains why the system did not proceed.

---

# 6. Frontend Implementation

## 6.1 `frontend/src/App.jsx`

`App.jsx` is the main React component and contains the primary user interface and interaction logic.

The application is organised into four navigation sections:

1. Price estimator
2. Model performance
3. Test cases
4. About the project

The frontend also provides the user with a three-step interaction flow:

```text
01 Describe property
        ↓
02 Review features
        ↓
03 Get estimate
```

---

## 6.2 State Management

React `useState` is used to manage the application's dynamic state.

The main state variables include:

- `page` — currently selected interface section.
- `description` — user's natural-language property description.
- `values` — extracted or manually reviewed feature values.
- `extracting` — whether feature extraction is currently running.
- `estimating` — whether price estimation is currently running.
- `message` — user-facing status or error message.
- `estimate` — returned estimated sale price.
- `requestCost` — API cost associated with the extraction request.
- `blockedReason` — explanation shown when estimation is blocked.

This state structure allows the interface to update immediately after extraction, validation, user edits, and prediction.

---

## 6.3 Property Description Input

The estimator provides a text area where users can describe a property naturally.

The interface supports English and Chinese descriptions.

Users can also load a predefined example using the `Load example` action.

The interface records the current description length and disables the extraction button when the description is empty.

---

## 6.4 Feature Extraction Request

The `extractPropertyFeatures()` function sends the property description to the local processing endpoint:

```text
POST /extract
```

The returned values are mapped to the seven predefined fields.

If the extraction layer returns a missing value, the corresponding frontend field is displayed as empty so that the user can review it.

The frontend also displays the API request cost when this information is returned by the processing layer.

If extraction succeeds and the result is ready, the user is prompted to review every extracted value before continuing.

If the extraction result requires review, the interface displays the returned reason.

---

## 6.5 Human Review

The frontend intentionally separates extraction from prediction.

After feature extraction, the seven values are displayed as editable numeric fields.

Users can manually correct extracted values before requesting an estimate.

Changing any value clears the previous estimate and status message. This prevents an old prediction from being displayed after the underlying input has changed.

The `Confirm and estimate` button is enabled only when all seven fields have values.

---

## 6.6 Estimation Request

The `confirmAndEstimate()` function converts the reviewed values into numeric values and sends them to:

```text
POST /estimate
```

If the processing layer returns a blocked status, the frontend does not display a price. Instead, it shows the reason for blocking.

For valid inputs, the returned estimated price is displayed in the estimate card.

The result card also displays:

- prediction model;
- historical test RMSE;
- current API request cost.

This provides context rather than presenting the estimate as a guaranteed market value.

---

# 7. Frontend Supporting Files

## 7.1 `frontend/src/main.jsx`

`main.jsx` is the React entry point.

It imports:

- React `StrictMode`;
- the global stylesheet;
- the main `App` component.

It then renders the application into the HTML element with the ID `root`.

The file is intentionally small because the main application logic is implemented in `App.jsx`.

---

## 7.2 `frontend/src/App.css`

`App.css` contains component-level styling for the application.

It controls the visual presentation of:

- sidebar navigation;
- page headings;
- panels;
- input fields;
- buttons;
- estimate cards;
- model performance cards;
- evaluation tables;
- status messages;
- responsive layouts.

Keeping these styles separate from `App.jsx` makes the interface logic easier to maintain.

---

## 7.3 `frontend/src/index.css`

`index.css` contains global styling rules used by the frontend.

It establishes the base styling and page-level layout behaviour, while `App.css` handles application-specific component styling.

---

## 7.4 `frontend/package.json`

`package.json` defines the frontend dependencies and development scripts.

The project uses React and Vite.

The main local development command is:

```bash
npm run dev
```

This starts the Vite development server for local frontend testing.

---

## 7.5 `frontend/vite.config.js`

`vite.config.js` contains the Vite configuration used by the React frontend.

It provides the configuration required for the frontend development and build process.

---

# 8. Evaluation Implementation

The notebook contains six end-to-end evaluation scenarios designed to test different parts of the system.

The cases cover:

### Case 1 — English, square feet, complete

A complete English property description is used to test successful feature extraction and prediction.

Recorded result:

```text
Estimated $194,164
```

### Case 2 — Larger valid house

A larger but valid property is used to test whether the model can process a different valid feature combination.

Recorded result:

```text
Estimated $332,000
```

### Case 3 — Missing required fields

The description intentionally omits:

```text
OverallQual
TotalBsmtSF
GarageCars
```

The expected behaviour is to block estimation.

### Case 4 — Conflicting garage capacity

The description contains two different garage capacities.

The extraction layer is expected to return the garage capacity as unresolved, resulting in blocked estimation.

### Case 5 — Year outside training range

The description specifies:

```text
YearBuilt = 2022
```

The training data ends at 2010, so the validation layer blocks the estimate.

### Case 6 — Chinese, square metres, complete

A complete Chinese description uses square metres for area measurements.

The system converts the measurements and performs a valid prediction.

The latest recorded notebook result is:

```text
Estimated $195,170
```

Detailed results, API costs, expected behaviours, and limitations are documented in `EVAL_README.md`.

---

# 9. Code Design Principles

## Separation of AI and Prediction

The LLM and machine learning model perform different tasks.

The LLM handles natural-language understanding and structured feature extraction. The Random Forest handles numerical price prediction.

This separation makes it easier to evaluate the two stages independently.

## Human-in-the-Loop Review

The system does not immediately trust extracted values.

Instead, the extracted features are shown to the user for review before prediction.

This provides an additional safeguard against LLM extraction errors.

## Explicit Validation

The system blocks incomplete, conflicting, invalid, and out-of-range inputs rather than producing a prediction from uncertain information.

## Reproducible Evaluation

The machine learning experiments use a fixed train/test split and `random_state = 42`.

This makes the recorded model comparison reproducible from the notebook.

## Secure Configuration

API credentials are loaded from environment variables and excluded from version control.

---

# 10. Implementation Boundaries

The submitted repository contains the React frontend and the Python/Jupyter Notebook implementation.

The frontend is configured to communicate with local processing endpoints at:

```text
http://127.0.0.1:8000
```

using the `/extract` and `/estimate` routes.

The Python processing implementation currently included in the repository is documented in:

```text
house_price_project.ipynb
```

rather than as a separate `backend.py` source file.

This documentation describes the implementation that is actually present in the submitted repository and does not introduce additional backend files that are not included in the codebase.

---

# 11. Limitations Relevant to the Code

The current implementation has several important boundaries:

- The prediction model uses only seven housing features.
- Neighbourhood information is not included in the model.
- The model is trained on historical Ames housing data.
- The training data covers construction years up to 2010.
- Range validation cannot guarantee that an extracted value is semantically correct if it is within the allowed numerical range.
- LLM extraction can still make mistakes, which is why human review is included in the workflow.
- The six end-to-end evaluation cases are scenario-based and are not sufficient to establish general extraction accuracy or model robustness.
- The model's RMSE is a test-set aggregate and should not be interpreted as the expected error for every individual property.
- The system is a research prototype rather than a validated current-market property valuation tool.

---

# 12. Related Documentation

The repository contains additional documentation files:

- `README.md` — project overview and setup information.
- `DATA_README.md` — dataset description and data usage.
- `EVAL_README.md` — evaluation cases, expected behaviours, results, API costs, and evaluation limitations.
- `CODE_DOCUMENTATION.md` — detailed explanation of the code structure and implementation.