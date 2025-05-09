import React, { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import "./App.css";
import type { AppState, CollisionInput } from "./types";
import { initialFormData } from "./types";
import MapPicker from "./components/MapPicker";

const API_URL = import.meta.env.VITE_API_URL; // Get API_URL from env
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""; // Get API key

function App() {
  const [formData, setFormData] = useState<CollisionInput>(initialFormData);
  const [predictionResult, setPredictionResult] =
    useState<AppState["predictionResult"]>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleLocationChange = (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      LATITUDE: lat,
      LONGITUDE: lng,
    }));
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    let processedValue: string | number = value;
    if (type === "checkbox") {
      processedValue = (e.target as HTMLInputElement).checked ? "YES" : "NO";
    } else if (name === "LATITUDE" || name === "LONGITUDE") {
      // Allow empty string, a minus sign, a number, or a number ending with a decimal.
      if (value === "" || value === "-" || /^[-]?\d*\.?\d*$/.test(value)) {
        processedValue = value;
      } else {
        // If not matching the allowed pattern, do not update the state for these fields.
        // This prevents entering non-numeric characters.
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setPredictionResult(null);

    if (!API_URL) {
      setError(
        "API URL is not configured. Please set VITE_API_URL in your environment variables."
      );
      setIsLoading(false);
      return;
    }

    // Validate TIME format (HHMM)
    if (
      !/^([01]?[0-9]|2[0-3])[0-5][0-9]$/.test(formData.TIME) ||
      formData.TIME.length !== 4
    ) {
      setError(
        "Invalid TIME format. Please use HHMM (e.g., 0830 for 8:30 AM, 1745 for 5:45 PM)."
      );
      setIsLoading(false);
      return;
    }

    // Validate DATE format (YYYY-MM-DD) allowing optional spaces around hyphens
    if (!/^\d{4}\s*-\s*\d{2}\s*-\s*\d{2}$/.test(formData.DATE)) {
      setError(
        "Invalid DATE format. Please use YYYY-MM-DD (e.g., 2023-10-26). Spaces around hyphens are allowed."
      );
      setIsLoading(false);
      return;
    }

    // Validate and parse LATITUDE
    const latitude = parseFloat(String(formData.LATITUDE));
    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      setError("Invalid LATITUDE. Must be a number between -90 and 90.");
      setIsLoading(false);
      return;
    }

    // Validate and parse LONGITUDE
    const longitude = parseFloat(String(formData.LONGITUDE));
    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      setError("Invalid LONGITUDE. Must be a number between -180 and 180.");
      setIsLoading(false);
      return;
    }

    // Normalize the DATE by removing spaces and include parsed coordinates
    const normalizedFormData = {
      ...formData,
      DATE: formData.DATE.replace(/\s/g, ""),
      LATITUDE: latitude,
      LONGITUDE: longitude,
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([normalizedFormData]), // Send normalized data
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Failed to parse error response." }));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      setPredictionResult(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
      console.error("Error during prediction:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to create input fields
  const renderInputField = (
    name: keyof CollisionInput,
    label: string,
    type: string = "text",
    options?: string[]
  ) => (
    <div className="form-group" key={name}>
      <label htmlFor={name}>{label}:</label>
      {type === "select" && options ? (
        <select
          id={name}
          name={name}
          value={formData[name]}
          onChange={handleChange}
        >
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : type === "checkbox" ? (
        <input
          type="checkbox"
          id={name}
          name={name}
          checked={formData[name] === "YES"}
          onChange={handleChange}
        />
      ) : (
        <input
          type={type === "date" ? "date" : "text"}
          id={name}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={
            name === "TIME"
              ? "HHMM"
              : name === "DATE"
              ? "YYYY-MM-DD"
              : name === "LATITUDE" || name === "LONGITUDE"
              ? "e.g., 43.6532"
              : ""
          }
        />
      )}
    </div>
  );

  const binaryFields: Array<{ name: keyof CollisionInput; label: string }> = [
    { name: "PEDESTRIAN", label: "Pedestrian Involved?" },
    { name: "CYCLIST", label: "Cyclist Involved?" },
    { name: "AUTOMOBILE", label: "Automobile Involved?" },
    { name: "MOTORCYCLE", label: "Motorcycle Involved?" },
    { name: "TRUCK", label: "Truck Involved?" },
    { name: "TRSN_CITY_VEH", label: "Transit/City Vehicle Involved?" },
    { name: "EMERG_VEH", label: "Emergency Vehicle Involved?" },
    { name: "PASSENGER", label: "Passenger Involved?" },
    { name: "SPEEDING", label: "Speeding Related?" },
    { name: "AG_DRIV", label: "Aggressive Driving?" },
    { name: "REDLIGHT", label: "Ran Red Light?" },
    { name: "ALCOHOL", label: "Alcohol Involved?" },
    { name: "DISABILITY", label: "Disability Related?" },
  ];

  // Example options - in a real app, these might come from an API or config
  const roadClassOptions = [
    "Major Arterial",
    "Minor Arterial",
    "Collector",
    "Local",
    "Other",
  ];
  const invAgeOptions = [
    "0 to 4",
    "5 to 9",
    "10 to 14",
    "15 to 19",
    "20 to 24",
    "25 to 29",
    "30 to 34",
    "35 to 39",
    "40 to 44",
    "45 to 49",
    "50 to 54",
    "55 to 59",
    "60 to 64",
    "65 to 69",
    "70 to 74",
    "75 to 79",
    "80 to 84",
    "85 to 89",
    "90 to 94",
    "Over 95",
    "Unknown",
  ];

  return (
    <div className="App">
      <header className="App-header">
        <h1>Toronto Fatality Collision Predictor</h1>
      </header>
      <main>
        <form onSubmit={handleSubmit}>
          <h2>Collision Details</h2>
          <div className="form-section">
            <h3>General Information</h3>
            {renderInputField("DATE", "Date of Collision", "date")}
            {renderInputField("TIME", "Time of Collision (HHMM)", "text")}
            {/* Map Picker Section */}
            {GOOGLE_MAPS_API_KEY ? (
              <div className="form-section">
                <h3>Location (Select on Map or Enter Manually)</h3>
                <MapPicker
                  apiKey={GOOGLE_MAPS_API_KEY}
                  latitude={formData.LATITUDE}
                  longitude={formData.LONGITUDE}
                  onLocationChange={handleLocationChange}
                />
              </div>
            ) : (
              <div
                className="form-section error-message"
                style={{ textAlign: "center" }}
              >
                <p>
                  Google Maps API Key not configured. Please set
                  VITE_GOOGLE_MAPS_API_KEY.
                  <br />
                  Map functionality will be disabled.
                </p>
              </div>
            )}
            {renderInputField("LATITUDE", "Latitude (-90 to 90)", "text")}
            {renderInputField("LONGITUDE", "Longitude (-180 to 180)", "text")}
            {renderInputField("DISTRICT", "District")}
            {renderInputField("NEIGHBOURHOOD_158", "Neighbourhood")}
            {renderInputField(
              "ROAD_CLASS",
              "Road Class",
              "select",
              roadClassOptions
            )}
            {renderInputField("IMPACTYPE", "Impact Type")}
          </div>

          <div className="form-section">
            <h3>Conditions</h3>
            {renderInputField("ACCLOC", "Accident Location Type")}
            {renderInputField("TRAFFCTL", "Traffic Control")}
            {renderInputField("VISIBILITY", "Visibility")}
            {renderInputField("LIGHT", "Light Condition")}
            {renderInputField("RDSFCOND", "Road Surface Condition")}
          </div>

          <div className="form-section">
            <h3>Involvement Details</h3>
            {renderInputField("INVTYPE", "Primary Involved Type")}
            {renderInputField(
              "INVAGE",
              "Involved Person's Age Group",
              "select",
              invAgeOptions
            )}
            {renderInputField("PEDCOND", "Pedestrian Condition")}
            {renderInputField("CYCCOND", "Cyclist Condition")}
          </div>

          <div className="form-section grid-section">
            <h3>Factors & Vehicle Types</h3>
            {binaryFields.map((field) =>
              renderInputField(field.name, field.label, "checkbox")
            )}
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Predicting..." : "Get Prediction"}
          </button>
        </form>

        {error && (
          <div className="error-message">
            <p>Error: {error}</p>
          </div>
        )}

        {predictionResult && (
          <div className="prediction-result">
            <h2>Prediction Outcome</h2>
            <p>
              Prediction:
              <strong>
                {predictionResult.prediction &&
                predictionResult.prediction[0] === 1
                  ? "Fatal"
                  : "Non-Fatal Injury"}
              </strong>
            </p>
            {predictionResult.prediction_proba_fatal && (
              <p>
                Probability of Fatality:
                <strong>
                  {(predictionResult.prediction_proba_fatal[0] * 100).toFixed(
                    2
                  )}
                  %
                </strong>
              </p>
            )}
          </div>
        )}
      </main>
      <footer>
        <p>TorontoFatality Collision Predictor UI</p>
      </footer>
    </div>
  );
}

export default App;
