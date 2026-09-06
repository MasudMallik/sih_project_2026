import { RISK_LEVELS } from "../../interfaces/map.interface";
import { riskColor } from "../../validation/map.validation";

export function Legend() {
  return <div className="legend">{RISK_LEVELS.map((level) => <span className="legend__item" key={level}><span className="legend__dot" style={{ background: riskColor(level) }} />{level}</span>)}</div>;
}
