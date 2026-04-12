import { IsString } from 'class-validator';

export class AssignGroupMemberDto {
  @IsString()
  userId!: string;
}
