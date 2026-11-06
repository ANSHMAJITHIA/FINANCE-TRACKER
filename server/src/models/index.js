const { getIsConnected } = require('../config/db');
const MongooseUser = require('./User');
const MongooseTransaction = require('./Transaction');
const MongooseBudget = require('./Budget');
const MongooseGoal = require('./Goal');
const { UserModel, TransactionModel, BudgetModel, GoalModel } = require('./dataStore');

// Dynamic proxy to seamlessly support both real MongoDB and local fallback
const createModelProxy = (mongooseModel, fallbackModel) => {
  return new Proxy(mongooseModel, {
    get(target, prop, receiver) {
      if (getIsConnected()) {
        const val = Reflect.get(target, prop, target);
        return typeof val === 'function' ? val.bind(target) : val;
      }
      const fallbackVal = fallbackModel[prop];
      return typeof fallbackVal === 'function' ? fallbackVal.bind(fallbackModel) : fallbackVal;
    },
    apply(target, thisArg, argArray) {
      if (getIsConnected()) {
        return Reflect.apply(target, thisArg, argArray);
      }
      return fallbackModel.create(...argArray);
    },
    construct(target, argArray, newTarget) {
      if (getIsConnected()) {
        return Reflect.construct(target, argArray, newTarget);
      }
      return fallbackModel.create(...argArray);
    },
  });
};

const User = createModelProxy(MongooseUser, UserModel);
const Transaction = createModelProxy(MongooseTransaction, TransactionModel);
const Budget = createModelProxy(MongooseBudget, BudgetModel);
const Goal = createModelProxy(MongooseGoal, GoalModel);

module.exports = {
  User,
  Transaction,
  Budget,
  Goal,
};
