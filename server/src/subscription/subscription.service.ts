import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SubscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  //

}
