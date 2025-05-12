import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface RegionCollisionData {
  DISTRICT: string;
  collision_count: number;
}

const VITE_API_INSIGHTS_COLLISION_BY_REGION_URL = `${
  import.meta.env.VITE_API_URL
}/insights/collisions-by-region`;

const RegionCollisionsReport: React.FC = () => {
  const [data, setData] = useState<RegionCollisionData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!VITE_API_INSIGHTS_COLLISION_BY_REGION_URL) {
        setError("API URL for insights is not configured.");
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(VITE_API_INSIGHTS_COLLISION_BY_REGION_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
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
      <div style={{ width: "100%", height: 400, marginBottom: "20px" }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="DISTRICT"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="collision_count"
              name="Number of Collisions"
              fill="#009E85"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <table>
        <thead>
          <tr>
            <th>Region</th>
            <th>Total Collisions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.DISTRICT}>
              <td>{item.DISTRICT}</td>
              <td>{item.collision_count.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RegionCollisionsReport;
