import { Router } from 'express';
import { FactoryFunction } from 'tsyringe';
import { RecordController } from '../controllers/recordController';

const recordRouterFactory: FactoryFunction<Router> = (dependencyContainer) => {
  const router = Router();
  const recordsController = dependencyContainer.resolve(RecordController);

  router.get('/exists/:id', recordsController.recordExists);
  router.post('/', recordsController.createRecord);
  router.put('/:id', recordsController.updateRecord);
  router.delete('/:id', recordsController.deleteRecord);
  router.post('/find', recordsController.findRecord);
  router.post('/find/versions', recordsController.getRecordVersions);

  return router;
};

export const RECORD_ROUTER_SYMBOL = Symbol('RecordRouterFactory');

export { recordRouterFactory };
