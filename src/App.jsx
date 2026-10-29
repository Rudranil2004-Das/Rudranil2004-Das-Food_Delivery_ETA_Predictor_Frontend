import { useMemo, useState } from 'react';
import {
  Activity, ArrowRight, Bike, CheckCircle2, Clock3, CloudSun,
  Gauge, MapPin, RotateCcw, ShieldCheck, Sparkles, Timer, Truck,
  Utensils, Wind, Zap, AlertCircle
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const initialValues = {
  distance_km: 5,
  preparation_time_min: 15,
  traffic_level: 2,
  weather_severity: 0,
  rider_experience_years: 3,
};

const trafficLabels = {
  1: { title: 'Low', detail: 'Roads are clear' },
  2: { title: 'Moderate', detail: 'Some congestion' },
  3: { title: 'High', detail: 'Heavy traffic' },
  4: { title: 'Severe', detail: 'Very slow movement' },
};

const weatherLabels = {
  0: { title: 'Clear', detail: 'Normal conditions' },
  1: { title: 'Light', detail: 'Light adverse weather' },
  2: { title: 'Bad', detail: 'Rain or poor visibility' },
  3: { title: 'Severe', detail: 'Severe weather' },
};

function FieldLabel({ icon: Icon, title, hint }) {
  return <div className="field-heading"><span className="field-icon"><Icon size={16} /></span><span><span className="field-title">{title}</span>{hint && <span className="field-hint">{hint}</span>}</span></div>;
}

function App() {
  const [values, setValues] = useState(initialValues);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastInputs, setLastInputs] = useState(null);

  const distanceLabel = useMemo(() => values.distance_km < 3 ? 'Short trip' : values.distance_km < 10 ? 'City delivery' : 'Longer trip', [values.distance_km]);

  function updateField(event) {
    const { name, value } = event.target;
    setValues(current => ({ ...current, [name]: Number(value) }));
    setError('');
  }

  async function predictDelivery(event) {
    event.preventDefault();
    setLoading(true);
    setPrediction(null);
    setError('');
    setLastInputs({ ...values });
    try {
      const response = await fetch(`${API_URL.replace(/\/$/, '')}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        let message = 'The prediction service returned an error.';
        try { const body = await response.json(); message = body.detail || message; } catch { /* keep fallback */ }
        throw new Error(message);
      }
      const result = await response.json();
      if (typeof result.predicted_minutes !== 'number' || !Number.isFinite(result.predicted_minutes)) {
        throw new Error('The API response did not include a valid predicted_minutes number.');
      }
      setPrediction(Math.max(0, result.predicted_minutes));
    } catch (err) {
      setError(err instanceof TypeError
        ? `Could not reach the Python API. Make sure FastAPI is running at ${API_URL} and CORS allows this frontend.`
        : (err.message || 'Something went wrong. Please try again.'));
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setValues(initialValues);
    setPrediction(null);
    setError('');
    setLastInputs(null);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#top" aria-label="Deliverly home">
          <span className="brand-mark"><Bike size={23} strokeWidth={2.4} /></span>
          <span className="brand-name">deliverly<span>.</span><small>SMART DELIVERY AI</small></span>
        </a>
        <div className="side-label">WORKSPACE</div>
        <a className="nav-item active" href="#predictor"><Gauge size={18} /><span>Time predictor</span><span className="nav-dot" /></a>
        <div className="side-note">
          <div className="side-note-icon"><Sparkles size={17} /></div>
          <strong>Powered by machine learning</strong>
          <p>Estimate delivery duration from route, preparation, traffic and weather details.</p>
        </div>
        <div className="sidebar-bottom"><span className="status-dot" /> Prediction workspace <span className="version">v1.0</span></div>
      </aside>

      <main className="main-area" id="top">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> <strong>Time predictor</strong></div>
          <div className="topbar-right"><span className="secure-label"><ShieldCheck size={15} /> Local model API</span><div className="avatar">FD</div></div>
        </header>

        <div className="page-content" id="predictor">
          <section className="page-intro">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" /> DELIVERY INTELLIGENCE</div>
              <h1>Every minute,<br /><span>better predicted.</span></h1>
              <p className="intro-copy">Make smarter delivery estimates with your machine learning model. Add the order conditions below to get an estimated arrival duration.</p>
            </div>
            <div className="intro-art" aria-hidden="true"><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-center"><Bike size={54} strokeWidth={1.4} /></div><span className="art-chip chip-clock"><Clock3 size={15} /> ETA</span><span className="art-chip chip-zap"><Zap size={15} /></span><span className="art-pin"><MapPin size={17} /></span></div>
          </section>

          <div className="stats-row">
            <div className="stat-card"><span className="stat-icon purple"><Activity size={18} /></span><div><span className="stat-label">PREDICTION ENGINE</span><strong>Linear Regression</strong><small>Supervised ML model</small></div></div>
            <div className="stat-card"><span className="stat-icon orange"><Timer size={18} /></span><div><span className="stat-label">OUTPUT</span><strong>Delivery duration</strong><small>Estimated in minutes</small></div></div>
            <div className="stat-card"><span className="stat-icon green"><ShieldCheck size={18} /></span><div><span className="stat-label">INTEGRATION</span><strong>Python API</strong><small>React + FastAPI</small></div></div>
          </div>

          <div className="content-grid">
            <section className="form-card">
              <div className="card-heading"><div><div className="section-kicker">ORDER CONFIGURATION</div><h2>Delivery details</h2><p>Adjust the conditions for this order.</p></div><span className="step-badge">01 <span>/ 01</span></span></div>
              <form onSubmit={predictDelivery}>
                <div className="form-section-title"><span>01</span> ROUTE & PREPARATION</div>
                <div className="field-grid">
                  <label className="field-block"><FieldLabel icon={MapPin} title="Delivery distance" hint="Restaurant to destination" /><div className="input-wrap"><input name="distance_km" type="number" min="0.1" max="50" step="0.1" value={values.distance_km} onChange={updateField} required /><span className="input-suffix">km</span></div><div className="field-foot"><span>{distanceLabel}</span><span>0.1–50 km</span></div></label>
                  <label className="field-block"><FieldLabel icon={Utensils} title="Preparation time" hint="Kitchen preparation" /><div className="input-wrap"><input name="preparation_time_min" type="number" min="1" max="120" step="1" value={values.preparation_time_min} onChange={updateField} required /><span className="input-suffix">min</span></div><div className="field-foot"><span>Order ready time</span><span>1–120 min</span></div></label>
                </div>

                <div className="form-section-title second"><span>02</span> DELIVERY CONDITIONS</div>
                <div className="field-block full-field"><FieldLabel icon={Wind} title="Traffic level" hint="Expected road congestion" /><div className="choice-grid traffic-grid">{Object.entries(trafficLabels).map(([key, item]) => <button type="button" key={key} className={`choice-card ${values.traffic_level === Number(key) ? 'selected' : ''}`} onClick={() => setValues(v => ({ ...v, traffic_level: Number(key) }))} aria-pressed={values.traffic_level === Number(key)}><span className={`choice-number traffic-${key}`}>{key}</span><strong>{item.title}</strong><small>{item.detail}</small></button>)}</div></div>

                <div className="field-block full-field weather-field"><FieldLabel icon={CloudSun} title="Weather severity" hint="Conditions during delivery" /><div className="choice-grid weather-grid">{Object.entries(weatherLabels).map(([key, item]) => <button type="button" key={key} className={`choice-card weather-choice ${values.weather_severity === Number(key) ? 'selected' : ''}`} onClick={() => setValues(v => ({ ...v, weather_severity: Number(key) }))} aria-pressed={values.weather_severity === Number(key)}><span className={`weather-symbol weather-${key}`}>{Number(key) === 0 ? '☀' : Number(key) === 1 ? '☁' : Number(key) === 2 ? '🌧' : '⛈'}</span><span><strong>{item.title}</strong><small>{item.detail}</small></span></button>)}</div></div>

                <div className="field-block experience-field"><FieldLabel icon={Bike} title="Rider experience" hint="Years of delivery experience" /><div className="input-wrap"><input name="rider_experience_years" type="number" min="0" max="50" step="1" value={values.rider_experience_years} onChange={updateField} required /><span className="input-suffix">years</span></div><div className="field-foot"><span>Experience can affect delivery duration</span><span>0–50 years</span></div></div>

                {error && <div className="error-banner" role="alert"><AlertCircle size={18} /><div><strong>Prediction unavailable</strong><p>{error}</p></div></div>}
                <div className="form-actions"><button className="reset-button" type="button" onClick={resetForm}><RotateCcw size={16} /> Reset</button><button className="predict-button" type="submit" disabled={loading}>{loading ? <><span className="spinner" /> Calculating...</> : <>Predict delivery time <ArrowRight size={17} /></>}</button></div>
                <p className="privacy-note"><ShieldCheck size={14} /> Your inputs are sent to your configured Python API for prediction.</p>
              </form>
            </section>

            <aside className="result-column">
              <section className={`result-card ${prediction !== null ? 'has-result' : ''}`} aria-live="polite">
                <div className="result-topline"><span className="result-icon"><Clock3 size={19} /></span><span className="live-label"><span /> {prediction !== null ? 'PREDICTION READY' : loading ? 'PROCESSING' : 'AWAITING INPUT'}</span></div>
                <div className="result-title">Estimated delivery<br />duration</div>
                {prediction !== null ? <><div className="result-number">{prediction.toFixed(1)}<span>min</span></div><div className="result-success"><CheckCircle2 size={15} /> Prediction completed successfully</div></> : <><div className="result-placeholder"><span>--</span><small>minutes</small></div><p className="result-description">Your estimated time will appear here after you run the prediction.</p></>}
                <div className="result-divider" />
                <div className="result-details"><div><span className="detail-icon"><MapPin size={15} /></span><span>Delivery distance</span><strong>{values.distance_km} km</strong></div><div><span className="detail-icon"><Utensils size={15} /></span><span>Preparation</span><strong>{values.preparation_time_min} min</strong></div><div><span className="detail-icon"><Wind size={15} /></span><span>Traffic</span><strong>{trafficLabels[values.traffic_level].title}</strong></div><div><span className="detail-icon"><CloudSun size={15} /></span><span>Weather</span><strong>{weatherLabels[values.weather_severity].title}</strong></div></div>
                {prediction !== null && <div className="result-foot"><span>Based on the submitted order conditions</span><span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>}
              </section>

              <section className="insight-card"><div className="insight-heading"><span className="insight-bulb"><Sparkles size={17} /></span><h3>Prediction insights</h3></div><p>The model uses your order details to estimate the delivery duration. The result is an estimate, not a guaranteed arrival time.</p><div className="insight-tags"><span><CheckCircle2 size={13} /> Model-based</span><span><ShieldCheck size={13} /> Estimate only</span></div></section>

              <section className="pipeline-card"><div className="pipeline-title"><span>HOW IT WORKS</span><span className="pipeline-status"><span /> READY</span></div><div className="pipeline-step"><span className="pipeline-icon"><Utensils size={15} /></span><div><strong>Order inputs</strong><small>React form collects details</small></div><CheckCircle2 size={15} className="pipeline-check" /></div><div className="pipeline-connector" /><div className="pipeline-step"><span className="pipeline-icon"><Zap size={15} /></span><div><strong>Python API</strong><small>FastAPI receives the request</small></div><span className="pipeline-mini-dot" /></div><div className="pipeline-connector" /><div className="pipeline-step"><span className="pipeline-icon"><Activity size={15} /></span><div><strong>ML prediction</strong><small>Saved model returns minutes</small></div><span className="pipeline-mini-dot" /></div></section>
            </aside>
          </div>

          <footer className="page-footer"><span>© {new Date().getFullYear()} Deliverly <span className="footer-separator">·</span> Educational ML project</span><span className="footer-tech">React <i /> FastAPI <i /> Scikit-learn</span></footer>
        </div>
      </main>
    </div>
  );
}

export default App;
