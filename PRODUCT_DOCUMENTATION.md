# Product Documentation

## 1. Product Overview

### Product Name

**AI-Assisted House Price Estimation**

### Product Purpose

AI-Assisted House Price Estimation is a prototype that helps users estimate the potential sale price of a residential property from a natural-language description.

Instead of requiring users to manually enter every model feature at the beginning, the system uses an LLM to extract structured housing information from the user's description. The extracted values are then presented to the user for review before being passed to a Random Forest regression model for price estimation.

The product is designed as an AI-assisted decision-support tool rather than a professional property valuation service.

---

# 2. Persona

## Primary Persona

### Prospective Home Buyer or Seller

A user who wants a quick, approximate indication of a property's potential value without manually preparing a structured machine-learning input.

Typical characteristics:

- Has basic information about a residential property.
- May describe a property using natural language rather than structured data.
- May not be familiar with machine learning models or housing datasets.
- Wants a simple estimate and an understandable interaction process.
- May provide information in English or Chinese.
- May use different area units, such as square feet or square metres.

## Secondary Persona

### AI / Data Science Learner

A student or learner who wants to understand how an LLM and a traditional machine-learning model can be combined in a practical AI application.

For this user, the product demonstrates:

- natural-language feature extraction;
- structured data validation;
- human-in-the-loop interaction;
- regression-based prediction;
- evaluation of successful and blocked cases.

---

# 3. User Input

The main user input is a **natural-language property description**.

For example, a user may describe:

- above-ground living area;
- overall house quality;
- construction year;
- basement area;
- number of full bathrooms;
- number of bedrooms;
- garage capacity.

The system extracts the following seven model features:

| Feature | Meaning | Example |
|---|---|---:|
| `GrLivArea` | Above-ground living area | 1,710 sq ft |
| `OverallQual` | Overall quality | 7 / 10 |
| `YearBuilt` | Construction year | 2003 |
| `TotalBsmtSF` | Basement area | 856 sq ft |
| `FullBath` | Full bathrooms | 2 |
| `BedroomAbvGr` | Bedrooms above ground | 3 |
| `GarageCars` | Garage capacity | 2 cars |

The user can review and manually edit the extracted values before requesting the final estimate.

---

# 4. Supported Input Behaviour

The product is designed to handle several types of natural-language input.

### English descriptions

The system can extract features from English property descriptions.

### Chinese descriptions

The evaluation includes a complete Chinese property description.

### Different area units

The system supports square-metre descriptions by converting them to square feet before prediction.

### Missing information

If a required feature cannot be determined, the system blocks the prediction.

### Conflicting information

If the description contains conflicting information, the system is designed to avoid making an unsupported assumption and instead blocks the estimate until the information is clarified.

### Out-of-range values

If a value falls outside the range observed in the training data, the system blocks the prediction.

---

# 5. Product Output

The primary output is an **estimated house sale price**.

For a valid input, the product displays:

- estimated price;
- prediction model;
- model test RMSE;
- API request cost.

For an invalid or unsupported input, the product does not generate a price. Instead, it displays an explanation of why the estimate was blocked.

This behaviour is intended to reduce the risk of presenting a numerical prediction when the input is incomplete, conflicting, or outside the model's supported range.

---

# 6. High-Level Product Architecture

The product follows a multi-stage AI-assisted prediction workflow:

```text
┌──────────────────────────┐
│          User            │
│ Natural-language input   │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│     React Frontend       │
│  Description + Review    │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│    LLM Feature           │
│      Extraction          │
│                          │
│ Natural language → JSON  │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ Unit Conversion &        │
│ Input Validation         │
│                          │
│ Missing / conflict /     │
│ out-of-range checks      │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│     Human Review         │
│                          │
│ User checks and edits    │
│ extracted features       │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│ Random Forest Regressor  │
│                          │
│ 7 structured features   │
│ → estimated price        │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│      Price Estimate      │
│ + model / cost context   │
└──────────────────────────┘
```

The frontend is implemented in React.

The Python machine-learning and LLM processing workflow is implemented in `house_price_project.ipynb`.

The frontend is configured to communicate with local processing endpoints at `127.0.0.1:8000`. The current repository does not contain a separate `backend.py` source file; the Python processing logic is documented in the notebook.

---

# 7. Product Workflow

The user-facing workflow consists of three main steps.

## Step 1 — Describe Property

The user enters a natural-language description of the property.

The system sends the description to the LLM extraction layer.

## Step 2 — Review Features

The extracted seven features are displayed in editable fields.

The user can review the values and correct them if necessary.

This human-in-the-loop step is important because an LLM may extract information incorrectly even when the overall description is understandable.

## Step 3 — Get Estimate

After the required fields are completed and validated, the structured features are passed to the Random Forest model.

