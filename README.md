# Noah - Multi Empresas

A comprehensive multi-company cleaning service management platform built with Next.js 15, TypeScript, and Tailwind CSS.

## 🌟 Overview

Noah is a modern, scalable platform designed to manage multiple cleaning service companies from a single interface. It provides role-based access control for administrators, companies, and professionals, offering complete management of appointments, teams, materials, payments, and more.

## ✨ Features

### 🔐 Authentication & Authorization
- **Multi-role system**: Admin, Company, and Professional roles
- **JWT-based authentication** with secure token management
- **Role-based access control** for different dashboard views

### 👥 User Management
- **Admin Dashboard**: Complete system oversight and management
- **Company Dashboard**: Company-specific operations and team management
- **Professional Dashboard**: Individual professional tools and schedules

### 📅 Appointment Management
- **Scheduling system** with calendar integration
- **Real-time appointment tracking** and status updates
- **Cancellation and rescheduling** functionality
- **Recurring appointments** support

### 👨‍💼 Team & Professional Management
- **Team creation and management** with leader assignments
- **Professional profiles** with performance tracking
- **GPS tracking** for field professionals
- **Check-in/check-out** system with photo capture

### 💰 Financial Management
- **Payment tracking** and processing
- **Plan management** with subscription handling
- **Financial reporting** and analytics

### 📊 Reporting & Analytics
- **Comprehensive dashboards** with real-time metrics
- **Performance analytics** for teams and individuals
- **Material consumption reports**
- **Customer satisfaction tracking**

### 💬 Communication
- **Internal chat system** for team communication
- **Notification system** for important updates
- **Customer feedback** collection and management

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI component library
- **Lucide React** - Beautiful icons

### Backend Integration
- **RESTful API** integration with .NET backend
- **JWT Authentication** for secure API communication
- **Real-time updates** with optimistic UI patterns

### Development Tools
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing
- **TypeScript** - Static type checking

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Access to the Noah API backend

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/your-username/noah-platform.git
   cd noah-platform
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   \`\`\`env
   NEXT_PUBLIC_API_URL=https://209.97.149.15:5000/api
   NEXT_PUBLIC_APP_NAME=Noah - Multi empresas
   \`\`\`

4. **Run the development server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

\`\`\`
noah-platform/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard pages
│   ├── company/           # Company dashboard pages
│   ├── professional/      # Professional dashboard pages
│   ├── login/             # Authentication pages
│   └── register/          
├── components/            # Reusable UI components
│   ├── admin/            # Admin-specific components
│   ├── company/          # Company-specific components
│   ├── professional/     # Professional-specific components
│   └── ui/               # Base UI components (shadcn/ui)
├── contexts/             # React Context providers
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and API clients
│   └── api/              # API integration modules
├── types/                # TypeScript type definitions
└── public/               # Static assets
\`\`\`

## 🔧 API Integration

The platform integrates with a .NET backend API providing:

### Authentication Endpoints
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Token refresh

### Core Entities
- **Leaders**: `GET|POST|PUT|DELETE /api/Leader`
- **Teams**: `GET|POST|PUT|DELETE /api/Team`
- **Companies**: `GET|POST|PUT|DELETE /api/Company`
- **Professionals**: `GET|POST|PUT|DELETE /api/Professional`
- **Appointments**: `GET|POST|PUT|DELETE /api/Appointment`

### Features
- **Pagination support** for large datasets
- **Filtering and search** capabilities
- **Real-time status updates**
- **File upload** for photos and documents

## 🎨 UI/UX Design

### Design System
- **Dark theme** with cyan accent colors
- **Responsive design** for all device sizes
- **Consistent spacing** and typography
- **Accessible components** with proper ARIA labels

### Color Palette
- **Primary**: Cyan (#06b6d4)
- **Background**: Dark slate (#0f172a, #1a2234)
- **Borders**: Muted slate (#2a3349)
- **Text**: White and gray variants

## 🔒 Security Features

- **JWT token management** with automatic refresh
- **Role-based route protection**
- **Secure API communication** with bearer tokens
- **Input validation** and sanitization
- **CORS configuration** for cross-origin requests

## 📱 Responsive Design

The platform is fully responsive and optimized for:
- **Desktop** (1024px+)
- **Tablet** (768px - 1023px)
- **Mobile** (320px - 767px)

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
\`\`\`bash
# Build the application
npm run build

# Start production server
npm start
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation wiki

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
- **v1.1.0** - Added team and leader management
- **v1.2.0** - Enhanced API integration and real-time features

---

Built with ❤️ by the Noah Development Team
