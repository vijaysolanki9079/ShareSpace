# ShareSpace Item Request System - Implementation Complete

## 🎯 What Was Built

A complete **peer-to-peer used goods donation platform** where users can:
- **Post requests** for items they need (furniture, clothes, toys, tools, books, etc.)
- **Browse nearby requests** within configurable distance radius (1-25km)
- **Contact requesters** via encrypted P2P chat
- **Track requests** by status (open, fulfilled)

## 📦 Database Schema

### New Tables Created:
```prisma
// Categories for item types
ItemCategory
  - id, name (furniture, clothes, electronics, etc.)
  - description, icon (optional)

// Main request posts
ItemRequest
  - id, requesterId, title, description
  - categoryId, images[], status
  - latitude, longitude, radius, locationName
  - ngoId (optional - for NGO-posted requests)
  - createdAt, updatedAt

// Donor responses
ItemResponse
  - id, donorId, itemRequestId
  - conversationId (links to P2P chat)
  - status (interested, fulfilled, no_longer_interested)
  - message (initial offer message)

// Extended Conversation (from NGO chat)
- Now supports itemRequestId
- Links requests to P2P conversations
```

## 🏗️ Technologies Used

- **Distance Calculation**: Haversine formula (simple + fast)
- **Database**: Prisma + PostgreSQL (Supabase)
- **Frontend**: React + Framer Motion
- **API**: Next.js Route Handlers
- **Auth**: NextAuth.js (existing)

## 📍 API Endpoints

### 1. Categories (Initialize)
```bash
GET /api/requests/categories
```
Returns all item categories (auto-initializes with 9 defaults)

### 2. Create Request
```bash
POST /api/requests/create
Headers: Content-Type: application/json
Body: {
  title: "Need a bed frame",
  description: "Looking for a single bed...",
  categoryId: "cmo0dsg6...",
  images: ["url1", "url2"],  // optional
  latitude: 28.6139,
  longitude: 77.209,
  locationName: "Delhi, Sector 5",
  radius: 5000,  // search radius in meters
  ngoId: "optional-ngo-id"
}
```

### 3. Browse Nearby Requests
```bash
GET /api/requests/nearby?latitude=28.6139&longitude=77.209&radius_km=5&category=furniture&limit=50
```

### 4. Get Request Detail
```bash
GET /api/requests/[id]
```

## 🎨 Frontend Components

### 1. **CreateRequestForm.tsx**
- Form for posting new donation requests
- Auto-detects user location (geolocation)
- Category selector
- Image upload placeholder
- Search radius slider

### 2. **NearbyRequestsFeed.tsx**
- Grid display of nearby requests
- Distance calculation & sorting
- Category badges
- Requester profile cards
- "Offer Help" CTA button

### 3. **RequestDetailPage.tsx**
- Full request details view
- Requester information
- Image gallery
- Location map info
- Contact/Chat button
- Shows interested helpers count

## 📄 Pages Created

| Route | Component | Purpose |
|-------|-----------|---------|
| `/requests` | `app/requests/page.tsx` | Browse nearby requests with filters |
| `/requests/[id]` | `app/requests/[id]/page.tsx` | View detailed request & start chat |
| Modal in browse | `components/CreateRequestForm.tsx` | Post new request |

## 🔗 How It Works

### User Flow:
```
1. User visits /requests
   ↓
2. System fetches user location (geolocation)
   ↓
3. Shows nearby requests within selected radius (1-25km)
   ↓
4. User clicks "Post a Request" or "Offer Help"
   ↓
5. For posting:  Form opens → Post item → API creates request
   ↓
6. For helping:  Click "Offer Help" → Creates P2P conversation
   ↓
7. Chat view: Encrypted messages via existing chat system
```

### Distance Sorting:
```javascript
// Haversine formula calculates distance between two coordinates
// Requests sorted by distance: closest first
// Filtered by radius: only shows requests within range
```

## 🔒 Security Features

- ✅ **Authentication required** for posting & messaging (NextAuth)
- ✅ **E2E encryption** for P2P chats (existing TweetNaCl)
- ✅ **Database relationships** prevent cross-user access
- ✅ **Validation** on all inputs
- ✅ **Area-based filtering** (no full list exposed)

## 📊 Database Relations

```
User
├── itemRequestsMade: ItemRequest[]
└── itemResponsesGiven: ItemResponse[]

ItemRequest
├── requester: User
├── category: ItemCategory
├── ngo: NGO (optional)
├── responses: ItemResponse[]
└── conversations: Conversation[]

ItemResponse
├── donor: User
├── itemRequest: ItemRequest
└── conversation: Conversation

Conversation
├── itemRequest: ItemRequest (optional)
├── itemResponses: ItemResponse[]
└── messages: Message[]
```

