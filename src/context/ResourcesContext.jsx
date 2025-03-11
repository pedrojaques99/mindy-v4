import { createContext, useContext, useReducer, useEffect } from 'react';

// Create the context
const ResourcesContext = createContext();

// Export the Consumer for direct access
export const ResourcesConsumer = ResourcesContext.Consumer;

// Define the initial state
const initialState = {
  resources: [],
  isLoading: true,
  error: null
};

// Define action types
export const SET_RESOURCES = 'SET_RESOURCES';
export const SET_LOADING = 'SET_LOADING';
export const SET_ERROR = 'SET_ERROR';

// Create reducer function
const resourcesReducer = (state, action) => {
  // Protect against null/undefined actions
  if (!action) return state;
  
  console.log('ResourcesContext: Action received:', action.type, action.payload?.length || 0);
  
  switch (action.type) {
    case SET_RESOURCES:
      return {
        ...state,
        resources: action.payload,
        isLoading: false
      };
    case SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
    case SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    default:
      return state;
  }
};

// Create the provider component
export const ResourcesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(resourcesReducer, initialState);
  
  // Check for cached resources on mount
  useEffect(() => {
    try {
      console.log('ResourcesContext: Checking for cached resources');
      const cachedResources = localStorage.getItem('cachedResources');
      if (cachedResources) {
        console.log('ResourcesContext: Found cached resources');
        try {
          const parsedResources = JSON.parse(cachedResources);
          console.log('ResourcesContext: Parsed resources count:', parsedResources?.length || 0);
          if (parsedResources && Array.isArray(parsedResources) && parsedResources.length > 0) {
            dispatch({ type: SET_RESOURCES, payload: parsedResources });
          } else {
            console.log('ResourcesContext: Empty or invalid cached resources');
            dispatch({ type: SET_ERROR, payload: 'Empty or invalid cached resources' });
          }
        } catch (parseError) {
          console.error('ResourcesContext: Error parsing cached resources:', parseError);
          dispatch({ type: SET_ERROR, payload: parseError.message });
        }
      } else {
        console.log('ResourcesContext: No cached resources found');
        dispatch({ type: SET_LOADING, payload: false });
      }
    } catch (error) {
      console.error('ResourcesContext: Error loading cached resources:', error);
      dispatch({ type: SET_ERROR, payload: error.message });
    }
  }, []);
  
  // Context value
  const value = {
    resources: state.resources,
    isLoading: state.isLoading,
    error: state.error,
    dispatch
  };
  
  return (
    <ResourcesContext.Provider value={value}>
      {children}
    </ResourcesContext.Provider>
  );
};

// Custom hook for using the context
export const useResources = () => {
  const context = useContext(ResourcesContext);
  if (!context) {
    throw new Error('useResources must be used within a ResourcesProvider');
  }
  return context;
};

export default ResourcesContext; 