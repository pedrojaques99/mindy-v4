import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase, checkSupabaseConnection } from '../main';
import { ArrowLeftIcon, RefreshIcon, ServerIcon, DatabaseIcon, CheckCircleIcon, XCircleIcon, ExclamationIcon } from '@heroicons/react/outline';
import { useLanguage } from "../context/LanguageContext";

const StatusPage = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [supabaseStatus, setSupabaseStatus] = useState({
    status: 'checking',
    responseTime: null,
    tables: [],
    error: null,
    lastChecked: new Date()
  });
  
  const [serverStatus, setServerStatus] = useState({
    status: 'online',
    uptime: 0,
    memoryUsage: null,
    version: '1.0.0',
    lastChecked: new Date()
  });
  
  // Check server status
  const checkServerStatus = () => {
    // In a real app, you would make an API call to the server
    // Here we're just simulating server data
    const startTime = performance.now();
    
    setTimeout(() => {
      // Simulate successful server response
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      setServerStatus({
        status: 'online',
        uptime: Math.floor(Math.random() * 10) + 1, // Random hours for demo
        memoryUsage: `${Math.floor(Math.random() * 500) + 100}MB`,
        version: '1.0.0',
        responseTime: Math.round(responseTime),
        lastChecked: new Date()
      });
    }, 500);
  };
  
  // Check Supabase connection status
  const checkSupabaseStatus = async () => {
    setLoading(true);
    
    try {
      const startTime = performance.now();
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      );
      
      // Test query to see if Supabase is responding
      // We'll use our dummy query approach that works even if tables don't exist
      const queryPromise = supabase
        .from('_dummy_query_for_connection_test_')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      // Race the query against the timeout
      const result = await Promise.race([
        queryPromise,
        timeoutPromise
      ]);
      
      const { data, error } = result;
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      // If we get a "relation does not exist" error, that's actually good!
      // It means we connected to the database but the table doesn't exist
      if (error && error.code === '42P01') {
        console.log('Supabase connection successful (table does not exist)');
        
        // Check what tables we can access
        const tables = [];
        
        // Try to access known tables
        const tableChecks = await Promise.allSettled([
          supabase.from('profiles').select('count', { count: 'exact', head: true }),
          supabase.from('resources').select('count', { count: 'exact', head: true }),
          supabase.from('translations').select('count', { count: 'exact', head: true }),
          supabase.from('health_check').select('count', { count: 'exact', head: true })
        ]);
        
        // Process results
        const tableNames = ['profiles', 'resources', 'translations', 'health_check'];
        tableChecks.forEach((result, index) => {
          const tableName = tableNames[index];
          if (result.status === 'fulfilled') {
            const { data, error } = result.value;
            if (error) {
              if (error.code === '42P01') {
                tables.push({ name: tableName, rows: '0', status: 'not created' });
              } else {
                tables.push({ name: tableName, rows: '?', status: 'error', error: error.message });
              }
            } else {
              const rowCount = data && data.count !== undefined ? data.count : '?';
              tables.push({ name: tableName, rows: rowCount, status: 'accessible' });
            }
          } else {
            tables.push({ name: tableName, rows: '?', status: 'error', error: result.reason.message });
          }
        });
        
        setSupabaseStatus({
          status: 'online',
          error: null,
          responseTime: Math.round(responseTime),
          tables,
          lastChecked: new Date()
        });
      } else if (error) {
        console.error('Supabase query error:', error);
        setSupabaseStatus({
          status: 'offline',
          error: t('status.errors.supabaseQuery', 'Supabase query error: {error}', { error: error.message }),
          responseTime: Math.round(responseTime),
          tables: [],
          lastChecked: new Date()
        });
      } else {
        // If we somehow got a successful response from our dummy table, that's weird but okay
        setSupabaseStatus({
          status: 'online',
          error: null,
          responseTime: Math.round(responseTime),
          tables: [{ name: '_dummy_query_for_connection_test_', rows: '?', status: 'accessible' }],
          lastChecked: new Date()
        });
      }
    } catch (error) {
      console.error('Error checking Supabase status:', error);
      setSupabaseStatus({
        status: 'error',
        error: error.message || t('status.errors.connectionFailed', 'Connection failed'),
        responseTime: null,
        tables: [],
        lastChecked: new Date()
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Run checks on component mount
  useEffect(() => {
    const runChecks = async () => {
      checkServerStatus();
      await checkSupabaseStatus();
    };
    
    runChecks();
  }, []);
  
  // Format timestamp
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  
  const refreshStatus = async () => {
    setLoading(true);
    checkServerStatus();
    await checkSupabaseStatus();
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Link to="/" className="flex items-center text-white/60 hover:text-lime-accent transition-colors mr-4">
            <ArrowLeftIcon className="w-5 h-5 mr-1" />
            <span>{t('common.backToHome', 'Back to Home')}</span>
          </Link>
          <h1 className="text-2xl font-bold">{t('status.title', 'System Status')}</h1>
          
          <button 
            onClick={refreshStatus} 
            disabled={loading}
            className="ml-auto flex items-center px-4 py-2 bg-dark-300 rounded-md hover:bg-dark-400 transition-colors"
          >
            <RefreshIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {t('common.refresh', 'Refresh')}
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Server Status */}
          <div className="glass-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <ServerIcon className="w-6 h-6 mr-2 text-white/70" />
                <h2 className="text-xl font-medium">{t('status.server.title', 'Server Status')}</h2>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                serverStatus.status === 'online' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {t(`status.server.status.${serverStatus.status}`, serverStatus.status.toUpperCase())}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/60">{t('status.server.responseTime', 'Response Time')}:</span>
                <span>{serverStatus.responseTime ? `${serverStatus.responseTime}ms` : t('common.na', 'N/A')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">{t('status.server.uptime', 'Uptime')}:</span>
                <span>{t('status.server.uptimeValue', '{hours} hours', { hours: serverStatus.uptime })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">{t('status.server.memoryUsage', 'Memory Usage')}:</span>
                <span>{serverStatus.memoryUsage || t('common.na', 'N/A')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">{t('status.server.version', 'Version')}:</span>
                <span>{serverStatus.version}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/50">{t('status.lastChecked', 'Last Checked')}:</span>
                <span>{formatTime(serverStatus.lastChecked)}</span>
              </div>
            </div>
          </div>
          
          {/* Supabase Status */}
          <div className="glass-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <DatabaseIcon className="w-6 h-6 mr-2 text-white/70" />
                <h2 className="text-xl font-medium">{t('status.supabase.title', 'Supabase Status')}</h2>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                supabaseStatus.status === 'online' ? 'bg-green-500/20 text-green-400' :
                supabaseStatus.status === 'degraded' ? 'bg-yellow-500/20 text-yellow-400' :
                supabaseStatus.status === 'checking' ? 'bg-blue-500/20 text-blue-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {t(`status.supabase.status.${supabaseStatus.status}`, supabaseStatus.status.toUpperCase())}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/60">{t('status.supabase.responseTime', 'Response Time')}:</span>
                <span>{supabaseStatus.responseTime ? `${supabaseStatus.responseTime}ms` : t('common.na', 'N/A')}</span>
              </div>
              {supabaseStatus.error && (
                <div className="p-2 bg-red-500/10 rounded-md text-red-400 text-sm">
                  {t('status.errors.prefix', 'Error')}: {supabaseStatus.error}
                </div>
              )}
              <div className="flex justify-between text-xs">
                <span className="text-white/50">{t('status.lastChecked', 'Last Checked')}:</span>
                <span>{formatTime(supabaseStatus.lastChecked)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Database Tables */}
        {supabaseStatus.tables && supabaseStatus.tables.length > 0 && (
          <div className="glass-card p-6 mb-8">
            <h2 className="text-xl font-medium mb-4">{t('status.tables.title', 'Database Tables')}</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-300">
                    <th className="text-left py-2 px-4 text-white/70">{t('status.tables.name', 'Table Name')}</th>
                    <th className="text-left py-2 px-4 text-white/70">{t('status.tables.status', 'Status')}</th>
                    <th className="text-left py-2 px-4 text-white/70">{t('status.tables.rows', 'Rows')}</th>
                    <th className="text-left py-2 px-4 text-white/70">{t('status.tables.details', 'Details')}</th>
                  </tr>
                </thead>
                <tbody>
                  {supabaseStatus.tables.map((table, index) => (
                    <tr key={index} className="border-b border-dark-300/50">
                      <td className="py-2 px-4 font-mono text-sm">{table.name}</td>
                      <td className="py-2 px-4">
                        {table.status === 'accessible' && (
                          <span className="flex items-center text-green-400">
                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                            {t('status.tables.accessible', 'Accessible')}
                          </span>
                        )}
                        {table.status === 'not created' && (
                          <span className="flex items-center text-yellow-400">
                            <ExclamationIcon className="w-4 h-4 mr-1" />
                            {t('status.tables.notCreated', 'Not Created')}
                          </span>
                        )}
                        {table.status === 'error' && (
                          <span className="flex items-center text-red-400">
                            <XCircleIcon className="w-4 h-4 mr-1" />
                            {t('status.tables.error', 'Error')}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-4">{table.rows}</td>
                      <td className="py-2 px-4 text-sm text-white/60">
                        {table.error && (
                          <span className="text-red-400">{table.error}</span>
                        )}
                        {table.status === 'not created' && (
                          <span>{t('status.tables.needsSetup', 'Table needs to be created')}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 p-3 bg-dark-300/50 rounded-md text-sm">
              <p className="text-white/70 mb-2">{t('status.tables.setupInstructions', 'Database Setup Instructions:')}</p>
              <ol className="list-decimal list-inside space-y-1 text-white/60">
                <li>{t('status.tables.setupStep1', 'Go to the Test Page to set up the database')}</li>
                <li>{t('status.tables.setupStep2', 'Click on "Setup Database" button')}</li>
                <li>{t('status.tables.setupStep3', 'Refresh this page to see the updated status')}</li>
              </ol>
              <div className="mt-3">
                <Link 
                  to="/test-supabase" 
                  className="inline-flex items-center px-3 py-1 bg-lime-accent/20 text-lime-accent rounded-md hover:bg-lime-accent/30 transition-colors"
                >
                  {t('status.tables.goToTestPage', 'Go to Test Page')}
                </Link>
              </div>
            </div>
          </div>
        )}
        
        {/* Environment Information */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-medium mb-4">Environment Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-white/60">Environment:</span>
              <span>{import.meta.env.MODE || 'development'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Node Version:</span>
              <span>{import.meta.env.VITE_NODE_VERSION || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Build Time:</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusPage; 