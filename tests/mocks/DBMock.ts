import { Repository, ObjectType, ObjectLiteral } from 'typeorm';

//functions
const getCustomRepositoryMock = jest.fn();
const createConnection = jest.fn();

let repositories: {
  [key: string]: unknown;
};

const initTypeOrmMocks = (): void => {
  repositories = {};
  getCustomRepositoryMock.mockImplementation(<T>(key: ObjectType<T>) => {
    return repositories[key.name];
  });
  createConnection.mockReturnValue({
    getCustomRepository: getCustomRepositoryMock,
  });
};

interface InsertQueryBuilder {
  values: jest.Mock;
  returning: jest.Mock;
  execute: jest.Mock;
}

interface SelectQueryBuilder {
  where: jest.Mock;
  orderBy: jest.Mock;
  getMany: jest.Mock;
  insert: jest.Mock;
}

interface RepositoryMocks {
  findOneMock: jest.Mock;
  findMock: jest.Mock;
  saveMock: jest.Mock;
  deleteMock: jest.Mock;
  countMock: jest.Mock;
  queryBuilderMock: jest.Mock;
  selectQueryBuilder: SelectQueryBuilder;
  insertQueryBuilder: InsertQueryBuilder;
}

const registerRepository = <T>(key: ObjectType<T>, instance: T): RepositoryMocks => {
  const repo = instance as unknown as Repository<ObjectLiteral>;
  const mocks: RepositoryMocks = {
    findOneMock: jest.fn(),
    findMock: jest.fn(),
    saveMock: jest.fn(),
    deleteMock: jest.fn(),
    countMock: jest.fn(),
    queryBuilderMock: jest.fn(),
    selectQueryBuilder: {
      where: jest.fn(),
      orderBy: jest.fn(),
      getMany: jest.fn(),
      insert: jest.fn(),
    },
    insertQueryBuilder: {
      values: jest.fn(),
      returning: jest.fn(),
      execute: jest.fn(),
    },
  };

  repo.findOne = mocks.findOneMock;
  repo.find = mocks.findMock;
  repo.save = mocks.saveMock;
  repo.delete = mocks.deleteMock;
  repo.count = mocks.countMock;
  (repo.createQueryBuilder as unknown) = mocks.queryBuilderMock;

  // Set select query builder mocks
  mocks.queryBuilderMock.mockImplementation(() => mocks.selectQueryBuilder);
  mocks.selectQueryBuilder.where.mockImplementation(() => mocks.selectQueryBuilder);
  mocks.selectQueryBuilder.orderBy.mockImplementation(() => mocks.selectQueryBuilder);
  mocks.selectQueryBuilder.insert.mockImplementation(() => mocks.insertQueryBuilder);

  // Set insert query builder mocks
  mocks.insertQueryBuilder.values.mockImplementation(() => mocks.insertQueryBuilder);
  mocks.insertQueryBuilder.returning.mockImplementation(() => mocks.insertQueryBuilder);

  repositories[key.name] = repo;
  return mocks;
};

//decorator mocks
// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
const Generated = () => jest.fn();

//interfaces
export { RepositoryMocks };
//initializers
export { registerRepository, initTypeOrmMocks };
//mocks
export { createConnection };
//decorator mocks
export { Generated };
