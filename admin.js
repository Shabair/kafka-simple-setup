const { Kafka, logLevel } = require('kafkajs');

// Create Kafka instance
const kafka = new Kafka({
  clientId: 'kafka-admin',
  brokers: ['localhost:9092'],
  logLevel: logLevel.INFO,
});

// Create admin client
const admin = kafka.admin();

// Define topics to create
const topics = [
  {
    topic: 'user-registrations',
    numPartitions: 3,
    replicationFactor: 1,
    configEntries: [
      { name: 'retention.ms', value: '604800000' }, // 7 days
      { name: 'cleanup.policy', value: 'delete' },
    ],
  },
  {
    topic: 'order-events',
    numPartitions: 5,
    replicationFactor: 1,
    configEntries: [
      { name: 'retention.ms', value: '2592000000' }, // 30 days
      { name: 'cleanup.policy', value: 'compact,delete' },
    ],
  },
  {
    topic: 'payment-transactions',
    numPartitions: 2,
    replicationFactor: 1,
    configEntries: [
      { name: 'retention.ms', value: '86400000' }, // 1 day
    ],
  },
  {
    topic: 'inventory-updates',
    numPartitions: 3,
    replicationFactor: 1,
    configEntries: [
      { name: 'retention.bytes', value: '1073741824' }, // 1 GB
    ],
  },
  {
    topic: 'notification-events',
    numPartitions: 2,
    replicationFactor: 1,
  },
];

async function createTopics() {
  try {
    console.log('Connecting to Kafka...');
    await admin.connect();
    console.log('Connected successfully!');

    // Check if topics already exist
    const existingTopics = await admin.listTopics();
    console.log('Existing topics:', existingTopics);

    // Filter out topics that don't exist yet
    const topicsToCreate = topics.filter(
      (topicConfig) => !existingTopics.includes(topicConfig.topic)
    );

    if (topicsToCreate.length === 0) {
      console.log('All topics already exist.');
      return;
    }

    console.log(`Creating ${topicsToCreate.length} topics...`);
    
    // Create topics
    await admin.createTopics({
      topics: topicsToCreate,
      waitForLeaders: true,
      timeout: 30000, // 30 seconds
    });

    console.log('Topics created successfully!');

    // Verify topics were created
    const metadata = await admin.fetchTopicMetadata({
      topics: topics.map(t => t.topic),
    });
    
    console.log('\nCreated Topics:');
    metadata.topics.forEach((topic) => {
      console.log(`- ${topic.name} (Partitions: ${topic.partitions.length})`);
    });

  } catch (error) {
    console.error('Error creating topics:', error);
  } finally {
    await admin.disconnect();
    console.log('Disconnected from Kafka.');
  }
}

async function deleteTopic(topicName) {
  try {
    await admin.connect();
    console.log(`Deleting topic: ${topicName}`);
    
    await admin.deleteTopics({
      topics: [topicName],
      timeout: 30000,
    });
    
    console.log(`Topic "${topicName}" deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting topic ${topicName}:`, error);
  } finally {
    await admin.disconnect();
  }
}

async function listTopics() {
  try {
    await admin.connect();
    const topics = await admin.listTopics();
    
    console.log('\nAll Topics:');
    topics.forEach((topic, index) => {
      console.log(`${index + 1}. ${topic}`);
    });
    
    const metadata = await admin.fetchTopicMetadata();
    console.log('\nTopic Details:');
    metadata.topics.forEach((topic) => {
      console.log(`\nTopic: ${topic.name}`);
      console.log(`  Partitions: ${topic.partitions.length}`);
      topic.partitions.forEach((partition) => {
        console.log(`    Partition ${partition.partitionId}: Leader: ${partition.leader}`);
      });
    });
  } catch (error) {
    console.error('Error listing topics:', error);
  } finally {
    await admin.disconnect();
  }
}

// CLI interface
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'create':
      await createTopics();
      break;
    case 'list':
      await listTopics();
      break;
    case 'delete':
      const topicName = process.argv[3];
      if (!topicName) {
        console.error('Please provide a topic name to delete');
        process.exit(1);
      }
      await deleteTopic(topicName);
      break;
    default:
      console.log(`
Kafka Admin Tool
Usage:
  node admin.js create   - Create all predefined topics
  node admin.js list     - List all topics
  node admin.js delete <topicName> - Delete a specific topic
  
Example:
  node admin.js create
  node admin.js list
  node admin.js delete user-registrations
      `);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  createTopics,
  listTopics,
  deleteTopic,
  admin,
  topics,
};