import React, { useState, useEffect } from "react";
import { Container, Row, Col, Table, Button, Form } from "react-bootstrap";
import api from "../../axios";

export default function MaintenanceReport() {
    const [filters, setFilters] = useState({
        start_date: "",
        end_date: "",
        order: "asc",
        vehicle_id: "",
    });
    const [data, setData] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);

    // Charger la liste des véhicules
    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const res = await api.get("/vehicles");
                let vehs = Array.isArray(res.data)
                    ? res.data
                    : Array.isArray(res.data.data)
                        ? res.data.data
                        : Array.isArray(res.data.vehicles)
                            ? res.data.vehicles
                            : [];

                vehs.sort((a, b) => (a.license_plate || "").localeCompare(b.license_plate || ""));
                setVehicles(vehs);
            } catch (err) {
                console.error("Erreur chargement véhicules :", err);
                setVehicles([]);
            }
        };
        fetchVehicles();
    }, []);

    const handleChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    // Charger rapport maintenance filtré
    const fetchReport = async () => {
        setLoading(true);
        try {
            const res = await api.get("/reports/maintenanceBetweenDates", {
                params: { ...filters, format: "json" },
            });
            const maintenances = Array.isArray(res.data.maintenances) ? res.data.maintenances : [];
            setData(maintenances);
        } catch (err) {
            console.error("Erreur chargement du rapport :", err);
            alert("Erreur lors du chargement du rapport !");
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    // Export PDF / Excel
    const exportReport = async (format) => {
        try {
            const res = await api.get("/reports/maintenanceBetweenDates", {
                params: { ...filters, format },
                responseType: "blob",
            });
            const blob = new Blob([res.data]);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `rapport_maintenance.${format === "pdf" ? "pdf" : "xlsx"}`;
            a.click();
        } catch (err) {
            console.error("Erreur export :", err);
            alert("Erreur lors de l’export du rapport !");
        }
    };

    return (
        <Container className="mt-4">
            <Row className="mb-4">
                <Col>
                    <h3 className="text-primary text-center">
                        🛠️ Rapport de maintenance des véhicules
                    </h3>
                </Col>
            </Row>

            {/* Filtres */}
            <Form className="bg-light p-3 rounded shadow-sm mb-4">
                <Row className="g-3 align-items-end">
                    <Col md={3}>
                        <Form.Group>
                            <Form.Label>Véhicule</Form.Label>
                            <Form.Select
                                name="vehicle_id"
                                value={filters.vehicle_id}
                                onChange={handleChange}
                            >
                                <option value="">Tous les véhicules</option>
                                {vehicles.map((v) => (
                                    <option key={v.id} value={v.id}>
                                        {v.license_plate}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    <Col md={3}>
                        <Form.Group>
                            <Form.Label>Date début</Form.Label>
                            <Form.Control
                                type="date"
                                name="start_date"
                                value={filters.start_date}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </Col>

                    <Col md={3}>
                        <Form.Group>
                            <Form.Label>Date fin</Form.Label>
                            <Form.Control
                                type="date"
                                name="end_date"
                                value={filters.end_date}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </Col>

                    <Col md={2}>
                        <Form.Group>
                            <Form.Label>Ordre</Form.Label>
                            <Form.Select
                                name="order"
                                value={filters.order}
                                onChange={handleChange}
                            >
                                <option value="asc">Croissant</option>
                                <option value="desc">Décroissant</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    <Col md={1}>
                        <Button
                            variant="primary"
                            className="w-100"
                            onClick={fetchReport}
                            disabled={loading}
                        >
                            {loading ? "..." : "Filtrer"}
                        </Button>
                    </Col>
                </Row>
            </Form>

            {/* Tableau */}
            <div className="table-responsive shadow-sm">
                <Table bordered hover className="align-middle text-center">
                    <thead className="table-primary">
                        <tr>
                            <th>Date</th>
                            <th>Type maintenance</th>
                            <th>Coût (FCFA)</th>
                            <th>Kilométrage (Km)</th>
                            <th>Fournisseur / Atelier</th>
                            <th>Remarques</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length > 0 ? (
                            data.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.date}</td>
                                    <td>{item.type}</td>
                                    <td>{item.cost?.toLocaleString()}</td>
                                    <td>{item.kilometers}</td>
                                    <td>{item.vendor}</td>
                                    <td>{item.notes}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-muted">
                                    Aucun enregistrement trouvé
                                </td>
                            </tr>
                        )}
                    </tbody>
                    {data.length > 0 && (
                        <tfoot className="fw-bold bg-light">
                            <tr>
                                <td>Total</td>
                                <td colSpan="1">-</td>
                                <td>{data.reduce((sum, i) => sum + (i.cost || 0), 0).toLocaleString()} FCFA</td>
                                <td colSpan="3">-</td>
                            </tr>
                        </tfoot>
                    )}
                </Table>
            </div>

            {/* Export */}
            <div className="mt-3 d-flex gap-2">
                <Button variant="success" onClick={() => exportReport("excel")}>
                    📗 Exporter Excel
                </Button>
                <Button variant="danger" onClick={() => exportReport("pdf")}>
                    📕 Exporter PDF
                </Button>
            </div>
        </Container>
    );
}
