import React, { useState } from "react";
import axios from "axios";
import AddToListButton from "./AddToListButton";

const SearchDestinations = ({ lists, onDestinationAdded }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/destinations/search?query=${searchQuery}`);
      setResults(response.data.results || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to search destinations.");
    }
  };

  return (
    <div>
      <h2>Search Destinations</h2>
      <input
        type="text"
        placeholder="Search destinations"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {results.map((destination) => (
          <li key={destination._id}>
            <h3>{destination.name} ({destination.country})</h3>
            <p>{destination.description}</p>
            <AddToListButton
              destinationId={destination._id}
              lists={lists}
              onDestinationAdded={onDestinationAdded}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchDestinations;
