# 🌍 ShareSpace

> **A Location-Based Community Donation Platform Connecting Individuals and Verified NGOs**

[![GitHub License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-94.7%25-blue)](.)
[![React](https://img.shields.io/badge/React-19.2.4-blue?logo=react)](.)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.2-black?logo=next.js)](.)

## 📖 Overview

<img width="2878" height="1458" alt="image" src="https://github.com/user-attachments/assets/783e7e33-f475-4ddc-bf4b-c4817d5e92bf" />

---

<img width="2876" height="1458" alt="image" src="https://github.com/user-attachments/assets/4805e7d0-893c-4474-89af-c033853b535e" />

---

<img width="2878" height="1454" alt="image" src="https://github.com/user-attachments/assets/e70b7bed-5b6c-4e41-89e9-584ff3280260" />

---

<img width="2878" height="1446" alt="image" src="https://github.com/user-attachments/assets/8672f558-d581-49e1-8d5f-2f9b6be90c01" />

---
**ShareSpace** is a non-commercial, social-impact web application designed to promote sustainable sharing, transparency, and efficient resource distribution. Our platform empowers communities by enabling individuals to donate usable items and connecting them with verified NGOs that need these resources.

### 🎯 Key Mission
- **Reduce Waste**: Give a second life to items that would otherwise be discarded
- **Support Communities**: Connect donors with trusted NGOs serving those in need
- **Promote Transparency**: Ensure verified, legitimate charitable organizations handle resources
- **Enable Sustainable Sharing**: Create an efficient ecosystem for resource distribution

## ✨ Key Features

### 👥 For Individual Donors
- **Easy Item Posting**: Quickly list items you want to donate with photos, descriptions, and location
- **Location-Based Matching**: Discover nearby NGOs and donation centers in real-time
- **Donation Tracking**: Monitor where your donations go and their impact
- **Secure Messaging**: Communicate directly with verified organizations
- **Donation History**: Keep track of all your contributions

### 🏢 For NGOs
- **NGO Verification**: Rigorous authentication process ensures only legitimate organizations are featured
- **Resource Discovery**: Find available donations in your service area instantly
- **Claim Donations**: Request items that match your organizational needs
- **Impact Metrics**: Track and showcase the donations your organization has received
- **Community Trust**: Build credibility through our verified badge system

### 🔐 Security & Trust
- **User Authentication**: Secure sign-up and login with NextAuth
- **NGO Verification Workflow**: Multi-step verification process for organizations
- **Data Encryption**: Sensitive information protected with bcryptjs
- **Location Privacy**: Control how your location information is shared
- **Report System**: Flag inappropriate listings or accounts

## 🛠️ Tech Stack

### Frontend
- **React 19.2.4**: Modern UI components with hooks and concurrent features
- **Next.js 16.2.2**: Full-stack React framework with SSR and API routes
- **TypeScript**: Type-safe development (94.7% of codebase)
- **Framer Motion**: Smooth animations and transitions
- **Leaflet & React-Leaflet**: Interactive maps and geolocation features
- **Lucide React**: Beautiful, consistent icons
- **React Hot Toast**: Non-intrusive notifications

### Backend
- **tRPC**: End-to-end typesafe APIs with zero runtime overhead
- **Prisma ORM**: Type-safe database access and migrations
- **PostgreSQL**: Robust, reliable relational database
- **Supabase**: Backend-as-a-service for authentication and storage
- **NextAuth**: Secure authentication framework

### Database
- **PostgreSQL 13+**: Primary database via Supabase
- **Prisma Client**: ORM for seamless data operations
- **Geospatial Support**: PostGIS extensions for location-based queries

### Development Tools
- **ESLint**: Code quality and consistency
- **Playwright**: End-to-end testing
- **Tailwind CSS 4**: Latest styling capabilities

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm/yarn
- **PostgreSQL** database (or Supabase account)
- **Environment Variables** (see setup below)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vijaysolanki9079/ShareSpace.git
   cd ShareSpace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/sharespace"

   # NextAuth Configuration
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"

   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-key"

   # Map Configuration (Optional)
   NEXT_PUBLIC_MAP_API_KEY="your-map-api-key"
   ```

4. **Set up the database**
   ```bash
   # Run migrations
   npx prisma migrate dev
   
   # Seed with test data (optional)
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
ShareSpace/
├── app/                 # Next.js app directory (pages & layouts)
├── components/          # Reusable React components
├── context/             # React context for state management
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and helpers
├── prisma/              # Database schema and migrations
├── server/              # Backend API routes and tRPC routers
├── public/              # Static assets (images, fonts, etc.)
├── supabase/            # Supabase configuration
├── types/               # TypeScript type definitions
├── tests/               # Test files (Playwright)
├── ngo-auth-workflow/   # NGO verification workflow
├── .github/             # GitHub Actions CI/CD
└── package.json         # Project dependencies
```

## 📚 Available Scripts

```bash
# Development
npm run dev              # Start development server with hot reload

# Production
npm run build            # Build optimized production bundle
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint to check code quality
npm run typecheck        # TypeScript type checking and generation

# Database
npm run db:seed          # Populate database with seed data

# Documentation
npm run guide:docx       # Generate work updates documentation
```

## 🔐 Authentication Flow

### User Registration
1. User signs up with email and password
2. Email verification sent to confirm identity
3. User creates profile (name, location, profile picture)

### NGO Verification
1. Organization registers with legal details
2. Admin review of submitted documents
3. NGO verification badge assigned upon approval
4. Access to organization dashboard and donation features

### Session Management
- JWT-based authentication with NextAuth
- Secure session storage with encrypted cookies
- Automatic session refresh for seamless experience

## 🗺️ Location-Based Features

- **Geospatial Queries**: Find donations and NGOs near you using PostGIS
- **Interactive Maps**: View locations of available items and organizations
- **Distance Filtering**: Filter results by proximity (1km, 5km, 10km, etc.)
- **Map Clustering**: Optimized visualization of multiple markers
- **Location Services**: Optional geolocation with user consent

## 🧪 Testing

Run end-to-end tests with Playwright:

```bash
npx playwright test
```

Generate test data with Faker:

```bash
npm run db:seed
```

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style and conventions
- Ensure all TypeScript types are properly defined
- Add tests for new features
- Update documentation as needed
- Keep commits atomic and descriptive

## 📋 Roadmap

### v0.1.0 (Current)
- ✅ User authentication and profiles
- ✅ Basic donation posting
- ✅ NGO verification workflow
- ✅ Location-based search
- ✅ Messaging system

### v0.2.0 (Planned)
- 📋 In-app notifications and reminders
- 📋 Donation impact reports
- 📋 Advanced filtering and search
- 📋 Mobile app
- 📋 Community reviews and ratings

### Future Enhancements
- 🎯 AI-powered donation recommendations
- 🎯 Inventory management for NGOs
- 🎯 Analytics dashboard
- 🎯 Multi-language support
- 🎯 Integration with other donation platforms

## 🐛 Bug Reports & Issues

Found a bug? Have a suggestion? Please [open an issue](https://github.com/vijaysolanki9079/ShareSpace/issues) with:
- Clear description of the problem
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)

## 📞 Support & Contact

- **GitHub Issues**: [Report bugs or request features](https://github.com/vijaysolanki9079/ShareSpace/issues)
- **Discussion Forum**: [Join community discussions](https://github.com/vijaysolanki9079/ShareSpace/discussions)
- **Email**: [Contact the maintainers](mailto:support@sharespace.local)

## 📄 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** for the incredible framework
- **Vercel** for hosting and infrastructure
- **Supabase** for backend services
- **Prisma** for excellent ORM capabilities
- **Open Source Community** for amazing libraries and tools
- **Contributors** who help make ShareSpace better

## 🌱 Our Impact

> *Every item donated is a story of compassion. Every organization helped is a community empowered.*

Help us create a more sustainable world by reducing waste and supporting those in need. Join ShareSpace today!

---

**Made with ❤️ by the ShareSpace Team**

[⬆ Back to Top](#-sharespace)
