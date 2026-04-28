import io
import pandas as pd
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.ensemble import RandomForestClassifier
from fairlearn.reductions import ExponentiatedGradient, DemographicParity

app = FastAPI(title="FairMind API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FairnessMetricsResponse(BaseModel):
    demographic_parity: dict
    equal_opportunity: dict
    disparate_impact: dict

# MVP Global State to share data between endpoints
STATE = {
    "df": None,
    "target_col": None,
    "protected_col": None,
    "model": None
}

@app.get("/")
def read_root():
    return {"message": "Welcome to the FairMind ML Engine API"}

@app.post("/api/v1/datasets/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    target_column: str = Form(...),
    protected_attribute: str = Form(...)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")
    
    contents = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(contents))
        
        if target_column not in df.columns or protected_attribute not in df.columns:
            raise HTTPException(status_code=400, detail=f"Headers not found. Make sure your CSV has columns exactly named '{target_column}' and '{protected_attribute}'.")
        
        # Data Quality Checks
        missing_values = int(df.isnull().sum().sum())
        duplicates = int(df.duplicated().sum())
        
        STATE["df"] = df
        STATE["target_col"] = target_column
        STATE["protected_col"] = protected_attribute
        STATE["model"] = None
        
        group_counts = df[protected_attribute].value_counts().to_dict()
        
        return {
            "filename": file.filename,
            "total_rows": len(df),
            "features_count": len(df.columns),
            "protected_attribute": protected_attribute,
            "groups": group_counts,
            "data_quality": {
                "missing_values": missing_values,
                "duplicates": duplicates
            },
            "status": "success"
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")

@app.get("/api/v1/audits/proxies")
async def detect_proxies():
    """ Detects hidden proxy variables that correlate highly with the protected attribute. """
    df = STATE.get("df")
    protected = STATE.get("protected_col")
    
    if df is None:
        raise HTTPException(status_code=400, detail="No dataset uploaded.")
        
    numeric_df = df.select_dtypes(include=['number']).fillna(0).copy()
    
    if protected not in numeric_df.columns:
        numeric_df[protected] = df[protected].astype('category').cat.codes
        
    corr = numeric_df.corr()[protected].drop(protected).abs().sort_values(ascending=False)
    
    proxies = []
    for feature, correlation in corr.items():
        if correlation > 0.15: # threshold for demo
            proxies.append({"feature": feature, "correlation": round(correlation, 2)})
            
    return {"proxies": proxies}

def _calculate_metrics(df_clean, target, protected, y_pred):
    df_clean['y_pred'] = y_pred
    
    # Identify top 2 groups
    top_groups = df_clean[protected].value_counts().nlargest(2).index.tolist()
    if len(top_groups) < 2:
        raise HTTPException(status_code=400, detail="Protected attribute must have at least 2 distinct groups.")
    group_a_name, group_b_name = top_groups[0], top_groups[1]
    
    group_a_data = df_clean[df_clean[protected] == group_a_name]
    group_b_data = df_clean[df_clean[protected] == group_b_name]
    
    rate_a = group_a_data['y_pred'].mean()
    rate_b = group_b_data['y_pred'].mean()
    
    dp_diff = rate_b - rate_a
    di_ratio = rate_b / rate_a if rate_a > 0 else 0
    di_ratio = min(di_ratio, 1/di_ratio) if di_ratio > 0 else di_ratio
    
    tpr_a = group_a_data[group_a_data[target] == 1]['y_pred'].mean()
    tpr_b = group_b_data[group_b_data[target] == 1]['y_pred'].mean()
    tpr_a = tpr_a if pd.notna(tpr_a) else 0
    tpr_b = tpr_b if pd.notna(tpr_b) else 0
    eo_diff = tpr_b - tpr_a
    
    def format_pct(val): return f"{int(round(val * 100))}%"
    def get_status(metric_val, threshold=0.1, is_ratio=False):
        if is_ratio: return "Pass" if metric_val >= 0.80 else "Fail"
        else: return "Pass" if abs(metric_val) <= threshold else "Fail"

    return {
        "demographic_parity": {
            "value": round(dp_diff, 2),
            "status": get_status(dp_diff, 0.1),
            "groupA": {"name": str(group_a_name), "val": format_pct(rate_a), "pct": int(rate_a*100)},
            "groupB": {"name": str(group_b_name), "val": format_pct(rate_b), "pct": int(rate_b*100)}
        },
        "equal_opportunity": {
            "value": round(eo_diff, 2),
            "status": get_status(eo_diff, 0.1),
            "groupA": {"name": str(group_a_name), "val": format_pct(tpr_a), "pct": int(tpr_a*100)},
            "groupB": {"name": str(group_b_name), "val": format_pct(tpr_b), "pct": int(tpr_b*100)}
        },
        "disparate_impact": {
            "value": round(di_ratio, 2),
            "status": get_status(di_ratio, is_ratio=True),
            "groupA": {"name": str(group_a_name), "val": format_pct(rate_a), "pct": int(rate_a*100)},
            "groupB": {"name": str(group_b_name), "val": format_pct(rate_b), "pct": int(rate_b*100)}
        }
    }

@app.post("/api/v1/audits/run", response_model=FairnessMetricsResponse)
async def run_fairness_audit():
    df = STATE.get("df")
    target = STATE.get("target_col")
    protected = STATE.get("protected_col")
    
    if df is None:
        raise HTTPException(status_code=400, detail="No dataset uploaded yet.")
    
    df_clean = df.dropna(subset=[target, protected]).copy()
    X = df_clean.drop(columns=[target]).select_dtypes(include=['number']).fillna(0)
    y = df_clean[target]
    
    model = RandomForestClassifier(n_estimators=20, random_state=42)
    model.fit(X, y)
    STATE["model"] = model
    y_pred = model.predict(X)
    
    return _calculate_metrics(df_clean, target, protected, y_pred)

@app.post("/api/v1/audits/mitigate", response_model=FairnessMetricsResponse)
async def run_mitigation():
    """ Uses Fairlearn's ExponentiatedGradient to re-weight and mitigate bias. """
    df = STATE.get("df")
    target = STATE.get("target_col")
    protected = STATE.get("protected_col")
    
    if df is None:
        raise HTTPException(status_code=400, detail="No dataset uploaded yet.")
        
    df_clean = df.dropna(subset=[target, protected]).copy()
    X = df_clean.drop(columns=[target]).select_dtypes(include=['number']).fillna(0)
    y = df_clean[target]
    A = df_clean[protected]
    
    estimator = RandomForestClassifier(n_estimators=20, max_depth=5, random_state=42)
    # Fairlearn mitigation algorithm
    mitigator = ExponentiatedGradient(estimator, DemographicParity())
    mitigator.fit(X, y, sensitive_features=A)
    STATE["model"] = mitigator
    
    y_pred_mitigated = mitigator.predict(X)
    
    return _calculate_metrics(df_clean, target, protected, y_pred_mitigated)

@app.get("/api/v1/audits/counterfactual/sample")
async def get_counterfactual_sample():
    df = STATE.get("df")
    target = STATE.get("target_col")
    protected = STATE.get("protected_col")
    model = STATE.get("model")
    
    if df is None or model is None:
        raise HTTPException(status_code=400, detail="Please upload a dataset and run Fairness Metrics first.")
        
    df_clean = df.dropna(subset=[target, protected]).copy()
    X = df_clean.drop(columns=[target]).select_dtypes(include=['number']).fillna(0)
    
    # Pick a random sample
    sample_idx = df_clean.sample(1).index[0]
    
    # Get original prediction
    features_df = pd.DataFrame([X.loc[sample_idx]])
    prediction = int(model.predict(features_df)[0])
    
    # We want to return exactly the numeric features that the model uses
    return {
        "id": int(sample_idx),
        "features": features_df.iloc[0].to_dict(),
        "protected_attribute": protected,
        "original_prediction": prediction
    }

@app.post("/api/v1/audits/counterfactual/predict")
async def run_counterfactual_prediction(payload: dict):
    model = STATE.get("model")
    df = STATE.get("df")
    target = STATE.get("target_col")
    protected = STATE.get("protected_col")
    
    if model is None or df is None:
        raise HTTPException(status_code=400, detail="Model not trained.")
        
    X_cols = df.dropna(subset=[target, protected]).drop(columns=[target]).select_dtypes(include=['number']).columns.tolist()
    
    # Build dataframe for prediction
    row_data = {}
    for col in X_cols:
        row_data[col] = float(payload.get(col, 0.0))
        
    X_pred = pd.DataFrame([row_data])
    prediction = int(model.predict(X_pred)[0])
    
    return {"prediction": prediction}

from fastapi.responses import StreamingResponse

@app.get("/api/v1/datasets/download_mitigated")
async def download_mitigated_data():
    """ Generates a re-weighted dataset for the user to download """
    df = STATE.get("df")
    target = STATE.get("target_col")
    protected = STATE.get("protected_col")
    
    if df is None:
        raise HTTPException(status_code=400, detail="No dataset uploaded.")
        
    df_mitigated = df.copy()
    
    # Pre-processing mitigation: Reweighting the dataset
    # We assign higher weights to underrepresented groups so models trained on this data won't ignore them
    weights = []
    total_len = len(df_mitigated)
    
    # Safe counting to avoid divide by zero
    group_counts = df_mitigated[protected].value_counts().to_dict()
    
    for val in df_mitigated[protected]:
        count = group_counts.get(val, 1)
        prob = count / total_len
        weights.append(1.0 / prob)
        
    # Normalize weights so they average to 1
    mean_weight = sum(weights) / len(weights)
    df_mitigated['fairness_weight'] = [round(w / mean_weight, 4) for w in weights]
    
    stream = io.StringIO()
    df_mitigated.to_csv(stream, index=False)
    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=mitigated_dataset.csv"
    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