## 🚀 Testing

### Via Browser:
1. **Public page**: http://localhost:3000/requests
2. **Create request**: Login required (use demo accounts)
3. **Browse**: See nearby requests
4. **Detail view**: Click any request card

### Via API:
```bash
# Get categories
curl http://localhost:3000/api/requests/categories

# Browse nearby (Delhi coordinates)
curl "http://localhost:3000/api/requests/nearby?latitude=28.6139&longitude=77.209&radius_km=5"

# Get a request detail (use ID from nearby results)
curl http://localhost:3000/api/requests/[request-id]
```

## 📋 Demo Data Setup

**9 Default Categories** (auto-created on first API call):
- 🛋️ Furniture
- 👕 Clothes
- 🖥️ Electronics
- 🎮 Toys
- 📚 Books
- 🔨 Tools
- 🍳 Kitchen
- ⚽ Sports
- 📦 Other

## 🎯 What's Next (Phase 2)

### Ready Now:
- ✅ Request creation & posting
- ✅ Browse nearby with distance sorting
- ✅ P2P messaging (uses existing chat system)
- ✅ Request detail pages

### Coming Soon:
- 🔄 Image upload to Supabase Storage
- 📸 Image gallery on request pages
- ⭐ Review & rating system
- 🔔 Notifications when helpers offer
- 📱 Mobile-optimized view
- 🗺️ Map view of requests
- 📊 Analytics dashboard

### Optimizations:
- PostGIS queries for faster distance calculation
- Elasticsearch for full-text search
- Caching for frequently viewed areas
- Request expiration (auto-close old requests)

## 💡 Key Features

| Feature | Status | Details |
|---------|--------|---------|
| Create requests | ✅ Ready | Form with all fields |
| Browse nearby | ✅ Ready | 1-25km radius filtering |
| Distance sorting | ✅ Ready | Haversine; shows meters |
| Categories | ✅ Ready | 9 defaults; auto-init |
| P2P chat | ✅ Ready | Uses existing chat API |
| Authentication | ✅ Ready | NextAuth required |
| Image uploads | ⏳ Next | Supabase Storage |
| Reviews | ⏳ Soon | Star rating system |
| Notifications | ⏳ Soon | Toast/email alerts |

## 📝 Code Quality

- ✅ **TypeScript**: Full type safety (0 errors)
- ✅ **Error handling**: Try-catch on all APIs
- ✅ **Logging**: `[requests/...]` prefixed console logs
- ✅ **Validation**: Input checks on all endpoints
- ✅ **Best practices**: Follows Next.js 16 patterns

## 🔗 Files Modified/Created

### New Files:
- `lib/item-requests.ts` - Business logic
- `app/api/requests/create/route.ts` - POST new request
- `app/api/requests/nearby/route.ts` - GET nearby (with distance calc)
- `app/api/requests/categories/route.ts` - GET categories
- `app/api/requests/[id]/route.ts` - GET request detail
- `app/requests/page.tsx` - Browse page
- `app/requests/[id]/page.tsx` - Detail page
- `components/CreateRequestForm.tsx` - Form component
- `components/NearbyRequestsFeed.tsx` - Feed display

### Modified Files:
- `prisma/schema.prisma` - Added 3 new models + extended Conversation

## 🎓 Architecture Notes

### Distance Calculation:
```typescript
// Simple but effective: Haversine formula
// Works for all locations
// No external dependencies
// Can be optimized to PostGIS later
constant R = 6371000m (Earth radius)
distance = 2*R*atan2(√a, √(1-a))
```

### Pages vs Components:
- **Pages**: `/requests` (browse), `/requests/[id]` (detail)
- **Components**: Forms, cards, feeds (reusable)
- **Modal**: Create form opens as overlay on browse page

### API Design:
- Simple REST endpoints
- JSON request/response
- Proper HTTP status codes
- Clear error messages
- Logging on all operations

## 🚨 Known Constraints

1. **Image upload**: Placeholder only (coming soon)
2. **PostGIS**: Using Haversine; upgrade to PostGIS for 1000+ requests
3. **Real-time**: No subscriptions; refresh needed for updates
4. **Requests limit**: Fetches all open → filters (optimize later)

## 📞 Support / Questions

All files have inline comments and console logging with `[requests/...]` prefix for easy debugging.
