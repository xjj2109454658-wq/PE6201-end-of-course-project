# Evaluation and Validation

## Overview

Six end-to-end checks were performed through the connected frontend and backend to verify key extraction, validation, and prediction behaviours of the house price estimation system.

## Verified Test Cases

| Case | Scenario | Status | Result |
|---|---|---|---|
| 01 | English · square feet | Complete | $194,164 |
| 02 | Larger valid home | Complete | $332,000 |
| 03 | Missing required fields | Blocked | OverallQual, TotalBsmtSF, GarageCars |
| 04 | Conflicting garage capacity | Blocked | GarageCars requires clarification |
| 05 | Year outside training range | Blocked | 2022 outside [1872, 2010] |
| 06 | Chinese · square metres | Complete | $195,468 |

**Verified test cases: 6**

## What These Tests Verify

The test cases cover three main behaviours:

- **Extraction and input handling:** The system accepts English and Chinese inputs and handles square-foot and square-metre measurements.
- **Validation:** The system blocks incomplete inputs, conflicting information, and values outside the supported training range.
- **Prediction:** Valid inputs are passed through the complete frontend-backend flow to produce a house price estimate.

## Interpretation and Limitations

These checks confirm specific extraction, validation, and prediction behaviours for the tested scenarios. They do **not** establish general model accuracy, robustness, or general extraction accuracy across unseen inputs.

The evaluation set is intentionally small and scenario-based. A larger and more systematically sampled test set would be required to make stronger claims about model performance and reliability.