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
#from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from utils.config import DATA_DIR, RANDOM_STATE, SERIALIZED_DIR, TARGET
from utils.data_cleaner import DataCleaner
from utils.evaluation import evaluate_model
from utils.feature_engineer import FeatureEngineer
from utils.sampling import apply_sampling

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

if __name__ == "__main__":
    # Load your data here
    logging.info("Loading data...")
    df = pd.read_csv(DATA_DIR / 'TOTAL_KSI_6386614326836635957.csv')
    
    # Create preprocessing pipeline
    preprocessing_pipeline = Pipeline([ 
        ('engineer', FeatureEngineer()),
        ('cleaner', DataCleaner()),
        #('scaler', StandardScaler())
    ])
    
    logging.info("Preprocessing data...")
    logging.info("Transforming data using full pipeline...")
    processed_data_np = preprocessing_pipeline.fit_transform(df)
    
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
        #('svc', SVC(kernel='rbf', probability=True, C=1, gamma='scale', class_weight='balanced')),
        ('dt', DecisionTreeClassifier(criterion='gini', min_samples_split=2, random_state=RANDOM_STATE, class_weight='balanced'))
    ]

    # Create a voting classifier.
    voting_clf = VotingClassifier(estimators=classifiers, voting='hard')

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=RANDOM_STATE)
    X_train_resampled, y_train_resampled = apply_sampling(X_train, y_train, method='smote_tomek')

    logging.info("Training Voting Classifier...")
    voting_clf.fit(X_train_resampled, y_train_resampled)

    # Log test set class distribution
    unique, counts = np.unique(y_test, return_counts=True)
    logging.info(f"Test set class distribution: {dict(zip(unique, counts))}")

    logging.info("Evaluating model...")
    evaluate_model(voting_clf, X_test, y_test)  # Evaluate on the original (but scaled) X_test

    # Save the *preprocessing* pipeline and the *trained* model
    joblib.dump(voting_clf, SERIALIZED_DIR / 'model.pkl')
    joblib.dump(preprocessing_pipeline, SERIALIZED_DIR / 'preprocessing_pipeline.pkl')
    logging.info("Model and preprocessing pipeline saved successfully.")