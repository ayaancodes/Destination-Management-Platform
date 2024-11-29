import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/PublicListsPage.css";

const PublicListsPage = () => {
  const [publicLists, setPublicLists] = useState([]); // Store public lists
  const [error, setError] = useState(""); // Error state
  const [loading, setLoading] = useState(false); // Loading state

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate(); // Navigation hook

  // Fetch public lists
  const fetchPublicLists = async (page = 1) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3000/api/lists/public-lists?page=${page}`
      );
      setPublicLists(response.data.lists || []); // Ensure it's always an array
      setCurrentPage(response.data.currentPage || 1);
      setTotalPages(response.data.totalPages || 1);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch public lists.");
      setPublicLists([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchPublicLists();
  }, []);

  // Pagination controls
  const handleNextPage = () => {
    if (currentPage < totalPages) fetchPublicLists(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) fetchPublicLists(currentPage - 1);
  };

  return (
    <div className="public-lists-container">
      <header>
        <h1>Public Destination Lists</h1>
        <p>Explore curated lists of destinations shared by other users.</p>
      </header>

      <main>
        {loading && <p>Loading public lists...</p>}
        {error && <p className="error">{error}</p>}

        <section className="lists-section">
          {publicLists && publicLists.length > 0 ? (
            publicLists.map((list) => (
              <div className="list-card" key={list._id}>
                <h3>{list.name}</h3>
                <p>
                  <strong>Created by:</strong> {list.userId?.nickname || "Anonymous"}
                </p>
                <p>
                  <strong>Destinations:</strong> {list.destinationIds?.length || 0}
                </p>

                <p>
                  <strong>Average Rating:</strong> {list.averageRating || "N/A"}
                </p>
                <button onClick={() => navigate(`/lists/${list._id}`)}>
                  View Details
                </button>
              </div>
            ))
          ) : (
            <p>No public lists available.</p>
          )}
        </section>

        {publicLists.length > 0 && (
          <div className="pagination-controls">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="btn-prev"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="btn-next"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default PublicListsPage;
