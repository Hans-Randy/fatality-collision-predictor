"""Model evaluation utilities."""

import pandas as pd
import numpy as np
from typing import Any
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, roc_auc_score, average_precision_score
from utils.visualization import plot_confusion_matrix
from utils.config import PERFORMANCE_DIR

def evaluate_model(model: Any, X_test: pd.DataFrame, y_test: np.ndarray) -> dict[str, float]:
    """Evaluate model performance and generate visualizations."""
    # Make predictions
    y_pred = model.predict(X_test)
    
    # Get probability predictions if possible
    y_prob = None
    if hasattr(model, "predict_proba"):
        # Check if all estimators support predict_proba or if voting='soft'
        # For VotingClassifier with voting='hard', predict_proba might not be directly available
        # unless all estimators support it. Let's try and handle the potential error.
        try:
            y_prob = model.predict_proba(X_test)[:, 1] # Probability of the positive class
        except Exception as e:
            print(f"Could not get probability predictions: {e}")
            # Fallback or specific handling if predict_proba fails
            # For now, we'll proceed without ROC/AUC/Avg Precision if probs aren't available
            pass

    # Calculate metrics
    metrics = {
        'accuracy': accuracy_score(y_test, y_pred),
        'confusion_matrix': confusion_matrix(y_test, y_pred),
        'classification_report': classification_report(y_test, y_pred, output_dict=False), # Keep as string for file writing
    }
    
    # Calculate ROC AUC and Average Precision if probabilities are available
    if y_prob is not None:
        metrics['roc_auc'] = roc_auc_score(y_test, y_prob)
        metrics['average_precision'] = average_precision_score(y_test, y_prob)

    # Generate visualizations
    plot_confusion_matrix(y_test, y_pred)
    # Optional: Add plots for ROC and Precision-Recall if probabilities are available
    # if y_prob is not None:
    #     plot_roc_curve(y_test, y_prob)
    #     plot_precision_recall_curve(y_test, y_prob)

    # Save metrics to file
    with open(PERFORMANCE_DIR / 'classification_report.txt', 'w') as f:
        f.write("Model Performance Metrics:\\n")
        f.write("=" * 50 + "\\n\\n")
        f.write(f"Accuracy: {metrics['accuracy']:.3f}\\n")
        # Only write ROC AUC and Avg Precision if they were calculated
        if 'roc_auc' in metrics:
            f.write(f"ROC AUC: {metrics['roc_auc']:.3f}\\n")
        if 'average_precision' in metrics:
            f.write(f"Average Precision: {metrics['average_precision']:.3f}\\n\\n")
        else:
             f.write("\\n") # Add newline if ROC/Avg Prec are missing

        f.write("Detailed Classification Report:\\n")
        f.write("-" * 20 + "\\n")
        # Ensure classification_report is the string version here
        f.write(metrics['classification_report']) 
    
    # Return the full metrics dictionary, including potentially calculated ones
    # Convert classification_report to dict for return value if needed elsewhere
    metrics['classification_report_dict'] = classification_report(y_test, y_pred, output_dict=True)
    return metrics