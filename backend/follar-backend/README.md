# FOLLAR Spring Boot & H2 Backend

This backend provides REST APIs for the FOLLAR fashion boutique, including:
- **JWT Authentication** (`/api/auth/login`, `/api/auth/register`)
- **Products & Categories Management** (`/api/products`, `/api/categories`)
- **Orders & Delivery Department Queue** (`/api/orders`)
- **H2 In-Memory Database** with Console at `/h2-console`

## Running the Backend

1. Ensure you have Java 17+ installed.
2. Navigate to `backend/follar-backend`.
3. Run with Maven:
   ```bash
   mvn spring-boot:run
   ```
4. The server runs on `http://localhost:8080`.
5. H2 Database Console is available at `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:follardb`, User: `sa`, Password: `password`).
