const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_FILE = path.join(__dirname, '../../data/db.json');

// Ensure data folder and file exist
const initFile = () => {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify({ users: [], transactions: [], budgets: [], goals: [] }, null, 2),
      'utf-8'
    );
  }
};

const readData = () => {
  initFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return { users: [], transactions: [], budgets: [], goals: [] };
  }
};

const writeData = (data) => {
  initFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
};

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

// User Model Adapter
const UserModel = {
  findOne: async (query) => {
    const db = readData();
    const user = db.users.find((u) => {
      if (query.email) {
        return u.email.toLowerCase() === query.email.toLowerCase();
      }
      return false;
    });
    if (!user) return null;
    return {
      ...user,
      matchPassword: async (enteredPassword) => {
        return await bcrypt.compare(enteredPassword, user.password);
      },
      save: async function () {
        const freshDb = readData();
        const idx = freshDb.users.findIndex((u) => u._id === this._id);
        if (idx !== -1) {
          freshDb.users[idx] = { ...this };
          delete freshDb.users[idx].matchPassword;
          delete freshDb.users[idx].save;
          writeData(freshDb);
        }
        return this;
      },
    };
  },

  findById: async (id) => {
    const db = readData();
    const user = db.users.find((u) => u._id === id.toString());
    if (!user) return null;
    return {
      ...user,
      select: function (exclude) {
        if (exclude === '-password') {
          const { password, ...rest } = this;
          return rest;
        }
        return this;
      },
      matchPassword: async (enteredPassword) => {
        return await bcrypt.compare(enteredPassword, user.password);
      },
    };
  },

  create: async (userData) => {
    const db = readData();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const newUser = {
      _id: generateId(),
      name: userData.name,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      currency: userData.currency || 'USD',
      monthlyBudgetLimit: userData.monthlyBudgetLimit || 0,
      savingsGoal: userData.savingsGoal || 0,
      avatar: userData.avatar || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    writeData(db);

    return {
      ...newUser,
      matchPassword: async (enteredPassword) => {
        return await bcrypt.compare(enteredPassword, newUser.password);
      },
    };
  },

  findByIdAndUpdate: async (id, updateData, options = {}) => {
    const db = readData();
    const idx = db.users.findIndex((u) => u._id === id.toString());
    if (idx === -1) return null;

    db.users[idx] = {
      ...db.users[idx],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    writeData(db);
    return db.users[idx];
  },
};

// Transaction Model Adapter
const TransactionModel = {
  find: (query = {}) => {
    let results = readData().transactions;

    if (query.user) {
      const uId = query.user.toString();
      results = results.filter((t) => t.user === uId);
    }
    if (query.type) {
      results = results.filter((t) => t.type === query.type);
    }
    if (query.category) {
      results = results.filter((t) => t.category.toLowerCase() === query.category.toLowerCase());
    }
    if (query.startDate && query.endDate) {
      results = results.filter((t) => {
        const d = new Date(t.date).getTime();
        return d >= new Date(query.startDate).getTime() && d <= new Date(query.endDate).getTime();
      });
    }

    const wrapper = {
      data: results,
      sort: function (sortCriteria) {
        // e.g. { date: -1 }
        const field = Object.keys(sortCriteria)[0];
        const dir = sortCriteria[field] === -1 ? -1 : 1;
        this.data.sort((a, b) => {
          if (field === 'date') {
            return (new Date(b.date) - new Date(a.date)) * (dir === -1 ? 1 : -1);
          }
          if (field === 'amount') {
            return (b.amount - a.amount) * (dir === -1 ? 1 : -1);
          }
          return 0;
        });
        return this;
      },
      limit: function (n) {
        this.data = this.data.slice(0, n);
        return this;
      },
      skip: function (n) {
        this.data = this.data.slice(n);
        return this;
      },
      then: function (resolve, reject) {
        resolve(this.data);
      },
    };
    return wrapper;
  },

  findById: async (id) => {
    const db = readData();
    return db.transactions.find((t) => t._id === id.toString()) || null;
  },

  create: async (txData) => {
    const db = readData();
    const newTx = {
      _id: generateId(),
      ...txData,
      user: txData.user.toString(),
      amount: Number(txData.amount),
      date: txData.date ? new Date(txData.date).toISOString() : new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.transactions.push(newTx);
    writeData(db);
    return newTx;
  },

  insertMany: async (txList) => {
    const db = readData();
    const inserted = txList.map((tx) => ({
      _id: generateId(),
      ...tx,
      user: tx.user.toString(),
      amount: Number(tx.amount),
      date: tx.date ? new Date(tx.date).toISOString() : new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    db.transactions.push(...inserted);
    writeData(db);
    return inserted;
  },

  findByIdAndUpdate: async (id, updateData, options = {}) => {
    const db = readData();
    const idx = db.transactions.findIndex((t) => t._id === id.toString());
    if (idx === -1) return null;

    db.transactions[idx] = {
      ...db.transactions[idx],
      ...updateData,
      amount: updateData.amount !== undefined ? Number(updateData.amount) : db.transactions[idx].amount,
      updatedAt: new Date().toISOString(),
    };
    writeData(db);
    return db.transactions[idx];
  },

  findByIdAndDelete: async (id) => {
    const db = readData();
    const idx = db.transactions.findIndex((t) => t._id === id.toString());
    if (idx === -1) return null;
    const removed = db.transactions.splice(idx, 1)[0];
    writeData(db);
    return removed;
  },

  deleteMany: async (query = {}) => {
    const db = readData();
    if (query.user) {
      const uId = query.user.toString();
      db.transactions = db.transactions.filter((t) => t.user !== uId);
      writeData(db);
    }
  },
};

// Budget Model Adapter
const BudgetModel = {
  find: async (query = {}) => {
    let results = readData().budgets;
    if (query.user) {
      results = results.filter((b) => b.user === query.user.toString());
    }
    if (query.month) {
      results = results.filter((b) => b.month === query.month);
    }
    return results;
  },

  findOne: async (query = {}) => {
    const results = await BudgetModel.find(query);
    if (query.category) {
      return results.find((b) => b.category.toLowerCase() === query.category.toLowerCase()) || null;
    }
    return results[0] || null;
  },

  findById: async (id) => {
    const db = readData();
    return db.budgets.find((b) => b._id === id.toString()) || null;
  },

  create: async (bData) => {
    const db = readData();
    const newBudget = {
      _id: generateId(),
      ...bData,
      user: bData.user.toString(),
      amount: Number(bData.amount),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.budgets.push(newBudget);
    writeData(db);
    return newBudget;
  },

  insertMany: async (list) => {
    const db = readData();
    const inserted = list.map((b) => ({
      _id: generateId(),
      ...b,
      user: b.user.toString(),
      amount: Number(b.amount),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    db.budgets.push(...inserted);
    writeData(db);
    return inserted;
  },

  findByIdAndUpdate: async (id, updateData, options = {}) => {
    const db = readData();
    const idx = db.budgets.findIndex((b) => b._id === id.toString());
    if (idx === -1) return null;

    db.budgets[idx] = {
      ...db.budgets[idx],
      ...updateData,
      amount: updateData.amount !== undefined ? Number(updateData.amount) : db.budgets[idx].amount,
      updatedAt: new Date().toISOString(),
    };
    writeData(db);
    return db.budgets[idx];
  },

  findByIdAndDelete: async (id) => {
    const db = readData();
    const idx = db.budgets.findIndex((b) => b._id === id.toString());
    if (idx === -1) return null;
    const removed = db.budgets.splice(idx, 1)[0];
    writeData(db);
    return removed;
  },

  deleteMany: async (query = {}) => {
    const db = readData();
    if (query.user) {
      const uId = query.user.toString();
      db.budgets = db.budgets.filter((b) => b.user !== uId);
      writeData(db);
    }
  },
};

// Goal Model Adapter
const GoalModel = {
  find: async (query = {}) => {
    let results = readData().goals;
    if (query.user) {
      results = results.filter((g) => g.user === query.user.toString());
    }
    return results;
  },

  findById: async (id) => {
    const db = readData();
    return db.goals.find((g) => g._id === id.toString()) || null;
  },

  create: async (gData) => {
    const db = readData();
    const newGoal = {
      _id: generateId(),
      ...gData,
      user: gData.user.toString(),
      targetAmount: Number(gData.targetAmount),
      currentAmount: Number(gData.currentAmount || 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.goals.push(newGoal);
    writeData(db);
    return newGoal;
  },

  insertMany: async (list) => {
    const db = readData();
    const inserted = list.map((g) => ({
      _id: generateId(),
      ...g,
      user: g.user.toString(),
      targetAmount: Number(g.targetAmount),
      currentAmount: Number(g.currentAmount || 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    db.goals.push(...inserted);
    writeData(db);
    return inserted;
  },

  findByIdAndUpdate: async (id, updateData, options = {}) => {
    const db = readData();
    const idx = db.goals.findIndex((g) => g._id === id.toString());
    if (idx === -1) return null;

    db.goals[idx] = {
      ...db.goals[idx],
      ...updateData,
      targetAmount: updateData.targetAmount !== undefined ? Number(updateData.targetAmount) : db.goals[idx].targetAmount,
      currentAmount: updateData.currentAmount !== undefined ? Number(updateData.currentAmount) : db.goals[idx].currentAmount,
      updatedAt: new Date().toISOString(),
    };
    writeData(db);
    return db.goals[idx];
  },

  findByIdAndDelete: async (id) => {
    const db = readData();
    const idx = db.goals.findIndex((g) => g._id === id.toString());
    if (idx === -1) return null;
    const removed = db.goals.splice(idx, 1)[0];
    writeData(db);
    return removed;
  },

  deleteMany: async (query = {}) => {
    const db = readData();
    if (query.user) {
      const uId = query.user.toString();
      db.goals = db.goals.filter((g) => g.user !== uId);
      writeData(db);
    }
  },
};

module.exports = {
  UserModel,
  TransactionModel,
  BudgetModel,
  GoalModel,
};
