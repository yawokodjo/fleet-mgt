import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../axios';

const ACCENT = '#0d6efd';

const inp = (err) => ({
    width: '100%', background: err ? '#fff8f8' : '#f8faff',
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

export default function VehicleEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [form, setForm] = useState({ marque: '', model: '', license_plate: '', year: '', fuel_type: '', fuel_card: '', mileage: '', status: 'operational' });
    const [documentFile, setDocumentFile] = useState(null);
    const [existingDoc, setExistingDoc] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        api.get(`/vehicles/${id}`)
            .then(res => { setForm(res.data); setExistingDoc(res.data.document_url || null); setLoading(false); })
            .catch(() => { navigate('/vehicles'); });
    }, [id, navigate]);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        setErrors({});
        setSaving(true);
        try {
            if (documentFile) {
                const payload = new FormData();
                Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== undefined) payload.append(k, v); });
                payload.append('document', documentFile);
                payload.append('_method', 'PUT');
                await api.post(`/vehicles/${id}`, payload);
            } else {
                await api.put(`/vehicles/${id}`, form);
            }
            setSuccess(true);
            setTimeout(() => navigate('/vehicles'), 1500);
        } catch (err) {
            if (err.response?.status === 422) setErrors(err.response.data.errors || {});
            else if (err.response?.status === 403) alert(t('common.unauthorized'));
            else alert(err.response?.data?.message || t('common.error'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}><div className="spinner-border text-primary" /></div>;

    return (
        <div style={{ padding: '1.5rem', maxWidth: '740px', margin: '0 auto' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <button onClick={() => navigate('/vehicles')} style={{ background: 'none', border: 'none', color: ACCENT, fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer', padding: 0, marginBottom: '0.75rem' }}>
                    ← {t('common.back')}
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '11px', background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>✏️</div>
                    <div>
                        <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.25rem', color: '#0f172a' }}>{t('vehicles.edit_title')}</h2>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>{form.license_plate}</p>
                    </div>
                </div>
            </div>

            {success && (
                <div style={{ background: '#dcfce7', border: '1.5px solid #16a34a', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#15803d', fontWeight: 600, fontSize: '0.88rem' }}>
                    ✓ {t('vehicles.update_success')} — Redirection…
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ background: '#fff', borderRadius: '16px', border: '1.5px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: '1.25rem', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.4rem', borderBottom: '1px solid #f1f5f9', background: `${ACCENT}08` }}>
                        <h3 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: ACCENT }}>Identification</h3>
                    </div>
                    <div style={{ padding: '1.25rem 1.4rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {[
                            { name: 'marque',        label: t('vehicles.brand'),         ph: 'Toyota' },
                            { name: 'model',         label: t('vehicles.model'),          ph: 'Hilux' },
                            { name: 'license_plate', label: t('vehicles.license_plate'),  ph: 'TG-1234-AB' },
                            { name: 'year',          label: t('vehicles.year'),           ph: '2022', type: 'number' },
                        ].map(f => (
                            <div key={f.name}>
                                <Label>{f.label}</Label>
                                <input type={f.type || 'text'} name={f.name} value={form[f.name] || ''} onChange={handleChange} required style={inp(errors[f.name])} placeholder={f.ph}
                                    onFocus={e => e.target.style.borderColor = ACCENT} onBlur={e => e.target.style.borderColor = errors[f.name] ? '#fca5a5' : '#e2e8f0'} />
                                <Err msg={errors[f.name]?.[0]} />
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ background: '#fff', borderRadius: '16px', border: '1.5px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: '1.25rem', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.4rem', borderBottom: '1px solid #f1f5f9', background: `${ACCENT}08` }}>
                        <h3 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: ACCENT }}>Carburant & Statut</h3>
                    </div>
                    <div style={{ padding: '1.25rem 1.4rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <Label>{t('vehicles.fuel_type')}</Label>
                            <select name="fuel_type" value={form.fuel_type || ''} onChange={handleChange} required style={{ ...inp(false), cursor: 'pointer' }}
                                onFocus={e => e.target.style.borderColor = ACCENT} onBlur={e => e.target.style.borderColor = '#e2e8f0'}>
                                <option value="">{t('vehicles.select_fuel')}</option>
                                <option value="essence">{t('vehicles.fuel_gasoline')}</option>
                                <option value="diesel">{t('vehicles.fuel_diesel')}</option>
                                <option value="hybride">{t('vehicles.fuel_hybrid')}</option>
                                <option value="électrique">{t('vehicles.fuel_electric')}</option>
                                <option value="gpl">{t('vehicles.fuel_gpl')}</option>
                                <option value="autre">{t('vehicles.fuel_other')}</option>
                            </select>
                        </div>
                        <div>
                            <Label>{t('vehicles.fuel_card')}</Label>
                            <input name="fuel_card" value={form.fuel_card || ''} onChange={handleChange} style={inp(false)}
                                onFocus={e => e.target.style.borderColor = ACCENT} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                        </div>
                        <div>
                            <Label>{t('vehicles.mileage')}</Label>
                            <div style={{ position: 'relative' }}>
                                <input type="number" name="mileage" value={form.mileage || ''} onChange={handleChange} style={{ ...inp(false), paddingRight: '2.8rem' }}
                                    onFocus={e => e.target.style.borderColor = ACCENT} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>km</span>
                            </div>
                        </div>
                        <div>
                            <Label>{t('vehicles.status')}</Label>
                            <select name="status" value={form.status || 'operational'} onChange={handleChange} style={{ ...inp(false), cursor: 'pointer' }}
                                onFocus={e => e.target.style.borderColor = ACCENT} onBlur={e => e.target.style.borderColor = '#e2e8f0'}>
                                <option value="operational">{t('vehicles.status_operational')}</option>
                                <option value="maintenance">{t('vehicles.status_maintenance')}</option>
                                <option value="out_of_service">{t('vehicles.status_out_of_service')}</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div style={{ background: '#fff', borderRadius: '16px', border: '1.5px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: '1.5rem', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.4rem', borderBottom: '1px solid #f1f5f9', background: `${ACCENT}08` }}>
                        <h3 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: ACCENT }}>{t('vehicles.document')}</h3>
                    </div>
                    <div style={{ padding: '1.25rem 1.4rem' }}>
                        {existingDoc && (
                            <a href={existingDoc} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: ACCENT, fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', background: '#eff6ff', padding: '6px 14px', borderRadius: '8px', marginBottom: '0.75rem' }}>
                                📄 {t('vehicles.document_view')}
                            </a>
                        )}
                        <label style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            border: `2px dashed ${documentFile ? ACCENT : '#e2e8f0'}`, borderRadius: '12px', padding: '1.25rem',
                            cursor: 'pointer', background: documentFile ? `${ACCENT}08` : '#f8faff',
                        }}>
                            <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={e => setDocumentFile(e.target.files[0] || null)} />
                            <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{documentFile ? '📎' : '📤'}</div>
                            <div style={{ fontWeight: 600, fontSize: '0.82rem', color: documentFile ? ACCENT : '#64748b' }}>
                                {documentFile ? documentFile.name : (existingDoc ? 'Remplacer le document...' : t('vehicles.document_hint'))}
                            </div>
                        </label>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button type="button" onClick={() => navigate('/vehicles')} style={{ flex: 1, padding: '0.72rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#374151', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
                        {t('common.cancel')}
                    </button>
                    <button type="submit" disabled={saving || success} style={{ flex: 1, padding: '0.72rem', borderRadius: '10px', border: 'none', background: ACCENT, color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: saving ? 'wait' : 'pointer', boxShadow: `0 4px 14px ${ACCENT}50` }}>
                        {saving ? <><span className="spinner-border spinner-border-sm me-2" />{t('common.saving')}</> : `💾 ${t('common.update')}`}
                    </button>
                </div>
            </form>
        </div>
    );
}
