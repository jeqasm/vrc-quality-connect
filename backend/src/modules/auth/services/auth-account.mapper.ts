import { CurrentAccountResponseDto } from '../dto/auth-session-response.dto';
import { AuthenticatedAccountEntity } from '../entities/authenticated-account.entity';

export class AuthAccountMapper {
  static toCurrentAccountResponse(entity: AuthenticatedAccountEntity): CurrentAccountResponseDto {
    return {
      accountId: entity.accountId,
      email: entity.email,
      status: entity.status,
      user: {
        id: entity.user.id,
        email: entity.user.email,
        fullName: entity.user.fullName,
        department: { ...entity.user.department },
        accessRole: { ...entity.user.accessRole },
        groups: entity.user.groups.map((group) => ({ ...group })),
      },
      permissions: [...entity.permissions],
    };
  }
}
