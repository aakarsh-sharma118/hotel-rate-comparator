import { NativeConnection, Worker } from '@temporalio/worker';
import * as activities from './activities/supplierActivities';
import * as path from 'path';
import { SERVER_CONFIG } from './constants/appConsts';

export const TASK_QUEUE_NAME = SERVER_CONFIG.TASK_QUEUE_NAME;

export async function runWorker() {
  const temporalAddress = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
  console.log(`[Worker] Connecting to Temporal server at ${temporalAddress}...`);

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

  console.log(`[Worker] Temporal Worker listening on task queue "${TASK_QUEUE_NAME}"...`);
  await worker.run();
}

if (require.main === module || process.argv[1]?.includes('worker.ts')) {
  runWorker().catch((err) => {
    console.error('[Worker] Fatal error running Temporal worker:', err);
    process.exit(1);
  });
}
