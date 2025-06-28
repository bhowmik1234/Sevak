import { useNavigate } from 'react-router-dom';
import { ArrowLeftCircle } from 'lucide-react';

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-6xl font-bold text-white mb-4">404</h1>
      <p className="text-2xl text-slate-300 mb-6">Oops! Page not found</p>
      <p className="text-slate-400 mb-10 max-w-lg">
        The page you're looking for doesn't exist or has been moved. Please check the URL or go back to the homepage.
      </p>
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-md"
      >
        <ArrowLeftCircle className="w-5 h-5" />
        Go Back Home
      </button>
    </div>
  );
};

export default ErrorPage;
