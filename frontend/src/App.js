import React, { useState } from "react";
import "./App.css";

function App() {
  // Define state for each input field.
  // Add all necessary fields based on your model's requirements.
  // This is a subset for brevity.
  const [formData, setFormData] = useState({
    OBJECTID: 1, // Example default, make sure it's relevant or user-configurable
    INDEX_: "example_index",
    ACCNUM: "EXAMPLE_ACCNUM",
    DATE: new Date().toISOString().split("T")[0], // Default to today
    TIME: 1200, // Default to noon
    STREET1: "MAIN ST",
    STREET2: "CROSS AVE",
    OFFSET: "10 m N",
    ROAD_CLASS: "Major Arterial",
    DISTRICT: "Toronto and East York",
    LATITUDE: 43.65107,
    LONGITUDE: -79.347015,
    ACCLOC: "At Intersection",
    TRAFFCTL: "Traffic Signal",
    VISIBILITY: "Clear",
    LIGHT: "Daylight",
    RDSFCOND: "Dry",
    IMPACTYPE: "Angle",
    INVTYPE: "Driver",
    INVAGE: "30 to 34",
    INJURY: "Minimal",
    FATAL_NO: 0,
    INITDIR: "East",
    VEHTYPE: "Automobile, Station Wagon",
    MANOEUVER: "Going Ahead",
    DRIVACT: "Driving Properly",
    DRIVCOND: "Normal",
    PEDTYPE: "Not Applicable",
    PEDACT: "Not Applicable",
    PEDCOND: "Not Applicable",
    CYCLISTYPE: "Not Applicable",
    CYCACT: "Not Applicable",
    CYCCOND: "Not Applicable",
    PEDESTRIAN: "NO",
    CYCLIST: "NO",
    AUTOMOBILE: "YES",
    MOTORCYCLE: "NO",
    TRUCK: "NO",
    TRSN_CITY_VEH: "NO",
    EMERG_VEH: "NO",
    PASSENGER: "YES",
    SPEEDING: "NO",
    AG_DRIV: "NO",
    REDLIGHT: "NO",
    ALCOHOL: "NO",
    DISABILITY: "NO",
    HOOD_158: "75",
    NEIGHBOURHOOD_158: "South Riverdale (75)",
    HOOD_140: "70",
    NEIGHBOURHOOD_140: "South Riverdale",
    DIVISION: "D55",
    x: -79.347015, // Example, ensure it's consistent or derived
    y: 43.65107, // Example, ensure it's consistent or derived
    // ACCCLASS is the target, so it's not sent
  });

  const [predictionResult, setPredictionResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]:
        type === "checkbox"
          ? checked
            ? "YES"
            : "NO"
          : type === "number"
          ? parseFloat(value)
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setPredictionResult(null);
    setLoading(true);

    // The API expects an array of objects
    const requestData = [formData];

    try {
      const response = await fetch("http://127.0.0.1:5000/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(
          errData.error || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      setPredictionResult(result);
    } catch (err) {
      setError(err.message);
      console.error("Prediction API error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to create form fields - you'll need to expand this significantly
  const renderFormField = (label, name, type = "text", options = []) => {
    const commonProps = {
      id: name,
      name: name,
      value: formData[name] || (type === "number" ? 0 : ""),
      onChange: handleChange,
      className: "form-input",
    };

    if (type === "select") {
      return (
        <div className="form-group" key={name}>
          <label htmlFor={name}>{label}:</label>
          <select {...commonProps}>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );
    }
    if (type === "checkbox") {
      return (
        <div className="form-group-checkbox" key={name}>
          <input
            type="checkbox"
            id={name}
            name={name}
            checked={formData[name] === "YES"}
            onChange={handleChange}
            className="form-checkbox"
          />
          <label htmlFor={name} className="checkbox-label">
            {label}
          </label>
        </div>
      );
    }
    return (
      <div className="form-group" key={name}>
        <label htmlFor={name}>{label}:</label>
        <input type={type} {...commonProps} />
      </div>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Fatality Collision Predictor</h1>
      </header>
      <main className="App-main">
        <form onSubmit={handleSubmit} className="prediction-form">
          <h2>Enter Collision Details</h2>
          <p className="form-hint">
            Please fill in all relevant details for the prediction. This is a
            simplified form. Ensure all features required by your model are
            included.
          </p>

          <div className="form-grid">
            {renderFormField("Date", "DATE", "date")}
            {renderFormField("Time (HHMM)", "TIME", "number")}
            {renderFormField("Latitude", "LATITUDE", "number")}
            {renderFormField("Longitude", "LONGITUDE", "number")}
            {renderFormField("Road Class", "ROAD_CLASS", "text")}
            {renderFormField("Visibility", "VISIBILITY", "select", [
              { value: "Clear", label: "Clear" },
              { value: "Rain", label: "Rain" },
              { value: "Snow", label: "Snow" },
              { value: "Fog/Mist/Smoke", label: "Fog/Mist/Smoke" },
              { value: "Other", label: "Other" },
              { value: "Unknown", label: "Unknown" },
            ])}
            {renderFormField("Light Condition", "LIGHT", "select", [
              { value: "Daylight", label: "Daylight" },
              { value: "Dark", label: "Dark" },
              { value: "Dusk", label: "Dusk" },
              { value: "Dawn", label: "Dawn" },
              { value: "Dark, artificial", label: "Dark, artificial" },
              { value: "Daylight, artificial", label: "Daylight, artificial" },
              { value: "Other", label: "Other" },
            ])}
            {renderFormField("Road Surface", "RDSFCOND", "select", [
              { value: "Dry", label: "Dry" },
              { value: "Wet", label: "Wet" },
              { value: "Snow", label: "Snow" },
              { value: "Slush", label: "Slush" },
              { value: "Ice", label: "Ice" },
              { value: "Loose Sand/Gravel", label: "Loose Sand/Gravel" },
              { value: "Other", label: "Other" },
            ])}
            {renderFormField("Impact Type", "IMPACTYPE", "text")}
            {renderFormField("Involved Person Age Group", "INVAGE", "text")}
            {renderFormField(
              "Neighbourhood (e.g., South Riverdale (75))",
              "NEIGHBOURHOOD_158",
              "text"
            )}

            {/* Binary YES/NO fields as checkboxes for better UX */}
            {renderFormField("Pedestrian Involved?", "PEDESTRIAN", "checkbox")}
            {renderFormField("Cyclist Involved?", "CYCLIST", "checkbox")}
            {renderFormField("Automobile Involved?", "AUTOMOBILE", "checkbox")}
            {renderFormField("Motorcycle Involved?", "MOTORCYCLE", "checkbox")}
            {renderFormField("Truck Involved?", "TRUCK", "checkbox")}
            {renderFormField("Speeding Involved?", "SPEEDING", "checkbox")}
            {renderFormField("Aggressive Driving?", "AG_DRIV", "checkbox")}
            {renderFormField("Red Light Runner?", "REDLIGHT", "checkbox")}
            {renderFormField("Alcohol Involved?", "ALCOHOL", "checkbox")}
            {renderFormField("Disability Involved?", "DISABILITY", "checkbox")}

            {/* Add more fields here as needed, for example:
            {renderFormField('Object ID', 'OBJECTID', 'number')}
            {renderFormField('Index', 'INDEX_', 'text')}
            ... and so on for all 50+ features from your curl example,
            ensuring 'name' matches the keys in your formData state and API request.
            Consider grouping them or using a more advanced form library for very long forms.
            */}
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Predicting..." : "Get Prediction"}
          </button>
        </form>

        {error && <p className="error-message">Error: {error}</p>}

        {predictionResult && (
          <div className="results-section">
            <h2>Prediction Result</h2>
            <p>
              <strong>Outcome:</strong>{" "}
              {predictionResult.prediction &&
              predictionResult.prediction[0] === 1
                ? "Fatal"
                : "Non-Fatal"}
            </p>
            {predictionResult.prediction_proba_fatal && (
              <p>
                <strong>Probability of Fatality:</strong>{" "}
                {(predictionResult.prediction_proba_fatal[0] * 100).toFixed(2)}%
              </p>
            )}
          </div>
        )}
      </main>
      <footer className="App-footer">
        <p>&copy; {new Date().getFullYear()} Collision Predictor</p>
      </footer>
    </div>
  );
}

export default App;
