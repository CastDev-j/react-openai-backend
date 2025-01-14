import { IsString } from "class-validator";

export class imageVariationDto {

    @IsString()
    readonly baseImage: string; 

}