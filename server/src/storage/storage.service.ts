import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

type Driver = 'supabase' | 'local';

const SAFE_FILENAME = /^[A-Za-z0-9._-]+$/;

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly driver: Driver;

  // supabase driver
  private supabase?: SupabaseClient;
  private supabaseBucket = '';
  private supabasePublicUrlBase = '';

  // local driver
  private localUploadsDir = '';
  private localPublicUrlBase = '';

  constructor(config: ConfigService) {
    const isProd = process.env.NODE_ENV === 'production';
    const raw = config.get<string>('STORAGE_DRIVER');
    const driver = raw ?? (isProd ? 'supabase' : undefined);
    if (driver !== 'supabase' && driver !== 'local') {
      throw new Error(
        `STORAGE_DRIVER must be set to 'local' or 'supabase' (got: ${raw ?? '(unset)'})`,
      );
    }
    this.driver = driver;

    if (driver === 'local') {
      this.localUploadsDir = path.resolve(process.cwd(), 'uploads');
      const base = config.get<string>('PUBLIC_API_BASE_URL', 'http://localhost:3001');
      this.localPublicUrlBase = `${base.replace(/\/$/, '')}/uploads`;
      return;
    }

    const url = config.get<string>('SUPABASE_URL');
    const key = config.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    const bucket = config.get<string>('SUPABASE_STORAGE_BUCKET', 'photos');
    if (!url || !key) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
    }
    this.supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    this.supabaseBucket = bucket;
    this.supabasePublicUrlBase = `${url.replace(/\/$/, '')}/storage/v1/object/public/${bucket}`;
  }

  async onModuleInit(): Promise<void> {
    if (this.driver === 'local') {
      await fs.promises.mkdir(this.localUploadsDir, { recursive: true });
    }
  }

  async upload(
    filename: string,
    body: Buffer,
    contentType = 'image/webp',
  ): Promise<string> {
    if (!SAFE_FILENAME.test(filename)) {
      throw new BadRequestException('Invalid filename');
    }

    if (this.driver === 'local') {
      await fs.promises.writeFile(
        path.join(this.localUploadsDir, filename),
        body,
      );
      return `${this.localPublicUrlBase}/${filename}`;
    }

    const { error } = await this.supabase!.storage
      .from(this.supabaseBucket)
      .upload(filename, body, { contentType, upsert: false });
    if (error) {
      throw new InternalServerErrorException(
        `Storage upload failed: ${error.message}`,
      );
    }
    return `${this.supabasePublicUrlBase}/${filename}`;
  }

  async remove(srcs: string[]): Promise<void> {
    const paths = srcs
      .map((s) => this.srcToPath(s))
      .filter((p): p is string => p !== null);
    if (paths.length === 0) return;

    if (this.driver === 'local') {
      await Promise.all(
        paths.map((name) =>
          fs.promises
            .unlink(path.join(this.localUploadsDir, name))
            .catch((err) => {
              if (err.code !== 'ENOENT') {
                this.logger.warn(`Local remove failed: ${name} — ${err.message}`);
              }
            }),
        ),
      );
      return;
    }

    const { error } = await this.supabase!.storage
      .from(this.supabaseBucket)
      .remove(paths);
    if (error) {
      this.logger.warn(`Storage remove failed: ${error.message}`);
    }
  }

  private srcToPath(src: string): string | null {
    const prefix =
      this.driver === 'local'
        ? this.localPublicUrlBase + '/'
        : this.supabasePublicUrlBase + '/';
    if (!src.startsWith(prefix)) return null;
    const name = src.slice(prefix.length);
    if (!SAFE_FILENAME.test(name)) return null;
    return name;
  }
}
