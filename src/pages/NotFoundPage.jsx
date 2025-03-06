import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="text-9xl font-bold text-lime-accent mb-4">404</div>
      <h1 className="text-3xl font-bold mb-6">Page Not Found</h1>
      <p className="text-white/70 text-lg mb-8 text-center max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary">
        Back to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
