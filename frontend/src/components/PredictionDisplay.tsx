import React from "react";
import type { AppState } from "../types"; // Adjust path as needed

interface PredictionDisplayProps {
  predictionResult: AppState["predictionResult"];
  error: string | null;
}

const PredictionDisplay: React.FC<PredictionDisplayProps> = ({
  predictionResult,
  error,
}) => {
  if (error) {
    return (
      <div className="error-message">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!predictionResult) {
    return null; // Don't render anything if there's no result and no error
  }

  return (
    <div className="prediction-result">
      <h2>Prediction Outcome</h2>
      <p>
        Prediction:
        <strong>
          {predictionResult.prediction && predictionResult.prediction[0] === 1
            ? "Fatal"
            : "Non-Fatal Injury"}
        </strong>
      </p>
      {predictionResult.prediction_proba_fatal && (
        <p>
          Probability of Fatality:
          <strong>
            {(predictionResult.prediction_proba_fatal[0] * 100).toFixed(2)}%
          </strong>
        </p>
      )}
    </div>
  );
};

export default PredictionDisplay;
