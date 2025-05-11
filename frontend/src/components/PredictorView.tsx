import React from "react";
import MapPicker from "./MapPicker"; // Assuming MapPicker is in the same components folder
import CollisionForm from "./CollisionForm";
import PredictionDisplay from "./PredictionDisplay";
import type { CollisionInput, AppState } from "../types"; // Adjust path as needed
import type { ChangeEvent, FormEvent } from "react";

interface PredictorViewProps {
  formData: CollisionInput;
  predictionResult: AppState["predictionResult"];
  isLoading: boolean;
  error: string | null;
  googleMapsApiKey: string;
  handleLocationChange: (lat: number, lng: number) => void;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  // Option props for CollisionForm
  districtOptions: string[];
  neighbourhoodOptions: string[];
  roadClassOptions: string[];
  impactypeOptions: string[];
  acclocOptions: string[];
  traffctlOptions: string[];
  visibilityOptions: string[];
  lightOptions: string[];
  rdsfcondOptions: string[];
  invtypeOptions: string[];
  invAgeOptions: string[];
  pedcondOptions: string[];
  cyccondOptions: string[];
}

const PredictorView: React.FC<PredictorViewProps> = (props) => {
  const {
    formData,
    predictionResult,
    isLoading,
    error,
    googleMapsApiKey,
    handleLocationChange,
    handleChange,
    handleSubmit,
    // Destructure all option props
    districtOptions,
    neighbourhoodOptions,
    roadClassOptions,
    impactypeOptions,
    acclocOptions,
    traffctlOptions,
    visibilityOptions,
    lightOptions,
    rdsfcondOptions,
    invtypeOptions,
    invAgeOptions,
    pedcondOptions,
    cyccondOptions,
  } = props;

  return (
    <div className="predictor-view">
      <header className="view-header">
        {/* Added for consistency with potential dashboard styling */}
        <h1>Toronto Fatality Collision Predictor</h1>
      </header>

      {googleMapsApiKey ? (
        <div className="form-section location-map-section">
          {/* Keep map specific styling if any */}
          <h3>Location (Select on Map or Enter Manually)</h3>
          <MapPicker
            apiKey={googleMapsApiKey}
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
      <CollisionForm
        formData={formData}
        isLoading={isLoading}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        // Pass all option props
        districtOptions={districtOptions}
        neighbourhoodOptions={neighbourhoodOptions}
        roadClassOptions={roadClassOptions}
        impactypeOptions={impactypeOptions}
        acclocOptions={acclocOptions}
        traffctlOptions={traffctlOptions}
        visibilityOptions={visibilityOptions}
        lightOptions={lightOptions}
        rdsfcondOptions={rdsfcondOptions}
        invtypeOptions={invtypeOptions}
        invAgeOptions={invAgeOptions}
        pedcondOptions={pedcondOptions}
        cyccondOptions={cyccondOptions}
      />

      <PredictionDisplay predictionResult={predictionResult} error={error} />
    </div>
  );
};

export default PredictorView;
