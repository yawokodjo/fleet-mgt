import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Form, InputGroup, Modal, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../axios';
import Pagination from '../components/Pagination';

export default function Users() {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const locale = i18n.language === 'fr' ? 'fr-FR' : 'en-US';

    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0, perPage: 15, from: 0, to: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const searchTimeout = useRef(null);

    const fetchUsers = useCallback(async (page = 1, perPage = 15, search = '', role = 'all') => {
        setLoading(true);
        try {
            const params = { page, per_page: perPage };
            if (search) params.search = search;
            if (role !== 'all') params.role = role;
            const response = await api.get('/users', { params });
            const d = response.data;
            const usersData = d.data || d.users || d || [];
            setUsers(Array.isArray(usersData) ? usersData : []);
            setPagination({
                currentPage: d.current_page ?? 1,
                lastPage: d.last_page ?? 1,
                total: d.total ?? (Array.isArray(usersData) ? usersData.length : 0),
                perPage: d.per_page ?? perPage,
                from: d.from ?? 0,
                to: d.to ?? 0,
            });
        } catch (err) {
            console.error(err);
            setError(t('users.load_error'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchUsers(1, pagination.perPage, searchTerm, filterRole);
    }, []);

    const handleSearchChange = (value) => {
        setSearchTerm(value);
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => {
            fetchUsers(1, pagination.perPage, value, filterRole);
        }, 350);
    };

    const handleRoleChange = (role) => {
        setFilterRole(role);
        fetchUsers(1, pagination.perPage, searchTerm, role);
    };

    const handlePageChange = (page) => {
        fetchUsers(page, pagination.perPage, searchTerm, filterRole);
    };

    const handlePerPageChange = (perPage) => {
        fetchUsers(1, perPage, searchTerm, filterRole);
    };

    const handleDelete = async () => {
        if (!userToDelete) return;
        try {
            await api.delete(`/users/${userToDelete.id}`);
            setSuccess(t('users.delete_success', { name: userToDelete.name }));
            setShowDeleteModal(false);
            setUserToDelete(null);
            fetchUsers(pagination.currentPage, pagination.perPage, searchTerm, filterRole);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || t('users.delete_error'));
            setShowDeleteModal(false);
        }
    };

    const getRoleBadge = (role) => {
        const roleConfig = {
            admin: { bg: 'danger', icon: '👑', label: t('users.badge_admin') },
            manager: { bg: 'primary', icon: '👨‍💼', label: t('users.badge_manager') },
            driver: { bg: 'success', icon: '🚗', label: t('users.badge_driver') },
            accountant: { bg: 'info', icon: '📊', label: t('users.badge_accountant') }
        };
        const config = roleConfig[role?.toLowerCase()] || { bg: 'secondary', icon: '👤', label: role };
        return <Badge bg={config.bg} className="px-3 py-2">{config.icon} {config.label}</Badge>;
    };

    if (loading && users.length === 0) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    return (
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh', paddingTop: '2rem', paddingBottom: '3rem' }}>
            <Container fluid>
                <Row className="mb-4">
                    <Col>
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                            <div>
                                <h1 className="text-white fw-bold mb-2" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                                    {t('users.title')}
                                </h1>
                                <p className="text-white opacity-75 mb-0">{t('users.subtitle')}</p>
                            </div>
                            <Button size="lg" variant="light" className="shadow-lg"
                                style={{ borderRadius: '15px', fontWeight: '600' }}
                                onClick={() => navigate('/users/create')}>
                                {t('users.new_user')}
                            </Button>
                        </div>
                    </Col>
                </Row>

                {success && <Alert variant="success" dismissible onClose={() => setSuccess('')} className="shadow-sm">✅ {success}</Alert>}
                {error && <Alert variant="danger" dismissible onClose={() => setError('')} className="shadow-sm">❌ {error}</Alert>}

                <Card className="border-0 shadow-lg mb-4" style={{ borderRadius: '20px', background: 'rgba(255,255,255,0.95)' }}>
                    <Card.Body className="p-4">
                        <Row className="g-3">
                            <Col md={6}>
                                <InputGroup>
                                    <InputGroup.Text style={{ background: 'transparent', border: '2px solid #e9ecef' }}>🔍</InputGroup.Text>
                                    <Form.Control
                                        type="text" placeholder={t('users.search_placeholder')}
                                        value={searchTerm} onChange={(e) => handleSearchChange(e.target.value)}
                                        style={{ border: '2px solid #e9ecef', borderLeft: 'none' }}
                                    />
                                </InputGroup>
                            </Col>
                            <Col md={6}>
                                <Form.Select value={filterRole} onChange={(e) => handleRoleChange(e.target.value)}
                                    style={{ border: '2px solid #e9ecef' }}>
                                    <option value="all">{t('users.all_roles')}</option>
                                    <option value="admin">{t('users.role_admin_filter')}</option>
                                    <option value="manager">{t('users.role_manager_filter')}</option>
                                    <option value="driver">{t('users.role_driver_filter')}</option>
                                    <option value="accountant">{t('users.role_accountant_filter')}</option>
                                </Form.Select>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                <Card className="border-0 shadow-lg" style={{ borderRadius: '20px', background: 'rgba(255,255,255,0.95)' }}>
                    <Card.Body className="p-4">
                        {loading && (
                            <div className="text-center py-3">
                                <Spinner animation="border" size="sm" variant="primary" />
                            </div>
                        )}
                        <div className="table-responsive">
                            <Table hover className="align-middle">
                                <thead>
                                    <tr>
                                        <th className="border-0 text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>{t('users.user_col')}</th>
                                        <th className="border-0 text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>{t('users.email_col')}</th>
                                        <th className="border-0 text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>{t('users.role_col')}</th>
                                        <th className="border-0 text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>{t('users.creation_date')}</th>
                                        <th className="border-0 text-muted text-uppercase text-center" style={{ fontSize: '0.75rem' }}>{t('users.actions_col')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length > 0 ? (
                                        users.map((user) => (
                                            <tr key={user.id}>
                                                <td>
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div className="d-flex align-items-center justify-content-center" style={{
                                                            width: '45px', height: '45px', borderRadius: '50%',
                                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                            color: 'white', fontWeight: 'bold', fontSize: '1.2rem'
                                                        }}>
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="fw-semibold">{user.name}</div>
                                                            <small className="text-muted">ID: {user.id}</small>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{user.email}</td>
                                                <td>{getRoleBadge(user.role)}</td>
                                                <td>
                                                    {user.created_at ? new Date(user.created_at).toLocaleDateString(locale) : 'N/A'}
                                                </td>
                                                <td className="text-center">
                                                    <div className="d-flex gap-2 justify-content-center">
                                                        <Button variant="outline-primary" size="sm"
                                                            style={{ borderRadius: '10px' }}
                                                            onClick={() => navigate(`/users/${user.id}/edit`)}>
                                                            ✏️ {t('common.edit')}
                                                        </Button>
                                                        <Button variant="outline-danger" size="sm"
                                                            style={{ borderRadius: '10px' }}
                                                            onClick={() => { setUserToDelete(user); setShowDeleteModal(true); }}>
                                                            🗑️ {t('common.delete')}
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center text-muted py-5">
                                                <div style={{ fontSize: '3rem' }}>👥</div>
                                                <p className="mb-0">{t('users.no_users')}</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>

                        <Pagination
                            currentPage={pagination.currentPage}
                            lastPage={pagination.lastPage}
                            total={pagination.total}
                            perPage={pagination.perPage}
                            from={pagination.from}
                            to={pagination.to}
                            onPageChange={handlePageChange}
                            onPerPageChange={handlePerPageChange}
                        />
                    </Card.Body>
                </Card>
            </Container>

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton style={{ borderBottom: 'none' }}>
                    <Modal.Title>{t('users.delete_modal_title')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{t('users.delete_confirm', { name: userToDelete?.name })}</p>
                    <Alert variant="warning" className="mb-0">
                        <small>⚠️ {t('common.irreversible')}</small>
                    </Alert>
                </Modal.Body>
                <Modal.Footer style={{ borderTop: 'none' }}>
                    <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>
                        {t('common.cancel')}
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        🗑️ {t('common.delete')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
