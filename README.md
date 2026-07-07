# Mini ERP

Mini ERP is a modern, role-aware operations dashboard for inventory, product management, sales execution, customer visibility, users, and backend-seeded permission control. It is built as a production-facing React application, connected to a live REST API, and shaped around the workflows a small business or internal operations team uses every day: stock comes in, products move, sales happen, customers are tracked, and access is governed carefully.

The app is intentionally compact, but not simplistic. It treats the "mini" in Mini ERP as scope discipline, not as a lack of polish.

## What This Application Does

Mini ERP brings the essential back-office workflows into one clean dashboard:

| Area | What it handles |
| --- | --- |
| Authentication | Real backend login, persisted access/refresh tokens, role-aware routing |
| Dashboard | Product analytics, inventory overview, revenue/profit signals, low-stock and top-selling insights |
| Products | Create, update, view, soft-delete/restore, image upload, stock tracking, pricing, SKU management |
| Sales | Customer lookup, just-in-time customer creation, product selection, quantity control, sale completion |
| Sales History | Salesman analytics, revenue/profit summary, searchable completed sales |
| Customers | Live customer directory sourced from backend user records |
| Users | Staff and customer account management, role selection, user creation, permission overrides |
| Roles & Permissions | Role records, seeded permissions, permission blueprints, role-permission assignment |

## Why It Feels Enterprise Grade

The interface is designed around repeat use, not marketing gloss. It favors density, clear hierarchy, predictable actions, and operational confidence.

- Tables are scan-first and action-ready.
- Forms validate before hitting the backend.
- Critical operations use drawers, modals, and confirmation states.
- Empty, loading, error, and success states are designed instead of left accidental.
- Product imagery has fallbacks and URL normalization for real-world API variance.
- Route access is role-aware, and backend token truth is respected over local mock state.
- API calls are isolated by domain, typed, and consumed through React Query.
- The dashboard emphasizes business signals: stock, revenue, profit, sold quantity, low-stock risk.

## Tech Stack

| Layer | Choice |
| --- | --- |
| Runtime | React 19 |
| Build Tool | Vite 6 |
| Language | TypeScript |
| Routing | React Router 7 |
| Server State | TanStack React Query |
| Client State | Redux Toolkit + React Redux |
| Styling | Tailwind CSS 4 with a custom global design system |
| Icons | Lucide React |
| API Style | REST, JSON, multipart form-data for product images |

## Backend Integration

The frontend reads its API base URL from:

```env
VITE_BASE_URL=https://mini-erp-h54b.onrender.com/api/v1
```

If `VITE_BASE_URL` is not provided, the app falls back to:

```text
http://localhost:5000/api/v1
```

Authenticated requests include:

```http
Authorization: Bearer <accessToken>
x-refresh-token: <refreshToken>
```

Auth data is persisted in localStorage using:

```text
mini_erp_auth
accessToken
refreshToken
```

## Core API Surface

The application currently integrates these live backend domains:

### Auth

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/auth/login` | Sign in and receive user, access token, refresh token |

### Products

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/products/getAllProducts` | List products |
| GET | `/products/getAnalytics` | Product analytics for dashboard |
| POST | `/products/createProduct` | Create product with image upload |
| PATCH | `/products/updateProduct/:id` | Update product and optionally replace image |
| PATCH | `/products/toggleDeleteProduct/:id` | Toggle deleted/restored state |

Product create/update uses `multipart/form-data`:

```text
productName
img
sku
sellingPrice
actualPrice
inStock
```

### Sales

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/sells/createSale` | Create a sale for selected customer and cart items |
| GET | `/sells/getSalesmanAnalytics` | Sales history and salesman performance summary |

Create sale payload:

```json
{
  "customerId": "customer-id",
  "items": [
    {
      "itemId": "product-id",
      "quantity": 1
    }
  ]
}
```

### Users and Customers

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/users/getAllUsers` | List users and customers |
| POST | `/users/createUser` | Create staff user |
| POST | `/users/createCustomer` | Create customer |
| PATCH | `/users/updateUser/:id` | Update user |
| PATCH | `/users/togglePermissionDeletion/:id` | Toggle blocked permission for a user |

Customers are represented by backend user records whose role is `Customer`.

### Roles and Permissions

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/roles/getAllRoles` | List roles |
| POST | `/roles/createRole` | Create role |
| PATCH | `/roles/updateRole/:id` | Update role |
| DELETE | `/roles/toggleDeleteRole/:id` | Toggle role deletion |
| GET | `/permissions/getAllPermissions` | List backend-seeded permissions |
| GET | `/role-permissions-blueprint/getAllRolePermissionBlueprints` | List permission blueprints |
| POST | `/role-permissions-blueprint/createRolePermissionBlueprint` | Create role-permission blueprint |
| PATCH | `/role-permissions-blueprint/updateBlueprintPermission/:blueprintId` | Add/remove one permission on a blueprint |

## Role Model

The frontend recognizes three primary dashboard roles:

| Role | Default Home | Typical Access |
| --- | --- | --- |
| Admin | `/dashboard` | Full system access |
| Manager | `/dashboard` | Dashboard, products, sales, customers |
| Employee | `/sales/create` | Product lookup, create sale, account |

Route protection is handled in `src/App.tsx` through `AuthGuard`.

Backend permissions remain authoritative. The UI only exposes routes that match the user's frontend role, while the API can still deny calls when the user's real permission blueprint does not allow the operation.

## Application Routes

| Route | Screen |
| --- | --- |
| `/login` | Sign in |
| `/dashboard` | Analytics overview |
| `/products` | Product management |
| `/sales/create` | Create sale |
| `/sales/history` | Sales history |
| `/customers` | Customer directory |
| `/users` | User management |
| `/roles` | Roles and permissions |
| `/account` | Account page |
| `/403` | Forbidden |

## Project Structure

```text
mini-erp/
|-- src/
|   |-- api/                  # Typed API clients by domain
|   |-- components/
|   |   |-- common/           # AuthGuard, EmptyState, ConfirmDialog
|   |   |-- layout/           # Sidebar, Topbar
|   |   `-- ui/               # Modal, Drawer, Toast
|   |-- constants/            # Config, routes, nav, role access
|   |-- contexts/             # Auth context
|   |-- hooks/                # Reusable local hooks and legacy query hooks
|   |-- layouts/              # Dashboard shell
|   |-- mock/                 # Legacy/mock data retained for compatibility
|   |-- pages/                # Route screens
|   |-- providers/            # Query provider
|   |-- redux/                # Store and auth/client slices
|   |-- types/                # Shared TypeScript models
|   |-- App.tsx               # Route tree and guards
|   |-- global.css            # Design system and app-wide styles
|   `-- main.tsx              # React entry point
|-- .env
|-- package.json
|-- vite.config.ts
`-- README.md
```

