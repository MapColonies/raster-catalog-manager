import { Router } from 'express';
import { FactoryFunction } from 'tsyringe';
import { JobController } from '../controllers/jobController';
import { TaskController } from '../controllers/taskController';

const jobRouterFactory: FactoryFunction<Router> = (dependencyContainer) => {
  const router = Router();
  const jobsController = dependencyContainer.resolve(JobController);
  const tasksController = dependencyContainer.resolve(TaskController);

  router.get('/', jobsController.findResource);
  router.post('/', jobsController.createResource);
  router.get('/:jobId', jobsController.getResource);
  router.put('/:jobId', jobsController.updateResource);
  router.delete('/:jobId', jobsController.deleteResource);

  router.get('/:jobId/tasks', tasksController.getResources);
  router.post('/:jobId/tasks', tasksController.createResource);
  router.get('/:jobId/tasks/:taskId', tasksController.getResource);
  router.put('/:jobId/tasks/:taskId', tasksController.updateResource);
  router.delete('/:jobId/tasks/:taskId', tasksController.deleteResource);

  return router;
};

export { jobRouterFactory };
