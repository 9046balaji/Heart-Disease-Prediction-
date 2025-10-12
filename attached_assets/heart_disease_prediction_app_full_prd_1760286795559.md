# Product Requirements Document (PRD)

**Title:** Heart Disease Prediction & Lifestyle Support App

**Author:** ChatGPT for Balaji K.

**Date:** 2025-10-12

---

## 1. Executive Summary
A mobile-first web and app product that predicts an individual's risk of heart disease using tabular clinical data and provides personalised lifestyle guidance (diet, exercise), medication adherence support, and a chatbot for educational and triage interactions. The system includes a clinician dashboard for reviewing patients and model explanations. The project is research-focused (not a certified medical device) and suitable as a 1-year academic capstone.

---

## 2. Objectives & Success Metrics
**Primary objectives**
- Build and evaluate ML models that predict heart disease risk using public & collected clinical/tabular data.
- Deliver a usable mobile app + web portal with prediction, personalised guidance, and an integrated chatbot.
- Provide clinician-facing explainability (SHAP) and exportable summaries.

**Success metrics**
- Model AUC-ROC ≥ 0.80 on validation dataset (dataset-dependent). If public datasets limit this, document baseline and rationale.
- Sensitivity (recall) ≥ 0.85 for screening use-case (tunable depending on dataset and clinician guidance).
- Usability: System Usability Scale (SUS) score ≥ 70 in pilot user testing (5–10 users).
- End-to-end latency: prediction API response ≤ 500 ms for typical payloads.
- Feature completeness: mobile app implements at least 80% of MVP features (see Section 6).

**Non-functional constraints**
- Data privacy and encryption at rest and in transit. Use HTTPS and JWT auth.
- App must include clear medical disclaimer on first-run and on prediction screens.

---

## 3. Scope
**In scope (MVP)**
- Tabular-data ML pipeline (data ingestion, preprocessing, trained models: logistic regression, RandomForest/XGBoost).
- FastAPI backend exposing inference, user management, logging, and exports.
- Mobile app (React Native / Flutter) for user sign-in, data entry, risk prediction, viewing explanations, and lifestyle suggestions.
- Chatbot (Rasa or Dialogflow) integrated in-app for FAQs, triage, and personalised suggestions.
- Clinician web dashboard to view patients, trends, and model explanations (SHAP summaries).
- Content modules: diet recommendations, exercise programs, medication reminders, emergency flow.

**Out of scope (for this 1-year project unless time permits)**
- Medical device certification (FDA/CE) or hospital-grade integrations.
- Real-time biosensor integrations (IoT removed by request).
- Large-scale deployment/infrastructure beyond a modest cloud instance.

---

## 4. Users & Personas
**Primary users**
- **Patient / End User:** adults (18+) curious about heart disease risk or under follow-up for cardiac risk factors. Uses app for predictions, recipes, exercise routines, and chatbot advice.
- **Clinician / Researcher:** cardiologist or supervising faculty who reviews flagged patients, inspects model explanations, and evaluates aggregated metrics.
- **Administrator / Project Maintainer:** manages dataset, model updates, and deployment.

**Key personas**
1. *Raj, 52, hypertensive, non-technical* — wants easy meal suggestions, exercise routines, and simple explanations for risk. High need for clear, culturally-relevant advice.
2. *Meera, 28, health-conscious vegetarian* — wants meal plans, calorie guidance, and progress tracking.
3. *Dr. Suresh, cardiologist* — wants exportable patient summaries and explanation of model decisions to evaluate usefulness.

---

## 5. Requirements
### 5.1 Functional Requirements (FR)
**FR1 — User account & auth**
- FR1.1: Users can register using email + password (primary) and optionally phone number.
- FR1.2: Implement JWT-based auth; tokens expire and refreshable via refresh token.

**FR2 — Clinical data entry & profile**
- FR2.1: Users can input demographic and clinical features (age, sex, weight, height, BP, cholesterol, fasting blood sugar, smoking status, chest pain type, exercise-induced angina, resting ECG code if known, max heart rate, oldpeak, medications, allergies, comorbidities).
- FR2.2: Users can update profile and view history of entries.

**FR3 — Prediction & explanation**
- FR3.1: Users can request a risk prediction on demand.
- FR3.2: API returns risk score (0–100%), binary class (low/medium/high per thresholds), and top 3 contributing features with short plain-English explanations (derived from SHAP outputs).
- FR3.3: App displays recommended immediate actions (diet/exercise/doctor visit) based on top contributors and thresholds.

**FR4 — Lifestyle guidance**
- FR4.1: Provide personalised meal recommendations and 7-day meal plans adjusted for dietary preference (veg/non-veg), allergies and comorbidities.
- FR4.2: Provide personalised exercise plans (12-week progressive program) with safety notes and short demo clips or animations.
- FR4.3: Grocery list generation from chosen meal plans.

