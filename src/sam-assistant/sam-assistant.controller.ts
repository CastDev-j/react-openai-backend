import { Body, Controller, Get, Post } from '@nestjs/common';
import { SamAssistantService } from './sam-assistant.service';
import { QuestionDto } from './dtos/question.dto';
import { MessageListDto } from './dtos/MessageListDto';

@Controller('sam-assistant')
export class SamAssistantController {
  constructor(private readonly samAssistantService: SamAssistantService) {}

  @Post('create-thread')
  async createThread() {
    return await this.samAssistantService.creatThread();
  }

  @Post('user-question')
  async userQuestion(
    @Body() questionDto: QuestionDto
  ) {
    return await this.samAssistantService.userQuestion(questionDto);
  }

  @Get('get-message-list')
  async getMessageList(
    @Body() messageListDto: MessageListDto

  ) {
    return await this.samAssistantService.getMessageList(messageListDto);
  }

}
