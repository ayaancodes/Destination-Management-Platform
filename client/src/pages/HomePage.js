import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomePage.css";
import axios from "axios";

const HomePage = () => {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ email: "", password: "", nickname: "" });
  const [authError, setAuthError] = useState("");
  const [verificationLink, setVerificationLink] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const navigate = useNavigate();

  // Handle input changes
  const handleInputChange = (e, isSignup = false) => {
    const { name, value } = e.target;
    if (isSignup) {
      setSignupData({ ...signupData, [name]: value });
    } else {
      setLoginData({ ...loginData, [name]: value });
    }
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/api/open/login", loginData);
      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
    } catch (error) {
      setAuthError(error.response?.data?.error || "Login failed.");
    }
  };

  // Handle signup
  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/api/open/register", signupData);
      setVerificationLink(response.data.verificationLink); // Store the verification link
      setAuthError("");
    } catch (error) {
      setAuthError(error.response?.data?.error || "Signup failed.");
    }
  };

  // Handle email verification
  const handleEmailVerification = async () => {
    try {
      const token = verificationLink.split("/").pop(); // Extract token from the link
      const response = await axios.get(`http://localhost:3000/api/verify-email/${token}`);
      setEmailVerified(true); // Set the email as verified
      alert(response.data.message); // Notify the user
    } catch (error) {
      setAuthError(error.response?.data?.error || "Email verification failed.");
    }
  };

  return (
    <div className="homepage-container">
      <header>
        <h1>Welcome to Destination App</h1>
        <nav>
          <button onClick={() => navigate("/search")}>Search Destinations</button>
          <button onClick={() => navigate("/lists")}>View Public Lists</button>
        </nav>
      </header>

      <main>
        <section className="login-section">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={loginData.email}
              onChange={(e) => handleInputChange(e)}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={loginData.password}
              onChange={(e) => handleInputChange(e)}
              required
            />
            <button type="submit">Login</button>
          </form>
        </section>

        <section className="signup-section">
          <h2>Signup</h2>
          <form onSubmit={handleSignup}>
            <input
              type="text"
              name="nickname"
              placeholder="Nickname"
              value={signupData.nickname}
              onChange={(e) => handleInputChange(e, true)}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={signupData.email}
              onChange={(e) => handleInputChange(e, true)}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={signupData.password}
              onChange={(e) => handleInputChange(e, true)}
              required
            />
            <button type="submit">Signup</button>
          </form>

          {verificationLink && (
            <div className="verification-section">
              <p>A verification link has been sent to your email.</p>
              <button onClick={handleEmailVerification}>Verify Email</button>
            </div>
          )}
        </section>

        {emailVerified && <p>Email verified successfully! You can now log in.</p>}
        {authError && <p className="error">{authError}</p>}
      </main>
    </div>
  );
};

export default HomePage;
