import { NestFactory } from '@nestjs/core';

import { SeedModule } from './seed.module';

async function main() {
  const context = await NestFactory.createApplicationContext(SeedModule);

  await context.init();
  await context.close();
}

(async () => {
  try {
    await main();
  } catch (e) {
    console.error(e);
  }
})();