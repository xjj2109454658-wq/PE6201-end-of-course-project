import { useState } from "react";

import "./App.css";

const API_URL = "http://127.0.0.1:8000";



const fields = [

  ["GrLivArea", "Living area", "sq ft"],

  ["OverallQual", "Overall quality", "1–10"],

  ["YearBuilt", "Year built", "year"],

  ["TotalBsmtSF", "Basement area", "sq ft"],

  ["FullBath", "Full bathrooms", "count"],

  ["BedroomAbvGr", "Bedrooms above ground", "count"],

  ["GarageCars", "Garage capacity", "cars"],

];



const navigation = [

  ["estimator", "01", "Price estimator"],

  ["performance", "02", "Model performance"],

  ["tests", "03", "Test cases"],

  ["about", "04", "About the project"],

];



const example =

  "A house built in 2003 with 1,710 square feet of above-ground living " +

  "area, overall quality 7 out of 10, three bedrooms, two full " +

  "bathrooms, an 856-square-foot basement, and a two-car garage.";



const cases = [

  ["01", "English · square feet", "Complete", "$194,164"],

  ["02", "Larger valid home", "Complete", "$332,000"],

  ["03", "Missing required fields", "Blocked", "OverallQual, TotalBsmtSF, GarageCars"],

  ["04", "Conflicting garage capacity", "Blocked", "GarageCars requires clarification"],

  ["05", "Year outside training range", "Blocked", "2022 outside [1872, 2010]"],

  ["06", "Chinese · square metres", "Complete", "$195,468"],

];



function HouseIcon() {

  return (

    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">

      <path

        d="M3 10.5 12 3l9 7.5M5 9v11h14V9M9 20v-7h6v7"

        stroke="currentColor"

        strokeWidth="1.7"

        strokeLinecap="round"

        strokeLinejoin="round"

      />

    </svg>

  );

}



function Panel({ title, subtitle, children, className = "" }) {

  return (

    <section className={`panel ${className}`}>

      <div className="panel-heading">

        <h2>{title}</h2>

        {subtitle && <p>{subtitle}</p>}

      </div>

      {children}

    </section>

  );

}



