import React, { useState, useEffect } from "react";
import { Container, Row, Col, Table, Button, Form, Alert } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import api from "../../axios";

export default function ConsumptionReport() {
    const { t, i18n } = useTranslation();
    const locale = i18n.language === 'fr' ? 'fr-FR' : 'en-US';

    const [filters, setFilters] = useState({ start_date: "", end_date: "", order: "asc", vehicle_id: "" });
    const [data, setData] = useState([]);
    const [totals, setTotals] = useState({ total_fuel: 0, total_cost: 0 });
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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
            const res = await api.get("/reports/exportBetweenDates", { params: buildParams() });
            setData(res.data.consumptions ?? []);
            setTotals(res.data.totals ?? { total_fuel: 0, total_cost: 0 });
        } catch (err) {
            setError(err.response?.data?.message || t('reports.load_error'));
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const exportReport = async (format) => {
        if (!validate()) return;
        try {
            const res = await api.get("/reports/exportBetweenDates", {
                params: { ...buildParams(), format },
                responseType: "blob",
            });
            const url = URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement("a");
            a.href = url;
            a.download = `rapport_consommation_${filters.start_date}_${filters.end_date}.${format === "pdf" ? "pdf" : "xlsx"}`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            if (err.response?.data instanceof Blob) {
                const text = await err.response.data.text();
                try { setError(JSON.parse(text).message || t('reports.export_error')); }
                catch { setError(t('reports.export_error')); }
            } else {
                setError(t('reports.export_error'));
            }
        }
    };

    return (
        <Container className="mt-4">
            <Row className="mb-4">
                <Col>
                    <h3 className="text-primary text-center">{t('reports.consumption_report_title')}</h3>
                </Col>
            </Row>

            {error && <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert>}

            <Form className="bg-light p-3 rounded shadow-sm mb-4">
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

            <div className="table-responsive shadow-sm">
                <Table bordered hover className="align-middle text-center">
                    <thead className="table-success">
                        <tr>
                            <th>{t('reports.col_date')}</th>
                            <th>{t('reports.col_vehicle')}</th>
                            <th>{t('reports.col_driver')}</th>
                            <th>{t('reports.col_volume')}</th>
                            <th>{t('reports.col_total_cost')}</th>
                            <th>{t('reports.col_cost_per_liter')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length > 0 ? data.map((item, i) => (
                            <tr key={i}>
                                <td>{item.date ? new Date(item.date).toLocaleDateString(locale) : "-"}</td>
                                <td>{item.vehicle}</td>
                                <td>{item.driver}</td>
                                <td>{Number(item.fuel_volume).toLocaleString(locale, { minimumFractionDigits: 2 })}</td>
                                <td>{Number(item.fuel_cost).toLocaleString(locale)}</td>
                                <td>{item.cost_per_liter ? Number(item.cost_per_liter).toLocaleString(locale) : "N/A"}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan="6" className="text-muted">{t('reports.no_records')}</td></tr>
                        )}
                    </tbody>
                    {data.length > 0 && (
                        <tfoot className="fw-bold table-light">
                            <tr>
                                <td colSpan="3">{t('reports.total')}</td>
                                <td>{Number(totals.total_fuel).toLocaleString(locale, { minimumFractionDigits: 2 })} L</td>
                                <td>{Number(totals.total_cost).toLocaleString(locale)} FCFA</td>
                                <td>-</td>
                            </tr>
                        </tfoot>
                    )}
                </Table>
            </div>

            <div className="mt-3 d-flex gap-2">
                <Button variant="success" onClick={() => exportReport("excel")}>{t('reports.export_excel_btn')}</Button>
                <Button variant="danger" onClick={() => exportReport("pdf")}>{t('reports.export_pdf_btn')}</Button>
            </div>
        </Container>
    );
}
