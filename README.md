# 🌀 Customer Churn Prediction Dashboard

This is a full-stack web application designed to predict customer churn using machine learning. The system features a **Flask** backend powered by a trained model and a **React** frontend that offers an interactive dashboard for insights.

---

## 🚀 Features

- **📁 CSV Upload**: Easily upload customer data in CSV format.
- **🤖 AI-Powered Predictions**: Predicts churn probability using a pre-trained ML model.
- **📊 Interactive Dashboard**: Visualizes key metrics in a user-friendly interface.
- **👥 Customer Segmentation**: Groups customers into strategic segments like:
  - *High-Value At-Risk*
  - *New & Unhappy*
- **📈 Data-Driven Insights**: View KPIs such as churn rate by city and complaint impact.
- **🔍 Interactive Filtering**: Click on chart elements to filter the customer table dynamically.

---

## 🛠 Tech Stack

### Backend
- Python
- Flask
- Pandas
- Scikit-learn
- Flask-CORS
- Gunicorn
- SQLite

### Frontend
- React
- Vite
- TypeScript
- Axios
- Tailwind CSS
- Recharts
- Lucide React

---

## ⚙️ Setup and Installation

### 1. Backend Setup

#### 📋 Prerequisites
- Python 3.8+
- pip

#### 🧰 Installation

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate environment (Windows)
.\venv\Scripts\activate

# OR activate on macOS/Linux
source venv/bin/activate

# Install dependencies
pip install Flask pandas scikit-learn flask-cors gunicorn
```

📦 Place Your Model
Make sure your trained model file (e.g., churn_prediction_model.pkl) is inside the backend/ directory.

🚀 Run the Server
```bash
Copy
Edit
flask run
```
Flask backend will run at: http://127.0.0.1:5000

2. Frontend Setup
📋 Prerequisites
Node.js

npm

🧰 Installation
bash
Copy
Edit
cd frontend

# Install dependencies
npm install
🚀 Run the Development Server
bash
```
Copy
Edit
npm run dev
```
Frontend will run at: http://localhost:5173

🧑‍💻 How to Use
Open http://localhost:5173 in your browser.

Upload your CSV file containing customer data.

Click "Upload and Predict".

View churn predictions and KPIs on the interactive dashboard.

Click on any chart to filter customers dynamically.

🧩 API Endpoints
Method	Endpoint	Description
POST	/upload	Upload CSV, run predictions, save to database
GET	/customers	Get all customers and their predictions
GET	/stats	Retrieve dashboard statistics and KPIs
GET	/segments	Retrieve count of customers per defined segment

📁 Project Structure
project-root/
├── backend/
│   ├── venv/                    # Virtual environment
│   ├── app.py                   # Main Flask app
│   ├── churn_prediction_model.pkl # Trained ML model
│   └── customers.db             # SQLite DB file
├── frontend/
│   ├── node_modules/
│   ├── public/
│   └── src/
│       ├── components/          # (Optional) Reusable components
│       ├── App.tsx             # Main React component
│       ├── main.tsx            # React entry point
│       └── index.css           # Tailwind CSS config


📬 Contact
Feel free to open an issue or fork the repo to improve it!

