import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error('Invalid credentials');

      const data = await res.json(); 
      if(!data.success) throw new Error(data.message || 'Login failed');
      sessionStorage.setItem('userId', JSON.stringify({ id: data.data.userId, name: data.data.name }));

      alert('Login successful!');
      navigate('/chat');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full p-2 border" required />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full p-2 border" required />
        <button type="submit" className="w-full p-2 bg-blue-500 text-white">Login</button>
      </form>
      <p className="mt-2 text-sm">
        Don't have an account? <a href="/signup" className="text-blue-500">Signup</a>
      </p>
    </div>
  );
};

export default Login;
