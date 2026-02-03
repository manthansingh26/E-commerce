import dotenv from 'dotenv';
import { Server } from 'http';
import { connectDatabase, pool } from './config/database';
import { config } from './config/env';
import { createApp } from './app';

/**
 * Server Entry Point
 * Requirements: All requirements
 * 
 * Initializes and starts the authentication server:
 * - Loads environment variables
 * - Connects to PostgreSQL database
 * - Configures email service
 * - Starts Express server
 * - Handles graceful shutdown
 */

// Load environment variables
dotenv.config();

// Create Express application
const app = createApp();

// Server instance for graceful shutdown
let server: Server | null = null;

/**
 * Start the server
 * 
 * Steps:
 * 1. Initialize database connection
 * 2. Configure email service (via environment variables)
 * 3. Start Express server
 */
const startServer = async (): Promise<void> => {
  try {
    console.log('Starting AuraExpress Authentication Server...');

    // Step 1: Initialize database connection
    console.log('Connecting to database...');
    await connectDatabase();
    console.log('Database connected successfully');

    // Step 2: Email service is configured via environment variables
    // Validated in config/env.ts
    console.log('Email service configured');

    // Step 3: Start Express server
    const port = config.server.port;
    server = app.listen(port, () => {
      console.log('='.repeat(50));
      console.log(`🚀 Server is running on port ${port}`);
      console.log(`📧 Environment: ${config.server.nodeEnv}`);
      console.log(`🌐 Frontend URL: ${config.frontend.url}`);
      console.log(`💾 Database: ${config.database.host}:${config.database.port}`);
      console.log('='.repeat(50));
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

/**
 * Graceful shutdown handler
 * 
 * Closes server and database connections cleanly
 * Triggered by SIGTERM or SIGINT signals
 */
const gracefulShutdown = async (signal: string): Promise<void> => {
  console.log(`\n${signal} signal received: initiating graceful shutdown...`);

  try {
    // Close HTTP server
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server!.close((err) => {
          if (err) {
            console.error('Error closing HTTP server:', err);
            reject(err);
          } else {
            console.log('HTTP server closed');
            resolve();
          }
        });
      });
    }

    // Close database connection pool
    await pool.end();
    console.log('Database connection pool closed');

    console.log('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Start the server
startServer();

export default app;
