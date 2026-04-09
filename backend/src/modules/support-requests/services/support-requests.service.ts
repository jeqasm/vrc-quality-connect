import { Injectable } from '@nestjs/common';

@Injectable()
export class SupportRequestsService {
  getMeta() {
    return {
      module: 'support-requests',
      implementationStatus: 'skeleton',
    };
  }
}
