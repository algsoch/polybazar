# PolyBazar — AI Intelligence for Polymer Trade

<p align="center">
  <img src="docs/logo.svg" width="120" alt="PolyBazar Logo"/>
</p>

> A full-stack B2B marketplace for polymer granules and plastic waste trading with AI-powered pricing, visual classification, and intelligent negotiation.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PolyBazar Architecture                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐     ┌─────────────────────────────────────────────────┐  │
│   │   Browser   │────▶│              Next.js Frontend                   │  │
│   │   Client    │◀────│         (SSR + React + TailwindCSS)            │  │
│   └─────────────┘     └─────────────────────────────────────────────────┘  │
│          │                              │                                   │
│          │ WebSocket                    │ REST API                         │
│          ▼                              ▼                                   │
│   ┌─────────────────────────────────────────────────────────────────────┐  │
│   │                 Spring Boot API Gateway (Java)                      │  │
│   │  • Auth (JWT + Refresh Tokens) • Products • Orders • Invoices       │  │
│   │  • KYC Management • Admin Panel • WebSocket Chat Server             │  │
│   └─────────────────────────────────────────────────────────────────────┘  │
│                              │                                              │
│              ┌───────────────┼───────────────┐                             │
│              ▼               ▼               ▼                             │
│   ┌─────────────────┐ ┌───────────┐ ┌───────────────────────────────────┐ │
│   │  PostgreSQL     │ │  MongoDB  │ │     FastAPI ML Microservices      │ │
│   │  (Orders,Users) │ │ (Products,│ │  • Vision Classifier              │ │
│   │                 │ │  Chat)    │ │  • Embedding + FAISS/Chroma       │ │
│   └─────────────────┘ └───────────┘ │  • Price Prediction               │ │
│                                     │  • OCR (KYC Document Extraction)  │ │
│                                     └───────────────────────────────────┘ │
│                                              │                             │
│                                              ▼                             │
│                                     ┌───────────────────┐                  │
│                                     │  FAISS/Chroma     │                  │
│                                     │  (Vector Store)   │                  │
│                                     └───────────────────┘                  │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
polybazar/
├── frontend/                    # Next.js App Router + React + Tailwind
│   ├── app/                     # App Router pages
│   ├── components/              # React components
│   ├── hooks/                   # Custom hooks (WebSocket, etc.)
│   ├── lib/                     # Utilities, API client
│   └── public/                  # Static assets
├── backend/                     # Spring Boot API Gateway
│   ├── src/main/java/           # Java source
│   │   └── com/polybazar/
│   │       ├── controller/      # REST controllers
│   │       ├── service/         # Business logic
│   │       ├── repository/      # Data access
│   │       ├── model/           # Entities & DTOs
│   │       ├── security/        # JWT, Auth filters
│   │       └── config/          # App configuration
│   └── src/main/resources/      # Properties, templates
├── ml-services/                 # Python FastAPI microservices
│   ├── vision/                  # Image classification
│   ├── embeddings/              # Vector embeddings & search
│   ├── pricing/                 # Price prediction
│   └── ocr/                     # Document OCR
├── database/                    # Database schemas & migrations
│   ├── postgres/                # Flyway migrations
│   └── mongodb/                 # MongoDB init scripts
├── scripts/                     # Utility scripts
│   ├── generate_products.py     # Seed data generator
│   └── train_vision.py          # ML model training
├── tests/                       # E2E tests (Cypress)
├── docs/                        # Documentation
├── .github/workflows/           # CI/CD pipelines
├── docker-compose.yml           # Local development
├── render.yaml                  # Render.com deployment
└── Dockerfiles                  # Container definitions
```

## 🚀 Quick Start (Local Development)

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for frontend development)
- Java 17+ (for backend development)
- Python 3.10+ (for ML services development)

### 1. Clone and Setup Environment

```bash
git clone https://github.com/yourorg/polybazar.git
cd polybazar
cp .env.example .env
# Edit .env with your secrets
```

### 2. Start All Services

```bash
docker-compose up -d
```

### 3. Run Database Migrations & Seed Data

```bash
# Wait for services to start, then:
docker-compose exec backend ./gradlew flywayMigrate
python scripts/generate_products.py --count 100
```

### 4. Access the Application

| Service         | URL                         |
|-----------------|----------------------------|
| Frontend        | http://localhost:3000      |
| Backend API     | http://localhost:8080      |
| ML Services     | http://localhost:8000      |
| MongoDB Express | http://localhost:8081      |
| pgAdmin         | http://localhost:5050      |

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```bash
# Database
MONGO_URI=mongodb://localhost:27017/polybazar
POSTGRES_URL=jdbc:postgresql://localhost:5432/polybazar
POSTGRES_USER=polybazar
POSTGRES_PASSWORD=your_secure_password

# Authentication
JWT_SECRET=your_256_bit_secret_key_here
JWT_ACCESS_EXPIRY=900000        # 15 minutes in ms
JWT_REFRESH_EXPIRY=1209600000   # 14 days in ms

# Cloud Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Azure Storage (optional, for production)
AZURE_STORAGE_CONN_STRING=your_connection_string

# ML Configuration
ML_MODEL_PATH=./models
FAISS_INDEX_PATH=./data/faiss.index
VECTOR_DB_TYPE=faiss                    # or 'chroma'
EMBEDDING_MODEL=local                   # or 'openai'
OPENAI_API_KEY=sk-...                   # only if EMBEDDING_MODEL=openai

# Encryption
KYC_ENCRYPTION_KEY=your_aes_256_key    # 32 bytes base64 encoded

# External Services
PHONEPAY_MERCHANT_ID=your_merchant_id
PHONEPAY_SALT_KEY=your_salt_key
```

## 🧪 Running Tests

```bash
# Backend unit tests
cd backend && ./gradlew test

# ML services tests
cd ml-services && pytest

# E2E tests
cd tests && npx cypress run
```

## 📦 Deployment

### Using Student Credits

#### DigitalOcean ($200 Student Credits)
```bash
./scripts/deploy-digitalocean.sh
```
See [docs/DEPLOY_DO.md](docs/DEPLOY_DO.md) for detailed instructions.

#### Azure for Students ($100 Credits)
```bash
./scripts/deploy-azure.sh
```
See [docs/DEPLOY_AZURE.md](docs/DEPLOY_AZURE.md) for detailed instructions.

#### Render.com (Free Tier + Credits)
```bash
# Push to GitHub, then connect repo to Render
# Or use render.yaml for blueprint deployment
```

## 📚 Documentation

- [API Documentation](docs/API.md)
- [Frontend Guide](frontend/README.md)
- [Backend Guide](backend/README.md)
- [ML Services Guide](ml-services/README.md)
- [Contributing](CONTRIBUTING.md)
- [Feature Guide](FEATURE_GUIDE.md)

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

---

<p align="center">Made with ❤️ for sustainable polymer trading</p>
