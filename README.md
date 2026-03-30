# Tayyibt

A comprehensive platform for [project description].

## Project Structure

```
jawazaty-farhaty/
├── .augment/              # AI assistant configuration and guidelines
├── backend/               # Node.js/Express backend service
├── admin/                 # Admin dashboard
├── mobile/                # React Native mobile application
├── ai-service/            # Python AI matching service
├── docs/                  # Project documentation
├── scripts/               # Utility scripts
├── docker/                # Docker configurations
├── docker-compose.yml     # Docker compose for local development
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- PostgreSQL 15
- Redis 7
- Docker & Docker Compose

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd jawazaty-farhaty
```

2. Copy environment template:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration

### Development

Using Docker Compose (recommended):
```bash
docker-compose up -d
```

### Services

- **Backend API**: http://localhost:3000
- **AI Service**: http://localhost:5000
- **Database**: PostgreSQL on port 5432
- **Cache**: Redis on port 6379

## Technology Stack

- **Backend**: Node.js, Express
- **Frontend**: React
- **Mobile**: React Native
- **AI/ML**: Python, TensorFlow
- **Database**: PostgreSQL
- **Cache**: Redis
- **Containerization**: Docker

## Documentation

See the `docs/` directory for detailed documentation.

## Contributing

Please follow the guidelines in `.augment/rules/` directory.

## License

[Your License Here]
