import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import type { AppState, CollisionInput } from "./types";
import { initialFormData } from "./types";
import DashboardLayout from "./components/DashboardLayout";
import PredictorView from "./components/PredictorView";
import InsightsView from "./components/InsightsView";
import RegionCollisionsReport from "./components/RegionCollisionsReport";

const API_URL = import.meta.env.VITE_API_PREDICT_URL; // Get API_URL from env
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""; // Get API key

function App() {
  const [formData, setFormData] = useState<CollisionInput>(initialFormData);
  const [predictionResult, setPredictionResult] =
    useState<AppState["predictionResult"]>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Options for select dropdowns
  const districtOptions: string[] = [
    "Scarborough",
    "North York",
    "Etobicoke",
    "Toronto and East York",
    "York",
    "Other",
  ];
  const neighbourhoodOptions: string[] = [
    "Woodbine-Lumsden",
    "Woodbine Corridor",
    "Kensington-Chinatown",
    "Dufferin Grove",
    "Don Valley Village",
    "Morningside Heights",
    "St Lawrence-East Bayfront-The Islands",
    "Elms-Old Rexdale",
    "Dorset Park",
    "Agincourt North",
    "Bendale South",
    "Victoria Village",
    "Humbermede",
    "Yonge-Eglinton",
    "Runnymede-Bloor West Village",
    "Lansing-Westgate",
    "West Hill",
    "Agincourt South-Malvern West",
    "Annex",
    "Wexford/Maryvale",
    "West Rouge",
    "Rosedale-Moore Park",
    "Palmerston-Little Italy",
    "Mimico-Queensway",
    "Casa Loma",
    "East L'Amoreaux",
    "High Park North",
    "West Humber-Clairville",
    "Parkwoods-O'Connor Hills",
    "Ionview",
    "Danforth",
    "O'Connor-Parkview",
    "KeeleSdale-Eglinton West",
    "Danforth East York",
    "Rexdale-Kipling",
    "Dovercourt Village",
    "Leaside-Bennington",
    "South Parkdale",
    "Malvern West",
    "Etobicoke City Centre",
    "Forest Hill South",
    "Eringate-Centennial-West Deane",
    "Moss Park",
    "South Riverdale",
    "Eglinton East",
    "Broadview North",
    "High Park-Swansea",
    "Humber Bay Shores",
    "Malvern East",
    "Kennedy Park",
    "Trinity-Bellwoods",
    "Kingsview Village-The Westway",
    "Steeles",
    "Junction-Wallace Emerson",
    "East Willowdale",
    "York University Heights",
    "Weston-Pelham Park",
    "Nsa",
    "Woburn North",
    "Brookhaven-Amesbury",
    "Maple Leaf",
    "Rockcliffe-Smythe",
    "Corso Italia-Davenport",
    "Mount Dennis",
    "Harbourfront-Cityplace",
    "Flemingdon Park",
    "Banbury-Don Mills",
    "Yonge-Bay Corridor",
    "Englemount-Lawrence",
    "Scarborough Village",
    "Bay-Cloverhill",
    "Glenfield-Jane Heights",
    "Clairlea-Birchmount",
    "Lawrence Park South",
    "Bedford Park-Nortown",
    "Birchcliffe-Cliffside",
    "Forest Hill North",
    "Humber Summit",
    "Beechborough-Greenbrook",
    "Willowdale West",
    "Greenwood-Coxwell",
    "St.Andrew-Windfields",
    "Edenbridge-Humber Valley",
    "Mount Pleasant East",
    "Stonegate-Queensway",
    "Yonge-St.Clair",
    "Humewood-Cedarvale",
    "Oakdale-Beverley Heights",
    "Westminster-Branson",
    "Henry Farm",
    "Downtown Yonge East",
    "Black Creek",
    "Humber Heights-Westmount",
    "Cabbagetown-South St.James Town",
    "The Beaches",
    "Wychwood",
    "Morningside",
    "South Eglinton-Davisville",
    "West Queen West",
    "Yonge-Doris",
    "New Toronto",
    "Clanton Park",
    "Princess-Rosethorn",
    "Fenside-Parkwoods",
    "Oakwood Village",
    "Bendale-Glen Andrew",
    "Wellington Place",
    "Little Portugal",
    "Lambton Baby Point",
    "Old East York",
    "Hillcrest Village",
    "Avondale",
    "Alderwood",
    "Taylor-Massey",
    "Newtonbrook East",
    "Cliffcrest",
    "Caledonia-Fairbank",
    "Church-Wellesley",
    "Milliken",
    "Bathurst Manor",
    "Briar Hill-Belgravia",
    "Fort York-Liberty Village",
    "Bayview Village",
    "Pelmo Park-Humberlea",
    "Thorncliffe Park",
    "Etobicoke West Mall",
    "Weston",
    "Willowridge-Martingrove-Richview",
    "Yorkdale-Glen Park",
    "North Riverdale",
    "Roncesvalles",
    "Mount Olive-Silverstone-Jamestown",
    "Tam O'Shanter-Sullivan",
    "Thistletown-Beaumond Heights",
    "L'Amoreaux West",
    "Regent Park",
    "Downsview",
    "Bridle Path-Sunnybrook-York Mills",
    "Guildwood",
    "Islington",
    "Lawrence Park North",
    "Rustic",
    "Pleasant View",
    "Golfdale-Cedarbrae-Woburn",
    "East End-Danforth",
    "Junction Area",
    "University",
    "Newtonbrook West",
    "Highland Creek",
    "Centennial Scarborough",
    "Blake-Jones",
    "Oakridge",
    "Bayview Woods-Steeles",
    "Long Branch",
    "Kingsway South",
    "Markland Wood",
    "Playter Estates-Danforth",
    "North St.James Town",
    "North Toronto",
  ].sort();

  const roadClassOptions: string[] = [
    "Major Arterial",
    "Minor Arterial",
    "Collector",
    "Local",
    "Other",
    "Laneway",
    "Expressway",
    "Major Arterial Ramp",
    "Parkway",
  ];
  const impactypeOptions: string[] = [
    "Pedestrian Collisions",
    "Cyclist Collisions",
    "Angle",
    "Rear End",
    "Sideswipe",
    "Turning Movement",
    "SMV Other",
    "Other",
  ];
  const acclocOptions: string[] = [
    "At Intersection",
    "Non Intersection",
    "Intersection Related",
    "Private Property",
    "Underpass or Tunnel",
    "Overpass or Bridge",
    "Laneway",
    "Other",
  ];
  const traffctlOptions: string[] = [
    "No Control",
    "Traffic Signal",
    "Stop Sign",
    "Pedestrian Crossover",
    "Yield Sign",
    "Police Control",
    "School Guard",
    "Streetcar Right of Way",
    "Traffic Controller",
    "Other",
  ];
  const visibilityOptions: string[] = [
    "Clear",
    "Rain",
    "Snow",
    "Fog/Mist/Smoke",
    "Drifting Snow",
    "Strong Wind",
    "Freezing Rain",
    "Other",
  ];
  const lightOptions: string[] = [
    "Daylight",
    "Dark",
    "Dusk",
    "Dawn",
    "Dark, artificial light",
    "Dusk, artificial light",
    "Dawn, artificial light",
    "Other",
  ];
  const rdsfcondOptions: string[] = [
    "Dry",
    "Wet",
    "Slush",
    "Snow",
    "Ice",
    "Loose Sand/Gravel",
    "Spilled Liquid",
    "Other",
  ];
  const invtypeOptions: string[] = [
    "Driver",
    "Pedestrian",
    "Cyclist",
    "Passenger",
    "Vehicle Owner",
    "Motorcyclist Driver",
    "Truck Driver",
    "Witness",
    "Other Involved Person",
    "In-Line Skater",
    "Wheelchair",
    "Other",
  ];
  const invAgeOptions: string[] = [
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
  const pedcondOptions: string[] = [
    "Normal",
    "Had Been Drinking",
    "Impaired Ability",
    "Inattentive",
    "Medical Condition",
    "Unknown",
    "NA",
    "Other",
  ];
  const cyccondOptions: string[] = [
    "Normal",
    "Had Been Drinking",
    "Impaired Ability",
    "Inattentive",
    "Improper Action",
    "Unknown",
    "NA",
    "Other",
  ];

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
        "API URL is not configured. Please set VITE_API_PREDICT_URL in your environment variables."
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
      DATE: formData.DATE.replace(/\s/g, ""),
      TIME: formData.TIME,
      ROAD_CLASS: formData.ROAD_CLASS,
      DISTRICT: formData.DISTRICT,
      LATITUDE: latitude,
      LONGITUDE: longitude,
      ACCLOC: formData.ACCLOC,
      TRAFFCTL: formData.TRAFFCTL,
      VISIBILITY: formData.VISIBILITY,
      LIGHT: formData.LIGHT,
      RDSFCOND: formData.RDSFCOND,
      IMPACTYPE: formData.IMPACTYPE,
      INVTYPE: formData.INVTYPE,
      INVAGE: formData.INVAGE,
      PEDCOND: formData.PEDCOND,
      CYCCOND: formData.CYCCOND,
      PEDESTRIAN: formData.PEDESTRIAN,
      CYCLIST: formData.CYCLIST,
      AUTOMOBILE: formData.AUTOMOBILE,
      MOTORCYCLE: formData.MOTORCYCLE,
      TRUCK: formData.TRUCK,
      TRSN_CITY_VEH: formData.TRSN_CITY_VEH,
      EMERG_VEH: formData.EMERG_VEH,
      PASSENGER: formData.PASSENGER,
      SPEEDING: formData.SPEEDING,
      AG_DRIV: formData.AG_DRIV,
      REDLIGHT: formData.REDLIGHT,
      ALCOHOL: formData.ALCOHOL,
      DISABILITY: formData.DISABILITY,
      NEIGHBOURHOOD_158: formData.NEIGHBOURHOOD_158,
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

  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route
            index
            element={
              <PredictorView
                formData={formData}
                predictionResult={predictionResult}
                isLoading={isLoading}
                error={error}
                googleMapsApiKey={GOOGLE_MAPS_API_KEY}
                handleLocationChange={handleLocationChange}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
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
            }
          />
          <Route path="insights" element={<InsightsView />}>
            <Route
              path="collisions-by-region"
              element={<RegionCollisionsReport />}
            />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
