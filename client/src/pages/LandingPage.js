import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LandingPage.css";
import axios from "axios";
import { Link } from "react-router-dom";


const LandingPage = () => {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({ email: "", password: "", nickname: "" });
  const [authError, setAuthError] = useState("");
  const [verificationLink, setVerificationLink] = useState("");
  const [signupVerificationLink, setSignupVerificationLink] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e, isSignup = false) => {
    const { name, value } = e.target;
    if (isSignup) {
      setSignupData({ ...signupData, [name]: value });
    } else {
      setLoginData({ ...loginData, [name]: value });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/api/open/login", loginData);
      localStorage.setItem("token", response.data.token);

      // Fetch user details to determine role
      const userResponse = await axios.get("http://localhost:3000/api/me", {
        headers: { Authorization: `Bearer ${response.data.token}` },
      });

      // Redirect based on user role
      if (userResponse.data.role === "admin") {
        navigate("/adminview");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      if (error.response?.status === 403) {
        const data = error.response.data;
        setAuthError(data.error);
        if (data.verificationLink) {
          setVerificationLink(data.verificationLink);
        }
      } else {
        setAuthError(error.response?.data?.error || "Login failed.");
      }
    }
  };


  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/api/open/register", signupData);
      setSignupVerificationLink(response.data.verificationLink);
      setAuthError("");
    } catch (error) {
      setAuthError(error.response?.data?.error || "Signup failed.");
    }
  };

  const handleEmailVerification = async (token) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/verify-email/${token}`);
      setEmailVerified(true);
      alert(response.data.message);
    } catch (error) {
      setAuthError(error.response?.data?.error || "Email verification failed.");
    }
  };

  return (
    <div className="landing-page-container">
      <header className="hero">
        <h1>Welcome to Destination App</h1>
        <p>Discover amazing places, create lists, and plan your travels!</p>
        <button onClick={() => navigate("/home")} className="btn-visit">
          Explore Destinations Without Signing In!
        </button>
      </header>

      <main className="content">
        <section className="form-section">
          <div className="form-card">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={loginData.email}
                onChange={(e) => handleInputChange(e)}
                className="input-field"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={loginData.password}
                onChange={(e) => handleInputChange(e)}
                className="input-field"
                required
              />
              <button type="submit" className="btn-primary">Login</button>
            </form>

            {verificationLink && (
              <div className="verification-section">
                <p>Your email is not verified. Please verify it to continue.</p>
                <button onClick={() => handleEmailVerification(verificationLink.split("/").pop())} className="btn-secondary">
                  Verify Email
                </button>
              </div>
            )}
          </div>

          <div className="form-card">
            <h2>Signup</h2>
            <form onSubmit={handleSignup}>
              <input
                type="text"
                name="nickname"
                placeholder="Nickname"
                value={signupData.nickname}
                onChange={(e) => handleInputChange(e, true)}
                className="input-field"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={signupData.email}
                onChange={(e) => handleInputChange(e, true)}
                className="input-field"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={signupData.password}
                onChange={(e) => handleInputChange(e, true)}
                className="input-field"
                required
              />
              <button type="submit" className="btn-primary">Signup</button>
            </form>

            {signupVerificationLink && (
              <div className="verification-section">
                <p>A verification link has been sent to your email.</p>
                <button onClick={() => handleEmailVerification(signupVerificationLink.split("/").pop())} className="btn-secondary">
                  Verify Email
                </button>
              </div>
            )}
          </div>
        </section>

        {emailVerified && <p className="success-message">Email verified successfully! You can now log in.</p>}
        {authError && <p className="error-message">{authError}</p>}

        <footer className="footer">
          <Link to="/privacy-policy" className="footer-link">Privacy Policy</Link>
          <Link to="/dmca-policy" className="footer-link">DMCA Notice</Link>
          <Link to="/acceptable-use-policy" className="footer-link">Acceptable Use Policy</Link>

        </footer>
      </main>
    </div>
  );
};

export default LandingPage;
