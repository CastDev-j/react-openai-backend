import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { GptService } from '@gpt/gpt.service';
import { OrthographyDto } from '@gpt/dtos/orthography.dto';
import { ProConDiscusserDto } from './dtos/proscons.dto';
import type { Response } from 'express';
import { TranslatorDto } from './dtos/translator.dto';
import { TextToAudioDto } from './dtos/text-to-audio.dto';
import * as path from 'path';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AudioToTextDto } from './dtos/AudioToTextDto';
import { ImageGenerationDto } from './dtos/ImageGenerationDto';
import { imageVariationDto } from './dtos/imageVariationDto';

@Controller('gpt')
export class GptController {
  constructor(private readonly gptService: GptService) {}

  @Post('orthography-check')
  orthographyCheck(@Body() orthographyDto: OrthographyDto) {
    return this.gptService.orthographyCheck(orthographyDto);
  }

  @Post('pros-cons-discusser')
  prosConsDiscusser(@Body() prosConsDiscusserDto: ProConDiscusserDto) {
    return this.gptService.prosConsDicusser(prosConsDiscusserDto);
  }

  @Post('pros-cons-discusser-stream')
  async prosConsDiscusserStream(
    @Body() prosConsDiscusserDto: ProConDiscusserDto,
    @Res() res: Response,
  ) {
    const stream =
      await this.gptService.prosConsDicusserStream(prosConsDiscusserDto);

    res.setHeader('Content-Type', 'application/json');
    res.status(HttpStatus.OK);

    for await (const chunk of stream) {
      const piece = chunk.choices[0].delta.content || '';
      res.write(piece);
    }

    res.end();
  }

  @Post('translator')
  async translator(@Body() translatorDto: TranslatorDto, @Res() res: Response) {
    const stream = await this.gptService.translator(translatorDto);

    res.setHeader('Content-Type', 'application/json');
    res.status(HttpStatus.OK);

    for await (const chunk of stream) {
      const piece = chunk.choices[0].delta.content || '';
      console.log(piece);
      res.write(piece);
    }

    res.end();
  }

  @Post('text-to-audio')
  async textToAudio(
    @Body() textToAudioDto: TextToAudioDto,
    @Res() res: Response,
  ) {
    const filePath = await this.gptService.textToAudio(textToAudioDto);
    res.setHeader('Content-Type', 'audio/mp3');
    res.status(HttpStatus.OK);
    res.sendFile(filePath);
  }

  @Get('text-to-audio/:fileId')
  async textToAudioWithId(
    @Param('fileId') fileId: string,
    @Res() res: Response,
  ) {
    const filePath = await this.gptService.textToAudioGetter(fileId);

    res.setHeader('Content-Type', 'audio/mp3');
    res.status(HttpStatus.OK);
    res.sendFile(filePath);
  }

  @Post('audio-to-text')
  @UseInterceptors(
    FileInterceptor('audio', {
      storage: diskStorage({
        destination: './generated/uploads',
        filename: (req, file, cb) => {
          const fileExtention = file.originalname.split('.').pop();
          const fileName = `${new Date().getTime()}.${fileExtention}`;
          return cb(null, fileName);
        },
      }),
    }),
  )
  async audioToText(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024 * 3,
            message: 'File too large',
          }),
          new FileTypeValidator({
            fileType: 'audio/*',
          }),
        ],
      }),
    )
    audio: Express.Multer.File,
    @Body()
    audioToTextDto: AudioToTextDto,
  ) {

    return await this.gptService.audioToText(audio, audioToTextDto);
  }

  @Post('image-generation')
  async imageGeneration(
    @Body() imageGenerationDto: ImageGenerationDto,
  ) {

    return await this.gptService.imageGeneration(imageGenerationDto);

  }

  @Get('image-generation/:imageInfo')
  async imageGenerationGetter(
    @Param('imageInfo') imageInfo: string,
    @Res() res: Response,
  ) {

    const filePath = this.gptService.getGeneratedImage(imageInfo);

    res.setHeader('Content-Type', 'image/png');
    res.status(HttpStatus.OK);
    res.sendFile(filePath);
  }

  @Post('image-variation')
  async imageVariation(
    @Body() imageVariationDto: imageVariationDto,
  ) {

    return await this.gptService.imageVariation(imageVariationDto);

  }
}
