import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UiConfigController } from './ui-config.controller';
import { UiConfigPublicController } from './ui-config-public.controller';
import { UiConfigService } from './ui-config.service';
import { Page, PageSchema } from './schemas/page.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Page.name, schema: PageSchema },
    ]),
  ],
  controllers: [UiConfigController, UiConfigPublicController],
  providers: [UiConfigService],
  exports: [UiConfigService],
})
export class UiConfigModule {}
