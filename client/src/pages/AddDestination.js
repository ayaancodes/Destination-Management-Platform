import React, { useState } from "react";
import axios from "axios";

const AddDestination = ({ list, onDestinationAdded }) => {
  const [destinationId, setDestinationId] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleAddDestination = async () => {
    try {
      await axios.post(
        `http://localhost:3000/api/lists/${list._id}/add-destination`,
        { destinationId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setSuccess("Destination added successfully!");
      setError("");
      setDestinationId("");
      onDestinationAdded();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add destination.");
      setSuccess("");
    }
  };

  return (
    <div>
      <h3>Add Destination to "{list.name}"</h3>
      <input
        type="text"
        placeholder="Destination ID"
        value={destinationId}
        onChange={(e) => setDestinationId(e.target.value)}
      />
      <button onClick={handleAddDestination}>Add Destination</button>
      {success && <p style={{ color: "green" }}>{success}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default AddDestination;
