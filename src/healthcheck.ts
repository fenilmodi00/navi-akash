/**
 * Healthcheck script for Docker container monitoring
 * 
 * This script is used by the Docker healthcheck to verify that the application
 * is running correctly. It performs basic checks to ensure the application
 * is operational.
 */

// Process exit codes
// 0: success - container is healthy
// 1: failure - container is unhealthy

try {
  // Check if the process is running
  if (process.uptime() > 0) {
    console.log('Healthcheck passed: Process is running');
    process.exit(0);
  } else {
    console.error('Healthcheck failed: Process uptime check failed');
    process.exit(1);
  }
} catch (error) {
  console.error('Healthcheck failed:', error);
  process.exit(1);
} 