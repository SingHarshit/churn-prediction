from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import traceback
import io
import sqlite3
import pickle
import os

app = Flask(__name__)
CORS(app, supports_credentials=True)

DB_PATH = "customers.db"
model = pickle.load(open("churn_prediction_model.pkl", "rb"))

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            age INTEGER,
            gender TEXT,
            churn_prob REAL,
            tenure INTEGER,
            citytier INTEGER,
            satisfactionscore INTEGER,
            complain INTEGER
        )
    ''')
    conn.commit()
    conn.close()

init_db()

@app.route("/upload", methods=["POST"])
def upload():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files['file']
        
        file_content = file.stream.read().decode("utf-8")
        lines = file_content.strip().splitlines()
        cleaned_lines = [line.strip().strip('"') for line in lines]
        cleaned_csv_string = "\n".join(cleaned_lines)
        
        df = pd.read_csv(io.StringIO(cleaned_csv_string))

        # --- FIX: Normalize all column names to lowercase ---
        df.columns = [col.lower() for col in df.columns]
        
        # --- Use lowercase for the expected features list ---
        expected_features = [
            'tenure', 'citytier', 'warehousetohome', 'hourspendonapp',
            'numberofdeviceregistered', 'satisfactionscore', 'numberofaddress',
            'complain', 'orderamounthikefromlastyear', 'couponused', 'ordercount',
            'daysincelastorder', 'cashbackamount', 'gender_female', 'gender_male',
            'maritalstatus_divorced', 'maritalstatus_married', 'maritalstatus_single'
        ]
        
        # Check for missing columns after converting to lowercase
        missing_cols = [col for col in expected_features if col not in df.columns]
        if missing_cols:
            return jsonify({"error": f"Missing required columns in CSV: {', '.join(missing_cols)}"}), 400

        X = df[expected_features]
        preds = model.predict_proba(X)[:, 1]

        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("DELETE FROM customers")

        for i, row in df.iterrows():
            name = f"Customer_{i+1}"
            age = 0 
            churn_prob = float(preds[i])
            # --- Use the lowercase column name to determine gender ---
            gender = 'Female' if row['gender_female'] == 1 else 'Male'
            
            tenure = int(row['tenure'])
            citytier = int(row['citytier'])
            satisfactionscore = int(row['satisfactionscore'])
            complain = int(row['complain'])
            
            c.execute(
                "INSERT INTO customers (name, age, gender, churn_prob, tenure, citytier, satisfactionscore, complain) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (name, age, gender, churn_prob, tenure, citytier, satisfactionscore, complain)
            )

        conn.commit()
        conn.close()
        
        return jsonify({"message": "File processed & predictions saved"})

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/customers", methods=["GET"])
def get_customers():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM customers ORDER BY churn_prob DESC")
    rows = c.fetchall()
    conn.close()

    data = [dict(row) for row in rows]
    return jsonify(data)

@app.route("/stats", methods=["GET"])
def get_stats():
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        c = conn.cursor()

        c.execute("SELECT COUNT(*) as count FROM customers WHERE churn_prob > 0.5")
        churn_count = c.fetchone()['count']
        c.execute("SELECT COUNT(*) as count FROM customers WHERE churn_prob <= 0.5")
        retain_count = c.fetchone()['count']

        c.execute("SELECT AVG(tenure) as avg_tenure FROM customers WHERE churn_prob > 0.5")
        avg_tenure_churn = c.fetchone()['avg_tenure'] or 0
        c.execute("SELECT AVG(tenure) as avg_tenure FROM customers WHERE churn_prob <= 0.5")
        avg_tenure_retain = c.fetchone()['avg_tenure'] or 0

        c.execute("SELECT citytier, COUNT(*) as total, SUM(CASE WHEN churn_prob > 0.5 THEN 1 ELSE 0 END) as churned FROM customers GROUP BY citytier")
        churn_by_tier_rows = c.fetchall()
        churn_by_tier = {row['citytier']: (row['churned'] / row['total']) * 100 if row['total'] > 0 else 0 for row in churn_by_tier_rows}

        c.execute("SELECT AVG(churn_prob) as avg_prob FROM customers WHERE complain = 1")
        complaint_churn_prob = c.fetchone()['avg_prob'] or 0
        c.execute("SELECT AVG(churn_prob) as avg_prob FROM customers WHERE complain = 0")
        no_complaint_churn_prob = c.fetchone()['avg_prob'] or 0

        conn.close()

        return jsonify({
            "at_risk": churn_count,
            "likely_to_stay": retain_count,
            "avg_tenure_churned": round(avg_tenure_churn, 1),
            "avg_tenure_retained": round(avg_tenure_retain, 1),
            "churn_rate_by_city": churn_by_tier,
            "complaint_impact": {
                "with_complaint": round(complaint_churn_prob * 100, 1),
                "without_complaint": round(no_complaint_churn_prob * 100, 1)
            }
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    
@app.route("/segments", methods=["GET"])
def get_segments():
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        c.execute("SELECT tenure, churn_prob FROM customers")
        customers = c.fetchall()
        conn.close()

        segments = {
            "High-Value At-Risk": 0,
            "New & Unhappy": 0,
            "Loyal Champions": 0,
            "New & Promising": 0,
            "Other": 0
        }

        for customer in customers:
            tenure = customer['tenure']
            churn_prob = customer['churn_prob']

            if tenure > 12 and churn_prob > 0.6:
                segments["High-Value At-Risk"] += 1
            elif tenure <= 3 and churn_prob > 0.6:
                segments["New & Unhappy"] += 1
            elif tenure > 12 and churn_prob <= 0.3:
                segments["Loyal Champions"] += 1
            elif tenure <= 3 and churn_prob <= 0.3:
                segments["New & Promising"] += 1
            else:
                segments["Other"] += 1
        
        return jsonify(segments)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500



if __name__ == "__main__":
    app.run(debug=True)
