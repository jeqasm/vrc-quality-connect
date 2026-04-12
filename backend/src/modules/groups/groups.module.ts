import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { GroupsController } from './controllers/groups.controller';
import { GroupsRepository } from './repositories/groups.repository';
import { GroupsService } from './services/groups.service';

@Module({
  imports: [AuthModule],
  controllers: [GroupsController],
  providers: [GroupsRepository, GroupsService],
  exports: [GroupsRepository, GroupsService],
})
export class GroupsModule {}
