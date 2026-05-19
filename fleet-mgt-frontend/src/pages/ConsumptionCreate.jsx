import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../axios';

const ACCENT = '#198754';

const inp = (err) => ({
    width: '100%', background: err ? '#fff8f8' : '#f8fff9',
    border: `1.5px solid ${err ? '#fca5a5' : '#e2e8f0'}`, borderRadius: '10px',
    padding: '0.62rem 0.9rem', fontSize: '0.88rem', color: '#1e293b',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.18s',
});
const Label = ({ children }) => (
    <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#64748b', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
        {children}
    </label>
);
const Err = ({ msg }) => msg ? <p style={{ fontSize: '0.76rem', color: '#dc2626', marginTop: '4px', marginBottom: 0 }}>{msg}</p> : null;

export default function ConsumptionCreate() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const token = localStorage.getItem('token');
    const today = new Date().toISOString().split('T')[0];

    const [form, setForm] = useState({ date: '', fuel_volume: '', fuel_cost: '', vehicle_id: '', driver_id: '', mileage: '' });
    const [documentFile, setDocumentFile] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        Promise.all([
            api.get('/vehicles-list', { headers: { Authorization: `Bearer ${token}` } }),
            api.get('/drivers',       { headers: { Authorization: `Bearer ${token}` } }),
        ]).then(([v, d]) => { setVehicles(v.data); setDrivers(d.data); })
          .catch(() => alert(t('common.error')))
          .finally(() => setLoading(false));
    }, [token, t]);

    const handleChange = e => {
        setForm(p => ({ ...p, [e.target.name]: e.target.value }));
        if (errors[e.target.name]) setErrors(p => ({ ...p, [e.target.name]: null }));
    };

    const validate = () => {
        const errs = {};
        if (!form.date) errs.date = t('common.error');
        else if (form.date > today) errs.date = t('consumptions.date_future_error');
        if (!form.vehicle_id) errs.vehicle_id = t('common.error');
        if (!form.driver_id)  errs.driver_id  = t('common.error');
        if (!form.fuel_volume || parseFloat(form.fuel_volume) <= 0) errs.fuel_volume = t('common.error');
        if (!form.fuel_cost   || parseFloat(form.fuel_cost)   <= 0) errs.fuel_cost   = t('common.error');
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!validate()) return;
        setSaving(true);
        try {
            const payload = new FormData();
            payload.append('date',        form.date);
            payload.append('vehicle_id',  form.vehicle_id);
            payload.append('driver_id',   form.driver_id);
            payload.append('fuel_volume', parseFloat(form.fuel_volume));
            payload.append('fuel_cost',   parseFloat(form.fuel_cost));
            if (form.mileage)  payload.append('mileage', parseInt(form.mileage));
            if (documentFile)  payload.append('document', documentFile);
            await api.post('/consumptions', payload, { headers: { Authorization: `Bearer ${token}` } });
            setSuccess(true);
            setTimeout(() => navigate('/consumptions'), 1500);
        } catch (err) {
            const apiErrors = err.response?.data?.errors;
            if (apiErrors) {
                const mapped = {};
                Object.entries(apiErrors).forEach(([k, v]) => { mapped[k] = Array.isArray(v) ? v[0] : v; });
                setErrors(mapped);
            } else {
                alert(err.response?.data?.message || t('common.error'));
            }
        } finally { setSaving(false); }
    };

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}><div className="spinner-border text-success" /></div>;

    return (
        <div style={{ padding: '1.5rem', maxWidth: '740px', margin: '0 auto' }}>
            <div style={{ marginBottom: '1.25rem', position: 'sticky', top: 0, zIndex: 100, background: '#fff', borderRadius: '0 0 16px 16px', boxShadow: '0 4px 20px rgba(25,135,84,0.1)', padding: '1rem 1.25rem' }}>
                <button onClick={() => navigate('/consumptions')} style={{ background: 'none', border: 'none', color: '#94a3b8', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', padding: 0, marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    ‹ {t('common.back')}
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '13px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0, boxShadow: '0 4px 14px rgba(25,135,84,0.35)' }}>⛽</div>
                    <div>
                        <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.18rem', color: '#0f172a', lineHeight: 1.2 }}>{t('consumptions.add_title')}</h2>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{t('consumptions.add_subtitle')}</p>
                    </div>
                </div>
            </div>

            {success && (
                <div style={{ background: '#dcfce7', border: '1.5px solid #16a34a', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#15803d', fontWeight: 600, fontSize: '0.88rem' }}>
                    ✓ {t('consumptions.add_success')} — Redirection…
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Section: Contexte */}
                <div style={{ background: '#fff', borderRadius: '16px', border: '1.5px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: '1.25rem', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.4rem', borderBottom: '1px solid #f1f5f9', background: `${ACCENT}0c` }}>
                        <h3 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: ACCENT }}>Contexte</h3>
                    </div>
                    <div style={{ padding: '1.25rem 1.4rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <Label>{t('consumptions.consumption_date')}</Label>
                            <input type="date" name="date" value={form.date} onChange={handleChange} max={today} required style={inp(errors.date)}
                                onFocus={e => e.target.style.borderColor = ACCENT} onBlur={e => e.target.style.borderColor = errors.date ? '#fca5a5' : '#e2e8f0'} />
                            <Err msg={errors.date} />
                        </div>
                        <div>
                            <Label>{t('consumptions.mileage')}</Label>
                            <div style={{ position: 'relative' }}>
                                <input type="number" name="mileage" value={form.mileage} onChange={handleChange} min="0" style={{ ...inp(errors.mileage), paddingRight: '2.8rem' }} placeholder="45 230"
                                    onFocus={e => e.target.style.borderColor = ACCENT} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>km</span>
                            </div>
                            <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '3px', marginBottom: 0 }}>{t('consumptions.mileage_hint')}</p>
                        </div>
                        <div>
                            <Label>{t('consumptions.vehicle')}</Label>
                            <select name="vehicle_id" value={form.vehicle_id} onChange={handleChange} required style={{ ...inp(errors.vehicle_id), cursor: 'pointer' }}
                                onFocus={e => e.target.style.borderColor = ACCENT} onBlur={e => e.target.style.borderColor = errors.vehicle_id ? '#fca5a5' : '#e2e8f0'}>
                                <option value="">{t('consumptions.select_vehicle')}</option>
                                {vehicles.map(v => <option key={v.id} value={v.id}>{v.license_plate}</option>)}
                            </select>
                            <Err msg={errors.vehicle_id} />
                        </div>
                        <div>
                            <Label>{t('consumptions.driver')}</Label>
                            <select name="driver_id" value={form.driver_id} onChange={handleChange} required style={{ ...inp(errors.driver_id), cursor: 'pointer' }}
                                onFocus={e => e.target.style.borderColor = ACCENT} onBlur={e => e.target.style.borderColor = errors.driver_id ? '#fca5a5' : '#e2e8f0'}>
                                <option value="">{t('consumptions.select_driver')}</option>
                                {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                            <Err msg={errors.driver_id} />
                        </div>
                    </div>
                </div>

                {/* Section: Carburant */}
                <div style={{ background: '#fff', borderRadius: '16px', border: '1.5px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: '1.25rem', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.4rem', borderBottom: '1px solid #f1f5f9', background: `${ACCENT}0c` }}>
                        <h3 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: ACCENT }}>Carburant & Coût</h3>
                    </div>
                    <div style={{ padding: '1.25rem 1.4rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <Label>{t('consumptions.liters')}</Label>
                            <div style={{ position: 'relative' }}>
                                <input type="number" name="fuel_volume" value={form.fuel_volume} onChange={handleChange} min="0" step="0.01" required style={{ ...inp(errors.fuel_volume), paddingRight: '2.8rem' }}
                                    onFocus={e => e.target.style.borderColor = ACCENT} onBlur={e => e.target.style.borderColor = errors.fuel_volume ? '#fca5a5' : '#e2e8f0'} />
                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>L</span>
                            </div>
                            <Err msg={errors.fuel_volume} />
                        </div>
                        <div>
                            <Label>{t('consumptions.amount')}</Label>
                            <div style={{ position: 'relative' }}>
                                <input type="number" name="fuel_cost" value={form.fuel_cost} onChange={handleChange} min="0" step="0.01" required style={{ ...inp(errors.fuel_cost), paddingRight: '3.8rem' }}
                                    onFocus={e => e.target.style.borderColor = ACCENT} onBlur={e => e.target.style.borderColor = errors.fuel_cost ? '#fca5a5' : '#e2e8f0'} />
                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>FCFA</span>
                            </div>
                            <Err msg={errors.fuel_cost} />
                        </div>
                        {form.fuel_volume > 0 && form.fuel_cost > 0 && (
                            <div style={{ gridColumn: '1/-1', background: '#f0fdf4', borderRadius: '10px', padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '1rem' }}>📊</span>
                                <span style={{ fontSize: '0.82rem', color: '#166534', fontWeight: 600 }}>
                                    Coût/litre estimé : {Math.round(parseFloat(form.fuel_cost) / parseFloat(form.fuel_volume)).toLocaleString()} FCFA/L
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Section: Document */}
                <div style={{ background: '#fff', borderRadius: '16px', border: '1.5px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: '1.5rem', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.4rem', borderBottom: '1px solid #f1f5f9', background: `${ACCENT}0c` }}>
                        <h3 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: ACCENT }}>{t('consumptions.document')}</h3>
                    </div>
                    <div style={{ padding: '1.25rem 1.4rem' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: `2px dashed ${documentFile ? ACCENT : '#e2e8f0'}`, borderRadius: '12px', padding: '1.4rem', cursor: 'pointer', background: documentFile ? `${ACCENT}08` : '#f8faff' }}>
                            <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={e => setDocumentFile(e.target.files[0] || null)} />
                            <div style={{ fontSize: '1.7rem', marginBottom: '0.35rem' }}>{documentFile ? '📎' : '📤'}</div>
                            <div style={{ fontWeight: 600, fontSize: '0.82rem', color: documentFile ? ACCENT : '#64748b' }}>
                                {documentFile ? documentFile.name : t('consumptions.document_hint')}
                            </div>
                            {!documentFile && <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>Reçu de carburant — PDF, JPG, PNG ≤ 5 Mo</div>}
                        </label>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button type="button" onClick={() => navigate('/consumptions')} style={{ flex: 1, padding: '0.72rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#374151', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
                        {t('common.cancel')}
                    </button>
                    <button type="submit" disabled={saving || success} style={{ flex: 1, padding: '0.72rem', borderRadius: '10px', border: 'none', background: ACCENT, color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: saving ? 'wait' : 'pointer', boxShadow: `0 4px 14px ${ACCENT}50` }}>
                        {saving ? <><span className="spinner-border spinner-border-sm me-2" />{t('common.saving')}</> : `💾 ${t('common.add')}`}
                    </button>
                </div>
            </form>
        </div>
    );
}
