import { IsISO31661Alpha2, IsISO31661Alpha3, IsLatitude, IsLongitude, Max, MaxLength, Min, MinLength } from "class-validator";

export class CreateFGSObjectDto {
    description: string
    @IsLongitude()
    longitude: number;
    @IsLatitude()
    latitude: number;
    @Min(-1000)
    @Max(+1000)
    obOffset: string|number;
    @Min(0)
    @Max(360)
    heading: number;
    @MaxLength(3)
    @MinLength(1)
    // @IsISO31661Alpha2()
    // @IsISO31661Alpha3()
    countryCode: string;
    modelId: number;
}
