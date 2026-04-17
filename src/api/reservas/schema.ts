import { z } from 'zod';
import type { ReservaPayload } from './types';

export const reservaPayloadSchema = z.object({
  clientId: z.string().uuid('ID do cliente inválido'),
  barberId: z.string().uuid('ID do barbeiro inválido'),
  serviceIds: z.array(z.string().uuid('ID do serviço inválido')).min(1, 'Selecione pelo menos um serviço'),
  startAt: z.string().min(1, "Horário obrigatório"),
}) satisfies z.ZodSchema<ReservaPayload>;
