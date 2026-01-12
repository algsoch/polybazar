# Contributing to PolyBazar

Thank you for your interest in contributing to PolyBazar! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

## 📜 Code of Conduct

Please be respectful and constructive in all interactions. We are committed to providing a welcoming and inclusive environment for all contributors.

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (for frontend)
- **Java 17** (for backend)
- **Python 3.11** (for ML services)
- **Docker & Docker Compose**
- **Git**

### Fork & Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/algsoch/polybazar.git
cd polybazar

# Add upstream remote
git remote add upstream https://github.com/algsoch/polybazar.git
```

### Environment Setup

```bash
# Copy environment file
cp .env.example .env

# Start dependencies
docker compose up -d mongodb postgres redis

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && ./gradlew build

# Install ML service dependencies
cd ../ml-service && pip install -r requirements.txt
```

## 🔄 Development Workflow

### Branch Naming

Use descriptive branch names:

- `feature/add-user-authentication`
- `fix/resolve-payment-bug`
- `docs/update-readme`
- `refactor/improve-product-service`
- `test/add-order-tests`

### Development Commands

**Frontend:**
```bash
cd frontend
npm run dev      # Start development server
npm run lint     # Run ESLint
npm run build    # Production build
npm run test     # Run tests
```

**Backend:**
```bash
cd backend
./gradlew bootRun   # Start development server
./gradlew test      # Run tests
./gradlew check     # Run all checks
./gradlew build     # Production build
```

**ML Service:**
```bash
cd ml-service
uvicorn app.main:app --reload  # Start development server
pytest                         # Run tests
black .                        # Format code
mypy .                         # Type checking
```

## 📝 Coding Standards

### Java (Backend)

- Follow [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html)
- Use meaningful variable/method names
- Add Javadoc for public methods
- Write unit tests for all services

```java
/**
 * Creates a new product listing.
 *
 * @param request the product creation request
 * @param userId the ID of the user creating the product
 * @return the created product
 * @throws ProductException if validation fails
 */
public Product createProduct(ProductRequest request, UUID userId) {
    // Implementation
}
```

### TypeScript/JavaScript (Frontend)

- Use TypeScript for type safety
- Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use functional components with hooks
- Implement proper error handling

```typescript
interface ProductCardProps {
  product: Product;
  onAddToCart?: (id: string) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  // Component implementation
}
```

### Python (ML Service)

- Follow [PEP 8](https://pep8.org/) style guide
- Use type hints
- Add docstrings for all functions
- Use Black for formatting

```python
def predict_price(
    polymer_type: str,
    quantity: float,
    features: dict[str, Any]
) -> PricePrediction:
    """
    Predict the price for a polymer product.

    Args:
        polymer_type: Type of polymer (e.g., "HDPE", "PP")
        quantity: Quantity in kg
        features: Additional features for prediction

    Returns:
        PricePrediction containing estimated price and confidence

    Raises:
        ValidationError: If input parameters are invalid
    """
    # Implementation
```

## 💬 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### Examples

```bash
feat(auth): add JWT refresh token rotation
fix(products): resolve pagination issue in search
docs(readme): update installation instructions
test(orders): add integration tests for order service
```

## 🔍 Pull Request Process

### Before Submitting

1. **Sync with upstream:**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run all tests:**
   ```bash
   # Frontend
   cd frontend && npm run test && npm run lint
   
   # Backend
   cd backend && ./gradlew check
   
   # ML Service
   cd ml-service && pytest && black --check .
   ```

3. **Update documentation** if needed

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
```

### Review Process

1. Create PR against `main` branch
2. Ensure all CI checks pass
3. Request review from maintainers
4. Address feedback promptly
5. Squash commits before merge

## 🐛 Issue Reporting

### Bug Reports

Include:
- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, browser, versions)
- Screenshots/logs if applicable

### Feature Requests

Include:
- Clear description of the feature
- Use case/motivation
- Proposed implementation (optional)
- Alternatives considered

### Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature request
- `documentation`: Documentation improvements
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed
- `priority: high`: Urgent issues

## 🏗️ Architecture Decisions

For significant changes, please:

1. Open an issue first to discuss
2. Document the decision in `/docs/decisions/`
3. Use [ADR format](https://adr.github.io/)

## 📞 Getting Help

- **Discord**: [Join our community](#)
- **Discussions**: Use GitHub Discussions
- **Email**: dev@polybazar.com

## 🙏 Recognition

Contributors will be recognized in:
- `CONTRIBUTORS.md` file
- Release notes
- Project documentation

---

Thank you for contributing to PolyBazar! 🎉
