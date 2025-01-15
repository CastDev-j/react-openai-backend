import { IsString } from 'class-validator';

export class MessageListDto {
  @IsString()
  readonly threadId: string;
}
