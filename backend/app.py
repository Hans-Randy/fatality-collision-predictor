import logging
import joblib
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from utils.config import SERIALIZED_DIR, DATA_DIR

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Enable CORS for all routes

# Load the model and pipeline artifacts
try:
    model_path = SERIALIZED_DIR / 'model.pkl'
    pipeline_path = SERIALIZED_DIR / 'preprocessing_pipeline.pkl'

    if not model_path.exists() or not pipeline_path.exists():
        model = None
        pipeline = None
        logging.error("Model or pipeline file not found. Please train the model first using model.py.")
    else:
        model = joblib.load(model_path)
        pipeline = joblib.load(pipeline_path)
        logging.info("Model, and pipeline loaded successfully.")

except Exception as e:
    logging.error(f"Error loading model artifacts or columns: {e}")
    model = None
    pipeline = None

@app.route('/api/predict', methods=['POST'])
def predict():
    """API endpoint to make predictions."""
    if not model or not pipeline:
        return jsonify({"error": "Model or pipeline configuration not loaded. Check server logs."}), 500

    try:
        # Get data from POST request
        data = request.get_json(force=True)
        logging.info(f"Received data for prediction: {data}")

        # Convert data into pandas DataFrame
        input_df = pd.DataFrame(data)

        logging.info(f"Input DataFrame columns after reordering & selection: {input_df.columns.tolist()}")
        logging.info(f"Input DataFrame shape: {input_df.shape}")

        # Apply the preprocessing pipeline
        processed_input = pipeline.transform(input_df)

        # If 'processed_input' is a DataFrame, log its columns
        if isinstance(processed_input, pd.DataFrame):
            logging.info(f"Processed DataFrame columns: {processed_input.columns.tolist()}")
        logging.info(f"Processed data shape for model: {processed_input.shape}")

        # Make prediction
        prediction = model.predict(processed_input)
        prediction_proba = None
        if hasattr(model, "predict_proba"):
            try:
                # Get probability for the positive class (Fatal)
                prediction_proba = model.predict_proba(processed_input)[:, 1]
                prediction_proba = prediction_proba.tolist()  # Convert to list for JSON
                logging.info("Prediction probabilities calculated.")
            except Exception as e:
                logging.warning(f"Could not get probability predictions: {e}")

        logging.info(f"Prediction result: {prediction.tolist()}")

        # Return prediction as JSON response
        response_payload = {'prediction': prediction.tolist()}
        if prediction_proba is not None:
            response_payload['prediction_proba_fatal'] = prediction_proba

        return jsonify(response_payload)

    except Exception as e:
        logging.error(f"Error during prediction: {e}", exc_info=True)
        return jsonify({"error": f"An error occurred during prediction: {str(e)}"}), 400

@app.route('/api/insights/collisions-by-region', methods=['GET'])
def get_collisions_by_region():
    """API endpoint to get collision statistics by region."""
    try:
        # Load the data
        df = pd.read_csv(DATA_DIR / 'TOTAL_KSI_6386614326836635957.csv')
        
        # Group by DISTRICT and count collisions
        region_stats = df.groupby('DISTRICT').size().reset_index(name='collision_count')
        
        # Sort by collision count in descending order
        region_stats = region_stats.sort_values('collision_count', ascending=False)
        
        # Convert to list of dictionaries for JSON response
        result = region_stats.to_dict('records')
        
        return jsonify(result)
        
    except Exception as e:
        logging.error(f"Error getting collisions by region: {e}", exc_info=True)
        return jsonify({"error": f"An error occurred while getting collisions by region: {str(e)}"}), 500

if __name__ == '__main__':
    # Set debug=False for production environments
    app.run(host='127.0.0.1', port=5000, debug=True)