**FR5 — Chatbot**
- FR5.1: Chatbot answers FAQs, explains results, suggests meal/exercise plans, and provides triage advice.
- FR5.2: Chatbot can trigger emergency actions (show emergency contact call button; prewritten SMS template) but cannot place calls automatically without user permission.

**FR6 — Medication & tracking**
- FR6.1: Medication schedule & reminders; user can mark taken/snooze.
- FR6.2: Symptom diary & vitals logging (manual, e.g., BP, HR, weight) with trend charts.

**FR7 — Clinician portal**
- FR7.1: Clinician can view list of patients, their recent risk scores, and download anonymized summaries.
- FR7.2: Clinician can view SHAP explanations for individual predictions and export PDF summary.

**FR8 — Data export & audit**
- FR8.1: Export anonymized CSV of dataset and user-selected patient histories.
- FR8.2: Logging for inference requests (timestamp, features, prediction, model version) for audit and retraining.

### 5.2 Non-functional Requirements (NFR)
- **NFR1 Security:** HTTPS for all network traffic, JWT auth, hashed passwords (bcrypt/scrypt), DB encryption at rest. Role-based access control for clinician/admin views.
- **NFR2 Performance:** Prediction API average latency ≤ 500ms for typical single-record requests under normal load (development instance).
- **NFR3 Scalability:** Containerized services (Docker); architecture should support later deployment to Kubernetes if needed.
- **NFR4 Reliability:** Basic monitoring and logging; backups for DB and models.
- **NFR5 Accessibility & UX:** Follow mobile accessibility basics (large tap targets, readable contrast). Localize language and food recommendations based on locale where feasible.

---

## 6. MVP Feature List & Prioritisation
**Must-have (launch)**
- User registration & profile.
- Manual clinical data entry and history.
- Baseline prediction model (Logistic Regression/XGBoost) with SHAP explanations.
- App screens: Home, Predict, History, Suggestions, Chatbot, Settings.
- Clinician portal: patient list + single-patient view.
- Emergency button & disclaimers.

**Nice-to-have (phase 2)**
- Multi-model ensemble and model versioning UI.
- Meal recipe library with images and grocery list automation.
- Medication interaction warnings.
- Push notifications for reminders.

**Future / stretch**
- Federated learning for privacy-preserving model updates.
- EMR integrations (FHIR/HL7).
- Certification pathway for medical device.

---

## 7. Data Strategy
### 7.1 Datasets
- Public datasets (e.g., UCI heart disease dataset — Cleveland, Hungarian, Long Beach, Switzerland; other open cardiac risk datasets). Document source, columns, and known biases.
- Optional: Controlled volunteer dataset via clinical questionnaire with consent. Include demographic diversity where possible.

### 7.2 Data model (schema)
**UserProfile**: {user_id, name*, dob, sex, height_cm, weight_kg, allergies, medications, comorbidities}
**ClinicalEntry**: {entry_id, user_id, timestamp, age, sex, resting_bp_systolic, resting_bp_diastolic, cholesterol_mg_dl, fasting_blood_sugar_flag, chest_pain_type, rest_ecg_code, max_heart_rate, exercise_angina_flag, oldpeak, smoking_status, label_if_available}
**PredictionLog**: {log_id, user_id, timestamp, features_json, prediction_score, prediction_label, model_version, shap_top_features}

\*Name optional; encourage anonymized accounts if data used for research.

### 7.3 Privacy & Consent
- Consent screen during registration describing data usage and research intent.
- Option to opt-out of research data sharing while still using the app.
- Store PII separately and encrypted; export only anonymized records for research.

---

## 8. Architecture & Tech Stack
**Frontend**: React Native (mobile) + React (clinician web portal)
**Backend**: Python (FastAPI), Dockerized
**ML stack**: pandas, scikit-learn, XGBoost, SHAP; Jupyter notebooks for experiments
**Database**: PostgreSQL for relational data; MinIO/S3 for file storage
**Authentication**: JWT tokens, bcrypt hashed passwords
**Chatbot**: Rasa (self-host) or Dialogflow (cloud)
**Hosting / infra**: Cloud VM for dev (AWS/GCP/Azure) or Heroku/Fly for hosting; CI via GitHub Actions
**Monitoring**: Prometheus + Grafana (optional) or cloud provider monitoring

Architecture diagram (textual)
```
User App / Web -> FastAPI (Auth) -> Postgres
                           -> Model Service (scikit-learn/XGBoost) -> SHAP
                           -> Chatbot Service (Rasa/Dialogflow)
Clinician Portal -> FastAPI -> Postgres
Admin -> Export / Model management
```

