import React, { useState } from "react";
import axios from "axios";

const AddToListButton = ({ destinationId, lists, onDestinationAdded }) => {
  const [selectedListId, setSelectedListId] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleAddDestination = async () => {
    if (!selectedListId) {
      setError("Please select a list.");
      return;
    }

    try {
      await axios.post(
        `http://localhost:3000/api/lists/${selectedListId}/add-destination`,
        { destinationId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setSuccess("Destination added successfully!");
      setError("");
      setSelectedListId("");
      onDestinationAdded(); // Trigger parent refresh
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add destination.");
      setSuccess("");
    }
  };

  return (
    <div>
      <select value={selectedListId} onChange={(e) => setSelectedListId(e.target.value)}>
        <option value="">Select a list</option>
        {lists.map((list) => (
          <option key={list._id} value={list._id}>
            {list.name}
          </option>
        ))}
      </select>
      <button onClick={handleAddDestination}>Add to List</button>
      {success && <p style={{ color: "green" }}>{success}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default AddToListButton;
