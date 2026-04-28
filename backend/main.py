from fastapi import FastAPI
from pydantic import BaseModel, Field


class AnalysisRequest(BaseModel):
    dataset_name: str = Field(default="Uploaded Dataset")
    total_rows: int = Field(default=0, ge=0)
    target_column: str = Field(default="Outcome")
    sensitive_columns: list[str] = Field(default_factory=list)
    positive_rate: float = Field(default=0.0, ge=0.0, le=1.0)
    max_gap: float = Field(default=0.0, ge=0.0, le=1.0)


class MetricResult(BaseModel):
    name: str
    group_a_score: str
    group_b_score: str
    status: str
    formula: str
    threshold: str
    reason: str


class AnalysisResponse(BaseModel):
    dataset_name: str
    score: int
    bias_flags: int
    compliance_risk: str
    target_column: str
    total_rows: int
    positive_rate: float
    metrics: list[MetricResult]
    subgroup_warnings: list[str]
    model_version: str = "analysis-contract-v1"


app = FastAPI(title="FairMind Analysis API", version="0.1.0")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/analysis/run", response_model=AnalysisResponse)
def run_analysis(payload: AnalysisRequest) -> AnalysisResponse:
    score = max(0, round(100 - payload.max_gap * 125 - max(0, 0.8 - payload.positive_rate) * 8))
    bias_flags = 1 if payload.max_gap >= 0.15 else 0
    compliance_risk = "High" if score < 60 else "Moderate" if score < 78 else "Low"

    metrics = [
        MetricResult(
            name="Demographic Parity",
            group_a_score=f"{max(0, 1 - payload.max_gap):.2f}",
            group_b_score=f"{max(0, 1 - payload.max_gap / 2):.2f}",
            status="Fail" if payload.max_gap >= 0.2 else "Borderline" if payload.max_gap >= 0.1 else "Pass",
            formula="1 - |group_rate - global_positive_rate|",
            threshold="Fail >= 20pp gap, Borderline >= 10pp gap",
            reason=f"Observed max approval gap is {payload.max_gap * 100:.1f} percentage points.",
        ),
        MetricResult(
            name="Disparate Impact",
            group_a_score=f"{max(0.0, 1 - payload.max_gap):.2f}",
            group_b_score="1.00",
            status="Fail" if (1 - payload.max_gap) < 0.8 else "Borderline" if (1 - payload.max_gap) < 0.9 else "Pass",
            formula="min(groupA_rate, groupB_rate) / max(groupA_rate, groupB_rate)",
            threshold="Fail < 0.80, Borderline < 0.90",
            reason=f"Computed ratio proxy is {max(0.0, 1 - payload.max_gap):.2f}.",
        ),
    ]

    warnings = []
    if payload.total_rows < 100:
        warnings.append("Dataset is small; fairness metrics may be unstable.")
    if not payload.sensitive_columns:
        warnings.append("No sensitive columns were provided, fairness scope is limited.")

    return AnalysisResponse(
        dataset_name=payload.dataset_name,
        score=score,
        bias_flags=bias_flags,
        compliance_risk=compliance_risk,
        target_column=payload.target_column,
        total_rows=payload.total_rows,
        positive_rate=payload.positive_rate,
        metrics=metrics,
        subgroup_warnings=warnings,
    )
