# JStore - E-Commerce Platform

A full-stack e-commerce application built with Spring Boot backend, React frontend, and Supabase database. Features product management, shopping cart, reviews, and admin panel.

## Tech Stack

### Backend
- **Spring Boot 3.5.7** with Java 21
- **PostgreSQL** via Supabase
- **Spring Security** with JWT authentication
- **Spring Data JPA** for ORM
- **Supabase Storage** for file uploads

### Frontend
- **React 18** with TypeScript 5.6
- **Vite 7.2** (build tool with HMR)
- **Tailwind CSS 3.4** (utility-first styling)
- **Shadcn/ui** (component library)
- **Zustand 5.0** (state management)
- **Axios 1.7** (HTTP client)
- **React Router v6** (client-side routing)

## Project Structure

```
JStore/
├── main/                      # Spring Boot backend
│   ├── src/main/java/         # Java source code
│   ├── src/main/resources/    # Configuration files (application.yml)
│   ├── pom.xml               # Maven dependencies
│   └── target/               # Build output (excluded from git)
├── frontend/                  # React TypeScript frontend
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API integration services
│   │   ├── stores/           # Zustand state management
│   │   └── types/            # TypeScript type definitions
│   ├── public/               # Static assets
│   ├── package.json          # npm dependencies
│   └── vite.config.ts        # Vite configuration
├── database/                  # Database schemas
│   └── supabase/             # SQL scripts for Supabase
└── docs/                     # Documentation
```

## Getting Started

### Prerequisites
- Java 21+ for backend
- Node.js 18+ and npm for frontend
- Supabase account with PostgreSQL database
- Git for version control

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd main
   ```

2. **Configure Supabase credentials** in `src/main/resources/application.yml`:
   ```yaml
   supabase:
     url: <your-supabase-url>
     key: <your-supabase-service-role-key>
   ```

3. **Run the backend:**
   ```bash
   mvn spring-boot:run
   ```
   Backend will start on `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   Frontend will start on `http://localhost:5173`

### Database Setup

1. **Create tables in Supabase:**
   - Go to Supabase Dashboard → SQL Editor
   - Run scripts from `database/supabase/` directory:
     - `schema.sql` - Main tables
     - `product_media.sql` - Product images/videos table
     - `add_delivered_status.sql` - Order status

2. **Create Storage buckets:**
   - Go to Supabase Dashboard → Storage
   - Create `product-images` bucket (public, max 5MB)
   - Create `product-videos` bucket (public, max 50MB)

3. **Admin Account Setup:**
   - **Default credentials** (ready to use):
     ```
     Username: jstore_admin
     Password: Admin12345
     ```
   - **Important**: See [docs/ADMIN_SETUP.md](docs/ADMIN_SETUP.md) for:
     - Creating new admin accounts
     - Fixing admin password issues
     - Granting admin roles
     - Troubleshooting authentication

## Features Implemented

### Phase 1: Review System ✅
- Star rating (1-5 stars)
- Customer comments/reviews
- Verified purchase badge
- Review validation and error handling

### Phase 2: Product Media Upload ✅
- **Multiple Media**: Upload multiple images and videos per product
- **Drag-and-Drop**: Intuitive file upload interface
- **Media Types**:
  - Images: JPG, PNG, WebP, GIF (max 5MB each)
  - Videos: MP4, WebM (max 50MB each)
- **Gallery Carousel**: Navigate through product media on detail pages
- **Supabase Storage**: Secure file storage with public CDN URLs
- **Backward Compatible**: Supports legacy single imageUrl field
- **Test Report**: See [docs/MEDIA_UPLOAD_TEST_REPORT.md](docs/MEDIA_UPLOAD_TEST_REPORT.md)

### Phase 3: Row Level Security (Optional)
- Database-level security policies
- User-scoped data access
- [Implementation pending - see docs/]

## API Endpoints

### Public Endpoints
- `GET /api/public/products` - List all products
- `GET /api/public/products/{id}` - Get product details
- `GET /api/public/reviews/product/{productId}` - Get product reviews

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token

### Reviews (Authenticated)
- `POST /api/reviews` - Submit review
- `PUT /api/reviews/{id}` - Update review
- `DELETE /api/reviews/{id}` - Delete review

