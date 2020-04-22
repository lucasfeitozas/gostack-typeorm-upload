import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}
interface BalanceQueryResult {
  type: string;
  value: number;
}
@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const list = (await this.createQueryBuilder('val')
      .select('val.type', 'type')
      .addSelect('SUM(val.value)', 'value')
      .groupBy('val.type')
      .getRawMany()) as Array<BalanceQueryResult>;

    let income = 0;
    let outcome = 0;
    list.forEach(e => {
      if (e.type === 'income') {
        income += e.value;
      } else {
        outcome += e.value;
      }
    });

    return {
      income,
      outcome,
      total: income - outcome,
    };
  }
}

export default TransactionsRepository;
