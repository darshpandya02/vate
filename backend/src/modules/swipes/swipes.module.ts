import { Module } from '@nestjs/common';
import { SwipesController } from './swipes.controller.js';
import { SwipesService } from './swipes.service.js';
import { MatchesModule } from '../matches/matches.module';

@Module({
  imports: [MatchesModule],
  controllers: [SwipesController],
  providers: [SwipesService],
  exports: [SwipesService],
})
export class SwipesModule {}
