# Google Wallet App Docker Commands

# Build and run in production mode
.PHONY: build
build:
	docker-compose build

.PHONY: up
up:
	docker-compose up -d

.PHONY: down
down:
	docker-compose down

.PHONY: logs
logs:
	docker-compose logs -f

.PHONY: restart
restart:
	docker-compose restart

# Development commands
.PHONY: dev-build
dev-build:
	docker-compose -f docker-compose.dev.yml build

.PHONY: dev-up
dev-up:
	docker-compose -f docker-compose.dev.yml up

.PHONY: dev-down
dev-down:
	docker-compose -f docker-compose.dev.yml down

.PHONY: dev-logs
dev-logs:
	docker-compose -f docker-compose.dev.yml logs -f

# Utility commands
.PHONY: clean
clean:
	docker-compose down -v --rmi all --remove-orphans

.PHONY: shell
shell:
	docker-compose exec google-wallet-app sh

.PHONY: dev-shell
dev-shell:
	docker-compose -f docker-compose.dev.yml exec google-wallet-app-dev sh

# Health check
.PHONY: health
health:
	curl -f http://localhost:3000 || exit 1

# Help
.PHONY: help
help:
	@echo "Available commands:"
	@echo "  build      - Build the production Docker image"
	@echo "  up         - Start the production container"
	@echo "  down       - Stop the production container"
	@echo "  logs       - View production container logs"
	@echo "  restart    - Restart the production container"
	@echo "  dev-build  - Build the development Docker image"
	@echo "  dev-up     - Start the development container"
	@echo "  dev-down   - Stop the development container"
	@echo "  dev-logs   - View development container logs"
	@echo "  clean      - Remove all containers, volumes, and images"
	@echo "  shell      - Access production container shell"
	@echo "  dev-shell  - Access development container shell"
	@echo "  health     - Check if the app is running"
	@echo "  help       - Show this help message"
