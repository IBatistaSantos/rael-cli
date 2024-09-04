import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { BranchModule } from './branches/branch.module';
import { RepoModule } from './repos/repo.module';
import { AuthModule } from './auth/auth.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    BranchModule,
    RepoModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
