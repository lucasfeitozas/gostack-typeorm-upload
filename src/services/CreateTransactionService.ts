import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const { total } = await transactionsRepository.getBalance();
    if (type === 'outcome' && value > total) {
      throw new AppError('The outcome value extrapolated the total balance');
    }

    let categoryEntity = await categoriesRepository.findOne({
      where: {
        title: category,
      },
    });
    if (!categoryEntity) {
      categoryEntity = categoriesRepository.create({
        title: category,
      });
      await categoriesRepository.save(categoryEntity);
    }

    const transaction = await transactionsRepository.create({
      title,
      value,
      type,
      category: categoryEntity,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
