class SummaryGroupItemDto {
  id!: string;
  code!: string;
  name!: string;
  totalHours!: number;
}

export class SummaryResponseDto {
  totalHours!: number;
  totalRecordsCount!: number;
  totalHoursByUser!: Array<SummaryGroupItemDto & { email: string }>;
  totalHoursByActivityType!: SummaryGroupItemDto[];
}
