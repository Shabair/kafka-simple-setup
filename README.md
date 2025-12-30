# Kafka Local Development Stack

A complete local Kafka development environment with Docker Compose and a Node.js administration tool for managing topics.

## Features

- 🐳 **Dockerized Kafka Stack**: Single-node Kafka cluster with Zookeeper
- 🎯 **Topic Management**: Create, list, and delete Kafka topics programmatically
- 📊 **Kafka UI**: Web-based interface for monitoring and administration
- 🔧 **Pre-configured Topics**: Common event-driven architecture topics with sensible defaults
- 🚀 **Easy Setup**: Simple commands to get started in minutes

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/get-npm) (comes with Node.js)

## Quick Start

### 1. Clone and Setup

```bash
# Clone your repository (replace with actual command)
# git clone <your-repo-url>
# cd <your-repo-directory>

# Install dependencies
npm install
```

### 2. Start Kafka Services

```bash
# Start all services in detached mode
docker-compose up -d

# Verify services are running
docker-compose ps
```

### 3. Create Topics

```bash
# Wait 30-60 seconds for Kafka to fully start
npm run create-topics

# Or using direct Node.js command
node admin.js create
```

### 4. Access Kafka UI

Open your browser and navigate to: [http://localhost:8080](http://localhost:8080)

## Project Structure

```
├── docker-compose.yml     # Docker Compose configuration
├── admin.js              # Kafka topic administration script
├── package.json          # Node.js dependencies and scripts
├── .env                  # Environment variables (optional)
└── README.md            # This file
```

## Services Overview

| Service | Port | Description |
|---------|------|-------------|
| Zookeeper | 2181 | Kafka coordination service |
| Kafka Broker | 9092 (external), 29092 (internal) | Main Kafka message broker |
| Kafka UI | 8080 | Web interface for monitoring |

## Topic Administration

The `admin.js` script provides a CLI interface for managing Kafka topics:

### Available Commands

```bash
# Create all pre-defined topics
npm run create-topics
# or
node admin.js create

# List all existing topics
npm run list-topics
# or
node admin.js list

# Delete a specific topic
node admin.js delete <topic-name>
# Example: node admin.js delete user-registrations
```

### Pre-configured Topics

The following topics are created by default:

| Topic Name | Partitions | Retention | Purpose |
|------------|------------|-----------|---------|
| user-registrations | 3 | 7 days | User registration events |
| order-events | 5 | 30 days | Order lifecycle events |
| payment-transactions | 2 | 1 day | Payment processing events |
| inventory-updates | 3 | 1 GB | Inventory change events |
| notification-events | 2 | Default | Notification delivery events |

## Customization

### Modifying Topic Configurations

Edit the `topics` array in `admin.js` to change topic configurations:

```javascript
const topics = [
  {
    topic: 'your-topic-name',
    numPartitions: 3,           // Number of partitions
    replicationFactor: 1,       // Replication factor (1 for single node)
    configEntries: [
      { name: 'retention.ms', value: '604800000' }, // Retention period
      { name: 'cleanup.policy', value: 'delete' },  // Cleanup policy
    ],
  },
  // ... add more topics as needed
];
```

### Environment Variables

Create a `.env` file for custom configurations:

```env
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=kafka-admin
```

## Management Commands

### Docker Compose Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f kafka
docker-compose logs -f kafka-ui

# Restart services
docker-compose restart

# Remove everything (including volumes)
docker-compose down -v
```

### Administrative Tasks

```bash
# Check if Kafka is ready
docker-compose exec kafka kafka-topics --bootstrap-server localhost:9092 --list

# Describe a specific topic
docker-compose exec kafka kafka-topics --bootstrap-server localhost:9092 \
  --describe --topic user-registrations

# Produce a test message
docker-compose exec kafka kafka-console-producer --bootstrap-server localhost:9092 \
  --topic user-registrations

# Consume messages
docker-compose exec kafka kafka-console-consumer --bootstrap-server localhost:9092 \
  --topic user-registrations --from-beginning
```

## Troubleshooting

### Common Issues

1. **Kafka not starting properly:**
   ```bash
   # Check logs
   docker-compose logs kafka
   
   # Restart services
   docker-compose restart
   ```

2. **Connection errors from admin script:**
   - Ensure Kafka is fully started (wait 60 seconds after `docker-compose up`)
   - Verify Kafka is accessible on `localhost:9092`

3. **Port conflicts:**
   - Check if ports 2181, 9092, 29092, or 8080 are already in use
   - Modify ports in `docker-compose.yml` if needed

4. **Topic creation fails:**
   - Check if topics already exist: `npm run list-topics`
   - Verify Kafka broker is healthy in Kafka UI

### Resetting Everything

```bash
# Stop and remove all containers and volumes
docker-compose down -v

# Remove node_modules
rm -rf node_modules

# Clean start
npm install
docker-compose up -d
# Wait 60 seconds
npm run create-topics
```

## Development

### Extending the Admin Script

The `admin.js` exports functions that can be used in other scripts:

```javascript
const { createTopics, listTopics, deleteTopic } = require('./admin.js');

// Use in your own scripts
async function myScript() {
  await createTopics();
  await listTopics();
}
```

### Adding More Features

1. **Modify `docker-compose.yml`** to add more services (e.g., Kafka Connect, Schema Registry)
2. **Extend `admin.js`** with additional administrative functions
3. **Create producer/consumer examples** for testing

## Monitoring

### Kafka UI

Access the web interface at `http://localhost:8080` to:
- View topics and partitions
- Monitor message rates
- Browse messages
- Check consumer groups
- View broker metrics

### Health Checks

```bash
# Check Zookeeper
docker-compose exec zookeeper zkServer.sh status

# Check Kafka
docker-compose exec kafka kafka-topics --bootstrap-server localhost:9092 --list
```

## Best Practices

1. **Wait for startup**: Kafka needs 30-60 seconds to fully initialize
2. **Use appropriate partitions**: More partitions increase parallelism but also overhead
3. **Set retention policies**: Configure retention based on your data importance
4. **Regular maintenance**: Monitor disk usage and topic growth
5. **Backup configurations**: Keep your `docker-compose.yml` and `admin.js` in version control

## License

MIT

## Contributing

Feel free to submit issues and enhancement requests!

## Support

For issues and questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review Kafka documentation
3. Open an issue in the repository

---

**Note**: This setup is for local development only. For production environments, consult the [Apache Kafka documentation](https://kafka.apache.org/documentation/) and consider using managed Kafka services or proper cluster configurations.