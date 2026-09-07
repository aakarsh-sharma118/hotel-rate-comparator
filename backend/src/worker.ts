import { NativeConnection, Worker } from '@temporalio/worker';
import * as activities from './activities/supplierActivities';
import { SERVER_CONFIG } from './constants/appConsts';

export const TASK_QUEUE_NAME = SERVER_CONFIG.TASK_QUEUE_NAME;

export async function runWorker() {
  const temporalAddress = process.env.TEMPORAL_ADDRESS || '127.0.0.1:7233';
  let isShuttingDown = false;

  const handleShutdown = () => {
    isShuttingDown = true;
  };
  process.on('SIGINT', handleShutdown);
  process.on('SIGTERM', handleShutdown);

  console.log(`[Worker] Initializing Temporal background worker for task queue "${TASK_QUEUE_NAME}"...`);

  while (!isShuttingDown) {
    try {
      console.log(`[Worker] Attempting connection to Temporal server at ${temporalAddress}...`);
      const connection = await NativeConnection.connect({
        address: temporalAddress,
      });

      const worker = await Worker.create({
        connection,
        namespace: 'default',
        taskQueue: TASK_QUEUE_NAME,
        workflowsPath: require.resolve('./workflows/hotelSearchWorkflow'),
        activities,
      });

      console.log(`[Worker] Successfully connected! Temporal Worker listening on task queue "${TASK_QUEUE_NAME}".`);
      await worker.run();
      break;
    } catch (err: any) {
      if (isShuttingDown) break;

      const isConnectionRefused =
        err?.message?.includes('ConnectionRefused') ||
        err?.message?.includes('actively refused') ||
        err?.message?.includes('tcp connect error') ||
        err?.message?.includes('ConnectError');

      if (isConnectionRefused) {
        console.warn(
          `[Worker] Temporal server is currently offline or unreachable at ${temporalAddress}.`
        );
        console.log(
          `[Worker] The backend is operating in Resilient Direct-Comparison fallback mode.`
        );
        console.log(
          `[Worker] Worker will automatically reconnect when Temporal server is started. Retrying in 10s...`
        );
      } else {
        console.error(`[Worker] Temporal worker error: ${err?.message || err}. Retrying in 10s...`);
      }

      // Wait 10 seconds before next connection attempt
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }
  }

  if (isShuttingDown) {
    console.log('[Worker] Gracefully shut down Temporal worker.');
  }
}

if (require.main === module || process.argv[1]?.includes('worker.ts')) {
  runWorker().catch((err) => {
    console.error('[Worker] Unexpected error in worker process:', err);
  });
}