---

## 9. UX / UI Requirements
**Screens (mobile)**
- Onboarding & consent
- Profile & clinical data entry
- Home (summary of last prediction, tips)
- Predict (run prediction & show explanation)
- Suggestions (diet/exercise/medication reminders)
- Chatbot (conversational UI)
- History & exports
- Settings (privacy, language, notifications)

**Design principles**
- Clear primary action on each screen (e.g., Predict, Add Entry).
- Use cards for quick recommendations.
- Keep medical language simple; use tooltips for clinical terms.

---

## 10. Chatbot Design
**Primary intents**
- ask_risk_explanation
- ask_food_advice
- ask_exercise_advice
- emergency_actions
- medication_reminder_help

**Capabilities**
- Provide short educational replies and follow-ups (e.g., offer meal plan or exercise demo).
- Link to internal app sections (open meal plan, schedule reminder).
- Escalate: if user reports chest pain or severe symptoms, show emergency modal and suggest calling emergency contacts.

---

## 11. APIs
**/auth/register [POST]** — create user account
**/auth/login [POST]** — returns JWT
**/profile [GET|PUT]** — get/update profile
**/clinical-entry [POST|GET]** — add or list clinical entries
**/predict [POST]** — returns {score, label, shap_contributions}
**/predictions/{user_id} [GET]** — list past predictions
**/export/users [GET]** — download anonymized CSV (admin)
**/chatbot/message [POST]** — proxy to chatbot service

Each endpoint must validate input schema and log requests for audit.

---

## 12. Model Lifecycle & Monitoring
- Version models (semantic versioning) and store model artifacts with metadata (training data version, date, metrics).
- Retain prediction logs for drift detection.
- Schedule monthly evaluation runs on held-out dataset; retrain if performance drops >5% AUC.

---

## 13. Testing & Validation
**Unit Tests**: backend routes, auth, input validation.
**Integration Tests**: end-to-end predict flow, clinician export.
**Model Validation**: k-fold cross-validation, subgroup analyses (age, sex), calibration assessment.
**User Testing**: 5–10 pilot users for usability + clinician review for clinical content.

---

## 14. Roadmap & Timeline (12-month high-level)
- Month 1: Proposal, literature review, dataset acquisition, consent templates.
- Month 2: Data schema, EDA, baseline modeling.
- Month 3: Model training & explainability (SHAP). Backend scaffolding.
- Month 4: Mobile app skeleton, profile & data entry UI.
- Month 5: Integrate prediction API; display results + SHAP in app.
- Month 6: Chatbot basic intents; clinician portal basic view.
- Month 7: Meal plans & exercise modules; medication reminders.
- Month 8: Pilot testing with small group; collect feedback.
- Month 9: Iterate models and UX; add export capabilities.
- Month 10: Security audit & documentation.
- Month 11: Final evaluation & report writing.
- Month 12: Presentation, demo video, code release, submission.

---

## 15. Deliverables
- Project proposal + ethical consent forms.
- Cleaned datasets + data dictionary.
- Jupyter notebooks for modeling + metrics.
- FastAPI backend code + Dockerfile.
- Mobile app source and build instructions.
- Chatbot training data.
- Clinician portal code.
- Final report, presentation, demo video, and README.

---

## 16. Risks & Mitigations
- **Limited labeled data**: supplement with public datasets, use robust CV, consider simple models to avoid overfitting.
- **Clinical validity concerns**: engage clinician early for content review and evaluation.
- **User safety**: prominent disclaimers, emergency triage flow, and push to seek medical care for red flags.
- **Data privacy**: encrypt PII, opt-in for research data sharing.

---

## 17. Acceptance Criteria
- App can produce a risk prediction from a single clinical entry and return SHAP-based top 3 contributing features.
- Clinician can view at least 10 anonymized patient summaries exported as CSV/PDF.
- Chatbot responds correctly to the key intents (>=80% intent match in pilot testing).
- All major endpoints covered by automated tests (≥70% backend unit/integration coverage).

---

## 18. Appendix
- Example prediction response format (JSON)
```json
{
  "score": 0.37,
  "label": "moderate",
  "model_version": "v0.1.0",
  "shap_top_features": [
    {"feature": "systolic_bp", "contribution": "+0.12", "explanation": "High systolic BP increased risk"},
    {"feature": "age", "contribution": "+0.08", "explanation": "Age contributed positively to risk"},
    {"feature": "cholesterol", "contribution": "+0.05", "explanation": "Elevated cholesterol raised risk"}
  ]
}
```

- Sample chatbot intent: `ask_food_advice` — example utterances and response templates. (Stored separately in chatbot training file.)

---

*End of PRD*

