import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/AdminPage.css";

const AdminPage = () => {
    const [users, setUsers] = useState([]); // Store all users
    const [error, setError] = useState(""); // Error state
    const [success, setSuccess] = useState(""); // Success state
    const [loading, setLoading] = useState(false); // Loading state

    useEffect(() => {
        fetchUsers(); // Fetch all users on page load
    }, []);

    // Fetch all users
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:3000/api/admin/users", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setUsers(response.data || []);
            setError("");
        } catch (err) {
            setError(err.response?.data?.error || "Failed to fetch users.");
        } finally {
            setLoading(false);
        }
    };

    // Toggle user status
    const toggleUserStatus = async (userId, currentStatus) => {
        const newStatus = currentStatus === "active" ? "disabled" : "active";
        try {
            await axios.put(
                `http://localhost:3000/api/admin/users/${userId}/status`,
                { status: newStatus },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }
            );
            setSuccess(`User status updated to ${newStatus}.`);
            fetchUsers(); // Refresh the user list
        } catch (err) {
            setError(err.response?.data?.error || "Failed to update user status.");
        }
    };

    // Grant admin privileges
    const grantAdminPrivileges = async (userId) => {
        try {
            await axios.put(
                `http://localhost:3000/api/admin/users/${userId}`,
                {},
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }
            );
            setSuccess("User granted admin privileges.");
            fetchUsers(); // Refresh the user list
        } catch (err) {
            setError(err.response?.data?.error || "Failed to grant admin privileges.");
        }
    };

    return (
        <div className="admin-page-container">
            <header>
                <h1>Admin Dashboard</h1>
                <p>Manage users and their permissions.</p>
            </header>

            <main>
                {loading && <p>Loading users...</p>}
                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}

                {users.length > 0 ? (
                    <table className="user-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.status}</td>
                                    <td>
                                        <button
                                            onClick={() => toggleUserStatus(user._id, user.status)}
                                            className={`status-button ${
                                                user.status === "active" ? "deactivate" : "activate"
                                            }`}
                                        >
                                            {user.status === "active" ? "Deactivate" : "Activate"}
                                        </button>
                                        {!user.role.includes("admin") && (
                                            <button
                                                onClick={() => grantAdminPrivileges(user._id)}
                                                className="grant-admin-button"
                                            >
                                                Grant Admin
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No users found.</p>
                )}
            </main>
        </div>
    );
};

export default AdminPage;
