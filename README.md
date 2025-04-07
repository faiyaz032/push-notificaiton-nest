# Push Notification System

A NestJS-based backend module for sending push notifications both immediately and at scheduled times. This system is designed to handle notifications for a user base of 40,000+ users.

## Setup Instructions

### Prerequisites

- Docker and Docker Compose installed on your machine
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/faiyaz032/push-notificaiton-nest.git
   cd push-notification-system
   ```

2. Start the application using Docker Compose:
   ```bash
   docker-compose up
   ```

This single command will:

- Build the NestJS application
- Set up Redis for the queue system
- Start all services
- Initialize mock user data
- Make the API available at http://localhost:3000

The Swagger API documentation will be available at: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

_You can test this application for **40k** users just by changing the `mockUserCount` property in `src/config/index.ts` file._

## API Testing Guidelines

### Using Swagger UI

The easiest way to test the API is through the Swagger UI interface:

1. Navigate to [http://localhost:3000/api/docs](http://localhost:3000/api/docs) in your browser
2. You'll see two main endpoints:
   - `POST /api/push-notification/send-now`
   - `POST /api/push-notification/schedule`
3. Click on an endpoint, then click the "Try it out" button
4. Provide the required request body (see examples below)
5. Click "Execute" to test the endpoint

### Request Body Format

Both endpoints accept the following JSON structure:

```json
{
  "title": "Notification Title",
  "message": "Notification Message Content",
  "scheduleAt": "2025-04-10T15:00:00.000Z" // Required only for /push/schedule
}
```

## Explanation of the Scheduling Logic

### Overview

The notification scheduling system is built using Bull queue with Redis as the backing store. This provides a robust, distributed job queue system that ensures notifications are delivered reliably, even if the application restarts.

### How It Works

1. **Immediate Notifications**:

   - When a request hits the `/api/push-notification/send-now` endpoint, the notification is immediately processed
   - The service fetches all users from the database. In our case it is 10. But I've designed the logic in a way that if the user is 40k then it will do batch processing.
   - For each user, it sends the notification to their device(in our case it simulates via console log)

2. **Scheduled Notifications**:

   - When a request hits the `/api/push-notification/schedule` endpoint, it fetches the user, maps the notification data with the user's device token and job details, and then adds the jobs to the queue in bulk.

   - The job contains the notification details and is scheduled to process at the specified time
   - Bull queue handles the timing precision based on the provided ISO timestamp

   - When the scheduled time arrives, the job is automatically moved to the active queue and processed

## License

[MIT License](LICENSE)