The model generates the estimated sale price, which is displayed to the user together with contextual information about the model.

---

# 8. Metrics Targeted

The product targets several dimensions of system quality.

## 8.1 Prediction Performance

The primary machine-learning metric is **Root Mean Squared Error (RMSE)**.

A lower RMSE indicates smaller average prediction errors on the held-out test set.

Two models were compared:

- Linear Regression baseline;
- Random Forest Regressor.

The Random Forest model was selected because it achieved the lower recorded test RMSE.

## 8.2 Extraction and Validation Reliability

The product also targets reliable handling of:

- complete inputs;
- missing information;
- conflicting information;
- out-of-range values;
- different languages;
- different area units.

The system is designed to block unsupported cases instead of always returning a numerical prediction.

## 8.3 Human Review

Another product objective is to keep the user involved in the prediction process.

Rather than directly passing the LLM output to the regression model, the system allows users to review and modify the extracted features.

## 8.4 API Cost Awareness

The product records the API cost associated with the LLM extraction request.

This provides an additional operational metric for evaluating the feasibility of the AI-assisted workflow.

---

# 9. Metrics Reached

## 9.1 Model Performance

On the held-out test set:

| Metric | Result |
|---|---:|
| Linear Regression RMSE | ~$38,999 |
| Random Forest RMSE | ~$29,941 |
| Test-set mean SalePrice | ~$178,840 |
| Test set size | 292 homes |
| Training set size | 1,168 homes |

The Random Forest model achieved a lower RMSE than the Linear Regression baseline on the same held-out test set.

The model uses:

```text
n_estimators = 200
min_samples_leaf = 2
random_state = 42
```

These results should be interpreted as historical test-set performance rather than a guarantee of current real-world property valuation accuracy.

---

## 9.2 End-to-End Evaluation

Six scenario-based end-to-end evaluation cases were completed.

| Case | Scenario | Result |
|---:|---|---|
| 1 | English; square feet; complete | Estimated $194,164 |
| 2 | English; larger valid house | Estimated $332,000 |
| 3 | Missing required fields | Blocked |
| 4 | Conflicting garage capacity | Blocked |
| 5 | Year outside training range | Blocked |
| 6 | Chinese; square metres; complete | Estimated $195,170 |

The six cases include both successful prediction scenarios and cases where the system correctly refuses to produce an estimate.

This gives the product evaluation coverage across:

- successful extraction;
- successful prediction;
- multilingual input;
- unit conversion;
- missing information;
- conflicting information;
- training-range validation.

---

## 9.3 API Cost

Across the six evaluation attempts, the recorded mean LLM API cost per attempt was approximately:

**$0.0001795 USD**

This measures the cost of the LLM feature-extraction step during the evaluation cases.

It does not represent the full operational cost of deploying the product at scale.

---

# 10. Product Safety and Reliability Considerations

The product does not treat every LLM extraction as automatically trustworthy.

Several design decisions are intended to reduce unreliable outputs:

### Human-in-the-loop review

Users can inspect and modify extracted values before prediction.

### Explicit blocking

The system blocks missing, conflicting, invalid, or out-of-range inputs.

### Training-range validation

Values are checked against the observed feature ranges in the training dataset.

### Transparent context

The interface displays model information and test RMSE alongside the estimate.

### Clear product positioning

The output is presented as an estimate from a machine-learning model, not as a professional valuation or guaranteed market price.

---

# 11. Product Limitations

The current prototype has several limitations.

First, the prediction model uses only seven housing features. Important factors such as neighbourhood and other detailed property characteristics are not included.

Second, the model is trained on historical Ames housing data. Therefore, the estimated prices may not generalise to other cities, housing markets, or time periods.

Third, the six evaluation cases are scenario-based and relatively small. They demonstrate selected system behaviours but cannot establish general LLM extraction accuracy or overall system robustness.

Fourth, range validation only confirms that a value falls within the numerical range observed in the training data. It does not prove that the extracted value is semantically correct.

Finally, the current implementation is a prototype designed to demonstrate an AI-assisted workflow. It should not be used as a substitute for professional property valuation.

---

# 12. Summary

AI-Assisted House Price Estimation combines an LLM, explicit validation, human review, and a Random Forest regression model into a single user-facing workflow.

The product demonstrates how natural-language AI can be connected to a conventional machine-learning prediction pipeline while retaining validation and human oversight.

The current prototype successfully demonstrates:

- natural-language property feature extraction;
- English and Chinese input handling;
- square-metre to square-foot conversion;
- human review of extracted features;
- explicit input validation;
- Random Forest price estimation;
- blocked handling of unsupported cases;
- scenario-based end-to-end evaluation;
- API cost tracking.

The system is therefore best understood as an AI-assisted house price estimation prototype and a demonstration of an end-to-end AI product workflow.