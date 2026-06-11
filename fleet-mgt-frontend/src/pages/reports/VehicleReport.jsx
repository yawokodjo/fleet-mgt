import React, { useState, useEffect, useMemo } from "react";
import { Container, Row, Col, Table, Form, Alert } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { addPdfHeader, addPdfSignatures } from "../../utils/pdfHelpers";
import { useAuth } from "../../context/AuthContext";
import api from "../../axios";
import Pagination from "../../components/Pagination";

const PAGE_SIZE = 20;

const STATUS_BADGE = {
    operational:    { bg: '#dcfce7', color: '#16a34a', border: '#86efac' },
    maintenance:    { bg: '#fff7ed', color: '#d97706', border: '#fcd34d' },
    out_of_service: { bg: '#fee2e2', color: '#dc2626', border: '#fca5a5' },
};

export default function VehicleReport() {
    const { t } = useTranslation();
    const { user } = useAuth();

    const [filters, setFilters] = useState({ status: "", year_from: "", year_to: "" });
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [fetched, setFetched] = useState(false);

    const fetchReport = async () => {
        setLoading(true);
        setError("");
        try {
            const params = { per_page: 1000, sort_by: "license_plate", sort_dir: "asc" };
            if (filters.status)    params.status    = filters.status;
            if (filters.year_from) params.year_from = filters.year_from;
            if (filters.year_to)   params.year_to   = filters.year_to;
            const res = await api.get("/vehicles", { params });
            setData(res.data.data ?? []);
            setCurrentPage(1);
            setFetched(true);
        } catch (err) {
            setError(err.response?.data?.message || t('reports.load_error'));
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReport(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const totals = useMemo(() => {
        const byStatus = { operational: 0, maintenance: 0, out_of_service: 0 };
        data.forEach(v => { byStatus[v.status] = (byStatus[v.status] || 0) + 1; });
        const totalMileage = data.reduce((s, v) => s + Number(v.mileage || 0), 0);
        return { byStatus, totalMileage, count: data.length };
    }, [data]);

    const lastPage = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
    const from = data.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const to = Math.min(currentPage * PAGE_SIZE, data.length);
    const pageData = useMemo(() => data.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE), [data, currentPage]);

    const statusLabel = (s) => ({
        operational:    t('vehicles.status_operational'),
        maintenance:    t('vehicles.status_maintenance'),
        out_of_service: t('vehicles.status_out_of_service'),
    }[s] ?? s);

    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '-';

    const exportPDF = async () => {
        const doc = new jsPDF({ orientation: 'landscape' });
        await addPdfHeader(doc, t('reports.vehicle_report_title'));
        autoTable(doc, {
            startY: 27,
            head: [[
                t('vehicles.brand'), t('vehicles.model'), t('vehicles.license_plate'),
                t('vehicles.year'), t('vehicles.fuel_type'), t('vehicles.mileage'),
                t('vehicles.tvm_expiry'), t('vehicles.technical_inspection_expiry'), t('vehicles.insurance_expiry'),
                t('vehicles.status'),
            ]],
            body: data.map(v => [
                v.marque, v.model, v.license_plate,
                v.year ?? '-', v.fuel_type ?? '-',
                v.mileage ? `${Number(v.mileage).toLocaleString('fr-FR')} km` : '-',
                fmtDate(v.tvm_expiry), fmtDate(v.technical_inspection_expiry), fmtDate(v.insurance_expiry),
                statusLabel(v.status),
            ]),
            foot: [[
                '', '', '', '', t('reports.total'),
                `${Number(totals.totalMileage).toLocaleString('fr-FR')} km`,
                '', '', '', '',
            ]],
            styles: { fontSize: 7 },
            headStyles: { fillColor: [13, 110, 253] },
            footStyles: { fillColor: [241, 245, 249], textColor: [30, 30, 30], fontStyle: 'bold' },
            margin: { bottom: 30 },
        });
        addPdfSignatures(doc, user?.name);
        doc.save(`rapport-vehicules-${new Date().toISOString().slice(0,10)}.pdf`);
    };

    const exportExcel = () => {
        const rows = data.map(v => ({
            [t('vehicles.brand')]:                          v.marque,
            [t('vehicles.model')]:                          v.model,
            [t('vehicles.license_plate')]:                  v.license_plate,
            [t('vehicles.year')]:                           v.year ?? '',
            [t('vehicles.fuel_type')]:                      v.fuel_type ?? '',
            [t('vehicles.mileage')]:                        v.mileage ? Number(v.mileage) : '',
            [t('vehicles.tvm_expiry')]:                     fmtDate(v.tvm_expiry),
            [t('vehicles.technical_inspection_expiry')]:    fmtDate(v.technical_inspection_expiry),
            [t('vehicles.insurance_expiry')]:               fmtDate(v.insurance_expiry),
            [t('vehicles.status')]:                         statusLabel(v.status),
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        ws['!cols'] = [16,16,14,8,12,12,14,16,14,16].map(w => ({ wch: w }));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Véhicules');
        XLSX.writeFile(wb, `rapport-vehicules-${new Date().toISOString().slice(0,10)}.xlsx`);
    };

    return (
        <Container>
            <div style={{ paddingTop: '1rem', paddingBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: 'linear-gradient(135deg, #3b82f6, #0d6efd)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.15rem', flexShrink: 0, boxShadow: '0 3px 10px rgba(13,110,253,0.3)' }}>🚗</div>
                        <div>
                            <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', lineHeight: 1.2 }}>{t('reports.vehicle_report_title')}</h3>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>{t('reports.vehicles_section')}</span>
                        </div>
                    </div>
                    {fetched && data.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={exportPDF} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.45rem 1rem', borderRadius: '8px', border: 'none', background: '#dc2626', color: '#fff', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
                                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                PDF
                            </button>
                            <button onClick={exportExcel} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.45rem 1rem', borderRadius: '8px', border: 'none', background: '#16a34a', color: '#fff', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
                                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                Excel
                            </button>
                        </div>
                    )}
                </div>

                {error && <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert>}

                <Form className="bg-light p-3 rounded shadow-sm mb-3">
                    <Row className="g-3 align-items-end">
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>{t('vehicles.status')}</Form.Label>
                                <Form.Select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                                    <option value="">{t('vehicles.all_statuses')}</option>
                                    <option value="operational">{t('vehicles.status_operational')}</option>
                                    <option value="maintenance">{t('vehicles.status_maintenance')}</option>
                                    <option value="out_of_service">{t('vehicles.status_out_of_service')}</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={2}>
                            <Form.Group>
                                <Form.Label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>{t('vehicles.year_from')}</Form.Label>
                                <Form.Control type="number" min="1990" max="2100" placeholder="2015"
                                    value={filters.year_from} onChange={(e) => setFilters({ ...filters, year_from: e.target.value })} />
                            </Form.Group>
                        </Col>
                        <Col md={2}>
                            <Form.Group>
                                <Form.Label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>{t('vehicles.year_to')}</Form.Label>
                                <Form.Control type="number" min="1990" max="2100" placeholder="2024"
                                    value={filters.year_to} onChange={(e) => setFilters({ ...filters, year_to: e.target.value })} />
                            </Form.Group>
                        </Col>
                        <Col md={2}>
                            <button onClick={fetchReport} disabled={loading}
                                style={{ width: '100%', padding: '0.48rem 1rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #3b82f6, #0d6efd)', color: '#fff', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', boxShadow: '0 3px 10px rgba(13,110,253,0.25)' }}>
                                {loading ? '...' : t('reports.filter_btn')}
                            </button>
                        </Col>
                    </Row>
                </Form>

                {fetched && data.length > 0 && (
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                        {[
                            { label: t('reports.vehicles_section'), value: totals.count, color: '#0d6efd', bg: '#eff6ff' },
                            { label: t('vehicles.status_operational'), value: totals.byStatus.operational, color: '#16a34a', bg: '#dcfce7' },
                            { label: t('vehicles.status_maintenance'), value: totals.byStatus.maintenance, color: '#d97706', bg: '#fff7ed' },
                            { label: t('vehicles.status_out_of_service'), value: totals.byStatus.out_of_service, color: '#dc2626', bg: '#fee2e2' },
                            { label: t('vehicles.mileage') + ' total', value: `${Number(totals.totalMileage).toLocaleString('fr-FR')} km`, color: '#6d28d9', bg: '#f5f3ff' },
                        ].map((stat, i) => (
                            <div key={i} style={{ background: stat.bg, borderRadius: '12px', padding: '0.65rem 1.1rem', minWidth: '130px', flex: '1 1 130px' }}>
                                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', marginTop: '3px' }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status" />
                    </div>
                ) : fetched && (
                    <>
                        <div className="table-responsive">
                            <Table bordered hover className="align-middle" style={{ fontSize: '0.88rem' }}>
                                <thead className="table-light text-center">
                                    <tr>
                                        <th>{t('vehicles.brand')}</th>
                                        <th>{t('vehicles.model')}</th>
                                        <th>{t('vehicles.license_plate')}</th>
                                        <th>{t('vehicles.year')}</th>
                                        <th>{t('vehicles.fuel_type')}</th>
                                        <th>{t('vehicles.mileage')}</th>
                                        <th>{t('vehicles.tvm_expiry')}</th>
                                        <th>{t('vehicles.technical_inspection_expiry')}</th>
                                        <th>{t('vehicles.insurance_expiry')}</th>
                                        <th>{t('vehicles.status')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageData.length > 0 ? pageData.map((v) => {
                                        const sb = STATUS_BADGE[v.status] || STATUS_BADGE.operational;
                                        return (
                                            <tr key={v.id} className="text-center">
                                                <td className="fw-semibold">{v.marque}</td>
                                                <td>{v.model}</td>
                                                <td><span className="badge bg-secondary">{v.license_plate}</span></td>
                                                <td>{v.year ?? '-'}</td>
                                                <td>{v.fuel_type ?? '-'}</td>
                                                <td><strong>{v.mileage ? Number(v.mileage).toLocaleString('fr-FR') : '-'} km</strong></td>
                                                <td>{fmtDate(v.tvm_expiry)}</td>
                                                <td>{fmtDate(v.technical_inspection_expiry)}</td>
                                                <td>{fmtDate(v.insurance_expiry)}</td>
                                                <td>
                                                    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '0.74rem', fontWeight: 700, background: sb.bg, color: sb.color, border: `1px solid ${sb.border}` }}>
                                                        {statusLabel(v.status)}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr><td colSpan="10" className="text-center text-muted py-5">
                                            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🚗</div>
                                            {t('vehicles.no_vehicles')}
                                        </td></tr>
                                    )}
                                </tbody>
                                {data.length > 0 && (
                                    <tfoot className="table-light">
                                        <tr>
                                            <td colSpan="5" className="text-end fw-bold">{t('reports.total')} ({data.length})</td>
                                            <td className="text-center fw-bold">{Number(totals.totalMileage).toLocaleString('fr-FR')} km</td>
                                            <td colSpan="4" />
                                        </tr>
                                    </tfoot>
                                )}
                            </Table>
                        </div>
                        <Pagination
                            currentPage={currentPage} lastPage={lastPage}
                            total={data.length} perPage={PAGE_SIZE}
                            from={from} to={to}
                            onPageChange={setCurrentPage}
                            onPerPageChange={() => {}}
                        />
                    </>
                )}
            </div>
        </Container>
    );
}
