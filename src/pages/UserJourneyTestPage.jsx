import { Helmet } from 'react-helmet-async';
import UserJourneyTest from '../components/UserJourneyTest';

const UserJourneyTestPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>User Journey Test | MINDY</title>
      </Helmet>
      
      <UserJourneyTest />
    </div>
  );
};

export default UserJourneyTestPage; 