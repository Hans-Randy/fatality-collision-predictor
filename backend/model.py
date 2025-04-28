import logging
from typing import Any
import joblib
import numpy as np
import pandas as pd
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
    pipeline = Pipeline([
        ('engineer', FeatureEngineer()),
        ('cleaner', DataCleaner()),
    ])
    
    logging.info("Preprocessing data...")
    # First preprocess the data
    processed_df = pipeline.fit_transform(df)
    
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
        ('svc', SVC(kernel='rbf', probability=True, C=1, gamma=3.0, class_weight='balanced')),
        ('dt', DecisionTreeClassifier(criterion='gini', min_samples_split=2, random_state=RANDOM_STATE, class_weight='balanced'))
    ]

    # Create a voting classifier.
    # The 'estimators' parameter expects a list of (name, estimator) tuples.
    voting_clf = VotingClassifier(estimators=classifiers, voting='hard')

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=RANDOM_STATE)

    # Apply sampling technique
    X_train_resampled, y_train_resampled = apply_sampling(X_train, y_train, method='smote_tomek')

    # Train the voting classifier.
    voting_clf.fit(X_train_resampled, y_train_resampled)

    # Log test set class distribution
    unique, counts = np.unique(y_test, return_counts=True)
    logging.info(f"Test set class distribution: {dict(zip(unique, counts))}")

    evaluate_model(voting_clf, X_test, y_test)

    save_model_artifacts(voting_clf, pipeline)
    logging.info("Model and pipeline saved successfully.")

