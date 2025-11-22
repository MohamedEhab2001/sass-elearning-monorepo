import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MongooseHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('health')
@SkipThrottle() // Health checks should not be rate limited
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private mongoose: MongooseHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Check if MongoDB is responsive
      () => this.mongoose.pingCheck('database'),
      // Check if memory heap is below 150MB
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      // Check if RSS memory is below 300MB
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
      // Check if disk storage is below 90% usage
      () => this.disk.checkStorage('disk', { path: '/', thresholdPercent: 0.9 }),
    ]);
  }

  @Get('db')
  @HealthCheck()
  checkDatabase() {
    return this.health.check([
      () => this.mongoose.pingCheck('database', { timeout: 5000 }),
    ]);
  }

  @Get('memory')
  @HealthCheck()
  checkMemory() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 400 * 1024 * 1024),
    ]);
  }
}
