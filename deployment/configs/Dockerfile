# AGENT - Advanced AI Multi-Domain Platform
# Production Docker Configuration

FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    AGENT_ENV=production \
    AGENT_PORT=8000

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        curl \
        git \
        build-essential \
        pkg-config \
        libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Rust (for performance components)
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Create non-root user
RUN useradd --create-home --shell /bin/bash agent
USER agent
WORKDIR /home/agent/app

# Copy requirements first for better caching
COPY --chown=agent:agent requirements*.txt ./

# Upgrade pip and install Python dependencies
RUN python -m pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt \
    && if [ -f requirements-vercel.txt ]; then pip install --no-cache-dir -r requirements-vercel.txt; fi \
    && pip install --no-cache-dir gunicorn uvicorn[standard]

# Copy project files
COPY --chown=agent:agent . .

# Build Rust components
RUN if [ -d "rust" ]; then \
        cd rust && cargo build --release; \
    fi

# Create necessary directories
RUN mkdir -p logs data temp static/uploads

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start command
CMD ["python", "run_agent.py", "--prod", "--host", "0.0.0.0", "--port", "8000"]
