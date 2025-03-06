# MINDY Resource Library

A curated collection of design and development resources for creators and developers.

## Features

- Browse resources by category
- Search for specific resources
- Filter by tags
- Save favorites (requires account)
- Submit new resources (requires account)
- User authentication with Supabase
- Responsive design for all devices

## Tech Stack

- React
- Vite
- Tailwind CSS
- Supabase (Authentication & Database)
- React Router
- React Hot Toast

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/pedrojaques99/mindy-3.git
cd mindy-3
```

2. Install dependencies
```bash
npm install
# or
yarn
```

3. Create a `.env` file in the root directory with your Supabase credentials
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Build for Production

```bash
npm run build
# or
yarn build
```

## License

MIT

## Acknowledgements

- [Supabase](https://supabase.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)