import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(`${data.message || 'Signup failed'}`);
      alert('Signup successful, please log in');
      navigate('/login'); 
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
            <h2 className="text-xl font-semibold text-blue-200 mb-1">Create Account</h2>
            <p className="text-slate-300 text-sm">Join us to access legal services</p>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-200">Full Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all" 
                placeholder="Enter your full name"
                required 
              />
            </div>
            
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
                placeholder="Create a password"
                required 
              />
            </div>
            
            <button 
              type="button" 
              onClick={handleSignup}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Create Account
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-slate-300 text-sm">
              Already have an account? 
              <a href="/login" className="text-blue-300 hover:text-blue-200 font-medium ml-1 transition-colors">
                Sign In
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;