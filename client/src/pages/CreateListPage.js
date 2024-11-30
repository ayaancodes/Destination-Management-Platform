import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CreateListPage = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:3000/api/lists",
        { name, description, visibility },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setSuccess("List created successfully!");
      setError("");
      navigate("/dashboard"); // Redirect to dashboard
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create the list.");
      setSuccess("");
    }
  };

  return (
    <div className="home-container">
      <header>
        <h1>Create a New List</h1>
      </header>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <br />
        <label>
          Description:
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <br />
        <label>
          Visibility:
          <select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
            <option value="private">Private</option>
            <option value="public">Public</option>
          </select>
        </label>
        <br />
        <button type="submit">Create List</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
};

export default CreateListPage;
