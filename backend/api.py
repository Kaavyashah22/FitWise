import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS
from plans import generate_plan

print("--- AI Server (V6) is Starting... ---")

try:
    model_cut = joblib.load('model_cut.pkl')
    scaler_cut = joblib.load('scaler_cut.pkl')

    model_bulk = joblib.load('model_bulk.pkl')
    scaler_bulk = joblib.load('scaler_bulk.pkl')

    model_maintain = joblib.load('model_maintain.pkl')
    scaler_maintain = joblib.load('scaler_maintain.pkl')

    le_plan = joblib.load('le_plan.pkl')
    le_gender = joblib.load('le_gender.pkl')
    le_activity = joblib.load('le_activity.pkl')

    print("✅ All V6 models loaded successfully!")

except FileNotFoundError:
    print("❌ ERROR: Model files not found.")
    exit()

app = Flask(__name__)
CORS(app)


@app.route('/predict', methods=['POST'])
def predict_plan():

    data = request.json
    print(f"Received data: {data}")

    try:
        age = int(data['age'])
        weight = float(data['weight'])
        height = float(data['height'])
        goal = data['goal'].lower()
        gender = data['gender'].capitalize()

        activity_raw = data['activity']
        # Map UI activity levels to model-supported labels
        if activity_raw.lower() == "sedentary":
            activity = "Sedentary"
        else:
            activity = "Active"

        gender_encoded = le_gender.transform([gender])[0]
        activity_encoded = le_activity.transform([activity])[0]

        new_user_data = [[age, weight, height, gender_encoded, activity_encoded]]

        prediction_encoded = None
        confidence = None

        if goal == 'cut':
            print("Routing to 'Cut' Expert...")
            data_scaled = scaler_cut.transform(new_user_data)
            prediction_encoded = model_cut.predict(data_scaled)
            confidence = max(model_cut.predict_proba(data_scaled)[0])

        elif goal == 'bulk':
            print("Routing to 'Bulk' Expert...")
            data_scaled = scaler_bulk.transform(new_user_data)
            prediction_encoded = model_bulk.predict(data_scaled)
            confidence = max(model_bulk.predict_proba(data_scaled)[0])

        elif goal == 'maintain':
            print("Routing to 'Maintain' Expert...")
            data_scaled = scaler_maintain.transform(new_user_data)
            prediction_encoded = model_maintain.predict(data_scaled)
            confidence = max(model_maintain.predict_proba(data_scaled)[0])

        if prediction_encoded is not None:

            final_plan_key = le_plan.inverse_transform(prediction_encoded)[0]
            print(f"AI Recommendation: {final_plan_key}")

            bmi = weight / ((height / 100) ** 2)

            full_plan = generate_plan(
                plan_key=final_plan_key,
                age=age,
                bmi=bmi,
                activity=activity,
                goal=goal,
                confidence=confidence
            )

            return jsonify(full_plan)

        else:
            return jsonify({'error': 'Invalid goal provided'}), 400

    except Exception as e:
        print(f"Error processing request: {e}")
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)