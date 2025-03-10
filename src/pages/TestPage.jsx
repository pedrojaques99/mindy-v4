import { Helmet } from 'react-helmet-async';
import SupabaseConnectionTest from '../components/SupabaseConnectionTest';

const TestPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Supabase Connection Test | MINDY</title>
      </Helmet>
      
      <SupabaseConnectionTest />
    </div>
  );
};

export default TestPage; 