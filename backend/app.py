import logging
import joblib
import pandas as pd
from flask import Flask, request, jsonify
from utils.config import SERIALIZED_DIR

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__)

# Load the model and pipeline artifacts
try:
    model_path = SERIALIZED_DIR / 'model.pkl'
    pipeline_path = SERIALIZED_DIR / 'preprocessing_pipeline.pkl'
    
    if not model_path.exists() or not pipeline_path.exists():
        logging.error("Model or pipeline file not found. Please train the model first using model.py.")
        model = None
        pipeline = None
    else:
        model = joblib.load(model_path)
        pipeline = joblib.load(pipeline_path)
        logging.info("Model and pipeline loaded successfully.")

except Exception as e:
    logging.error(f"Error loading model artifacts: {e}")
    model = None
    pipeline = None

@app.route('/predict', methods=['POST'])
def predict():
    """API endpoint to make predictions."""
    if not model or not pipeline:
        return jsonify({"error": "Model or pipeline not loaded. Check server logs."}), 500

    try:
        # Get data from POST request
        data = request.get_json(force=True)
        logging.info(f"Received data for prediction: {data}")

        # Convert data into pandas DataFrame
        # Ensure the input data structure matches the *original* format 
        # expected by the *start* of the preprocessing pipeline.
        input_df = pd.DataFrame(data) 
        
        logging.info(f"Input DataFrame columns: {input_df.columns.tolist()}")
        logging.info(f"Input DataFrame shape: {input_df.shape}")

        # Apply the preprocessing pipeline
        # The pipeline handles cleaning, feature engineering, etc.
        processed_input = pipeline.transform(input_df)
        logging.info("Preprocessing applied successfully.")
        logging.info(f"Processed DataFrame columns: {processed_input.columns.tolist()}")
        logging.info(f"Processed DataFrame shape: {processed_input.shape}")


        # Make prediction
        prediction = model.predict(processed_input)
        prediction_proba = None
        if hasattr(model, "predict_proba"):
             try:
                 # Get probability for the positive class (Fatal)
                 prediction_proba = model.predict_proba(processed_input)[:, 1] 
                 prediction_proba = prediction_proba.tolist() # Convert to list for JSON
                 logging.info("Prediction probabilities calculated.")
             except Exception as e:
                 logging.warning(f"Could not get probability predictions: {e}")


        logging.info(f"Prediction result: {prediction.tolist()}")

        # Return prediction as JSON response
        response = {'prediction': prediction.tolist()}
        if prediction_proba is not None:
            response['prediction_proba_fatal'] = prediction_proba
            
        return jsonify(response)

    except Exception as e:
        logging.error(f"Error during prediction: {e}", exc_info=True)
        # Provide a more specific error message if possible
        return jsonify({"error": f"An error occurred during prediction: {str(e)}"}), 400

if __name__ == '__main__':
    # Run the Flask app
    # Use 0.0.0.0 to make it accessible externally, change if needed
    # Set debug=False for production environments
    app.run(host='0.0.0.0', port=5000, debug=True)
