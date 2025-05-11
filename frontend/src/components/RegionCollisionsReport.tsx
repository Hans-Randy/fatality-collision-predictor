import React, { useEffect, useState } from "react";

interface RegionCollisionData {
  region_name: string;
  collision_count: number;
}

const API_INSIGHTS_URL = import.meta.env.VITE_API_URL; // Assuming insights use the same base URL

const RegionCollisionsReport: React.FC = () => {
  const [data, setData] = useState<RegionCollisionData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!API_INSIGHTS_URL) {
        setError("API URL for insights is not configured.");
        setIsLoading(false);
        return;
      }
      try {
        // SIMULATED FETCH - REPLACE WITH ACTUAL API CALL
        const response = await fetch(
          `${API_INSIGHTS_URL}/insights/collisions-by-region`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
        // Placeholder data for now until backend endpoint is ready
        console.log("Simulating fetch for /insights/collisions-by-region");
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay
        const placeholderData: RegionCollisionData[] = [
          { region_name: "Scarborough", collision_count: 1250 },
          { region_name: "North York", collision_count: 1100 },
          { region_name: "Etobicoke", collision_count: 950 },
          { region_name: "Toronto and East York", collision_count: 1500 },
          { region_name: "York", collision_count: 600 },
          { region_name: "Unknown/Other", collision_count: 150 },
        ];
        setData(placeholderData);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(
            "An unknown error occurred while fetching collision data by region."
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <p>Loading collision data by region...</p>;
  }

  if (error) {
    return <p className="error-message">Error: {error}</p>;
  }

  if (data.length === 0) {
    return <p>No collision data by region found.</p>;
  }

  return (
    <div className="region-collisions-report">
      <h4>Collisions by Region</h4>
      {/* Placeholder for a chart - e.g., using Chart.js or Recharts */}
      <div style={{ marginBottom: "20px" }}>
        {" "}
        [Chart will be rendered here]{" "}
      </div>{" "}
      <table>
        {" "}
        <thead>
          {" "}
          <tr>
            {" "}
            <th>Region</th> <th>Total Collisions</th>{" "}
          </tr>{" "}
        </thead>{" "}
        <tbody>
          {" "}
          {data.map((item) => (
            <tr key={item.region_name}>
              {" "}
              <td>{item.region_name}</td>{" "}
              <td>{item.collision_count.toLocaleString()}</td>{" "}
            </tr>
          ))}{" "}
        </tbody>{" "}
      </table>{" "}
    </div>
  );
};
export default RegionCollisionsReport;
