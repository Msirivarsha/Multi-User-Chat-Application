// src/pages/Login.js

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./button.css";
import SignupForm from "./SignupForm"; // Import SignupForm
import axios from "axios";
import logo from '../assets/logo.jpeg';  // Adjust path according to your folder structure

export const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSignup, setIsSignup] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem("chat-username");
    if (storedUsername) {
      navigate("/chat");
    }
  }, [navigate]);

  const handleLogin = async () => {
    try {
      setError("");

      if (username && password) {
        const response = await axios.post(
          "http://localhost:8080/api/users/login",
          {
            username,
            password,
          }
        );

        if (response.status === 200) {
          localStorage.setItem("chat-username", username);
          navigate("/chat");
        }
      } else {
        setError("Please enter both username and password.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      if (error.response && error.response.status === 401) {
        setError("Invalid username or password.");
      } else if (error.response && error.response.status === 404) {
        setError("User not found.");
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  };

  const handleSignupSuccess = (newUsername) => {
    localStorage.setItem("chat-username", newUsername);
    navigate("/chat");
  };

  return (
    <div className="flex items-center flex-col justify-center h-screen bg-blue-300">
      {error && <div className="text-red-500 mb-2 font-semibold">{error}</div>}
      {isSignup ? (
        <SignupForm onSignupSuccess={handleSignupSuccess} />
      ) : (
        <div
          className={`flex border-2 flex-col items-center justify-center w-1/4 p-4 bg-white bg-opacity-50 rounded-lg gap-2 ${
            error ? "border-red-500" : "border-gray-300"
          }`}
        >
          <form>
            <div className="flex justify-center mb-4">
          <img
              src={logo}
              alt="Logo"
              className="mb-4" // Add margin bottom to space it out from the username input
            />
            </div>
            {/* <h1 className="text-dark-blue text-4xl font-poppins mb-6 text-center">
  RIS Chats
</h1> */}
          <h1
  style={{
    color: "#1e3a8a",
    fontSize: "2.25rem",
    fontFamily: "'Poppins', sans-serif",
    textAlign: "center",
    marginBottom: "1.5rem",
    textShadow: "2px 2px 5px rgba(0, 0, 0, 0.3)",
    fontWeight: "bold",
    textTransform: "uppercase",
  }}
>
  RIS Chats
</h1>
          

            <input
              type="text"
              className="rounded-lg border border-gray-300 p-2 w-full text-center outline-blue-600"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyUp={(e) => {
                if (e.key === "Enter" || e.key === 13) handleLogin();
              }}
            />
            <input
              type="password"
              className="rounded-lg border border-gray-300 p-2 w-full text-center outline-blue-600"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyUp={(e) => {
                if (e.key === "Enter" || e.key === 13) handleLogin();
              }}
            />
            <div className="flex justify-center">
            <button
  type="button"
  className="bg-blue-500 text-white rounded-lg px-4 py-2 mt-2 hover:bg-blue-600"
  onClick={handleLogin}
>
  <span>Login</span>
</button>
</div>

            {/* <button
              type="button"
              className="text-blue-500 underline mt-4"
              onClick={() => setIsSignup(true)}
            >
              Don&apos;t have an account? Sign up
            </button> */}
            <div className="flex justify-center">
  <button
    type="button"
    className="bg-blue-500 text-white px-4 py-2 rounded mt-4 hover:bg-blue-600"
    onClick={() => setIsSignup(true)}
  >
    Sign Up
  </button>
</div>

          </form>
        </div>
      )}
    </div>
  );
};

export default Login;