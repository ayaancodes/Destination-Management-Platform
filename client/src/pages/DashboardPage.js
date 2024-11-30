import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Fuse from "fuse.js";
import "../styles/HomePage.css"; // Use existing styles

const DashboardPage = () => {
  const [searchField, setSearchField] = useState("country"); // Search by country, city, or name
  const [searchTerm, setSearchTerm] = useState(""); // Search term
  const [searchResults, setSearchResults] = useState([]); // All fetched destinations
  const [filteredResults, setFilteredResults] = useState([]); // Filtered destinations (fuzzy search)
  const [selectedDestination, setSelectedDestination] = useState(null); // Destination to add
  const [userLists, setUserLists] = useState([]); // User's lists
  const [error, setError] = useState(""); // Error message
  const [success, setSuccess] = useState(""); // Success message
  const [loading, setLoading] = useState(false); // Loading state

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

  // Handle search functionality
  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3000/api/destinations");
      const data = response.data;

      const fuse = new Fuse(data, {
        keys: [searchField],
        threshold: 0.4,
      });
      const results = fuse.search(searchTerm).map((res) => res.item);

      setSearchResults(data);
      setFilteredResults(results);
      setError(results.length ? "" : "No destinations found.");
    } catch (err) {
      setError(err.response?.data?.error || "Search failed.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all destinations
  const fetchAllDestinations = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3000/api/destinations");
      setSearchResults(response.data);
      setFilteredResults(response.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch destinations.");
    } finally {
      setLoading(false);
    }
  };

  // Add destination to a user's list
  const addDestinationToList = async (listId) => {
    if (!selectedDestination) {
      setError("Please select a destination to add.");
      return;
    }
    try {
      const response = await axios.post(
        `http://localhost:3000/api/lists/${listId}/add-destination`,
        { destinationId: selectedDestination._id },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setSuccess(`Destination "${selectedDestination.name}" added to list "${response.data.list.name}".`);
      setError("");
      fetchUserLists(); // Refresh lists
      setSelectedDestination(null); // Clear selected destination
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add destination.");
    }
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
        {/* Search Destinations Section */}
        <section className="search-section">
          <h2>Search Destinations</h2>
          <div className="search-bar">
            <select value={searchField} onChange={(e) => setSearchField(e.target.value)}>
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
        {success && <p className="success">{success}</p>}

        {/* Search Results Section */}
        <section className="results-section">
          <h2>Search Results</h2>
          {filteredResults.map((destination) => (
            <div
              className={`result-card ${selectedDestination?._id === destination._id ? "selected" : ""}`}
              key={destination._id}
              onClick={() => setSelectedDestination(destination)}
            >
              <h3>{destination.name}</h3>
              <p>{destination.country}</p>
            </div>
          ))}
        </section>

        {/* Add to List Section */}
        {selectedDestination && (
          <section className="add-to-list-section">
            <h3>Add "{selectedDestination.name}" to a List</h3>
            <select defaultValue="" onChange={(e) => addDestinationToList(e.target.value)}>
              <option value="" disabled>
                Select a list
              </option>
              {userLists.map((list) => (
                <option key={list._id} value={list._id}>
                  {list.name}
                </option>
              ))}
            </select>
          </section>
        )}

        {/* User's Lists Section */}
        <section className="user-lists">
          <h2>Your Lists</h2>
          <button onClick={() => navigate("/create-list")} className="create-list-button">
            Create New List
          </button>
          {userLists.map((list) => (
            <div className="list-card" key={list._id}>
              <h3>{list.name}</h3>
              <p>{list.description}</p>
              <button onClick={() => navigate(`/lists/${list._id}`)}>View Details</button>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
