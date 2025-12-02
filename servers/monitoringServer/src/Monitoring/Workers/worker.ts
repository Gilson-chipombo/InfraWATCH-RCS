import { startQueueScheduler } from '../Queue/scheduler';
import '../Queue/monitoringWorker';

export async function startMonitoring()
{
  console.log('InfraWatch Em Acção...');
  await startQueueScheduler();
}
