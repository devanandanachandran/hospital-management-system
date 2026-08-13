import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Stethoscope } from 'lucide-react';
import API from '../api/axios';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await API.post('/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate(`/${res.data.user.role}-dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden bg-brand-50">
      {/* animated gradient blobs */}
      <div className="absolute w-[420px] h-[420px] rounded-full blur-3xl opacity-50 bg-brand-600 -top-32 -left-24 animate-blob" />
      <div className="absolute w-[380px] h-[380px] rounded-full blur-3xl opacity-50 bg-[#6A4C93] -bottom-36 -right-20 animate-blob" style={{ animationDelay: '-4s' }} />
      <div className="absolute w-[300px] h-[300px] rounded-full blur-3xl opacity-40 bg-accent-500 bottom-10 left-1/3 animate-blob" style={{ animationDelay: '-8s' }} />

      <div className="w-full max-w-sm relative z-10">
        <div className="bg-white/75 backdrop-blur-xl border border-white/60 rounded-[20px] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)] p-8 animate-rise">
          <div className="w-11 h-11 rounded-[13px] bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center mb-4">
            <Stethoscope className="text-white" size={22} />
          </div>
          <h1 className="text-xl font-semibold text-brand-900">Welcome back</h1>
          <p className="text-brand-500/80 text-sm mt-1 mb-6">Sign in to MediCare HMS</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-brand-700/80 mb-1.5 tracking-wide">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 border border-brand-200 rounded-[10px] text-sm bg-white/80 focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500 transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-700/80 mb-1.5 tracking-wide">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 border border-brand-200 rounded-[10px] text-sm bg-white/80 focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500 transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-br from-brand-600 to-brand-800 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0 text-white text-sm font-semibold py-3 rounded-[10px] transition-all shadow-[0_8px_20px_-8px_rgba(17,86,90,0.6)]"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-brand-600/70 mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-700 font-semibold hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
