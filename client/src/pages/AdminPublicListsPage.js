import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/AdminPublicListsPage.css";

const AdminPublicListsPage = () => {
  const [publicLists, setPublicLists] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchPublicLists();
  }, []);

  // Fetch all public lists and their reviews
  const fetchPublicLists = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3000/api/admin/public-lists", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPublicLists(response.data.lists || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch public lists.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle review visibility
  const toggleReviewVisibility = async (listId, reviewId, hiddenStatus) => {
    try {
      await axios.put(
        `http://localhost:3000/api/admin/reviews/${reviewId}/hide`,
        { hidden: hiddenStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setSuccess(`Review successfully ${hiddenStatus ? "hidden" : "unhidden"}.`);
      fetchPublicLists(); // Refresh public lists
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update review visibility.");
    }
  };

  return (
    <div className="admin-public-lists-container">
      <header>
        <h1>Admin Public Lists</h1>
        <p>Manage public lists and reviews.</p>
      </header>

      <main>
        {loading && <p>Loading public lists...</p>}
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        {publicLists.length > 0 ? (
          publicLists.map((list) => (
            <div key={list._id} className="public-list-card">
              <h2>{list.name}</h2>
              <p>
                <strong>Description:</strong> {list.description || "No description provided."}
              </p>
              <p>
                <strong>Average Rating:</strong> {list.averageRating || "N/A"}
              </p>
              <h3>Reviews</h3>
              <ul>
                {list.reviews.length > 0 ? (
                  list.reviews.map((review) => (
                    <li key={review._id} className={`review-card ${review.hidden ? "hidden" : ""}`}>
                      <p>
                        <strong>{review.userId?.nickname || "Anonymous"}</strong> -{" "}
                        <span>{new Date(review.createdAt).toLocaleString()}</span>
                      </p>
                      <p>
                        <strong>Rating:</strong> {review.rating}/5
                      </p>
                      <p>
                        <strong>Comment:</strong> {review.comment}
                      </p>
                      <button
                        onClick={() =>
                          toggleReviewVisibility(list._id, review._id, !review.hidden)
                        }
                      >
                        {review.hidden ? "Unhide" : "Hide"}
                      </button>
                    </li>
                  ))
                ) : (
                  <p>No reviews available for this list.</p>
                )}
              </ul>
            </div>
          ))
        ) : (
          <p>No public lists found.</p>
        )}
      </main>
    </div>
  );
};

export default AdminPublicListsPage;
