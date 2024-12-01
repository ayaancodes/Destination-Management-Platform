import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/ListDetailsPage.css";

const ListDetailsPage = () => {
    const { id } = useParams(); // Get the list ID from the route parameter
    const navigate = useNavigate(); // Navigation hook
    const [listDetails, setListDetails] = useState(null); // Store list details
    const [reviews, setReviews] = useState([]); // Store reviews
    const [newReview, setNewReview] = useState(""); // New review comment
    const [newRating, setNewRating] = useState(1); // New review rating
    const [error, setError] = useState(""); // Error state
    const [success, setSuccess] = useState(""); // Success state
    const [loading, setLoading] = useState(false); // Loading state

    useEffect(() => {
        fetchListDetails();
        fetchReviews();
    }, [id]);

    // Fetch list details
    const fetchListDetails = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:3000/api/lists/${id}`);
            setListDetails(response.data || {});
            setError("");
        } catch (err) {
            setError(err.response?.data?.error || "Failed to fetch list details.");
        } finally {
            setLoading(false);
        }
    };

    // Fetch reviews for the list
    const fetchReviews = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/api/lists/${id}/reviews`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            const fetchedReviews = response.data.reviews || [];
            setReviews(fetchedReviews);
            setError("");

            // Calculate average rating
            if (fetchedReviews.length > 0) {
                const totalRating = fetchedReviews.reduce((sum, review) => sum + (review.rating || 0), 0);
                const averageRating = (totalRating / fetchedReviews.length).toFixed(1); // One decimal place

                // Update listDetails with calculated average rating
                setListDetails((prevDetails) => ({
                    ...prevDetails,
                    averageRating,
                }));
            }
        } catch (err) {
            setError(err.response?.data?.error || "Failed to fetch reviews.");
        }
    };

    // Add a new review
    const addReview = async () => {
        if (!newReview.trim()) {
            setError("Review comment cannot be empty.");
            return;
        }
        try {
            await axios.post(
                `http://localhost:3000/api/lists/${id}/review`,
                { comment: newReview, rating: newRating },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }
            );
            setSuccess("Review added successfully!");
            setError("");
            setNewReview(""); // Clear the review input
            setNewRating(1); // Reset the rating
            fetchReviews(); // Refresh the reviews
        } catch (err) {
            setError(err.response?.data?.error || "Failed to add the review.");
        }
    };

    // Delete the list
    const deleteList = async () => {
        const confirmed = window.confirm("Are you sure you want to delete this list?");
        if (!confirmed) {
            return; // Exit if confirmation is declined
        }

        try {
            await axios.delete(`http://localhost:3000/api/lists/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            alert("List deleted successfully.");
            navigate("/dashboard"); // Navigate back to dashboard
        } catch (err) {
            setError(err.response?.data?.error || "Failed to delete the list.");
        }
    };

    return (
        <div className="list-details-container">
            <header>
                <h1>List Details</h1>
                <button onClick={() => navigate(`/dashboard`)}>Back to Searching</button>
                {listDetails && (
                    <button onClick={deleteList} className="delete-button">
                        Delete List
                    </button>
                )}
            </header>

            <main>
                {loading && <p>Loading list details...</p>}
                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}

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
                            <strong>Average Rating:</strong>{" "}
                            {listDetails.averageRating !== undefined ? listDetails.averageRating : "N/A"}
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

                {/* Reviews Section */}
                {reviews.length > 0 && (
                    <section className="reviews-section">
                        <h3>User Reviews</h3>
                        <ul>
                            {reviews.map((review, index) => (
                                <li key={index} className="review-card">
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
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* Message if there are no reviews */}
                {reviews.length === 0 && <p>No reviews available for this list.</p>}

                {/* Add Review Section */}
                <section className="add-review-section">
                    <h3>Add a Review</h3>
                    <label>
                        Rating:
                        <select value={newRating} onChange={(e) => setNewRating(parseInt(e.target.value, 10))}>
                            {[1, 2, 3, 4, 5].map((rating) => (
                                <option key={rating} value={rating}>
                                    {rating}
                                </option>
                            ))}
                        </select>
                    </label>
                    <br />
                    <label>
                        Comment:
                        <textarea
                            value={newReview}
                            onChange={(e) => setNewReview(e.target.value)}
                            placeholder="Enter your review here"
                        />
                    </label>
                    <br />
                    <button onClick={addReview}>Submit Review</button>
                </section>
            </main>
        </div>
    );
};

export default ListDetailsPage;
