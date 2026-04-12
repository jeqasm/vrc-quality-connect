import { IsArray, IsString } from 'class-validator';

export class AssignGroupPermissionsDto {
  @IsArray()
  @IsString({ each: true })
  permissionCodes!: string[];
}
