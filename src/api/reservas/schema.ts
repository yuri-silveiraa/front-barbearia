import { z } from 'zod';
import type { ReservaPayload } from './types';

export const reservaPayloadSchema = z.object({
  clientId: z.string().uuid('ID do cliente inválido'),
  barberId: z.string().uuid('ID do barbeiro inválido'),
  serviceId: z.string().uuid('ID do serviço inválido'),
  timeId: z.string().uuid('ID do horário inválido'),
}) satisfies z.ZodSchema<ReservaPayload>;