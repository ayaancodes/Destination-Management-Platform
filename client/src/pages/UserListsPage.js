import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserListsPage = () => {
  const [userLists, setUserLists] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchUserLists = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3000/api/lists/my-lists", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUserLists(response.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch user lists.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserLists();
  }, []);

  return (
    <div>
      <h1>Your Lists</h1>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      <ul>
        {userLists.map((list) => (
          <li key={list._id}>
            <h2>{list.name}</h2>
            <p>{list.description}</p>
            <button onClick={() => navigate(`/lists/${list._id}`)}>View Details</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserListsPage;
