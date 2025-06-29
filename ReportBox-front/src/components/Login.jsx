// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// const Login = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password }),
//       });

//       if (!res.ok) throw new Error('Invalid credentials');

//       const data = await res.json(); 
//       if(!data.success) throw new Error(data.message || 'Login failed');
//       sessionStorage.setItem('userId', JSON.stringify({ id: data.data.userId, name: data.data.name }));

//       alert('Login successful!');
//       navigate('/');
//     } catch (err) {
//       alert(err.message);
//     }
//   };

//   return (
//     <div className="p-4 max-w-md mx-auto">
//       <h2 className="text-2xl font-bold mb-4">Login</h2>
//       <form onSubmit={handleLogin} className="space-y-4">
//         <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full p-2 border" required />
//         <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full p-2 border" required />
//         <button type="submit" className="w-full p-2 bg-blue-500 text-white">Login</button>
//       </form>
//       <p className="mt-2 text-sm">
//         Don't have an account? <a href="/signup" className="text-blue-500">Signup</a>
//       </p>
//     </div>
//   );
// };

// export default Login;

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
      navigate('/'); 
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">SEVAK</h1>
            <h2 className="text-xl font-semibold text-blue-200 mb-1">Welcome Back</h2>
            <p className="text-slate-300 text-sm">Sign in to access your account</p>
          </div>
          
          <div onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-200">Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all" 
                placeholder="Enter your email"
                required 
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-200">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all" 
                placeholder="Enter your password"
                required 
              />
            </div>
            
            <button 
              type="button" 
              onClick={handleLogin}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Sign In
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-slate-300 text-sm">
              Don't have an account? 
              <a href="/signup" className="text-blue-300 hover:text-blue-200 font-medium ml-1 transition-colors">
                Create Account
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;