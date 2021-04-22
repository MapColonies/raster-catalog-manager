import { Router } from 'express';
import { FactoryFunction } from 'tsyringe';
import { RecordController } from '../controllers/recordController';

const recordRouterFactory: FactoryFunction<Router> = (dependencyContainer) => {
  const router = Router();
  const recordsController = dependencyContainer.resolve(RecordController);

  router.get('/', recordsController.findResource);
  router.post('/', recordsController.createResource);
  router.get('/:recordId', recordsController.getResource);
  router.put('/:recordId', recordsController.updateResource);
  router.delete('/:recordId', recordsController.deleteResource);

  return router;
};

export { recordRouterFactory };
