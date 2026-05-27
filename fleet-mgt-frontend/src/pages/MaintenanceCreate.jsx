import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../axios';

const ACCENT = '#fd7e14';

const inp = (err) => ({
    width: '100%', background: err ? '#fff8f8' : '#fffcf8',
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

export default function MaintenanceCreate() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const token = localStorage.getItem('token');
    const today = new Date().toISOString().split('T')[0];

    const [form, setForm] = useState({ scheduled_date: '', vehicle_id: '', driver_id: '', maintenance_type: '', maintenance_company: '', cost: '', description: '', mileage_at_service: '' });
    const [documentFile, setDocumentFile] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const headers = { Authorization: `Bearer ${token}` };
        Promise.all([
            api.get('/vehicles-list', { headers }),
            api.get('/drivers',       { headers }),
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
        if (!form.scheduled_date)     errs.scheduled_date     = t('common.error');
        if (!form.vehicle_id)         errs.vehicle_id         = t('common.error');
        if (!form.driver_id)          errs.driver_id          = t('common.error');
        if (!form.maintenance_type)   errs.maintenance_type   = t('common.error');
        if (!form.maintenance_company) errs.maintenance_company = t('common.error');
        if (!form.cost || parseFloat(form.cost) <= 0) errs.cost = t('common.error');
        if (!form.description)        errs.description        = t('common.error');
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!validate()) return;
        setSaving(true);
        try {
            const payload = new FormData();
            Object.entries(form).forEach(([k, v]) => { if (v !== '') payload.append(k, v); });
            payload.set('cost', parseFloat(form.cost));
            if (documentFile) payload.append('document', documentFile);
            await api.post('/maintenances', payload, { headers: { Authorization: `Bearer ${token}` } });
            setSuccess(true);
            setTimeout(() => navigate('/maintenances'), 1500);
        } catch (err) {
            const apiErrors = err.response?.data?.errors;
            if (apiErrors) {
                const mapped = {};
                Object.entries(apiErrors).forEach(([k, v]) => { mapped[k] = Array.isArray(v) ? v[0] : v; });
                setErrors(mapped);
            } else {
                alert(err.response?.data?.message || t('maintenances.add_error'));
            }
        } finally { setSaving(false); }
    };

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}><div className="spinner-border" style={{ color: ACCENT }} /></div>;

    return (
        <div style={{ padding: '1.5rem', maxWidth: '740px', margin: '0 auto' }}>
            <div style={{ marginBottom: '1.25rem', background: '#fff', borderRadius: '0 0 16px 16px', boxShadow: '0 4px 20px rgba(253,126,20,0.1)', padding: '1rem 1.25rem' }}>
                <button onClick={() => navigate('/maintenances')} style={{ background: 'none', border: 'none', color: '#94a3b8', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', padding: 0, marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    ‹ {t('common.back')}
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '13px', background: 'linear-gradient(135deg, #fb923c, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0, boxShadow: '0 4px 14px rgba(253,126,20,0.35)' }}>🔧</div>
                    <div>
                        <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.18rem', color: '#0f172a', lineHeight: 1.2 }}>{t('maintenances.add_title')}</h2>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{t('maintenances.add_subtitle')}</p>
                    </div>
                </div>
            </div>

            {success && (
                <div style={{ background: '#dcfce7', border: '1.5px solid #16a34a', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#15803d', fontWeight: 600, fontSize: '0.88rem' }}>
                    ✓ {t('maintenances.add_success')} — Redirection…
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Planification */}
                <div style={{ background: '#fff', borderRadius: '16px', border: '1.5px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: '1.25rem', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.4rem', borderBottom: '1px solid #f1f5f9', background: `${ACCENT}10` }}>
                        <h3 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: ACCENT }}>{t('maintenances.section_planning')}</h3>
                    </div>
                    <div style={{ padding: '1.25rem 1.4rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <Label>{t('maintenances.date')}</Label>
                            <input type="date" name="scheduled_date" value={form.scheduled_date} onChange={handleChange} min={today} required style={inp(errors.scheduled_date)}
                                onFocus={e => e.target.style.borderColor = ACCENT} onBlur={e => e.target.style.borderColor = errors.scheduled_date ? '#fca5a5' : '#e2e8f0'} />
                            <Err msg={errors.scheduled_date} />
                        </div>
                        <div>
                            <Label>{t('maintenances.vehicle')}</Label>
                            <select name="vehicle_id" value={form.vehicle_id} onChange={handleChange} required style={{ ...inp(errors.vehicle_id), cursor: 'pointer' }}
                                onFocus={e => e.target.style.borderColor = ACCENT} onBlur={e => e.target.style.borderColor = errors.vehicle_id ? '#fca5a5' : '#e2e8f0'}>
                                <option value="">{t('maintenances.select_vehicle')}</option>
                                {vehicles.map(v => <option key={v.id} value={v.id}>{v.license_plate}</option>)}
                            </select>
                            <Err msg={errors.vehicle_id} />
                        </div>
                        <div>
                            <Label>{t('maintenances.driver')}</Label>
                            <select name="driver_id" value={form.driver_id} onChange={handleChange} required style={{ ...inp(errors.driver_id), cursor: 'pointer' }}
                                onFocus={e => e.target.style.borderColor = ACCENT} onBlur={e => e.target.style.borderColor = errors.driver_id ? '#fca5a5' : '#e2e8f0'}>
                                <option value="">{t('maintenances.select_driver')}</option>
                                {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                            <Err msg={errors.driver_id} />
                        </div>
                        <div>
                            <Label>{t('maintenances.mileage_at_service')}</Label>
                            <div style={{ position: 'relative' }}>
                                <input type="number" name="mileage_at_service" value={form.mileage_at_service} onChange={handleChange} min="0" style={{ ...inp(false), paddingRight: '2.8rem' }} placeholder="44 100"
                                    onFocus={e => e.target.style.borderColor = ACCENT} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>km</span>
                            </div>
                            <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '3px', marginBottom: 0 }}>{t('maintenances.mileage_at_service_hint')}</p>
                        </div>
                    </div>
                </div>

                {/* Intervention */}
                <div style={{ background: '#fff', borderRadius: '16px', border: '1.5px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: '1.25rem', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.4rem', borderBottom: '1px solid #f1f5f9', background: `${ACCENT}10` }}>
                        <h3 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: ACCENT }}>{t('maintenances.section_type_provider')}</h3>
                    </div>
                    <div style={{ padding: '1.25rem 1.4rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <Label>{t('maintenances.type')}</Label>
                            <select name="maintenance_type" value={form.maintenance_type} onChange={handleChange} required style={{ ...inp(errors.maintenance_type), cursor: 'pointer' }}
                                onFocus={e => e.target.style.borderColor = ACCENT} onBlur={e => e.target.style.borderColor = errors.maintenance_type ? '#fca5a5' : '#e2e8f0'}>
                                <option value="">{t('maintenances.select_type')}</option>
                                <option value="vidange">{t('maintenances.type_oil')}</option>
                                <option value="pneus">{t('maintenances.type_tires')}</option>
                                <option value="freins">{t('maintenances.type_brakes')}</option>
                                <option value="batterie">{t('maintenances.type_battery')}</option>
                                <option value="révision">{t('maintenances.type_revision')}</option>
                                <option value="carrosserie">{t('maintenances.type_bodywork')}</option>
                                <option value="autre">{t('maintenances.type_other')}</option>
                            </select>
                            <Err msg={errors.maintenance_type} />
                        </div>
                        <div>
                            <Label>{t('maintenances.company_full')}</Label>
                            <input name="maintenance_company" value={form.maintenance_company} onChange={handleChange} required style={inp(errors.maintenance_company)} placeholder="Garage Auto Plus"
                                onFocus={e => e.target.style.borderColor = ACCENT} onBlur={e => e.target.style.borderColor = errors.maintenance_company ? '#fca5a5' : '#e2e8f0'} />
                            <Err msg={errors.maintenance_company} />
                        </div>
                        <div>
                            <Label>{t('maintenances.cost')}</Label>
                            <div style={{ position: 'relative' }}>
                                <input type="number" name="cost" value={form.cost} onChange={handleChange} min="0" step="0.01" required style={{ ...inp(errors.cost), paddingRight: '3.8rem' }}
                                    onFocus={e => e.target.style.borderColor = ACCENT} onBlur={e => e.target.style.borderColor = errors.cost ? '#fca5a5' : '#e2e8f0'} />
                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>FCFA</span>
                            </div>
                            <Err msg={errors.cost} />
                        </div>
                        <div style={{ gridColumn: '1/-1' }}>
                            <Label>{t('maintenances.description')}</Label>
                            <textarea name="description" value={form.description} onChange={handleChange} required rows={3} style={{ ...inp(errors.description), resize: 'vertical' }} placeholder={t('maintenances.details_description') + '...'}
                                onFocus={e => e.target.style.borderColor = ACCENT} onBlur={e => e.target.style.borderColor = errors.description ? '#fca5a5' : '#e2e8f0'} />
                            <Err msg={errors.description} />
                        </div>
                    </div>
                </div>

                {/* Document */}
                <div style={{ background: '#fff', borderRadius: '16px', border: '1.5px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: '1.5rem', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.4rem', borderBottom: '1px solid #f1f5f9', background: `${ACCENT}10` }}>
                        <h3 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: ACCENT }}>{t('maintenances.document')}</h3>
                    </div>
                    <div style={{ padding: '1.25rem 1.4rem' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', border: `2px dashed ${documentFile ? ACCENT : '#e2e8f0'}`, borderRadius: '12px', padding: '1.4rem', cursor: 'pointer', background: documentFile ? `${ACCENT}08` : '#fffcf8' }}>
                            <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={e => setDocumentFile(e.target.files[0] || null)} />
                            <div style={{ fontSize: '1.7rem', marginBottom: '0.35rem' }}>{documentFile ? '📎' : '📤'}</div>
                            <div style={{ fontWeight: 600, fontSize: '0.82rem', color: documentFile ? ACCENT : '#64748b' }}>
                                {documentFile ? documentFile.name : t('maintenances.document_hint')}
                            </div>
                            {!documentFile && <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>{t('maintenances.invoice_hint')}</div>}
                        </label>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button type="button" onClick={() => navigate('/maintenances')} style={{ flex: 1, padding: '0.72rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#374151', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
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
