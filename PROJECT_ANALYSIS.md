# Vendor Portal - Complete Project Analysis

## 📋 Project Overview

Yeh ek **Vendor Portal** hai jo Admin Portal ke similar flow par based hai. Admin Portal ka code [souvenirAdmin repository](https://github.com/zaaain/souvenirAdmin) par deploy hai.

---

## 🏗️ Current Vendor Portal Structure

### **Tech Stack**
- ⚛️ **React 18** with TypeScript
- 🎨 **Tailwind CSS** for styling
- 🔄 **Redux Toolkit** + **RTK Query** for state management
- 📡 **React Router v7** for routing
- 🌐 **i18next** for internationalization (English/Arabic)
- ✅ **React Hook Form** + **Yup** for form validation
- 🔔 **React Hot Toast** for notifications
- 💾 **Redux Persist** for state persistence
- ⚡ **Vite** for build tooling

### **Project Structure**

```
src/
├── assets/              # Images, logos, fonts
├── components/
│   ├── buttons/        # Reusable button components
│   ├── cards/          # Card components
│   ├── forms/          # Form components (Login, Register, OTP, etc.)
│   ├── formsInput/     # Input components
│   ├── header/         # Header component
│   ├── layouts/        # AuthLayout, DashboardLayout
│   └── sidebar/        # Sidebar navigation
├── helpers/
│   └── schemas.ts      # Yup validation schemas
├── hooks/
│   ├── redux.ts        # Typed Redux hooks
│   ├── useLogout.ts    # Logout hook
│   └── useToast.ts     # Toast notification helpers
├── i18n/               # Internationalization config
│   ├── config.ts
│   └── locales/
│       ├── en.json
│       └── ar.json
├── pages/
│   ├── 404/            # NotFound page
│   ├── auth/           # Authentication pages
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── otp.tsx
│   │   └── forgot-password.tsx
│   ├── dashboard/      # Dashboard page
│   ├── profile/        # Profile page
│   └── settings/       # Settings page
├── routes/
│   └── index.tsx       # Route configuration
└── store/
    ├── features/
    │   ├── auth/       # Authentication slice & reducer
    │   └── profile/    # Profile slice
    ├── index.ts        # Store configuration
    └── rootReducer.ts  # Root reducer
```

---

## 🔐 Authentication Flow (Current Implementation)

### **1. Registration Flow**
```
Register Form → API: POST /api/auth/user/register
  ↓
OTP Verification → API: POST /api/auth/user/verify/registration/otp
  ↓
Login → Store token & profile data in Redux
```

### **2. Login Flow**
```
Login Form → API: POST /api/auth/user/login
  ↓
Response: { data: { token, profileData } }
  ↓
Store in Redux (setProfileData action)
  ↓
Navigate to Dashboard (/)
```

### **3. Authentication State Management**
- **Redux Store**: `auth` slice with `authReducer`
- **RTK Query**: `authSlice` for API calls
- **Persistence**: Redux Persist (only auth state)
- **Token Storage**: Redux state + localStorage (via persist)

### **4. Protected Routes**
- `DashboardLayout` checks authentication
- Auto-logout on 401/403 responses
- Token added to all API requests via `prepareHeaders`

---

## 🌐 API Integration

### **Base URL**
```
http://18.130.102.234:9078/api/
```

### **Current API Endpoints**

#### **Authentication**
- `POST /auth/user/register` - User registration
- `POST /auth/user/login` - User login
- `POST /auth/user/verify/registration/otp` - OTP verification

#### **Profile** (Currently using admin endpoints - needs vendor endpoints)
- `GET /admin/profile` - Get profile (should be `/vendor/profile`)
- `PUT /admin/profile` - Update profile (should be `/vendor/profile`)

**⚠️ Note**: Profile endpoints currently use `/admin/` prefix. These need to be changed to `/vendor/` for vendor portal.

---

## 🎨 UI/UX Features

### **Layouts**
1. **AuthLayout**: For authentication pages (login, register, etc.)
2. **DashboardLayout**: Main app layout with Sidebar + Header

### **Components**
- **Sidebar**: Navigation menu with RTL support
  - Dashboard
  - Products
  - Orders
  - Earning & Payout
  - Settings
  - Logout
- **Header**: Top bar with user info and menu
- **Forms**: Reusable form components with validation

### **Internationalization**
- English (en) - Default
- Arabic (ar) - RTL support
- Language switching capability

---

## 📊 Redux Store Structure

### **State Shape**
```typescript
{
  auth: {
    user: User | null
    token: string | null
    profileData: ProfileData | null
    isAuthenticated: boolean
    isLoading: boolean
  },
  authApi: RTK Query cache,
  profileApi: RTK Query cache
}
```

### **RTK Query Slices**
1. **authSlice**: Authentication mutations
2. **profileSlice**: Profile queries & mutations

---

## 🔄 What Needs to be Analyzed from Admin Portal

### **1. Admin Portal Structure Analysis Needed**
From [souvenirAdmin repo](https://github.com/zaaain/souvenirAdmin), we need to understand:

#### **A. Feature Modules**
- [ ] What features does admin portal have?
- [ ] How are vendors managed in admin portal?
- [ ] What data tables/views are used?
- [ ] What forms and workflows exist?

#### **B. API Endpoints Pattern**
- [ ] Admin API endpoint structure
- [ ] Vendor-specific endpoints (if any)
- [ ] Data fetching patterns
- [ ] Error handling approach

#### **C. State Management**
- [ ] How is state organized in admin portal?
- [ ] RTK Query usage patterns
- [ ] Cache invalidation strategies
- [ ] Optimistic updates

#### **D. UI Components**
- [ ] Reusable component library
- [ ] Table components
- [ ] Modal/Dialog patterns
- [ ] Form patterns
- [ ] Data visualization

#### **E. Routing & Navigation**
- [ ] Route structure
- [ ] Protected route patterns
- [ ] Role-based access control
- [ ] Navigation flow

#### **F. Business Logic**
- [ ] Vendor management workflow
- [ ] Order processing flow
- [ ] Product management
- [ ] Payment/earning flow

---

## 🎯 Vendor Portal Development Plan

### **Phase 1: Core Features (Based on Sidebar)**
1. ✅ **Authentication** - Already implemented
2. ⏳ **Dashboard** - Needs implementation
3. ⏳ **Products Management** - Vendor products CRUD
4. ⏳ **Orders Management** - View and manage orders
5. ⏳ **Earnings & Payout** - Financial tracking
6. ⏳ **Settings** - Vendor settings

### **Phase 2: API Integration**
- [ ] Update profile endpoints from `/admin/` to `/vendor/`
- [ ] Implement vendor-specific API endpoints
- [ ] Add proper error handling
- [ ] Implement loading states

### **Phase 3: Feature Parity**
- [ ] Match admin portal features (where applicable)
- [ ] Implement vendor-specific workflows
- [ ] Add data tables and filters
- [ ] Implement search and pagination

---

## 🔍 Key Differences: Admin vs Vendor Portal

### **Admin Portal** (Reference)
- Manages multiple vendors
- Has vendor approval/rejection
- Views all orders across vendors
- Manages platform settings
- Has analytics and reports

### **Vendor Portal** (Current Project)
- Single vendor view
- Manages own products
- Views own orders only
- Manages own profile/settings
- Views own earnings/payouts

---

## 📝 Next Steps

1. **Analyze Admin Portal Repository**
   - Clone/download admin portal code
   - Review structure and patterns
   - Document API endpoints
   - Understand component patterns

2. **Map Admin Features to Vendor Features**
   - Identify which admin features apply to vendors
   - Determine vendor-specific requirements
   - Plan feature implementation order

3. **Update Current Vendor Portal**
   - Fix API endpoints (admin → vendor)
   - Implement missing features
   - Add vendor-specific workflows
   - Test authentication flow

4. **Development**
   - Follow admin portal patterns
   - Maintain code consistency
   - Implement vendor features
   - Add proper error handling

---

## 🛠️ Technical Notes

### **Current Issues to Address**
1. ⚠️ Profile API uses `/admin/` endpoints - needs vendor endpoints
2. ⚠️ Sidebar has placeholder routes (products, orders, etc.) - need implementation
3. ⚠️ Dashboard page is empty - needs implementation
4. ⚠️ Settings page is empty - needs implementation

### **Best Practices to Follow**
- Use RTK Query for all API calls
- Implement proper loading states
- Add error boundaries
- Use TypeScript strictly
- Follow existing component patterns
- Maintain i18n support
- Ensure RTL support for Arabic

---

## 📚 Resources

- **Admin Portal Repo**: https://github.com/zaaain/souvenirAdmin
- **API Base URL**: http://18.130.102.234:9078/api/
- **Current Project**: Vendor Portal (this repo)

---

**Last Updated**: Analysis phase
**Status**: Ready for admin portal analysis and vendor portal development
