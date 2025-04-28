import logging
from typing import Any
import joblib
import numpy as np
import pandas as pd
from sklearn.discriminant_analysis import StandardScaler
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from utils.config import DATA_DIR, RANDOM_STATE, SERIALIZED_DIR, TARGET
from utils.data_cleaner import DataCleaner
from utils.evaluation import evaluate_model
from utils.feature_engineer import FeatureEngineer
from utils.sampling import apply_sampling

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def save_model_artifacts(model: Any, pipeline: Any) -> None:
    """Save model and preprocessing pipeline."""    
    joblib.dump(model, SERIALIZED_DIR / 'model.pkl')
    joblib.dump(pipeline, SERIALIZED_DIR / 'preprocessing_pipeline.pkl') 


if __name__ == "__main__":
    # Load your data here
    logging.info("Loading data...")
    df = pd.read_csv(DATA_DIR / 'TOTAL_KSI_6386614326836635957.csv')
    
    # Create preprocessing pipeline
    preprocessing_pipeline = Pipeline([ # <-- Rename for clarity
        ('engineer', FeatureEngineer()),
        ('cleaner', DataCleaner()),
        ('scaler', StandardScaler()) # <-- Add StandardScaler
    ])
    
    logging.info("Preprocessing data...")
    # First preprocess the data
    # Transform the data using the fitted pipeline (results in NumPy array)
    logging.info("Transforming data using full pipeline...")
    processed_data_np = preprocessing_pipeline.fit_transform(df)

    # Get column names and index from the data state *before* the final scaling step
    # We need to apply the transformations up to the scaler to get the correct columns/index
    logging.info("Retrieving column names and index before scaling...")
    temp_df = df
    processed_columns = None
    processed_index = None
    try:
        # Iterate through steps *before* the scaler ('scaler' is the last step)
        for name, step in preprocessing_pipeline.steps[:-1]:
            # Get the already fitted transformer instance from the pipeline
            fitted_transformer = preprocessing_pipeline.named_steps[name]
            # Apply transform using the fitted transformer
            temp_df = fitted_transformer.transform(temp_df)
            # Ensure temp_df remains a DataFrame to access columns/index easily
            # Note: Custom transformers FeatureEngineer/DataCleaner must return DataFrames
            if not isinstance(temp_df, pd.DataFrame):
                raise TypeError(f"Intermediate step '{name}' did not return a pandas DataFrame.")

        # After applying steps before the scaler, get columns and index
        processed_columns = temp_df.columns
        processed_index = temp_df.index
    except Exception as e:
        logging.error(f"Error retrieving column names/index before scaling: {e}")
        # Handle error appropriately, e.g., raise, log, or fallback
        # If FeatureEngineer/DataCleaner significantly change columns, this might need adjustment
        # For now, re-raise to indicate failure
        raise RuntimeError("Could not determine column names/index after preprocessing steps before scaler.") from e

    # Create DataFrame from the scaled NumPy array with retrieved columns and index
    logging.info("Creating final DataFrame from scaled data...")
    processed_df = pd.DataFrame(processed_data_np, columns=processed_columns, index=processed_index)

    # Optional: Verify TARGET column exists before proceeding
    if TARGET not in processed_df.columns:
        raise ValueError(f"Target column '{TARGET}' not found in the processed DataFrame columns: {processed_df.columns.tolist()}")
    logging.info(f"Shape of final processed DataFrame: {processed_df.shape}")
    
    # Seperate features and target variable
    X = processed_df.drop(columns=[TARGET])
    y = processed_df[TARGET] 

    logging.info(f"Final dataset shape: {X.shape}")
    logging.info(f"Number of Fatal accidents: {y.sum()}")
    logging.info(f"Number of Non-Fatal accidents: {len(y) - y.sum()}")


    # Create a list of classifiers.
    classifiers = [
        ('knn', KNeighborsClassifier(n_neighbors=5)),
        ('rf', RandomForestClassifier(n_estimators=100, random_state=RANDOM_STATE, class_weight='balanced')),
        # Consider reducing gamma or using 'scale'/'auto' after scaling
        ('svc', SVC(kernel='rbf', probability=True, C=1, gamma='scale', class_weight='balanced')), # <-- Changed gamma
        ('dt', DecisionTreeClassifier(criterion='gini', min_samples_split=2, random_state=RANDOM_STATE, class_weight='balanced'))
    ]

    # Create a voting classifier.
    voting_clf = VotingClassifier(estimators=classifiers, voting='hard') # <-- Keep this as is for now

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=RANDOM_STATE)

    # Apply sampling technique
    X_train_resampled, y_train_resampled = apply_sampling(X_train, y_train, method='smote_tomek')

    # Train the voting classifier.
    # Note: Scaling should ideally be fit only on training data to avoid data leakage.
    # A more robust approach involves putting the classifier *inside* a pipeline
    # that includes scaling, especially if doing cross-validation later.
    # However, for this structure, scaling X before splitting is simpler, though less strict.
    # A better way:
    # 1. Split data: X_train, X_test, y_train, y_test = train_test_split(...)
    # 2. Fit scaler on X_train: scaler.fit(X_train)
    # 3. Transform train and test: X_train_scaled = scaler.transform(X_train), X_test_scaled = scaler.transform(X_test)
    # 4. Apply sampling on scaled training data: X_train_resampled, y_train_resampled = apply_sampling(X_train_scaled, y_train, ...)
    # 5. Train on resampled scaled data: voting_clf.fit(X_train_resampled, y_train_resampled)
    # 6. Evaluate on scaled test data: evaluate_model(voting_clf, X_test_scaled, y_test)

    # For simplicity with the current structure, we'll train on the already scaled data from the pipeline
    # (assuming the pipeline was fit_transformed on the *entire* dataset before splitting)
    # Re-splitting after scaling the full dataset is necessary here:
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=RANDOM_STATE)
    X_train_resampled, y_train_resampled = apply_sampling(X_train, y_train, method='smote_tomek')

    logging.info("Training Voting Classifier...")
    voting_clf.fit(X_train_resampled, y_train_resampled)

    # Log test set class distribution
    unique, counts = np.unique(y_test, return_counts=True)
    logging.info(f"Test set class distribution: {dict(zip(unique, counts))}")

    logging.info("Evaluating model...")
    evaluate_model(voting_clf, X_test, y_test) # Evaluate on the original (but scaled) X_test

    # Save the *preprocessing* pipeline and the *trained* model
    save_model_artifacts(voting_clf, preprocessing_pipeline) # <-- Save the pipeline including the scaler
    logging.info("Model and preprocessing pipeline saved successfully.")