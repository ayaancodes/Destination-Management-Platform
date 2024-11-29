import React, { useState } from "react";
import axios from "axios";
import Fuse from "fuse.js"; // Import Fuse.js
import "../styles/HomePage.css";

const Home = () => {
  const [searchField, setSearchField] = useState("country"); // Default search field
  const [searchTerm, setSearchTerm] = useState(""); // Search term
  const [searchResults, setSearchResults] = useState([]); // Store results
  const [filteredResults, setFilteredResults] = useState([]); // For fuzzy-matched results
  const [selectedDestination, setSelectedDestination] = useState(null); // For expanded details
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [displayLimit, setDisplayLimit] = useState(5); // Default number of destinations per page
  const [currentPage, setCurrentPage] = useState(1);

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

  // Fetch all destinations (no search term applied)
  const fetchAllDestinations = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3000/api/destinations");
      setSearchResults(response.data);
      setFilteredResults(response.data); // Show all results
      setError("");
      setCurrentPage(1); // Reset to the first page
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch destinations.");
      setLoading(false);
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

  // Handle destination details view
  const viewDetails = (destination) => {
    setSelectedDestination(destination);
  };

  const closeDetails = () => {
    setSelectedDestination(null);
  };

  return (
    <div className="home-container">
      <header>
        <h1>Discover Destinations</h1>
        <p>Search for amazing destinations worldwide and explore their details.</p>
      </header>

      <main>
        <section className="search-section">
          <h2>Search Destinations</h2>
          <div className="search-bar">
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
            >
              <option value="country">Country</option>
              <option value="city">City</option>
              <option value="name">Name</option>
            </select>
            <input
              type="text"
              placeholder="Enter search term"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>
          </div>
          <button onClick={fetchAllDestinations} className="view-all">
            View All Destinations
          </button>
        </section>

        {loading && <p>Loading destinations...</p>}
        {error && <p className="error">{error}</p>}

        <section className="results-section">
          {paginatedResults.map((destination) => (
            <div className="result-card" key={destination._id}>
              <h3>{destination.name}</h3>
              <p>{destination.country}</p>
              <button
                onClick={() =>
                  window.open(
                    `https://duckduckgo.com/?q=${encodeURIComponent(
                      destination.name + " " + destination.country
                    )}`,
                    "_blank"
                  )
                }
              >
                Search on DDG
              </button>
              <button onClick={() => viewDetails(destination)}>View Details</button>
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
            <button onClick={closeDetails}>Close</button>
          </section>
        )}
      </main>
    </div>
  );
};

export default Home;
