# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vendex is a Point of Sale (PDV) system built with Angular 19, PrimeNG, and Tailwind CSS v4. The application manages sales transactions, product catalog, inventory, cash register operations, and sales history.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:4200)
npm start
# or: ng serve

# Build for production
npm run build

# Build and watch for changes (development mode)
npm run watch

# Run unit tests
npm test

# Generate new component
ng generate component component-name
```

## Tech Stack

- **Angular**: 19.2.0 (standalone components, signals API)
- **PrimeNG**: 19.1.4 (Aura theme)
- **Tailwind CSS**: 4.1.13 (with PostCSS)
- **Keycloak**: keycloak-angular 20.0.0, keycloak-js 26.2.0
- **TypeScript**: 5.7.2
- **RxJS**: 7.8.0

## Architecture

### Core Structure

The application follows Angular feature-based architecture with clear separation of concerns:

- **core/**: Singleton services and infrastructure
  - `api/`: Base API service for HTTP communication
  - `auth/`: Authentication service, guards, and JWT interceptor
  - `services/`: Global services (notification, loading)

- **features/**: Feature modules with lazy loading
  - `pdv/`: Point of Sale (main feature)
    - Main PDV interface with product grid, cart, and checkout
    - Sales history with detailed transaction views
    - Services: `pdv.service.ts`, `historico.service.ts`, `pdv-theme.service.ts`
  - `produtos/`: Product management
    - Product list, form, and detail views
    - Service: `produto.service.ts`
  - `caixa/`: Cash register operations
    - Opening/closing cash register sessions
    - Transaction tracking (entries/exits, deposits, withdrawals)
    - Payment method breakdown
    - Service: `caixa.service.ts`
  - `estoque/`: Inventory management
    - Stock levels, movement history
    - Service: `estoque.service.ts`
  - `usuarios/`: User management
  - `notas-fiscais/`: Invoice management

- **layout/**: Layout components
  - `main-layout/`: Standard application layout with sidebar and header
  - `auth-layout/`: Authentication pages layout
  - `pdv-layout/`: Specialized fullscreen PDV interface layout

- **shared/**: Reusable components, models, and directives
  - Common UI components (header, sidebar, buttons, inputs, modals, data-table, loading-spinner)
  - Domain models (Usuario, Produto, Venda, Carrinho, VendaHistorico, Caixa, Lancamento)
  - Custom directives (force-theme)

### Key Architectural Patterns

1. **Signal-based State Management**: Services use Angular signals for reactive state
   - `pdv.service.ts`: Products, cart items, sales history managed with `signal()`
   - `caixa.service.ts`: Current cash register session, transactions, computed summaries
   - Computed values use `computed()` (e.g., subtotal, total, cash register summary)
   - Updates use `.update()` and `.set()` methods

2. **Lazy-loaded Routes**: Features use lazy loading pattern
   - Default route redirects to `/dashboard`
   - PDV route at `/pdv` loads fullscreen (no sidebar/header)
   - Other features load within `MainLayoutComponent` wrapper

3. **Mock Data**: Currently uses in-memory mock data
   - Products in `pdv.service.ts` with emoji icons for visual identification
   - No backend integration yet (ApiService is a skeleton)
   - All data stored in memory using signals

4. **PrimeNG Integration**: UI components leverage PrimeNG with Aura theme
   - Configured in `app.config.ts` with `providePrimeNG()`
   - Dark mode currently disabled (`darkModeSelector: 'false'`)

5. **Tailwind CSS v4**: Uses latest Tailwind with PostCSS
   - Main styles in `src/styles.css`
   - PostCSS config in `.postcssrc.json`

6. **PDV-Caixa Integration**: Sales automatically register in cash register when open
   - `pdv.service.ts` calls `caixa.service.ts` upon sale completion
   - Payment methods from PDV converted to cash register format
   - Sales only register if cash register session is open

### Route Structure

- `/pdv` - Fullscreen point of sale interface
- `/dashboard` - Main dashboard (default)
- `/produtos` - Product management
- `/caixa` - Cash register operations
- `/estoque` - Inventory management
- `/usuarios` - User management
- `/notas-fiscais` - Invoice management
- `/vendas/*` - Sales routes (history, reports, returns)
- `/financeiro/*` - Financial routes (payables, receivables, cash flow, banks)
- `/configuracoes/*` - Settings routes (general, POS, tax, integrations)

### Environment Configuration

- **Development API URL**: `http://localhost:8080/api` (Spring Boot backend)
- **Frontend Dev Server**: `http://localhost:4200` (Angular)
- **Keycloak Server**: `http://localhost:8180` (Authentication/SSO)
- App name: "Vedex" (note: typo in original)
- Production environment config in `src/environments/environment.prod.ts`

## Authentication & Keycloak Integration

### **✅ KEYCLOAK INTEGRATION COMPLETED**

The frontend is fully integrated with **Keycloak 23.0.0** for SSO authentication.

### Configuration

**Keycloak Settings** (`src/app/core/config/keycloak.config.ts`):
- **Keycloak URL**: `http://localhost:8180`
- **Realm**: `vendex-master`
- **Client ID**: `vedex-frontend` (public client)
- **Init Mode**: `check-sso` (checks authentication without forcing redirect)
- **PKCE**: Enabled (`S256`) for enhanced security

### Authentication Flow

1. **App Initialization**: Keycloak initializes before Angular app starts (`APP_INITIALIZER`)
2. **Token Management**: `KeycloakService` handles token lifecycle and auto-refresh
3. **HTTP Interceptor**: `KeycloakBearerInterceptor` automatically adds JWT token to API requests
4. **Route Guards**: `authGuard` protects all routes except public endpoints
5. **Token Injection**: JWT automatically added to `/api/*` requests, excluded from `/assets` and `/api/public`

### Authentication Components

- **Factory**: `src/app/core/auth/keycloak-init.factory.ts` - Initializes Keycloak before app startup
- **Config**: `src/app/core/config/keycloak.config.ts` - Keycloak server and client configuration
- **Guard**: `src/app/core/guards/auth.guard.ts` - Route protection with Keycloak
- **Service**: `src/app/core/auth/auth.service.ts` - Authentication utilities and user info
- **Interceptor**: `KeycloakBearerInterceptor` (from `keycloak-angular`) - Auto-injects JWT tokens

### Logout Implementation

Logout is implemented in two locations:

1. **Topbar** (`src/app/layout/topbar/topbar.component.ts`):
   - User menu dropdown with "Sair" option
   - Displays user info (name, role, initials)
   - Additional options: Profile (opens Keycloak account management), Settings

2. **Sidebar** (`src/app/layout/sidebar/sidebar.component.ts`):
   - Logout button at the bottom of the sidebar
   - Shows user info and email when sidebar is expanded
   - Icon-only when sidebar is collapsed

**How it works**:
- Both components call `authService.logout()`
- This triggers `keycloak.logout(window.location.origin)`
- User is redirected to Keycloak logout page
- After logout, user is redirected back to the app (login required)

### Protected Routes

All routes require authentication via `authGuard`:
- `/pdv` - PDV interface (fullscreen)
- `/dashboard` and all child routes under `MainLayoutComponent`

### Token Refresh

- Tokens auto-refresh when less than 70 seconds remain before expiration
- Configured in `keycloak-init.factory.ts` via `shouldUpdateToken()`

### Testing Authentication

```bash
# Ensure Keycloak is running
# Access: http://localhost:8180
# Default credentials: admin / admin123

# Start frontend
npm start

# Navigate to http://localhost:4200
# App will redirect to Keycloak login if not authenticated
```

### Important Notes

- **Client Type**: `vedex-frontend` must be configured as **PUBLIC** (Client Authentication = OFF)
- **Client Secret**: Frontend does NOT use client secret (SPAs can't store secrets securely)
- **Backend Client**: `vedex-backend` uses secret `ne9G2uzi37r4hQnRsxcN0tgvkr342idm` (confidential)
- **Token Storage**: Tokens handled by Keycloak JS library (not stored manually)
- **CORS**: Keycloak configured to accept requests from `http://localhost:4200`
- **Logout**: Use `KeycloakService.logout()` to clear session and redirect to Keycloak logout
- **User Roles**: Extracted from JWT `realm_access.roles` claim (handled by backend)

### Troubleshooting 401 Error

If you get **401 Unauthorized** when accessing Keycloak:

1. **Check client configuration**:
   - Client ID: `vedex-frontend`
   - Client Authentication: **OFF** (must be public)
   - Standard Flow: **Enabled**
   - Valid Redirect URIs: `http://localhost:4200/*`

2. **See detailed fix guide**: `KEYCLOAK-FIX-CLIENT.md`

3. **Quick test** (should return access_token):
   ```bash
   curl -X POST "http://localhost:8180/realms/vendex-master/protocol/openid-connect/token" \
     -d "client_id=vedex-frontend" \
     -d "grant_type=password" \
     -d "username=YOUR_USER" \
     -d "password=YOUR_PASSWORD"
   ```

## Backend Integration

### API Communication Pattern

All feature services follow this integration pattern:

1. **Service Structure**:
   - `listarTodosAPI()` - GET all items
   - `buscarPorIdAPI(id)` - GET by ID
   - `criarAPI(dto)` - POST create
   - `atualizarAPI(id, dto)` - PUT update
   - `excluirAPI(id)` - DELETE

2. **HTTP Headers**:
   - `Content-Type: application/json`
   - `Authorization: Bearer <jwt_token>` (automatically injected by Keycloak interceptor)
   - **Note**: `X-Tenant-ID` header **deprecated** - tenant context now extracted from JWT by backend

3. **DTO Converters**:
   - `converterDTOParaModel()` - Backend DTO → Frontend Model
   - `converterModelParaDTO()` - Frontend Model → Backend DTO

4. **Error Handling**:
   - All API calls have fallback to local/mock data
   - Errors logged to console
   - Toast messages for user feedback
   - 401/403 errors trigger Keycloak re-authentication

### Integrated Modules

**✅ Produtos (Products)** - COMPLETE
- Backend: `ProdutoController` at `/api/produtos`
- Frontend: `ProdutoService` with full CRUD via API
- Components: `produto-list`, `produto-view` (form)
- Features: List, create, edit, delete products via API

**✅ Categorias (Categories)** - COMPLETE
- Backend: `CategoriaController` at `/api/categorias`
- Frontend: `CategoriaService` with full CRUD via API
- Integration: Product form loads categories from API dynamically
- Cache: Categories cached in signal for performance

**Backend Controllers Available** (not yet integrated):
- `EstoqueController` - `/api/estoque`
- `CaixaController` - `/api/caixa`
- `VendaController` - `/api/vendas`
- `ClienteController` - `/api/clientes`
- `UsuarioController` - `/api/usuarios`
- `TenantController` - `/api/tenants`

## Important Implementation Notes

- **API URL**: Backend runs on port `8080`, not `3000`. Always use `environment.apiUrl`.
- **Authentication**: All routes protected by Keycloak. JWT tokens automatically injected into API calls via `KeycloakBearerInterceptor`.
- **Multitenancy**: Backend extracts `tenant_id` from JWT token. Frontend no longer needs to send `X-Tenant-ID` header manually (handled by backend via JWT).
- **Cash Register Workflow**: A cash register session must be open before sales can be tracked in the cash flow. The PDV checks `caixa.service.hasCaixaAberto()` before registering sales.
- **Stock Control**: Products have `controlarEstoque` and `permiteEstoqueNegativo` flags. Stock is automatically decremented after each sale in `pdv.service.atualizarEstoque()`.
- **Signal Updates**: Always use `.update()` for array/object mutations to maintain immutability and trigger reactivity correctly.
- **Component Structure**: Feature components use standalone components with lazy loading via `loadComponent()` or `loadChildren()` in routes.
- **HttpClient**: Configured in `app.config.ts` with `provideHttpClient(withInterceptorsFromDi())` to support Keycloak interceptor.
- **CORS**: Backend configured to accept requests from `http://localhost:4200`.

## Integration Checklist (for new modules)

When integrating a new backend module:

1. ✅ Verify backend controller exists and endpoints work
2. ✅ Create/update frontend service with API methods (`*API()` suffix)
3. ✅ Add DTO converters (backend DTO ↔ frontend model)
4. ✅ Implement error handling with fallback
5. ✅ Update components to use API methods instead of local methods
6. ✅ Test CRUD operations (create, read, update, delete)
7. ✅ Add toast notifications for user feedback
8. ✅ Ensure user is authenticated (JWT token automatically added by Keycloak interceptor)

**Note**: `X-Tenant-ID` header is no longer needed - tenant context is extracted from JWT token by the backend.
