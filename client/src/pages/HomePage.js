import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomePage.css";
import axios from "axios";

const HomePage = () => {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ email: "", password: "", nickname: "" });
  const [authError, setAuthError] = useState("");
  const [verificationLink, setVerificationLink] = useState(""); // Verification link from login
  const [signupVerificationLink, setSignupVerificationLink] = useState(""); // For signup flow
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
      if (error.response?.status === 403) {
        const data = error.response.data;
        setAuthError(data.error);
        if (data.verificationLink) {
          setVerificationLink(data.verificationLink); // Store verification link for unverified users
        }
      } else {
        setAuthError(error.response?.data?.error || "Login failed.");
      }
    }
  };

  // Handle signup
  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/api/open/register", signupData);
      setSignupVerificationLink(response.data.verificationLink); // Store verification link for signup
      setAuthError("");
    } catch (error) {
      setAuthError(error.response?.data?.error || "Signup failed.");
    }
  };

  // Handle email verification
  const handleEmailVerification = async (token) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/verify-email/${token}`);
      setEmailVerified(true); // Set email as verified
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

          {verificationLink && (
            <div className="verification-section">
              <p>Your email is not verified. Please verify it to continue.</p>
              <button onClick={() => handleEmailVerification(verificationLink.split("/").pop())}>
                Verify Email
              </button>
            </div>
          )}
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

          {signupVerificationLink && (
            <div className="verification-section">
              <p>A verification link has been sent to your email.</p>
              <button onClick={() => handleEmailVerification(signupVerificationLink.split("/").pop())}>
                Verify Email
              </button>
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
