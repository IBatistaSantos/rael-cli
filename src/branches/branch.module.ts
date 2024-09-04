import { Module } from '@nestjs/common';
import { BranchCommand } from './commands/create-branch.command';
import { DeleteBranchCommand } from './commands/delete-branch.command';
@Module({
  imports: [],
  controllers: [],
  providers: [BranchCommand, DeleteBranchCommand],
})
export class BranchModule {}
