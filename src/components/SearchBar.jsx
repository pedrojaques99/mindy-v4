import { useState } from 'react';
import { SearchIcon } from '@heroicons/react/outline';
import { supabase } from '../main';
import { useUser } from '../context/UserContext';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const { user } = useUser();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Track search query for analytics if user is logged in
    if (user && query.trim()) {
      await supabase
        .from('search_queries')
        .insert([
          { 
            query: query.trim(),
            user_id: user.id,
            results_count: 0 // This will be updated after results are fetched
          }
        ])
        .catch(error => console.error('Error tracking search:', error));
    }
    
    onSearch(query);
  };
  
  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for resources, tools, assets..."
          className="
            block w-full pl-10 pr-4 py-3 
            bg-[rgba(255,255,255,0.05)] backdrop-blur-md 
            border border-[rgba(255,255,255,0.15)] rounded-full
            text-white placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-[#bfff58]/50 focus:border-[#bfff58]/50
            transition-all duration-300
          "
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <button
            type="submit"
            className="
              p-1 rounded-full 
              bg-[#bfff58]/20 hover:bg-[#bfff58]/30 
              text-[#bfff58]
              transition-colors duration-300
            "
          >
            <SearchIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </form>
  );
} 