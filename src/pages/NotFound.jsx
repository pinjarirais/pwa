import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-950 to-indigo-950 flex items-center justify-center p-4">
    <div className="text-center">
      <h1 className="text-9xl font-bold text-white/10">404</h1>
      <h2 className="text-3xl font-bold text-white mt-4">Page Not Found</h2>
      <p className="text-blue-300 mt-2">The page you're looking for doesn't exist.</p>
      <Link to="/dashboard" className="inline-block mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors">
        Back to Dashboard
      </Link>
    </div>
  </div>
);

export default NotFound;
