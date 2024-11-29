import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <header className="hero">
        <h1>Destination App</h1>
        <p>
          Welcome to the Destination App! Plan your adventures, discover unique
          places, and share your experiences with others. Explore destinations,
          create and browse public lists, and plan your next trip effortlessly.
        </p>
        <div className="action-buttons">
          <button onClick={() => navigate("/")} className="btn-primary">
            Login
          </button>
          <button onClick={() => navigate("/")} className="btn-secondary">
            Signup
          </button>
        </div>
      </header>

      <section className="features-section">
        <h2>Why Choose Destination App?</h2>
        <ul>
          <li>Discover amazing destinations around the globe.</li>
          <li>Create public lists to share your favorite spots.</li>
          <li>Plan trips with ease using our user-friendly tools.</li>
        </ul>
      </section>
    </div>
  );
};

export default Home;
