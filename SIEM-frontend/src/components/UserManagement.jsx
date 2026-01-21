import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navigation from './Navigation';
import { getUsers, createUser, updateUserRole, deleteUser } from '../services/usersService';
import '../styles/pages.css';

function UserManagement() {
    const { user, tenant } = useAuth();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserRole, setNewUserRole] = useState('viewer');
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState(null);

    const [showRoleModal, setShowRoleModal] = useState(false);
    const [userToUpdate, setUserToUpdate] = useState(null);
    const [newRole, setNewRole] = useState('');
    const [updating, setUpdating] = useState(false);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
            setError(err.error || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleString('en-US', options);
    };

    const getRoleBadgeClass = (role) => {
        switch (role) {
            case 'admin':
                return 'status-critical';
            case 'analyst':
                return 'status-warning';
            case 'viewer':
                return 'status-info';
            default:
                return 'status-badge';
        }
    };

    const handleCreateClick = () => {
        setShowCreateModal(true);
        setNewUserEmail('');
        setNewUserPassword('');
        setNewUserRole('viewer');
        setCreateError(null);
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();

        if (!newUserEmail.trim()) {
            setCreateError('Email is required');
            return;
        }
        if (newUserPassword.length < 6) {
            setCreateError('Password must be at least 6 characters');
            return;
        }

        setCreating(true);
        setCreateError(null);

        try {
            await createUser(newUserEmail.trim(), newUserPassword, newUserRole);
            setShowCreateModal(false);
            await fetchUsers();
        } catch (err) {
            console.error('Failed to create user:', err);
            setCreateError(err.error || 'Failed to create user');
        } finally {
            setCreating(false);
        }
    };

    const handleRoleClick = (userItem) => {
        setUserToUpdate(userItem);
        setNewRole(userItem.role);
        setShowRoleModal(true);
    };

    const handleRoleUpdate = async () => {
        if (!userToUpdate || !newRole) return;

        setUpdating(true);
        try {
            await updateUserRole(userToUpdate.id, newRole);
            setUsers(users.map(u =>
                u.id === userToUpdate.id
                    ? { ...u, role: newRole }
                    : u
            ));
            setShowRoleModal(false);
        } catch (err) {
            console.error('Failed to update role:', err);
            alert(err.error || 'Failed to update user role');
        } finally {
            setUpdating(false);
            setUserToUpdate(null);
        }
    };

    const handleDeleteClick = (userItem) => {
        setUserToDelete(userItem);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;

        setDeleting(true);
        try {
            await deleteUser(userToDelete.id);
            setUsers(users.filter(u => u.id !== userToDelete.id));
            setShowDeleteConfirm(false);
        } catch (err) {
            console.error('Failed to delete user:', err);
            alert(err.error || 'Failed to delete user');
        } finally {
            setDeleting(false);
            setUserToDelete(null);
        }
    };

    return (
        <div className="app-layout">
            <Navigation />
            <div className="main-content">
                <div className="container">
                    <div className="page-card">
                        <div className="page-header">
                            <h1>User Management</h1>
                        </div>
                        <p className="page-subtitle">
                            Manage users for <strong>{tenant?.name}</strong>
                        </p>

                        <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                            <button onClick={handleCreateClick} className="btn btn-primary">
                                + Add User
                            </button>
                        </div>

                        {loading && (
                            <div className="loading-container">
                                <p>Loading users...</p>
                            </div>
                        )}

                        {error && (
                            <div className="error-container">
                                <p className="error-message">{error}</p>
                                <button onClick={fetchUsers} className="btn btn-secondary">
                                    Retry
                                </button>
                            </div>
                        )}

                        {!loading && !error && users.length === 0 && (
                            <div className="empty-state">
                                <p>No users found.</p>
                            </div>
                        )}

                        {!loading && !error && users.length > 0 && (
                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Created</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((userItem) => {
                                            const isCurrentUser = userItem.id === user.id;
                                            return (
                                                <tr key={userItem.id}>
                                                    <td>
                                                        <strong>{userItem.email}</strong>
                                                        {isCurrentUser && <span style={{ marginLeft: '0.5rem', color: 'var(--primary-color)', fontSize: '0.875rem' }}>(You)</span>}
                                                    </td>
                                                    <td>
                                                        <span className={`status-badge ${getRoleBadgeClass(userItem.role)}`}>
                                                            {userItem.role}
                                                        </span>
                                                    </td>
                                                    <td>{formatDate(userItem.createdAt)}</td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button
                                                                className="btn btn-sm btn-secondary"
                                                                onClick={() => handleRoleClick(userItem)}
                                                                disabled={isCurrentUser}
                                                                title={isCurrentUser ? 'Cannot change your own role' : 'Change role'}
                                                            >
                                                                Change Role
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-danger"
                                                                onClick={() => handleDeleteClick(userItem)}
                                                                disabled={isCurrentUser}
                                                                title={isCurrentUser ? 'Cannot delete your own account' : 'Delete user'}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {showCreateModal && (
                            <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                    <h2>Add New User</h2>
                                    <form onSubmit={handleCreateSubmit}>
                                        <div className="form-group">
                                            <label htmlFor="userEmail">Email *</label>
                                            <input
                                                type="email"
                                                id="userEmail"
                                                value={newUserEmail}
                                                onChange={(e) => setNewUserEmail(e.target.value)}
                                                placeholder="user@example.com"
                                                disabled={creating}
                                                autoFocus
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="userPassword">Password *</label>
                                            <input
                                                type="password"
                                                id="userPassword"
                                                value={newUserPassword}
                                                onChange={(e) => setNewUserPassword(e.target.value)}
                                                placeholder="At least 6 characters"
                                                minLength={6}
                                                disabled={creating}
                                            />
                                            <small>Minimum 6 characters</small>
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="userRole">Role *</label>
                                            <select
                                                id="userRole"
                                                value={newUserRole}
                                                onChange={(e) => setNewUserRole(e.target.value)}
                                                disabled={creating}
                                            >
                                                <option value="viewer">Viewer - Can view logs and alerts</option>
                                                <option value="analyst">Analyst - Can view and manage alerts</option>
                                                <option value="admin">Admin - Full access including user management</option>
                                            </select>
                                        </div>
                                        {createError && (
                                            <p className="error-message">{createError}</p>
                                        )}
                                        <div className="modal-actions">
                                            <button
                                                type="button"
                                                onClick={() => setShowCreateModal(false)}
                                                className="btn btn-secondary"
                                                disabled={creating}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={creating || !newUserEmail.trim() || newUserPassword.length < 6}
                                            >
                                                {creating ? 'Creating...' : 'Create User'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {showRoleModal && userToUpdate && (
                            <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
                                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                    <h2>Change User Role</h2>
                                    <p>Changing role for <strong>{userToUpdate.email}</strong></p>
                                    <div className="form-group">
                                        <label htmlFor="roleSelect">Select New Role</label>
                                        <select
                                            id="roleSelect"
                                            value={newRole}
                                            onChange={(e) => setNewRole(e.target.value)}
                                            disabled={updating}
                                        >
                                            <option value="viewer">Viewer</option>
                                            <option value="analyst">Analyst</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div className="modal-actions">
                                        <button
                                            onClick={() => setShowRoleModal(false)}
                                            className="btn btn-secondary"
                                            disabled={updating}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleRoleUpdate}
                                            className="btn btn-primary"
                                            disabled={updating || newRole === userToUpdate.role}
                                        >
                                            {updating ? 'Updating...' : 'Update Role'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {showDeleteConfirm && userToDelete && (
                            <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
                                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                    <h2>Delete User</h2>
                                    <p>Are you sure you want to delete <strong>{userToDelete.email}</strong>?</p>
                                    <div className="warning-box">
                                        <strong>Warning:</strong> This action cannot be undone.
                                    </div>
                                    <div className="modal-actions">
                                        <button
                                            onClick={() => {
                                                setShowDeleteConfirm(false);
                                                setUserToDelete(null);
                                            }}
                                            className="btn btn-secondary"
                                            disabled={deleting}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleDeleteConfirm}
                                            className="btn btn-danger"
                                            disabled={deleting}
                                        >
                                            {deleting ? 'Deleting...' : 'Delete User'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserManagement;
