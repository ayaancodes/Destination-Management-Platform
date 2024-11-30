import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/ListDetailsPage.css";

const ListDetailsPage = () => {
    const { id } = useParams(); // Get the list ID from the route parameter
    const navigate = useNavigate(); // Navigation hook
    const [listDetails, setListDetails] = useState(null); // Store list details
    const [error, setError] = useState(""); // Error state
    const [loading, setLoading] = useState(false); // Loading state

    useEffect(() => {
        fetchListDetails();
    }, [id]);
    const fetchListDetails = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:3000/api/lists/${id}`);
            console.log(response.data); // Debugging
            setListDetails(response.data || {});
            setError("");
        } catch (err) {
            setError(err.response?.data?.error || "Failed to fetch list details.");
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="list-details-container">
            <header>
                <h1>List Details</h1>
                <button onClick={() => navigate("/lists")} className="back-button">
                    Back to Public Lists
                </button>
                <button onClick={() => navigate(`/lists/${listDetails._id}/add-destination`)}>
                    Add Destinations
                </button>

            </header>

            <main>
                {loading && <p>Loading list details...</p>}
                {error && <p className="error">{error}</p>}

                {listDetails && (
                    <section className="expanded-list-section">
                        <h2>{listDetails.name}</h2>
                        <p>
                            <strong>Created by:</strong> {listDetails.userId?.nickname || "Anonymous"}
                        </p>
                        <p>
                            <strong>Description:</strong> {listDetails.description || "No description provided."}
                        </p>
                        <p>
                            <strong>Average Rating:</strong> {listDetails.averageRating || "N/A"}
                        </p>
                        <h3>Destinations</h3>
                        <ul>
                            {listDetails.destinationIds && listDetails.destinationIds.length > 0 ? (
                                listDetails.destinationIds.map((destination) => (
                                    <li key={destination._id}>
                                        <strong>{destination.name}</strong> - {destination.country}
                                    </li>
                                ))
                            ) : (
                                <p>No destinations available.</p>
                            )}
                        </ul>



                    </section>
                )}
            </main>
        </div>
    );
};

export default ListDetailsPage;
