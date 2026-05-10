import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Form, InputGroup, Modal, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../axios';

export default function Users() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Charger les utilisateurs
    useEffect(() => {
        fetchUsers();
    }, []);

    // Filtrer les utilisateurs
    useEffect(() => {
        let filtered = users;

        // Filtre par rôle
        if (filterRole !== 'all') {
            filtered = filtered.filter(user => user.role === filterRole);
        }

        // Filtre par recherche
        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredUsers(filtered);
    }, [searchTerm, filterRole, users]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/users');
            const usersData = response.data.data || response.data.users || response.data || [];
            setUsers(usersData);
            setFilteredUsers(usersData);
        } catch (err) {
            console.error('Erreur chargement utilisateurs:', err);
            setError('Erreur lors du chargement des utilisateurs');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!userToDelete) return;

        try {
            await api.delete(`/users/${userToDelete.id}`);
            setSuccess(`Utilisateur ${userToDelete.name} supprimé avec succès`);
            setShowDeleteModal(false);
            setUserToDelete(null);
            fetchUsers();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Erreur suppression:', err);
            setError(err.response?.data?.message || 'Erreur lors de la suppression');
            setShowDeleteModal(false);
        }
    };

    const getRoleBadge = (role) => {
        const roleConfig = {
            admin: { bg: 'danger', icon: '👑', label: 'Administrateur' },
            manager: { bg: 'primary', icon: '👨‍💼', label: 'Gestionnaire' },
            driver: { bg: 'success', icon: '🚗', label: 'Chauffeur' },
            accountant: { bg: 'info', icon: '📊', label: 'Comptable' }
        };

        const config = roleConfig[role?.toLowerCase()] || { bg: 'secondary', icon: '👤', label: role };
        return (
            <Badge bg={config.bg} className="px-3 py-2">
                {config.icon} {config.label}
            </Badge>
        );
    };

    const getRoleStats = () => {
        return {
            total: users.length,
            admin: users.filter(u => u.role === 'admin').length,
            manager: users.filter(u => u.role === 'manager').length,
            driver: users.filter(u => u.role === 'driver').length,
            accountant: users.filter(u => u.role === 'accountant').length
        };
    };

    const stats = getRoleStats();

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    return (
        <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            minHeight: '100vh',
            paddingTop: '2rem',
            paddingBottom: '3rem'
        }}>
            <Container fluid>
                {/* En-tête */}
                <Row className="mb-4">
                    <Col>
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                            <div>
                                <h1 className="text-white fw-bold mb-2" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                                    👥 Gestion des Utilisateurs
                                </h1>
                                <p className="text-white opacity-75 mb-0">
                                    Gérez les comptes et les accès de votre équipe
                                </p>
                            </div>
                            <Button
                                size="lg"
                                variant="light"
                                className="shadow-lg"
                                style={{ borderRadius: '15px', fontWeight: '600' }}
                                onClick={() => navigate('/users/create')}
                            >
                                ➕ Nouvel utilisateur
                            </Button>
                        </div>
                    </Col>
                </Row>

                {/* Messages */}
                {success && (
                    <Alert variant="success" dismissible onClose={() => setSuccess('')} className="shadow-sm">
                        ✅ {success}
                    </Alert>
                )}
                {error && (
                    <Alert variant="danger" dismissible onClose={() => setError('')} className="shadow-sm">
                        ❌ {error}
                    </Alert>
                )}

                {/* Statistiques - Ligne unique avec 5 cartes compactes */}
                <Row className="g-3 mb-4">
                    <Col xs={6} sm={4} md className="d-flex">
                        <Card className="border-0 shadow-lg flex-fill" style={{ borderRadius: '15px', background: 'rgba(255,255,255,0.95)' }}>
                            <Card.Body className="text-center p-3">
                                <div style={{ fontSize: '1.8rem' }}>👥</div>
                                <h4 className="fw-bold mb-0">{stats.total}</h4>
                                <small className="text-muted">Total</small>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={6} sm={4} md className="d-flex">
                        <Card className="border-0 shadow-lg flex-fill" style={{ borderRadius: '15px', background: 'rgba(255,255,255,0.95)' }}>
                            <Card.Body className="text-center p-3">
                                <div style={{ fontSize: '1.8rem' }}>👑</div>
                                <h4 className="fw-bold mb-0">{stats.admin}</h4>
                                <small className="text-muted">Admins</small>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={6} sm={4} md className="d-flex">
                        <Card className="border-0 shadow-lg flex-fill" style={{ borderRadius: '15px', background: 'rgba(255,255,255,0.95)' }}>
                            <Card.Body className="text-center p-3">
                                <div style={{ fontSize: '1.8rem' }}>👨‍💼</div>
                                <h4 className="fw-bold mb-0">{stats.manager}</h4>
                                <small className="text-muted">Managers</small>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={6} sm={6} md className="d-flex">
                        <Card className="border-0 shadow-lg flex-fill" style={{ borderRadius: '15px', background: 'rgba(255,255,255,0.95)' }}>
                            <Card.Body className="text-center p-3">
                                <div style={{ fontSize: '1.8rem' }}>🚗</div>
                                <h4 className="fw-bold mb-0">{stats.driver}</h4>
                                <small className="text-muted">Chauffeurs</small>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={12} sm={6} md className="d-flex">
                        <Card className="border-0 shadow-lg flex-fill" style={{ borderRadius: '15px', background: 'rgba(255,255,255,0.95)' }}>
                            <Card.Body className="text-center p-3">
                                <div style={{ fontSize: '1.8rem' }}>📊</div>
                                <h4 className="fw-bold mb-0">{stats.accountant}</h4>
                                <small className="text-muted">Comptables</small>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Filtres et recherche */}
                <Card className="border-0 shadow-lg mb-4" style={{ borderRadius: '20px', background: 'rgba(255,255,255,0.95)' }}>
                    <Card.Body className="p-4">
                        <Row className="g-3">
                            <Col md={6}>
                                <InputGroup>
                                    <InputGroup.Text style={{ background: 'transparent', border: '2px solid #e9ecef' }}>
                                        🔍
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="text"
                                        placeholder="Rechercher par nom ou email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{ border: '2px solid #e9ecef', borderLeft: 'none' }}
                                    />
                                </InputGroup>
                            </Col>
                            <Col md={6}>
                                <Form.Select
                                    value={filterRole}
                                    onChange={(e) => setFilterRole(e.target.value)}
                                    style={{ border: '2px solid #e9ecef' }}
                                >
                                    <option value="all">📋 Tous les rôles</option>
                                    <option value="admin">👑 Administrateurs</option>
                                    <option value="manager">👨‍💼 Gestionnaires</option>
                                    <option value="driver">🚗 Chauffeurs</option>
                                    <option value="accountant">📊 Comptables</option>
                                </Form.Select>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Tableau des utilisateurs */}
                <Card className="border-0 shadow-lg" style={{ borderRadius: '20px', background: 'rgba(255,255,255,0.95)' }}>
                    <Card.Body className="p-4">
                        <div className="table-responsive">
                            <Table hover className="align-middle">
                                <thead>
                                    <tr>
                                        <th className="border-0 text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>Utilisateur</th>
                                        <th className="border-0 text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>Email</th>
                                        <th className="border-0 text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>Rôle</th>
                                        <th className="border-0 text-muted text-uppercase" style={{ fontSize: '0.75rem' }}>Date création</th>
                                        <th className="border-0 text-muted text-uppercase text-center" style={{ fontSize: '0.75rem' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map((user) => (
                                            <tr key={user.id}>
                                                <td>
                                                    <div className="d-flex align-items-center gap-3">
                                                        <div
                                                            className="d-flex align-items-center justify-content-center"
                                                            style={{
                                                                width: '45px',
                                                                height: '45px',
                                                                borderRadius: '50%',
                                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                color: 'white',
                                                                fontWeight: 'bold',
                                                                fontSize: '1.2rem'
                                                            }}
                                                        >
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
                                                    {user.created_at
                                                        ? new Date(user.created_at).toLocaleDateString('fr-FR')
                                                        : 'N/A'
                                                    }
                                                </td>
                                                <td className="text-center">
                                                    <div className="d-flex gap-2 justify-content-center">
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            style={{ borderRadius: '10px' }}
                                                            onClick={() => navigate(`/users/${user.id}/edit`)}
                                                        >
                                                            ✏️ Modifier
                                                        </Button>
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            style={{ borderRadius: '10px' }}
                                                            onClick={() => {
                                                                setUserToDelete(user);
                                                                setShowDeleteModal(true);
                                                            }}
                                                        >
                                                            🗑️ Supprimer
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center text-muted py-5">
                                                <div style={{ fontSize: '3rem' }}>👥</div>
                                                <p className="mb-0">Aucun utilisateur trouvé</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </Card.Body>
                </Card>
            </Container>

            {/* Modal de confirmation de suppression */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton style={{ borderBottom: 'none' }}>
                    <Modal.Title>⚠️ Confirmer la suppression</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{userToDelete?.name}</strong> ?</p>
                    <Alert variant="warning" className="mb-0">
                        <small>⚠️ Cette action est irréversible</small>
                    </Alert>
                </Modal.Body>
                <Modal.Footer style={{ borderTop: 'none' }}>
                    <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>
                        Annuler
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        🗑️ Supprimer
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}