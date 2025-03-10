import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const NotFoundPage = () => {
  const { t } = useLanguage();
  
  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="text-9xl font-bold text-lime-accent mb-4">404</div>
      <h1 className="text-3xl font-bold mb-6">{t('errors.pageNotFound', 'Page Not Found')}</h1>
      <p className="text-white/70 text-lg mb-8 text-center max-w-md">
        {t('errors.pageNotFoundDesc', "The page you're looking for doesn't exist or has been moved.")}
      </p>
      <Link to="/" className="btn btn-primary">
        {t('common.backToHome', 'Back to Home')}
      </Link>
    </div>
  );
};

export default NotFoundPage;