## Key Screens

### Dashboard

The dashboard combines high-level product analytics with inventory signals:

- Total products
- Total stock available
- Total sold quantity
- Revenue
- Profit
- Low-stock products
- Top-selling products
- Product table with image fallback

### Product Management

Products are managed through a live API-backed catalog:

- Create product with required image
- Update name, SKU, prices, stock, and image
- View details in a drawer
- Toggle deleted/restored state
- Search by product name or SKU
- Filter by stock state and deleted state
- Paginated responsive table

The product image layer is defensive. It supports `productImg` and `img`, upgrades plain Cloudinary paths, normalizes HTTP URLs to HTTPS, and falls back to an icon when an image cannot load.

### Create Sale

The sale workflow is built for speed:

1. Search customer by phone, email, or name.
2. Select a matching customer.
3. If no customer is found, create one inline.
4. Search products.
5. Add products to cart.
6. Manage quantities with stock limits.
7. Complete sale through `/sells/createSale`.

### Sales History

Sales history uses the salesman analytics endpoint to show:

- Total sales
- Total items sold
- Total revenue
- Total profit
- Searchable completed sales
- Sale details in a drawer

### Customers

The Customers page is a live read-only directory built from backend user records:

- Filters users to role `Customer`
- Shows active/deleted customer counts
- Search by name, email, or phone
- Detail drawer for customer metadata

### Users

The Users page handles both staff and customers:

- Create staff users with role selection
- Create customers through the backend customer route
- View assigned roles and permission blueprint
- Manage inherited permission blocking

### Roles & Permissions

This screen reflects backend-seeded permissions and role-permission blueprints:

- Create and update roles
- View seeded permissions grouped by module
- Create a blueprint for a role
- Add or remove permissions from existing blueprints
- Prevents accidental duplicate blueprint assignment for roles

## Local Setup

### Prerequisites

- Node.js 20+
- npm 10+

### Install

```bash
npm install
```

### Environment

Create or update `.env`:

```env
VITE_BASE_URL=https://mini-erp-h54b.onrender.com/api/v1
```

Optional:

```env
VITE_APP_URL=http://localhost:3000
```

### Run Development Server

```bash
npm run dev
```

Vite will print the local URL, usually:

```text
http://localhost:3000
```

If port `3000` is occupied, Vite may use another port.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite development server |
| `npm run build` | Type-check and build production assets |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript without emitting files |

## Quality Checks Used During Development

The project is kept healthy with:

```bash
npm run type-check
npm run build
```

Both commands should pass before shipping changes.

## Design System Notes

Most of the visual language lives in `src/global.css`.

The UI favors:

- Compact enterprise spacing
- Clear table hierarchy
- Predictable action buttons
- Icon-first controls where appropriate
- Drawers for record details
- Modals for create/edit workflows
- Badges for statuses and operational state
- Responsive mobile cards for dense tables

Shared components:

| Component | Purpose |
| --- | --- |
| `Modal` | Form and confirmation workflows |
| `Drawer` | Record details without losing table context |
| `Toast` | User feedback for mutations |
| `EmptyState` | Designed empty/error states |
| `ConfirmDialog` | Destructive or state-changing confirmation |
| `AuthGuard` | Route protection |

## Auth and Session Notes

The app stores the real backend session after login. A previous dev-only role switcher has been removed so local UI role cannot diverge from the backend token identity.

If a user sees unexpected `Permission denied` responses:

1. Log out.
2. Clear localStorage if needed.
3. Log in with a backend user whose role and permission blueprint allow the target operation.

The backend remains the final authority for permission checks.

## Known Boundaries

The app currently reflects the backend routes that are available:

- Customers can be listed from `getAllUsers` and created through `createCustomer`.
- Customer edit/delete is not shown on the Customers page because dedicated backend routes were not provided.
- Sales history depends on the logged-in user's backend permissions.
- Product images depend on URLs returned by the backend/Cloudinary; the frontend provides robust fallbacks but cannot repair a permanently inaccessible remote asset.

## Development Philosophy

Mini ERP is designed as an operational cockpit: quiet, fast, readable, and trustworthy. It avoids decorative noise and puts the work first. Every table, drawer, form, badge, and empty state exists to help an operator understand what is happening and take the next correct action with confidence.

The result is a small ERP that behaves like a larger system: permission-aware, API-driven, typed, responsive, and ready to grow.
