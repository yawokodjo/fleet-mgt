import React, { useState, useEffect, useMemo } from "react";
import { Container, Row, Col, Table, Button, Form, Alert } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { addPdfHeader, addPdfSignatures } from "../../utils/pdfHelpers";
import { useAuth } from "../../context/AuthContext";
import api from "../../axios";
import Pagination from "../../components/Pagination";

const PAGE_SIZE = 20;

export default function MaintenanceReport() {
    const { t, i18n } = useTranslation();
    const locale = i18n.language === 'fr' ? 'fr-FR' : 'en-US';
    const { user } = useAuth();

    const [filters, setFilters] = useState({ start_date: "", end_date: "", order: "asc", vehicle_id: "" });
    const [data, setData] = useState([]);
    const [totals, setTotals] = useState({ total_cost: 0, count: 0 });
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        api.get("/vehicles-list")
            .then((res) => {
                const vehs = Array.isArray(res.data) ? res.data : [];
                vehs.sort((a, b) => (a.license_plate || "").localeCompare(b.license_plate || ""));
                setVehicles(vehs);
            })
            .catch(() => setVehicles([]));
    }, []);

    const buildParams = () => {
        const params = { order: filters.order, format: "json" };
        if (filters.start_date) params.start_date = filters.start_date;
        if (filters.end_date)   params.end_date   = filters.end_date;
        if (filters.vehicle_id) params.vehicle_id = filters.vehicle_id;
        return params;
    };

    const validate = () => {
        if (!filters.start_date || !filters.end_date) {
            setError(t('reports.date_error'));
            return false;
        }
        setError("");
        return true;
    };

    const fetchReport = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            const res = await api.get("/reports/maintenanceBetweenDates", { params: buildParams() });
            setData(res.data.maintenances ?? []);
            setTotals(res.data.totals ?? { total_cost: 0, count: 0 });
            setCurrentPage(1);
        } catch (err) {
            setError(err.response?.data?.message || t('reports.load_error'));
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const exportPDF = async () => {
        const doc = new jsPDF({ orientation: 'landscape' });
        await addPdfHeader(doc, t('reports.maintenance_report_title'), `Période : ${filters.start_date} → ${filters.end_date}`);
        autoTable(doc, {
            startY: 27,
            head: [[
                t('reports.col_planned_date'), t('reports.col_completed_date'), t('reports.col_vehicle'),
                t('reports.col_type'), t('reports.col_company'), t('reports.col_cost'),
                t('reports.col_mileage'), t('reports.col_document'),
                t('reports.col_status'), t('reports.col_description'),
            ]],
            body: data.map(item => [
                item.date ? new Date(item.date).toLocaleDateString(locale) : '-',
                item.completed_date ? new Date(item.completed_date).toLocaleDateString(locale) : '-',
                item.vehicle, item.type, item.company,
                Number(item.cost).toLocaleString(locale),
                item.mileage_at_service ? Number(item.mileage_at_service).toLocaleString(locale) + ' km' : '-',
                item.document_path ? 'Oui' : '—',
                statusLabel(item.status), item.description ?? '',
            ]),
            foot: [[
                '', '', '', '', t('reports.total') + ` (${totals.count})`,
                `${Number(totals.total_cost).toLocaleString(locale)} FCFA`,
                '', '', '', '',
            ]],
            styles: { fontSize: 7 },
            headStyles: { fillColor: [249, 115, 22] },
            footStyles: { fillColor: [241, 245, 249], textColor: [30, 30, 30], fontStyle: 'bold' },
            margin: { bottom: 30 },
        });
        addPdfSignatures(doc, user?.name);
        doc.save(`rapport-maintenance-${filters.start_date}-${filters.end_date}.pdf`);
    };

    const exportExcel = () => {
        const rows = data.map(item => ({
            [t('reports.col_planned_date')]:   item.date ? new Date(item.date).toLocaleDateString(locale) : '-',
            [t('reports.col_completed_date')]: item.completed_date ? new Date(item.completed_date).toLocaleDateString(locale) : '-',
            [t('reports.col_vehicle')]:        item.vehicle,
            [t('reports.col_type')]:           item.type,
            [t('reports.col_company')]:        item.company,
            [t('reports.col_cost')]:           Number(item.cost),
            [t('reports.col_mileage')]:        item.mileage_at_service ? Number(item.mileage_at_service) : '',
            [t('reports.col_document')]:       item.document_path ? 'Oui' : '—',
            [t('reports.col_status')]:         statusLabel(item.status),
            [t('reports.col_description')]:    item.description ?? '',
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        ws['!cols'] = [12, 14, 16, 14, 18, 12, 12, 10, 14, 30].map(w => ({ wch: w }));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Maintenances');
        XLSX.writeFile(wb, `rapport-maintenance-${filters.start_date}-${filters.end_date}.xlsx`);
    };

    const statusLabel = (s) => ({
        planned: t('reports.status_planned'),
        in_progress: t('reports.status_in_progress'),
        completed: t('reports.status_completed'),
        cancelled: t('reports.status_cancelled'),
    }[s] ?? s);

    const lastPage = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
    const from = data.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const to = Math.min(currentPage * PAGE_SIZE, data.length);
    const pageData = useMemo(() => data.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE), [data, currentPage]);

    return (
        <Container>
            <div style={{ background: '#f8f9fa', paddingBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '1rem', paddingBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '11px', background: 'linear-gradient(135deg, #fb923c, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.15rem', flexShrink: 0, boxShadow: '0 3px 10px rgba(249,115,22,0.3)' }}>🔧</div>
                    <div>
                        <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', lineHeight: 1.2 }}>{t('reports.maintenance_report_title')}</h3>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>{t('reports.maintenances_section')}</span>
                    </div>
                </div>
                {data.length > 0 && (
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

            <Form className="bg-light p-3 rounded shadow-sm mb-2">
                <Row className="g-3 align-items-end">
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label>{t('reports.col_vehicle')}</Form.Label>
                            <Form.Select value={filters.vehicle_id} onChange={(e) => setFilters({ ...filters, vehicle_id: e.target.value })}>
                                <option value="">{t('reports.all_vehicles')}</option>
                                {vehicles.map((v) => (
                                    <option key={v.id} value={v.id}>{v.license_plate}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label>{t('reports.start_date')} <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="date" value={filters.start_date} onChange={(e) => setFilters({ ...filters, start_date: e.target.value })} />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label>{t('reports.end_date')} <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="date" value={filters.end_date} onChange={(e) => setFilters({ ...filters, end_date: e.target.value })} />
                        </Form.Group>
                    </Col>
                    <Col md={2}>
                        <Form.Group>
                            <Form.Label>{t('reports.order')}</Form.Label>
                            <Form.Select value={filters.order} onChange={(e) => setFilters({ ...filters, order: e.target.value })}>
                                <option value="asc">{t('reports.order_asc')}</option>
                                <option value="desc">{t('reports.order_desc')}</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={1}>
                        <Button variant="primary" className="w-100" onClick={fetchReport} disabled={loading}>
                            {loading ? "..." : t('reports.filter_btn')}
                        </Button>
                    </Col>
                </Row>
            </Form>
            </div>

            <div className="table-responsive shadow-sm">
                <Table bordered hover className="align-middle text-center">
                    <thead className="table-primary">
                        <tr>
                            <th>{t('reports.col_planned_date')}</th>
                            <th>{t('reports.col_completed_date')}</th>
                            <th>{t('reports.col_vehicle')}</th>
                            <th>{t('reports.col_type')}</th>
                            <th>{t('reports.col_company')}</th>
                            <th>{t('reports.col_cost')}</th>
                            <th>{t('reports.col_mileage')}</th>
                            <th>{t('reports.col_document')}</th>
                            <th>{t('reports.col_status')}</th>
                            <th>{t('reports.col_description')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pageData.length > 0 ? pageData.map((item, i) => (
                            <tr key={i}>
                                <td>{item.date ? new Date(item.date).toLocaleDateString(locale) : "-"}</td>
                                <td>{item.completed_date ? new Date(item.completed_date).toLocaleDateString(locale) : "-"}</td>
                                <td>{item.vehicle}</td>
                                <td>{item.type}</td>
                                <td>{item.company}</td>
                                <td>{Number(item.cost).toLocaleString(locale)}</td>
                                <td>{item.mileage_at_service ? Number(item.mileage_at_service).toLocaleString(locale) + ' km' : '-'}</td>
                                <td>{item.document_path ? 'Oui' : '—'}</td>
                                <td>{statusLabel(item.status)}</td>
                                <td className="text-start">{item.description}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan="10" className="text-muted">{t('reports.no_records')}</td></tr>
                        )}
                    </tbody>
                    {data.length > 0 && currentPage === lastPage && (
                        <tfoot className="fw-bold table-light">
                            <tr>
                                <td colSpan="5">{t('reports.maintenance_total', { count: totals.count })}</td>
                                <td>{Number(totals.total_cost).toLocaleString(locale)} FCFA</td>
                                <td colSpan="4">-</td>
                            </tr>
                        </tfoot>
                    )}
                </Table>
            </div>

            {data.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    lastPage={lastPage}
                    total={data.length}
                    perPage={PAGE_SIZE}
                    from={from}
                    to={to}
                    onPageChange={setCurrentPage}
                />
            )}

        </Container>
    );
}
