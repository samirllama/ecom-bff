FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod ./
# COPY go.sum ./ # Not present yet
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/server/main.go

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/main .
EXPOSE 3002
CMD ["./main"]
