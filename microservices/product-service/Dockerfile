# ---- Build Stage ----
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Pre-copy dependency files for better layer caching
COPY go.mod go.sum ./
RUN go mod download

# Copy the entire service source
COPY . .

# Build a static binary
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# ---- Run Stage ----
FROM alpine:latest

WORKDIR /app

# Copy the binary from the build stage
COPY --from=builder /app/main .

EXPOSE 3002

CMD ["./main"]
