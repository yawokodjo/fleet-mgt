import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function VehicleCreate() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [form, setForm] = useState({ marque: '', model: '', license_plate: '', year: '', fuel_type: '', fuel_card: '', mileage: 0, status: 'operational', current_driver_id: '', insurance_expiry: '', technical_inspection_expiry: '', tvm_expiry: '' });
    const [documentFile, setDocumentFile] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        setErrors({});
        setLoading(true);
        try {
            const payload = new FormData();
            Object.entries(form).forEach(([k, v]) => { if (v !== '' && v !== null) payload.append(k, v); });
            if (documentFile) payload.append('document', documentFile);
            await api.post('/vehicles', payload);
            setSuccess(true);
            setTimeout(() => navigate('/vehicles'), 1500);
        } catch (err) {
            if (err.response?.status === 422) setErrors(err.response.data.errors || {});
            else if (err.response?.status === 403) alert(t('common.unauthorized'));
            else alert(err.response?.data?.message || t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '1.5rem', maxWidth: '740px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '1.25rem', background: '#fff', borderRadius: '0 0 16px 16px', boxShadow: '0 4px 20px rgba(13,110,253,0.1)', padding: '1rem 1.25rem' }}>
                <button onClick={() => navigate('/vehicles')} style={{ background: 'none', border: 'none', color: '#94a3b8', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', padding: 0, marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    ‹ {t('common.back')}
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '13px', background: 'linear-gradient(135deg, #3b82f6, #0d6efd)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0, boxShadow: '0 4px 14px rgba(13,110,253,0.35)' }}>🚗</div>
                    <div>
                        <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.18rem', color: '#0f172a', lineHeight: 1.2 }}>{t('vehicles.add_title')}</h2>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{t('vehicles.add_subtitle')}</p>
                    </div>
                </div>
            </div>

            {success && (
                <div style={{ background: '#dcfce7', border: '1.5px solid #16a34a', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#15803d', fontWeight: 600, fontSize: '0.88rem' }}>
                    ✓ {t('vehicles.add_success')} — Redirection…
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Section: Identification */}
                <div style={{ background: '#fff', borderRadius: '16px', border: '1.5px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: '1.25rem', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.4rem', borderBottom: '1px solid #f1f5f9', background: `${ACCENT}08` }}>
                        <h3 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: ACCENT }}>{t('vehicles.section_identification')}</h3>
                    </div>
                    <div style={{ padding: '1.25rem 1.4rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <Label>{t('vehicles.brand')}</Label>
                            <input name="marque" value={form.marque} onChange={handleChange} required style={inp(errors.marque)} placeholder="Toyota"
                                onFocus={e => e.target.style.borderColor = ACCENT} onBlur={e => e.target.style.borderColor = errors.marque ? '#fca5a5' : '#e2e8f0'} />
                            <Err msg={errors.marque?.[0]} />
                        </div>
                        <div>
                            <Label>{t('vehicles.model')}</Label>
                            <input name="model" value={form.model} onChange={handleChange} required style={inp(errors.model)} placeholder="Hilux"
                                onFocus={e => e.target.style.borderColor = ACCENT} onBlur={e => e.target.style.borderColor = errors.model ? '#fca5a5' : '#e2e8f0'} />
                            <Err msg={errors.model?.[0]} />
                        </div>
                        <div>
                            <Label>{t('vehicles.license_plate')}</Label>
                            <input name="license_plate" value={form.license_plate} onChange={handleChange} required style={inp(errors.license_plate)} placeholder="TG-1234-AB"
                                onFocus={e => e.target.style.borderColor = ACCENT} onBlur={e => e.target.style.borderColor = errors.license_plate ? '#fca5a5' : '#e2e8f0'} />
                            <Err msg={errors.license_plate?.[0]} />
                        </div>
                        <div>
                            <Label>{t('vehicles.year')}</Label>
                            <input type="number" name="year" value={form.year} onChange={handleChange} required style={inp(errors.year)} placeholder="2022"
                                onFocus={e => e.target.style.borderColor = ACCENT} onBlur={e => e.target.style.borderColor = errors.year ? '#fca5a5' : '#e2e8f0'} />
                            <Err msg={errors.year?.[0]} />
                        </div>
                    </div>
                </div>

                {/* Section: Carburant & Statut */}
                <div style={{ background: '#fff', borderRadius: '16px', border: '1.5px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: '1.25rem', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.4rem', borderBottom: '1px solid #f1f5f9', background: `${ACCENT}08` }}>
                        <h3 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: ACCENT }}>{t('vehicles.section_fuel_status')}</h3>
                    </div>
                    <div style={{ padding: '1.25rem 1.4rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <Label>{t('vehicles.fuel_type')}</Label>
                            <select name="fuel_type" value={form.fuel_type} onChange={handleChange} required style={{ ...inp(errors.fuel_type), cursor: 'pointer' }}
                                onFocus={e => e.target.style.borderColor = ACCENT} onBlur={e => e.target.style.borderColor = '#e2e8f0'}>
                                <option value="">{t('vehicles.select_fuel')}</option>
                                <option value="essence">{t('vehicles.fuel_gasoline')}</option>
                                <option value="diesel">{t('vehicles.fuel_diesel')}</option>
                                <option value="hybride">{t('vehicles.fuel_hybrid')}</option>
                                <option value="électrique">{t('vehicles.fuel_electric')}</option>
                                <option value="gpl">{t('vehicles.fuel_gpl')}</option>
                                <option value="autre">{t('vehicles.fuel_other')}</option>
                            </select>
                            <Err msg={errors.fuel_type?.[0]} />
                        </div>
                        <div>
                            <Label>{t('vehicles.fuel_card_optional')}</Label>
                            <input name="fuel_card" value={form.fuel_card} onChange={handleChange} style={inp(false)} placeholder="CI-2024-001"
                                onFocus={e => e.target.style.borderColor = ACCENT} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                        </div>
                        <div>
                            <Label>{t('vehicles.mileage')}</Label>
                            <div style={{ position: 'relative' }}>
                                <input type="number" name="mileage" value={form.mileage} onChange={handleChange} required style={{ ...inp(errors.mileage), paddingRight: '2.8rem' }}
                                    onFocus={e => e.target.style.borderColor = ACCENT} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>km</span>
                            </div>
                            <Err msg={errors.mileage?.[0]} />
                        </div>
                        <div>
                            <Label>{t('vehicles.status')}</Label>
                            <select name="status" value={form.status} onChange={handleChange} required style={{ ...inp(false), cursor: 'pointer' }}
                                onFocus={e => e.target.style.borderColor = ACCENT} onBlur={e => e.target.style.borderColor = '#e2e8f0'}>
                                <option value="operational">{t('vehicles.status_operational')}</option>
                                <option value="maintenance">{t('vehicles.status_maintenance')}</option>
                                <option value="out_of_service">{t('vehicles.status_out_of_service')}</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Section: Documents Réglementaires */}
                <div style={{ background: '#fff', borderRadius: '16px', border: '1.5px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: '1.25rem', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.4rem', borderBottom: '1px solid #f1f5f9', background: 'linear-gradient(135deg, #fff1f208, #fef9f008)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <span style={{ fontSize: '1rem' }}>🛡️</span>
                            <h3 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: '#dc2626' }}>{t('vehicles.regulatory_docs')}</h3>
                        </div>
                        <p style={{ margin: '3px 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>{t('vehicles.regulatory_docs_hint_create')}</p>
                    </div>
                    <div style={{ padding: '1.25rem 1.4rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        {[
                            { name: 'insurance_expiry',            icon: '🛡️', label: t('vehicles.insurance_expiry_label') },
                            { name: 'technical_inspection_expiry', icon: '🔬', label: t('vehicles.inspection_expiry_label') },
                            { name: 'tvm_expiry',                  icon: '📋', label: t('vehicles.tvm_expiry_label') },
                        ].map(f => (
                            <div key={f.name}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.76rem', fontWeight: 700, color: '#64748b', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                                    <span>{f.icon}</span>{f.label}
                                </label>
                                <input type="date" name={f.name} value={form[f.name]} onChange={handleChange} style={inp(errors[f.name])}
                                    onFocus={e => e.target.style.borderColor = '#dc2626'} onBlur={e => e.target.style.borderColor = errors[f.name] ? '#fca5a5' : '#e2e8f0'} />
                                <Err msg={errors[f.name]?.[0]} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section: Document */}
                <div style={{ background: '#fff', borderRadius: '16px', border: '1.5px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', marginBottom: '1.5rem', overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.4rem', borderBottom: '1px solid #f1f5f9', background: `${ACCENT}08` }}>
                        <h3 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: ACCENT }}>{t('vehicles.document')}</h3>
                    </div>
                    <div style={{ padding: '1.25rem 1.4rem' }}>
                        <label style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            border: `2px dashed ${documentFile ? ACCENT : '#e2e8f0'}`, borderRadius: '12px', padding: '1.5rem',
                            cursor: 'pointer', background: documentFile ? `${ACCENT}08` : '#f8faff', transition: 'all 0.2s',
                        }}>
                            <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={e => setDocumentFile(e.target.files[0] || null)} />
                            <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>{documentFile ? '📎' : '📤'}</div>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: documentFile ? ACCENT : '#64748b' }}>
                                {documentFile ? documentFile.name : t('vehicles.document_hint')}
                            </div>
                            {!documentFile && <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '3px' }}>PDF, JPG, PNG — max 5 Mo</div>}
                        </label>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button type="button" onClick={() => navigate('/vehicles')} style={{ flex: 1, padding: '0.72rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#374151', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
                        {t('common.cancel')}
                    </button>
                    <button type="submit" disabled={loading || success} style={{ flex: 1, padding: '0.72rem', borderRadius: '10px', border: 'none', background: ACCENT, color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: loading ? 'wait' : 'pointer', boxShadow: `0 4px 14px ${ACCENT}50` }}>
                        {loading ? <><span className="spinner-border spinner-border-sm me-2" />{t('common.saving')}</> : `💾 ${t('common.save')}`}
                    </button>
                </div>
            </form>
        </div>
    );
}
