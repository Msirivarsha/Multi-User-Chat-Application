import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:8080/api/users/login', {
        username,
        password
      }, {
        headers: {
          'Content-Type': 'application/json',  // Ensure JSON content type is sent
        }
      });

      if (response.data === "Login successful!") {
        alert('Login successful!');
        navigate('/chat');  // Navigate to chat page on success
      } else {
        alert('Invalid username or password!');
      }
    } catch (err) {
      alert('Login failed!');
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
