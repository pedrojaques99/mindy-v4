import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../main';
import { useUser } from '../context/UserContext';
import toast from 'react-hot-toast';
import { useLanguage } from '../context/LanguageContext';

const SubmitResourcePage = () => {
  const { user } = useUser();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    image_url: '',
    category: '',
    tags: '',
  });
  
  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');
          
        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error(t('submit.errors.loadCategories', 'Failed to load categories'));
      }
    };
    
    fetchCategories();
  }, [t]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error(t('submit.errors.notSignedIn', 'You must be signed in to submit a resource'));
      return;
    }
    
    try {
      setLoading(true);
      
      // Process tags
      const tagsArray = formData.tags
        .split(',')
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => tag);
      
      // Submit resource
      const { data, error } = await supabase
        .from('resources')
        .insert([
          {
            title: formData.title,
            description: formData.description,
            url: formData.url,
            image_url: formData.image_url || null,
            category: formData.category,
            tags: tagsArray,
            user_id: user.id,
            approved: false,
          },
        ], { 
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json' 
          }
        })
        .select();
        
      if (error) throw error;
      
      toast.success(t('submit.success', 'Resource submitted successfully!'));
      navigate('/');
    } catch (error) {
      console.error('Error submitting resource:', error);
      toast.error(t('submit.errors.submitFailed', 'Failed to submit resource'));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{t('submit.title', 'Submit a Resource')}</h1>
        
        <div className="glass-card p-6 mb-8">
          <p className="text-white/70 mb-4">
            {t('submit.description', 'Share a valuable resource with the community. All submissions are reviewed before being published.')}
          </p>
          
          {!user && (
            <div className="bg-dark-400 p-4 rounded-lg mb-6">
              <p className="text-white/70 mb-2">
                {t('submit.signInRequired', 'You need to be signed in to submit a resource.')}
              </p>
              <button 
                onClick={() => navigate('/')}
                className="text-lime-accent hover:underline"
              >
                {t('common.signIn', 'Sign in')}
              </button>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                {t('submit.form.title', 'Title')} *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-dark-400 border border-glass-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-accent"
                required
                disabled={!user || loading}
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                {t('submit.form.description', 'Description')} *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 bg-dark-400 border border-glass-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-accent"
                required
                disabled={!user || loading}
              />
            </div>
            
            <div>
              <label htmlFor="url" className="block text-sm font-medium mb-1">
                {t('submit.form.url', 'URL')} *
              </label>
              <input
                id="url"
                name="url"
                type="url"
                value={formData.url}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-dark-400 border border-glass-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-accent"
                required
                disabled={!user || loading}
              />
            </div>
            
            <div>
              <label htmlFor="image_url" className="block text-sm font-medium mb-1">
                {t('submit.form.imageUrl', 'Image URL')}
              </label>
              <input
                id="image_url"
                name="image_url"
                type="url"
                value={formData.image_url}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-dark-400 border border-glass-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-accent"
                disabled={!user || loading}
              />
              <p className="text-white/50 text-xs mt-1">
                {t('submit.form.imageUrlHelp', 'Optional. Leave blank to use a default image.')}
              </p>
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-1">
                {t('submit.form.category', 'Category')} *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-dark-400 border border-glass-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-accent"
                required
                disabled={!user || loading}
              >
                <option value="">{t('submit.form.selectCategory', 'Select a category')}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="tags" className="block text-sm font-medium mb-1">
                {t('submit.form.tags', 'Tags')}
              </label>
              <input
                id="tags"
                name="tags"
                type="text"
                value={formData.tags}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-dark-400 border border-glass-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-accent"
                disabled={!user || loading}
              />
              <p className="text-white/50 text-xs mt-1">
                {t('submit.form.tagsHelp', 'Separate tags with commas (e.g., design, tools, productivity)')}
              </p>
            </div>
            
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={!user || loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('submit.form.submitting', 'Submitting...')}
                </span>
              ) : (
                t('submit.form.submit', 'Submit Resource')
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitResourcePage;
