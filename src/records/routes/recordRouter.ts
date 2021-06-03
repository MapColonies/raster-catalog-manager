import { Router } from 'express';
import { FactoryFunction } from 'tsyringe';
import { RecordController } from '../controllers/recordController';

const recordRouterFactory: FactoryFunction<Router> = (dependencyContainer) => {
  const router = Router();
  const recordsController = dependencyContainer.resolve(RecordController);

  router.get('/exists/:id', recordsController.recordExists);
  router.post('/', recordsController.createRecord);
  router.put('/:recordId', recordsController.updateRecord);
  router.delete('/:recordId', recordsController.deleteRecord);

  return router;
};

export { recordRouterFactory };
