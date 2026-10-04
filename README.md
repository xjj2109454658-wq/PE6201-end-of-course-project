# Evaluation and Validation

## Overview

This project evaluates the house price estimation workflow through end-to-end test cases covering natural-language feature extraction, unit conversion, input validation, and price prediction.

The evaluation is designed to test not only whether the system can produce a house price estimate from a complete description, but also whether it can appropriately block estimation when the input is incomplete, conflicting, or outside the supported training-data range.

The evaluation includes six test cases covering English and Chinese inputs, square feet and square metres, complete descriptions, missing required information, conflicting information, and an out-of-range construction year.

## Evaluation Cases

| Case | Scenario | Extraction | System Result | API Cost (USD) |
|---:|---|---|---|---:|
| 1 | English; square feet; complete | 7/7 features extracted | Estimated $194,164 | 0.000178 |
| 2 | English; larger valid house; complete | 7/7 features extracted | Estimated $332,000 | 0.000181 |
| 3 | Missing required fields | OverallQual, TotalBsmtSF and GarageCars expected as null | Blocked; required fields are missing | 0.000172 |
| 4 | Conflicting garage capacity | GarageCars expected as null | Blocked; garage capacity must be clarified | 0.000182 |
| 5 | Construction year outside training range | YearBuilt = 2022 | Blocked; year exceeds 2010 | 0.000178 |
| 6 | Chinese; square metres; complete | 7/7 features extracted; units converted | Estimated $195,170 | 0.000186 |

**Verified test cases: 6**

## Test Case Details

### Case 1 — English Description in Square Feet

The first case uses a complete English-language house description with measurements already provided in square feet.

The system successfully extracted all seven model features:

- `GrLivArea = 1710`
- `OverallQual = 7`
- `YearBuilt = 2003`
- `TotalBsmtSF = 856`
- `FullBath = 2`
- `BedroomAbvGr = 3`
- `GarageCars = 2`

The extracted values passed validation and were passed to the Random Forest model.

**System result: $194,164**

This case provides the baseline successful end-to-end test for a complete and valid English input.

### Case 2 — Larger Valid House

The second case tests a larger property with valid values across all seven required features.

The description specifies a 2,400-square-foot living area, overall quality of 9, construction year 2008, a 1,200-square-foot basement, three full bathrooms, four bedrooms, and a two-car garage.

The system successfully extracted all seven required features and the values passed the training-data range checks.

**System result: $332,000**

This case tests whether the system can handle a larger valid property rather than only the baseline property used in Case 1.

### Case 3 — Missing Required Fields

The third case intentionally omits three required model features:

- `OverallQual`
- `TotalBsmtSF`
- `GarageCars`

The system is expected to return `null` for these missing fields rather than infer unsupported values.

Because the model requires all seven features for prediction, the validation layer detects the missing values and blocks the estimate.

**System result: Blocked**

This demonstrates a safety-oriented design choice: when information required for prediction is unavailable, the system does not silently fill in assumptions and produce a potentially misleading price.

### Case 4 — Conflicting Garage Capacity

The fourth case tests conflicting information in the natural-language input.

The description gives two different garage capacities. Because the system cannot reliably determine which value is correct, `GarageCars` is expected to be returned as `null`.

The validation layer therefore blocks the prediction and asks for clarification rather than selecting one of the conflicting values arbitrarily.

**System result: Blocked**

This case tests the system's ability to recognise ambiguity rather than treating every extracted value as trustworthy.

### Case 5 — Construction Year Outside the Training Range

The fifth case provides a house built in **2022**.

The extracted features are otherwise complete and valid, but the training dataset contains construction years only within the supported range of **1872 to 2010**.

The validation function checks each feature against the minimum and maximum values observed in the training data. Since `YearBuilt = 2022` exceeds the upper boundary, the system blocks the prediction.

**System result: Blocked**

This test demonstrates why range validation is important. Even when all required fields are present, an input outside the model's observed training range may represent a situation where the model cannot be expected to generalise reliably.

### Case 6 — Chinese Description in Square Metres

The sixth case tests multilingual input and unit conversion.

The house description is provided in Chinese, with living area and basement area expressed in square metres. The system converts the area values into square feet before passing them to the prediction model.

The system successfully extracted all seven required features and converted the area measurements before prediction.

**System result: $195,170**

This case demonstrates that the system can support a different input language and measurement unit while maintaining the feature schema required by the underlying model.

