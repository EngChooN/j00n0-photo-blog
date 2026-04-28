import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
  private readonly client: SupabaseClient;
  private readonly bucket: string;
  private readonly publicUrlBase: string;
  private readonly logger = new Logger(StorageService.name);

  constructor(config: ConfigService) {
    const url = config.get<string>('SUPABASE_URL');
    const key = config.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    const bucket = config.get<string>('SUPABASE_STORAGE_BUCKET', 'photos');
    if (!url || !key) {
      throw new Error(
        'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set',
      );
    }
    this.client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    this.bucket = bucket;
    this.publicUrlBase = `${url.replace(/\/$/, '')}/storage/v1/object/public/${bucket}`;
  }

  async upload(
    filename: string,
    body: Buffer,
    contentType = 'image/webp',
  ): Promise<string> {
    const { error } = await this.client.storage
      .from(this.bucket)
      .upload(filename, body, { contentType, upsert: false });
    if (error) {
      throw new InternalServerErrorException(
        `Storage upload failed: ${error.message}`,
      );
    }
    return `${this.publicUrlBase}/${filename}`;
  }

  async remove(srcs: string[]): Promise<void> {
    const paths = srcs
      .map((s) => this.srcToPath(s))
      .filter((p): p is string => p !== null);
    if (paths.length === 0) return;
    const { error } = await this.client.storage
      .from(this.bucket)
      .remove(paths);
    if (error) {
      this.logger.warn(`Storage remove failed: ${error.message}`);
    }
  }

  private srcToPath(src: string): string | null {
    const prefix = this.publicUrlBase + '/';
    if (!src.startsWith(prefix)) return null;
    return src.slice(prefix.length);
  }
}
