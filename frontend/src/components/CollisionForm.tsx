import React from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { CollisionInput } from "../types";

interface CollisionFormProps {
  formData: CollisionInput;
  isLoading: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  // Option props
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

const CollisionForm: React.FC<CollisionFormProps> = ({
  formData,
  isLoading,
  handleChange,
  handleSubmit,
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
}) => {
  // Helper to create input fields (moved from App.tsx)
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

  return (
    <form onSubmit={handleSubmit}>
      <h2>Collision Details</h2>
      {/* General Information fields - Note: MapPicker is kept in App.tsx as it interacts with LAT/LONG states directly */}
      {/* The LATITUDE and LONGITUDE input fields are still rendered here to be part of the form submission and layout */}
      <div className="form-section">
        <h3>General Information</h3>
        {/* Date and Time are now passed from App.tsx via formData and rendered here */}
        {renderInputField("DATE", "Date of Collision", "date")}
        {renderInputField("TIME", "Time of Collision (HHMM)", "text")}
        {renderInputField("LATITUDE", "Latitude (-90 to 90)", "text")}
        {renderInputField("LONGITUDE", "Longitude (-180 to 180)", "text")}
        {renderInputField("DISTRICT", "District", "select", districtOptions)}
        {renderInputField(
          "NEIGHBOURHOOD_158",
          "Neighbourhood",
          "select",
          neighbourhoodOptions
        )}
        {renderInputField(
          "ROAD_CLASS",
          "Road Class",
          "select",
          roadClassOptions
        )}
        {renderInputField(
          "IMPACTYPE",
          "Impact Type",
          "select",
          impactypeOptions
        )}
      </div>

      <div className="form-section">
        <h3>Conditions</h3>
        {renderInputField(
          "ACCLOC",
          "Accident Location Type",
          "select",
          acclocOptions
        )}
        {renderInputField(
          "TRAFFCTL",
          "Traffic Control",
          "select",
          traffctlOptions
        )}
        {renderInputField(
          "VISIBILITY",
          "Visibility",
          "select",
          visibilityOptions
        )}
        {renderInputField("LIGHT", "Light Condition", "select", lightOptions)}
        {renderInputField(
          "RDSFCOND",
          "Road Surface Condition",
          "select",
          rdsfcondOptions
        )}
      </div>

      <div className="form-section">
        <h3>Involvement Details</h3>
        {renderInputField(
          "INVTYPE",
          "Primary Involved Type",
          "select",
          invtypeOptions
        )}
        {renderInputField(
          "INVAGE",
          "Involved Person's Age Group",
          "select",
          invAgeOptions
        )}
        {renderInputField(
          "PEDCOND",
          "Pedestrian Condition",
          "select",
          pedcondOptions
        )}
        {renderInputField(
          "CYCCOND",
          "Cyclist Condition",
          "select",
          cyccondOptions
        )}
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
  );
};

export default CollisionForm;
