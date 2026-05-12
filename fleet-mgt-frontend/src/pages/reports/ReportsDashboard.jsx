import React from "react";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function ReportsDashboard() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const reports = [
        {
            id: 1,
            title: t('reports.consumption_title'),
            icon: "⛽",
            description: t('reports.consumption_desc'),
            color: "success",
            gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            route: "/reports/consumption",
            features: [t('reports.filter_vehicle'), t('reports.export_excel'), t('reports.auto_totals')],
            statValue: t('reports.fuel_stat'),
        },
        {
            id: 2,
            title: t('reports.maintenance_title'),
            icon: "🔧",
            description: t('reports.maintenance_desc'),
            color: "primary",
            gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            route: "/reports/maintenance",
            features: [t('reports.cost_tracking'), t('reports.filter_period'), t('reports.multi_export')],
            statValue: t('reports.maintenance_stat'),
        }
    ];

    const infoBlocks = [
        {
            icon: '🔍',
            bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            title: t('reports.advanced_filter'),
            desc: t('reports.advanced_filter_desc'),
        },
        {
            icon: '📊',
            bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            title: t('reports.clear_visual'),
            desc: t('reports.clear_visual_desc'),
        },
        {
            icon: '📥',
            bg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            title: t('reports.flexible_export'),
            desc: t('reports.flexible_export_desc'),
        },
    ];

    return (
        <Container fluid className="py-5 bg-light min-vh-100">
            <Row className="mb-5">
                <Col>
                    <div className="text-center">
                        <h1 className="display-4 fw-bold text-primary mb-3">
                            {t('reports.dashboard_title')}
                        </h1>
                        <p className="lead text-muted">{t('reports.dashboard_subtitle')}</p>
                        <Badge bg="info" className="px-3 py-2 fs-6">{t('reports.realtime_data')}</Badge>
                    </div>
                </Col>
            </Row>

            <Row className="g-4 mb-5">
                {reports.map((report) => (
                    <Col key={report.id} lg={6}>
                        <Card className="h-100 border-0 shadow-lg"
                            style={{ transition: "transform 0.3s ease, box-shadow 0.3s ease", cursor: "pointer" }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-10px)"; e.currentTarget.style.boxShadow = "0 1rem 3rem rgba(0,0,0,.175)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0.5rem 1rem rgba(0,0,0,.15)"; }}>
                            <div className="p-4 text-white position-relative overflow-hidden"
                                style={{ background: report.gradient, borderTopLeftRadius: "0.375rem", borderTopRightRadius: "0.375rem" }}>
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <div className="d-inline-flex align-items-center justify-content-center mb-3"
                                            style={{ fontSize: "3rem", width: "80px", height: "80px", background: "rgba(255,255,255,0.2)", borderRadius: "50%", backdropFilter: "blur(10px)" }}>
                                            {report.icon}
                                        </div>
                                        <h3 className="fw-bold mb-0">{report.title}</h3>
                                    </div>
                                    <Badge bg="light" text="dark" className="px-3 py-2">{report.statValue}</Badge>
                                </div>
                                <div className="position-absolute" style={{ bottom: "-50px", right: "-50px", width: "200px", height: "200px", background: "rgba(255,255,255,0.1)", borderRadius: "50%" }} />
                            </div>

                            <Card.Body className="p-4">
                                <Card.Text className="text-muted mb-4">{report.description}</Card.Text>
                                <div className="mb-4">
                                    <h6 className="text-uppercase text-muted mb-3" style={{ fontSize: "0.75rem" }}>
                                        {t('reports.features_label')}
                                    </h6>
                                    <div className="d-flex flex-column gap-2">
                                        {report.features.map((feature, index) => (
                                            <div key={index} className="d-flex align-items-center">
                                                <span className="text-success me-2">✓</span>
                                                <small className="text-muted">{feature}</small>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="d-grid">
                                    <Button variant={report.color} size="lg" onClick={() => navigate(report.route)} className="fw-semibold">
                                        {t('reports.view_report')} <span className="ms-2">→</span>
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row>
                <Col lg={12}>
                    <Card className="border-0 shadow-sm bg-white">
                        <Card.Body className="p-4">
                            <Row className="g-4">
                                <Col md={12} className="mb-3">
                                    <h5 className="fw-bold text-primary mb-4">📈 {t('reports.features_label')}</h5>
                                </Col>
                                {infoBlocks.map((block) => (
                                    <Col key={block.title} md={4}>
                                        <div className="d-flex align-items-start">
                                            <div className="flex-shrink-0 me-3" style={{ width: "50px", height: "50px", background: block.bg, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>
                                                {block.icon}
                                            </div>
                                            <div>
                                                <h6 className="fw-semibold mb-2">{block.title}</h6>
                                                <p className="text-muted small mb-0">{block.desc}</p>
                                            </div>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mt-4">
                <Col>
                    <Card className="border-0 bg-primary bg-opacity-10">
                        <Card.Body className="text-center py-4">
                            <h6 className="text-primary mb-2">{t('reports.tip')}</h6>
                            <p className="text-muted small mb-0">{t('reports.tip_content')}</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}