## What These Tests Verify

### Feature Extraction

The evaluation checks whether the LLM extraction component can transform natural-language descriptions into the seven structured features required by the prediction model:

- `GrLivArea`
- `OverallQual`
- `YearBuilt`
- `TotalBsmtSF`
- `FullBath`
- `BedroomAbvGr`
- `GarageCars`

Complete cases test whether all seven fields can be extracted, while incomplete or ambiguous cases test whether the system can correctly identify information that should not be treated as known.

### Multilingual and Unit Handling

The evaluation includes both English and Chinese descriptions.

Cases 1 and 2 use English descriptions with square-foot measurements, while Case 6 uses Chinese text and square-metre measurements. This tests whether the natural-language interface can handle different ways of expressing the same underlying property information.

For square-metre inputs, the system converts the measurements to square feet using the conversion factor defined in the extraction pipeline before model prediction.

### Input Validation

The validation layer checks for missing values, invalid values, and values outside the observed training-data range.

Cases 3–5 specifically test failure-handling behaviour:

- Case 3 tests missing required information.
- Case 4 tests conflicting information.
- Case 5 tests an input outside the training-data range.

The intended behaviour is to block estimation rather than produce a prediction when the system does not have sufficiently reliable input.

### End-to-End Prediction

Cases 1, 2, and 6 demonstrate successful completion of the complete workflow:

**Natural-language input → LLM feature extraction → structured features → validation → Random Forest prediction**

Cases 3–5 demonstrate the corresponding validation path:

**Natural-language input → LLM feature extraction → validation failure → prediction blocked**

Together, the cases test both the normal and defensive paths of the system.

## Ground Truth and Expected Behaviour

For these evaluation cases, ground truth is defined primarily at the level of expected system behaviour and expected extracted feature values.

For complete valid inputs, the expected behaviour is that all seven required features are available, the values pass validation, and the system produces an estimated house price.

For incomplete inputs, the expected behaviour is that missing required fields are represented as `null` and the prediction is blocked.

For conflicting inputs, the expected behaviour is that the ambiguous field is not treated as a reliable value and the prediction is blocked until clarification is provided.

For values outside the training-data range, the expected behaviour is that the validation layer blocks the prediction rather than extrapolating without warning.

The successful prediction cases also provide the recorded model outputs from the executed notebook evaluation:

- Case 1: **$194,164**
- Case 2: **$332,000**
- Case 6: **$195,170**

These values are model estimates, not guaranteed market prices.

## Evaluation Limitations

These six cases confirm specific extraction, validation, unit-conversion, and prediction behaviours, but they do not establish general model accuracy or robustness.

The evaluation set is intentionally small and scenario-based. It is useful for checking whether key system behaviours work as intended, but it is not large enough to support broad claims about performance across all possible housing descriptions.

In particular, successful extraction in these six cases does not imply that the LLM will correctly extract every possible phrasing, language, unit, or ambiguous property description.

Similarly, successful prediction does not mean that the estimated price represents the actual market value of a property. The Random Forest model learns patterns from the available historical training data, and its predictions may not generalise to different housing markets, time periods, or property types.

The out-of-range test in Case 5 also demonstrates an important limitation: the validation layer can prevent some unsupported inputs from reaching the model, but it cannot guarantee that every valid-looking input will be accurately represented by the training distribution.

A larger evaluation set with systematically sampled property descriptions, multilingual inputs, ambiguous cases, and independent ground-truth prices would be required for a more comprehensive assessment of model and system performance.

## API Usage

Each evaluation case that requires natural-language feature extraction makes an OpenRouter API request using the configured LLM extraction pipeline.

The API cost recorded for each case is included in the evaluation table above. Across the six executed evaluation cases, the mean API cost per attempt is approximately:

**$0.0001795 USD**

The API cost reflects the recorded usage reported by the extraction API and may vary slightly between requests.

## Summary

The six evaluation cases demonstrate that the system can:

- Extract the seven required housing features from natural-language descriptions.
- Process both English and Chinese inputs.
- Convert square-metre measurements into the square-foot format required by the model.
- Produce price estimates for complete and valid property descriptions.
- Detect missing required information.
- Detect conflicting information and request clarification.
- Block predictions for values outside the supported training-data range.

The evaluation therefore provides evidence that the implemented workflow includes both a functional prediction path and validation mechanisms designed to reduce unreliable predictions.