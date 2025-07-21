Customer Churn Prediction Dashboard
This is a full-stack web application designed to predict customer churn. It features a Python (Flask) backend that uses a machine learning model to analyze customer data, and a React frontend that provides an interactive dashboard to visualize the results.

FeaturesCSV Upload: 
Easily upload customer data in CSV format.
AI-Powered Predictions: Uses a pre-trained machine learning model to predict the churn probability for each customer.
Interactive Dashboard: Visualizes key metrics and predictions in a user-friendly interface.
Customer Segmentation: Automatically groups customers into strategic segments like "High-Value At-Risk" and "New & Unhappy.
"Data-Driven Insights: Provides actionable insights through KPIs and charts, such as churn rate by city and the impact of customer complaints.
Interactive Filtering: Allows users to drill down into specific customer segments by clicking on the charts.


Tech Stack

Backend:
Python
Flask
Pandas
Scikit-learn
Gunicorn (for production)
SQLite

Frontend:
React
Vite
TypeScript
Axios
Tailwind CSS
Recharts (for charts)
Lucide React (for icons)


Setup and Installation
To get the project running locally, follow these steps for both the backend and frontend.
1. Backend SetupPrerequisites: Python 3.8+ and pip.Navigate to the backend directory:cd backend

Create and activate a virtual environment:# Create the environment
python -m venv venv

# Activate it (Windows)
.\venv\Scripts\activate

# Activate it (macOS/Linux)
source venv/bin/activate

Install the required Python packages:pip install Flask pandas scikit-learn flask-cors gunicorn

Place Your Model:Make sure your trained model file (e.g., churn_prediction_model.pkl) is in the backend directory.Run the Flask Server:flask run

The backend will now be running on http://127.0.0.1:5000.2. Frontend SetupPrerequisites: Node.js and npm.Navigate to the frontend directory:cd frontend

Install the required npm packages:npm install

Run the React Development Server:npm run dev

The frontend will now be running on http://localhost:5173 (or another port if 5173 is busy).

How to UseOpen your web browser and navigate to the frontend URL (e.g., http://localhost:5173).
You will see the file upload screen. 
Click the designated area or drag and drop your customer data CSV file.
Click the "Upload and Predict" button.
The application will process the data and automatically display the interactive dashboard with all the predictions and insights.
Click on the bars in the "Customer Segments" chart to filter the customer list below.
API EndpointsThe Flask backend provides the following API endpoints:POST /upload: Uploads a CSV file, runs predictions, and saves data to the database.
GET /customers: Retrieves a list of all customers and their churn predictions.GET /stats: Retrieves calculated statistics and KPIs for the dashboard.GET /segments: Retrieves the count of customers in each defined segment.



Project Structure.
├── backend/
│   ├── venv/
│   ├── app.py                      # Main Flask application
│   ├── churn_prediction_model.pkl  # Your trained ML model
│   └── customers.db                # SQLite database file
│
└── frontend/
    ├── node_modules/
    ├── public/
    └── src/
        ├── components/             # (Optional) For smaller components
        ├── App.tsx                 # Main React application component
        ├── main.tsx                # Entry point for the React app
        └── index.css               # Tailwind CSS directives
