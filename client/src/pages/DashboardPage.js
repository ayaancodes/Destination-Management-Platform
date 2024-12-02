import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Fuse from "fuse.js";
import "../styles/HomePage.css";

const DashboardPage = () => {
  const [searchField, setSearchField] = useState("country"); // Default search field
  const [searchTerm, setSearchTerm] = useState(""); // Search term
  const [searchResults, setSearchResults] = useState([]); // Store results
  const [filteredResults, setFilteredResults] = useState([]); // For fuzzy-matched results
  const [userLists, setUserLists] = useState([]); // User's lists
  const [selectedDestination, setSelectedDestination] = useState(null); // Selected destination for details
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(""); // Success message
  const [selectedList, setSelectedList] = useState(null); // Selected list for "Add to List"

  // Pagination state
  const [displayLimit, setDisplayLimit] = useState(5); // Default number of destinations per page
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  // Fetch user's lists
  const fetchUserLists = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/lists/my-lists", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUserLists(response.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch your lists.");
    }
  };

  // Handle search requests
  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3000/api/destinations");
      const data = response.data;

      // Fuzzy search setup
      const options = {
        keys: [searchField], // Search by the selected field (country, city, name)
        threshold: 0.4, // Sensitivity: lower means stricter matching
      };

      const fuse = new Fuse(data, options);
      const results = fuse.search(searchTerm).map((result) => result.item);

      setSearchResults(data); // Save all results for pagination
      setFilteredResults(results); // Save fuzzy-matched results
      setError(results.length ? "" : "No matching destinations found.");
      setCurrentPage(1); // Reset to the first page
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || "Search failed.");
      setSearchResults([]);
      setFilteredResults([]);
      setLoading(false);
    }
  };

  // Add destination to a list
  const addToList = async (destinationId, listId) => {
    try {
      await axios.post(
        `http://localhost:3000/api/lists/${listId}/add-destination`,
        { destinationId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setSuccess("Destination added to the list successfully!");
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add destination to the list.");
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredResults.length / displayLimit);
  const startIndex = (currentPage - 1) * displayLimit;
  const paginatedResults = filteredResults.slice(startIndex, startIndex + displayLimit);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  useEffect(() => {
    fetchUserLists(); // Fetch user's lists on page load
  }, []);

  return (
    <div className="home-container">
      <header>
        <h1>Dashboard</h1>
        <p>Manage your lists and explore destinations.</p>
      </header>

      <main>
        {/* Display User Lists */}
        <section className="user-lists-section">
          <h2>Your Lists</h2>
          {userLists.length > 0 ? (
            <ul>
              {userLists.map((list) => (
                <li key={list._id}>
                  <a
                    href={`/lists/${list._id}`}
                    className="list-link"
                  >
                    {list.name}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>No lists found. Create a new one!</p>
          )}
        </section>
        <section className="create-list-section">
          <button
            className="create-list-button"
            onClick={() => navigate("/create-list")}
          >
            Create New List
          </button>


        </section>


        {/* Search Destinations Section */}
        <section className="search-section">
          <h2>Search Destinations</h2>
          <div className="search-bar">
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
            >
              <option value="country">Country</option>
              <option value="city">Name</option>
              <option value="name">City</option>
            </select>
            <input
              type="text"
              placeholder="Enter search term"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>
          </div>
        </section>

        {loading && <p>Loading destinations...</p>}
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <section className="results-section">
          {paginatedResults.map((destination) => (
            <div className="result-card" key={destination._id}>
              <h3>{destination.name}</h3>
              <p>{destination.country}</p>
              <button onClick={() => setSelectedDestination(destination)}>View Details</button>
              <select
                onChange={(e) => setSelectedList(e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>
                  Add to List
                </option>
                {userLists.map((list) => (
                  <option key={list._id} value={list._id}>
                    {list.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => addToList(destination._id, selectedList)}
                disabled={!selectedList}
              >
                Add
              </button>
              <button
                className="ddg-search-button"
                onClick={() =>
                  window.open(
                    `https://duckduckgo.com/?q=${encodeURIComponent(destination.name)}`,
                    "_blank"
                  )
                }
              >
                Search on DDG
              </button>
            </div>
          ))}
        </section>

        {filteredResults.length > 0 && (
          <div className="pagination-controls">
            <label htmlFor="display-limit">Results per page: </label>
            <select
              id="display-limit"
              value={displayLimit}
              onChange={(e) => setDisplayLimit(Number(e.target.value))}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
            </select>
            <div className="pagination-buttons">
              <button onClick={handlePrevPage} disabled={currentPage === 1}>
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                Next
              </button>
            </div>
          </div>
        )}

        {selectedDestination && (
          <section className="details-section">
            <h2>{selectedDestination.name}</h2>
            <p>
              <strong>Country:</strong> {selectedDestination.country}
            </p>
            <p>
              <strong>Coordinates:</strong> {selectedDestination.latitude},{" "}
              {selectedDestination.longitude}
            </p>
            <button onClick={() => setSelectedDestination(null)}>Close</button>
          </section>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
