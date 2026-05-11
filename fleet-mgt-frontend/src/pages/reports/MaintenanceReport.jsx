import React, { useState, useEffect } from "react";
import { Container, Row, Col, Table, Button, Form, Alert } from "react-bootstrap";
import api from "../../axios";

export default function MaintenanceReport() {
    const [filters, setFilters] = useState({
        start_date: "",
        end_date: "",
        order: "asc",
        vehicle_id: "",
    });
    const [data, setData] = useState([]);
    const [totals, setTotals] = useState({ total_cost: 0, count: 0 });
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
            setError("Veuillez sélectionner une date de début et une date de fin.");
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
        } catch (err) {
            const msg = err.response?.data?.message || "Erreur lors du chargement du rapport.";
            setError(msg);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const exportReport = async (format) => {
        if (!validate()) return;
        try {
            const res = await api.get("/reports/maintenanceBetweenDates", {
                params: { ...buildParams(), format },
                responseType: "blob",
            });
            const url = URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement("a");
            a.href = url;
            a.download = `rapport_maintenance_${filters.start_date}_${filters.end_date}.${format === "pdf" ? "pdf" : "xlsx"}`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            if (err.response?.data instanceof Blob) {
                const text = await err.response.data.text();
                try {
                    const json = JSON.parse(text);
                    setError(json.message || "Erreur lors de l'export.");
                } catch {
                    setError("Erreur lors de l'export.");
                }
            } else {
                setError("Erreur lors de l'export.");
            }
        }
    };

    const statusLabel = (s) => ({
        planned: "Planifié", in_progress: "En cours", completed: "Terminé", cancelled: "Annulé",
    }[s] ?? s);

    return (
        <Container className="mt-4">
            <Row className="mb-4">
                <Col>
                    <h3 className="text-primary text-center">Rapport de maintenance des véhicules</h3>
                </Col>
            </Row>

            {error && <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert>}

            <Form className="bg-light p-3 rounded shadow-sm mb-4">
                <Row className="g-3 align-items-end">
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label>Véhicule</Form.Label>
                            <Form.Select value={filters.vehicle_id} onChange={(e) => setFilters({ ...filters, vehicle_id: e.target.value })}>
                                <option value="">Tous les véhicules</option>
                                {vehicles.map((v) => (
                                    <option key={v.id} value={v.id}>{v.license_plate}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label>Date début <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="date" value={filters.start_date} onChange={(e) => setFilters({ ...filters, start_date: e.target.value })} />
                        </Form.Group>
                    </Col>
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label>Date fin <span className="text-danger">*</span></Form.Label>
                            <Form.Control type="date" value={filters.end_date} onChange={(e) => setFilters({ ...filters, end_date: e.target.value })} />
                        </Form.Group>
                    </Col>
                    <Col md={2}>
                        <Form.Group>
                            <Form.Label>Ordre</Form.Label>
                            <Form.Select value={filters.order} onChange={(e) => setFilters({ ...filters, order: e.target.value })}>
                                <option value="asc">Croissant</option>
                                <option value="desc">Décroissant</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={1}>
                        <Button variant="primary" className="w-100" onClick={fetchReport} disabled={loading}>
                            {loading ? "..." : "Filtrer"}
                        </Button>
                    </Col>
                </Row>
            </Form>

            <div className="table-responsive shadow-sm">
                <Table bordered hover className="align-middle text-center">
                    <thead className="table-primary">
                        <tr>
                            <th>Date prévue</th>
                            <th>Date réalisée</th>
                            <th>Véhicule</th>
                            <th>Type</th>
                            <th>Société / Atelier</th>
                            <th>Coût (FCFA)</th>
                            <th>Statut</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length > 0 ? data.map((item, i) => (
                            <tr key={i}>
                                <td>{item.date ? new Date(item.date).toLocaleDateString("fr-FR") : "-"}</td>
                                <td>{item.completed_date ? new Date(item.completed_date).toLocaleDateString("fr-FR") : "-"}</td>
                                <td>{item.vehicle}</td>
                                <td>{item.type}</td>
                                <td>{item.company}</td>
                                <td>{Number(item.cost).toLocaleString("fr-FR")}</td>
                                <td>{statusLabel(item.status)}</td>
                                <td className="text-start">{item.description}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan="8" className="text-muted">Aucun enregistrement trouvé</td></tr>
                        )}
                    </tbody>
                    {data.length > 0 && (
                        <tfoot className="fw-bold table-light">
                            <tr>
                                <td colSpan="5">Total ({totals.count} maintenance{totals.count > 1 ? "s" : ""})</td>
                                <td>{Number(totals.total_cost).toLocaleString("fr-FR")} FCFA</td>
                                <td colSpan="2">-</td>
                            </tr>
                        </tfoot>
                    )}
                </Table>
            </div>

            <div className="mt-3 d-flex gap-2">
                <Button variant="success" onClick={() => exportReport("excel")}>Exporter Excel</Button>
                <Button variant="danger" onClick={() => exportReport("pdf")}>Exporter PDF</Button>
            </div>
        </Container>
    );
}
