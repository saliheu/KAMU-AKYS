# Dilekçe Şikayet Yönetim Sistemi - Frontend

This is the React TypeScript frontend for the Dilekçe Şikayet Yönetim Sistemi (Complaint Management System).

## Features

### Citizen Portal
- User registration and login
- Submit new complaints with attachments
- Track complaint status
- View and respond to officer responses
- Dashboard with personal complaint statistics

### Admin/Officer Portal
- Dashboard with system-wide statistics
- Manage all complaints
- Filter complaints by status, priority, department
- Respond to complaints
- Update complaint status
- Export complaints to Excel
- User management (Admin only)
- Department management (Admin only)

## Tech Stack

- **React 19** with TypeScript
- **Material-UI (MUI)** for UI components
- **React Router** for navigation
- **Axios** for API calls
- **Recharts** for data visualization
- **date-fns** for date formatting
- **Context API** for state management

## Project Structure

```
src/
├── components/
│   ├── auth/         # Authentication components (Login, Register)
│   ├── complaint/    # Complaint-related components
│   ├── dashboard/    # Dashboard component
│   ├── layout/       # Layout components (Header, Sidebar)
│   └── common/       # Shared components
├── contexts/         # React Context providers
├── pages/            # Page components
├── services/         # API service layers
├── types/            # TypeScript type definitions
├── utils/            # Utility functions and constants
└── App.tsx           # Main application component
```

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your backend API URL:
```
REACT_APP_API_URL=http://localhost:3001/api
```

4. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Available Scripts

- `npm start` - Run the app in development mode
- `npm build` - Build the app for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App (not recommended)

## API Integration

The frontend expects a backend API running at the URL specified in `REACT_APP_API_URL`. The `package.json` includes a proxy configuration for development that forwards API requests to `http://localhost:3001`.

## Authentication

The app uses JWT tokens for authentication. Tokens are stored in localStorage and automatically included in API requests via Axios interceptors.

## User Roles

The system supports three user roles:
- **CITIZEN**: Can create and track their own complaints
- **OFFICER**: Can view and respond to complaints in their department
- **ADMIN**: Full system access including user and department management

## Environment Variables

- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_NAME`: Application name
- `REACT_APP_ENV`: Environment (development/production)

## Deployment

1. Build the production bundle:
```bash
npm run build
```

2. The build folder will contain the optimized production build ready to be deployed.

## Browser Support

The app supports all modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)