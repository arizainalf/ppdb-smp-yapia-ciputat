import { Hono } from 'hono';
import { CalonSiswaController } from '../../../interface-adapters/controllers/CalonSiswaController.js';
import { CreateCalonSiswaUseCase } from '../../../application/use-cases/CreateCalonSiswaUseCase.js';
import { D1CalonSiswaRepository } from '../../../interface-adapters/repositories/D1CalonSiswaRepository.js';
import { requireAuth, requirePermission } from '../middlewares/authMiddleware.js';

export function createCalonSiswaRouter(): Hono {
  const router = new Hono();

  // Dependency Injection Composition Root
  const calonSiswaRepo = new D1CalonSiswaRepository();
  const createUseCase = new CreateCalonSiswaUseCase(calonSiswaRepo);
  const controller = new CalonSiswaController(createUseCase, calonSiswaRepo);

  // Routes
  // GET /:id & POST / sengaja publik: halaman cek status & formulir pendaftaran mandiri.
  router.get('/', requireAuth(), requirePermission('VIEW_PENDAFTAR'), controller.handleGetAll);
  router.get('/:id', controller.handleGetById);
  router.post('/', controller.handleCreate);
  router.patch('/:id/status', requireAuth(), requirePermission('VIEW_PENDAFTAR'), controller.handleUpdateStatus);

  return router;
}
