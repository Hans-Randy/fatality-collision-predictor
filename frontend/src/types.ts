// Interface for the data to be sent to the backend
export interface CollisionInput {
  // Date and Time inputs for FeatureEngineer
  DATE: string; // e.g., "2023-10-26" (format should be parsable by pandas.to_datetime)
  TIME: string; // e.g., "1430" for 2:30 PM (string representing HHMM)

  // Geographical Coordinates
  LATITUDE: number | string; // Using string to allow empty input, will parse to number
  LONGITUDE: number | string; // Using string to allow empty input, will parse to number

  // Binary inputs (expected values: "YES" or "NO")
  PEDESTRIAN: string;
  CYCLIST: string;
  AUTOMOBILE: string;
  MOTORCYCLE: string;
  TRUCK: string;
  TRSN_CITY_VEH: string; // Transit/City Vehicle
  EMERG_VEH: string; // Emergency Vehicle
  PASSENGER: string;
  SPEEDING: string;
  AG_DRIV: string; // Aggressive Driving
  REDLIGHT: string;
  ALCOHOL: string;
  DISABILITY: string;

  // Categorical inputs (string values)
  ROAD_CLASS: string;
  DISTRICT: string;
  ACCLOC: string; // Accident Location
  TRAFFCTL: string; // Traffic Control
  VISIBILITY: string;
  LIGHT: string; // Light Conditions
  RDSFCOND: string; // Road Surface Condition
  IMPACTYPE: string;
  INVTYPE: string; // Involvement Type
  INVAGE: string; // Involved Person's Age Group (e.g., "25 to 29", "65+")
  PEDCOND: string; // Pedestrian Condition (can be empty; backend fills with "NA")
  CYCCOND: string; // Cyclist Condition (can be empty; backend fills with "NA")
  NEIGHBOURHOOD_158: string; // Neighbourhood identifier
}

// Overall application state for the frontend
export interface AppState {
  formData: CollisionInput; // Holds the current values from the input form
  predictionResult: {
    prediction?: number[]; // e.g., [0] for Non-Fatal, [1] for Fatal
    prediction_proba_fatal?: number[]; // e.g., [0.75] probability of fatality
  } | null;
  isLoading: boolean; // To show a loading indicator during API calls
  error: string | null; // To display any errors from the API or frontend
}

export const initialFormData: CollisionInput = {
  DATE: "",
  TIME: "",
  LATITUDE: "", // Initialize as empty string for controlled input
  LONGITUDE: "", // Initialize as empty string for controlled input
  PEDESTRIAN: "NO",
  CYCLIST: "NO",
  AUTOMOBILE: "NO",
  MOTORCYCLE: "NO",
  TRUCK: "NO",
  TRSN_CITY_VEH: "NO",
  EMERG_VEH: "NO",
  PASSENGER: "NO",
  SPEEDING: "NO",
  AG_DRIV: "NO",
  REDLIGHT: "NO",
  ALCOHOL: "NO",
  DISABILITY: "NO",
  ROAD_CLASS: "",
  DISTRICT: "",
  ACCLOC: "",
  TRAFFCTL: "",
  VISIBILITY: "",
  LIGHT: "",
  RDSFCOND: "",
  IMPACTYPE: "",
  INVTYPE: "",
  INVAGE: "",
  PEDCOND: "",
  CYCCOND: "",
  NEIGHBOURHOOD_158: "",
};