export default function App() {

  const [page, setPage] = useState("estimator");

  const [description, setDescription] = useState("");

  const [values, setValues] = useState(

    Object.fromEntries(fields.map(([key]) => [key, ""]))

  );



  const [extracting, setExtracting] = useState(false);

  const [estimating, setEstimating] = useState(false);

  const [message, setMessage] = useState("");

  const [estimate, setEstimate] = useState(null);

  const [requestCost, setRequestCost] = useState(null);
  const [blockedReason, setBlockedReason] = useState("");

  const allFieldsFilled = fields.every(
    ([key]) => values[key] !== "" && values[key] !== null
  );

  async function extractPropertyFeatures() {
    setMessage("");
    setBlockedReason("");
    setEstimate(null);
    setExtracting(true);

    try {
      const response = await fetch(`${API_URL}/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Feature extraction failed.");
      }

      setValues(
        Object.fromEntries(
          fields.map(([key]) => [
            key,
            data.values?.[key] === null || data.values?.[key] === undefined
              ? ""
              : String(data.values[key]),
          ])
        )
      );

      setRequestCost(data.cost ?? null);
      if (data.status === "ready") {
        setBlockedReason("");
        setMessage("Features extracted. Please review every value before confirming.");
      } else {
        const reason = data.reason || "Some values need review before estimation.";
        setBlockedReason(reason);
        setMessage(reason);
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setExtracting(false);
    }
  }

  async function confirmAndEstimate() {
    setMessage("");
    setBlockedReason("");
    setEstimating(true);

    const numericValues = Object.fromEntries(
      fields.map(([key]) => [
        key,
        values[key] === "" ? null : Number(values[key]),
      ])
    );

    try {
      const response = await fetch(`${API_URL}/estimate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values: numericValues }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Estimation failed.");
      }

      if (data.status === "blocked") {
        const reason = data.reason || "Estimate blocked. Please review the inputs.";
        setEstimate(null);
        setBlockedReason(reason);
        setMessage(reason);
        return;
      }

      setBlockedReason("");
      setEstimate(data.estimated_price);
      setMessage("Estimate generated from the reviewed property features.");
    } catch (error) {
      setEstimate(null);
      setMessage(error.message);
    } finally {
      setEstimating(false);
    }
  }

  const titles = {

    estimator: ["Your property, in perspective.", "Describe, review, estimate."],

    performance: ["Measured against real sales.", "A baseline and a non-linear model, tested on the same homes."],

    tests: ["Designed to pause when uncertain.", "Six end-to-end checks run through the connected prototype."],

    about: ["A small system with clear boundaries.", "How the prototype works and where its evidence applies."],

  };



  return (

    <div className="app-shell">

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-icon"><HouseIcon /></div>

          <div>

            <strong>AMES</strong>

            <span>Property intelligence</span>

          </div>

        </div>



        <div className="nav-caption">WORKSPACE</div>

        <nav aria-label="Main navigation">

          {navigation.map(([id, number, label]) => (

            <button

              key={id}

              className={`nav-item ${page === id ? "active" : ""}`}

              onClick={() => setPage(id)}

              aria-current={page === id ? "page" : undefined}

            >

              <span className="nav-number">{number}</span>

              <span>{label}</span>

              <span className="nav-arrow">↗</span>

            </button>

          ))}

        </nav>



        <div className="sidebar-note">

          <span className="small-label">THE DATASET</span>

          <strong>Ames, Iowa</strong>

          <p>Historical residential sales.<br />A research prototype.</p>

        </div>



        <div className="sidebar-footer">

          <div className="avatar">XJ</div>

          <div><strong>Xu Junjun</strong><span>PE6201 · Individual project</span></div>

        </div>

      </aside>



      <main className="main-content">

        <header className="topbar">

          <span>WORKSPACE <span className="breadcrumb">/ {navigation.find(([id]) => id === page)[2]}</span></span>

          <span className="prototype-badge">RESEARCH PROTOTYPE</span>

        </header>



        <div className="page-content">

          <div className="page-heading">

            <span className="eyebrow">HOUSE PRICE ESTIMATION</span>

            <h1>{titles[page][0]}</h1>

            <p>{titles[page][1]}</p>

          </div>



          {page === "estimator" && (

            <>

              <div className="steps">

                <span><b>01</b> Describe property</span>

                <i />

                <span><b>02</b> Review features</span>

                <i />

                <span><b>03</b> Get estimate</span>

              </div>



              <div className="estimator-grid">

                <div>

                  <Panel

                    title="Property description"

                    subtitle="Write naturally in English or Chinese. Include units for all areas."

                  >

                    <label className="field-label" htmlFor="description">Tell us about the home</label>

                    <textarea

                      id="description"

                      value={description}

                      onChange={(event) => setDescription(event.target.value)}

                      placeholder="For example: a home built in 2003, with three bedrooms, two full bathrooms…"

                      rows={6}

                    />

                    <div className="description-footer">

                      <button className="text-button" onClick={() => setDescription(example)}>

                        Load example ↗

                      </button>

                      <span>{description.length} characters</span>

                    </div>

                    <button
                      className="primary-button"
                      onClick={extractPropertyFeatures}
                      disabled={!description.trim() || extracting}
                    >
                      {extracting ? "Extracting…" : "Extract property features"} <span>→</span>
                    </button>

                    <p className="connection-note">Connected to the local Python backend.</p>

                  </Panel>



                  <Panel

                    title="Review extracted features"

                    subtitle="Check every value against the description. Correct any errors before confirming."

                  >

                    <div className="fields-grid">

                      {fields.map(([key, label, unit]) => (

                        <div className="field" key={key}>

                          <label htmlFor={key}>{label}</label>

                          <div className="input-wrapper">

                            <input

                              id={key}

                              type="number"

                              value={values[key]}

                              placeholder="—"

                              onChange={(event) => {
                                setValues((previous) => ({
                                  ...previous,
                                  [key]: event.target.value,
                                }));
                                setEstimate(null);
                                setBlockedReason("");
                                setMessage("");
                              }}

                            />

                            <span>{unit}</span>

                          </div>

                        </div>

                      ))}

                    </div>

                    <button
                      className="primary-button"
                      onClick={confirmAndEstimate}
                      disabled={!allFieldsFilled || estimating}
                    >
                      {estimating ? "Estimating…" : "Confirm and estimate"} <span>→</span>
                    </button>

                    {message && <p className="status-note">{message}</p>}

                  </Panel>

                </div>



                <div className="result-column">

                  <section className="estimate-card">

                    <span className="small-label">ESTIMATED SALE PRICE</span>

                    <div className="estimate-icon"><HouseIcon /></div>

                    <h2>
                      {estimate !== null ? (
                        `$${estimate.toLocaleString()}`
                      ) : blockedReason ? (
                        <>Input needs<br />review.</>
                      ) : (
                        <>Start with<br />a description.</>
                      )}
                    </h2>

                    <p>
                      {estimate !== null
                        ? "Approximate sale price based on historical Ames housing data."
                        : blockedReason
                          ? blockedReason
                          : "Your estimate will appear after the property features are reviewed and confirmed."}
                    </p>

                    <div className="estimate-divider" />

                    <div className="estimate-detail"><span>Prediction model</span><strong>Random Forest</strong></div>

                    <div className="estimate-detail"><span>Historical test RMSE</span><strong>$29,941</strong></div>

                    <div className="estimate-detail"><span>Current request cost</span><strong>{requestCost == null ? "—" : `$${Number(requestCost).toFixed(7)}`}</strong></div>

                  </section>



                  <section className="context-card">

                    <span className="context-icon">i</span>

                    <div>

                      <h3>Put the estimate in context</h3>

                      <p>

                        Test RMSE describes error across historical test homes.

                        It is not a guaranteed error range for one property.

                      </p>

                    </div>

                  </section>

                </div>

              </div>

            </>

          )}



          {page === "performance" && (

            <>

              <div className="metric-grid">

                <div className="metric-card"><span>TEST HOMES</span><strong>292</strong><p>20% held-out split</p></div>

                <div className="metric-card"><span>TEST MEAN SALE PRICE</span><strong>$178,840</strong><p>Context for the prediction error</p></div>

                <div className="metric-card"><span>LOWER RMSE WITH RANDOM FOREST</span><strong>23.2%</strong><p>Compared with Linear Regression</p></div>

              </div>

              <Panel title="Model comparison" subtitle="Recorded notebook results · same seven features and test split">

                <div className="model-row">

                  <div><strong>Linear Regression</strong><span>Interpretable baseline</span></div>

                  <div className="bar-track"><div className="model-bar baseline-bar" /></div>

                  <strong>$38,999</strong>

                </div>

                <div className="model-row">

                  <div><strong>Random Forest</strong><span>Selected for this prototype</span></div>

                  <div className="bar-track"><div className="model-bar forest-bar" /></div>

                  <strong>$29,941</strong>

                </div>

                <p className="footnote">RMSE in USD · lower is better · random_state = 42 · 1,168 training homes</p>

              </Panel>

              <Panel title="What the score covers" subtitle="Prediction performance with known property features">

                <p className="body-copy">

                  These scores evaluate the regressors on held-out historical rows.

                  They do not include errors introduced by extracting information

                  from a user's description. RMSE is an aggregate test-set metric

                  and does not imply the same error for every individual property.

                </p>

              </Panel>

            </>

          )}



          {page === "tests" && (

            <Panel title="Extraction and validation checks" subtitle="Six end-to-end checks verified through the connected frontend and backend.">

              <div className="table-scroll">

                <table>

                  <thead><tr><th>CASE</th><th>SCENARIO</th><th>STATUS</th><th>RESULT</th></tr></thead>

                  <tbody>

                    {cases.map(([id, scenario, status, result]) => (

                      <tr key={id}>

                        <td className="case-number">{id}</td>

                        <td>{scenario}</td>

                        <td><span className={`status ${status === "Complete" ? "complete" : "blocked"}`}>{status}</span></td>

                        <td>{result}</td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

              <div className="test-summary">

                <div><span>VERIFIED TEST CASES</span><strong>6</strong></div>

                <p>These checks confirm specific extraction, validation and prediction behaviours; they do not establish general model or extraction accuracy.</p>

              </div>

            </Panel>

          )}



          {page === "about" && (

            <div className="about-grid">

              <Panel title="How it works" subtitle="Language understanding and price prediction have separate roles.">

                <div className="workflow-item"><b>01</b><div><h3>Extract</h3><p>A language model accessed through OpenRouter converts a free-text description into seven numeric features.</p></div></div>

                <div className="workflow-item"><b>02</b><div><h3>Review and validate</h3><p>The user checks the values. Python blocks missing, invalid or out-of-range inputs.</p></div></div>

                <div className="workflow-item"><b>03</b><div><h3>Estimate</h3><p>A locally trained Random Forest predicts the historical sale price.</p></div></div>

              </Panel>

              <Panel title="Scope and limitations" subtitle="Read the result with these boundaries in mind.">

                <ul className="limitations">

                  <li>Based on 1,460 labelled homes from the Kaggle House Prices training dataset for Ames, Iowa.</li>

                  <li>Uses seven numeric features; neighbourhood location is not included.</li>

                  <li>The dataset's newest construction year is 2010.</li>

                  <li>An incorrectly extracted value can pass range checks. Human review remains necessary.</li>

                  <li>Not validated for present-day valuations or other housing markets.</li>

                </ul>

              </Panel>

            </div>

          )}



          <footer className="page-footer">

            <span>AMES / HOUSE PRICE ESTIMATOR</span>

            <span>Historical data. Approximate estimates. Human review.</span>

          </footer>

        </div>

      </main>

    </div>

  );

}