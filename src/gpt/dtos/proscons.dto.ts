import { IsString } from 'class-validator';

export class ProConDiscusserDto {
  @IsString()
  readonly prompt: string;
}
