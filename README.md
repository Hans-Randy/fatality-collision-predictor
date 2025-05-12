# Fatality Collision Predictor

A machine learning-powered web application that predicts and analyzes traffic collision fatalities in different regions. The application provides insights into collision patterns and helps identify high-risk areas for traffic accidents.

## Features

- Real-time collision fatality prediction
- Interactive map visualization of collision data
- Regional collision analysis and reporting
- User-friendly dashboard interface
- Data-driven insights and statistics

## Technology Stack

### Frontend

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Key Libraries**:
  - React Router DOM for navigation
  - React Google Maps API for map visualization
  - Recharts for data visualization
- **Styling**: Custom CSS with modern design principles
- **Development Tools**:
  - TypeScript for type safety
  - ESLint for code quality
  - Modern development environment with hot reloading

### Backend

- **Framework**: Flask (Python)
- **Key Features**:
  - RESTful API endpoints
  - CORS support for cross-origin requests
  - Machine learning model integration
- **Data Processing**:
  - Pandas for data manipulation
  - Joblib for model serialization
- **Security**: Environment-based configuration

## Project Structure

```
fatality-collision-predictor/
├── frontend/           # React frontend application
│   ├── src/           # Source code
│   ├── public/        # Static assets
│   └── package.json   # Frontend dependencies
└── backend/           # Flask backend application
    ├── app.py        # Main application file
    ├── model.py      # ML model implementation
    └── utils/        # Utility functions
```

## Getting Started

1. Clone the repository
2. Set up the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. Set up the backend:
   ```bash
   cd backend
   pip install -r requirements.txt
   python app.py
   ```

## Environment Variables

The application requires the following environment variables:

- `VITE_API_PREDICT_URL`: Backend API URL
- `VITE_GOOGLE_MAPS_API_KEY`: Google Maps API key
