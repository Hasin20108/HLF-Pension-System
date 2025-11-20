FROM golang:1.22-alpine AS builder

WORKDIR /app
COPY . .

RUN go mod download
RUN go mod vendor
RUN CGO_ENABLED=0 GOOS=linux go build -o chaincode -ldflags="-s -w" .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/

COPY --from=builder /app/chaincode .

ARG CC_SERVER_PORT
ENV CC_SERVER_PORT=${CC_SERVER_PORT}

EXPOSE ${CC_SERVER_PORT}
CMD ["./chaincode"]