### Media (Admin Only)
- `POST /api/admin/media/products/{productId}/images` - Upload image
- `POST /api/admin/media/products/{productId}/videos` - Upload video
- `GET /api/admin/media/products/{productId}` - Get product media
- `DELETE /api/admin/media/{mediaId}` - Delete media

### Cart (Authenticated)
- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/{itemId}` - Update cart item
- `DELETE /api/cart/{itemId}` - Remove item from cart

## Authentication

The application uses JWT (JSON Web Token) authentication:

1. **User registers** via `/api/auth/register`
2. **User logs in** via `/api/auth/login` (returns JWT token)
3. **Token stored** in localStorage on frontend
4. **Axios interceptor** automatically adds `Authorization: Bearer <token>` to requests
5. **Token refreshed** automatically via `/api/auth/refresh`

### User Roles
- **ROLE_CUSTOMER** - Regular users, can review and purchase
- **ROLE_STAFF** - Staff members, can manage products
- **ROLE_ADMIN** - Administrators, full access

## Running Both Servers Locally

### Option 1: Two Terminal Windows
Terminal 1:
```bash
cd /home/thanhjash/JStore/main && mvn spring-boot:run
```

Terminal 2:
```bash
cd /home/thanhjash/JStore/frontend && npm run dev
```

### Option 2: Background Process (Linux/Mac)
```bash
# Start backend in background
cd /home/thanhjash/JStore/main && nohup mvn spring-boot:run > backend.log 2>&1 &

# Start frontend in background
cd /home/thanhjash/JStore/frontend && npm run dev > frontend.log 2>&1 &
```

### Stopping Servers
```bash
# View running processes
ps aux | grep -E "mvn|node"

# Kill specific process
kill -9 <PID>
```

## Development Notes

### CORS Configuration
The backend has CORS enabled for `http://localhost:5173` to allow frontend requests during development.

### Environment Variables
Frontend uses `.env.local` for environment-specific variables (not committed to git).

Backend uses `application.yml` for Spring Boot configuration.

### Database Connection
The application connects to Supabase PostgreSQL at `db.doxksbweeaxtewrlcvat.supabase.co:5432`

## Testing

### Backend Testing
Run tests with Maven:
```bash
mvn test
```

### Frontend Testing
Run frontend tests:
```bash
npm run test
```

## Documentation

See the `docs/` directory for detailed documentation:

### Quick Start
- **[docs/README.md](docs/README.md)** - Complete documentation index
- **[docs/ADMIN_SETUP.md](docs/ADMIN_SETUP.md)** - Admin account creation and troubleshooting
- **[docs/CONFIGURATION_GUIDE.md](docs/CONFIGURATION_GUIDE.md)** - Backend configuration guide
- **[docs/TESTING_AUTH.md](docs/TESTING_AUTH.md)** - Authentication testing guide

### Implementation & Testing
- **[docs/MEDIA_UPLOAD_TEST_REPORT.md](docs/MEDIA_UPLOAD_TEST_REPORT.md)** - Media upload feature test results
- **[docs/IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md)** - Feature implementation progress
- **[docs/FRONTEND_SETUP_COMPLETE.md](docs/FRONTEND_SETUP_COMPLETE.md)** - Frontend setup details

### Testing Scripts
- **[docs/scripts/](docs/scripts/)** - Comprehensive API test scripts
- **[docs/complete_test_results.md](docs/complete_test_results.md)** - Test execution results

## Troubleshooting

### CORS Errors
Ensure backend is running on `http://localhost:8080` and frontend on `http://localhost:5173`.

### API Connection Issues
Check that both servers are running:
```bash
curl http://localhost:8080/api/public/products
curl http://localhost:5173
```

### Database Connection
Verify Supabase credentials in `main/src/main/resources/application.yml`.

### Module Not Found Errors
In frontend directory, run:
```bash
rm -rf node_modules package-lock.json
npm install
```

In backend directory, run:
```bash
mvn clean install
```

## Future Enhancements

- [ ] Implement Row Level Security (RLS) for database
- [ ] Add product recommendations
- [ ] Implement search and filtering
- [ ] Add payment integration
- [ ] Implement order tracking
- [ ] Add email notifications
- [ ] Implement user profile management

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Commit with clear messages
4. Push to your fork
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Contact

For questions or issues, please create an issue in the GitHub repository.
