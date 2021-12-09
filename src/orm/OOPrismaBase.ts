import { PrismaClient } from '@prisma/client'

export const makeOOPrisma = function <T>(prisma: PrismaClient) {
  class OOPrismaBase {
    modelName: string
    // static get delegate() {
    //   return prisma[this.modelName] as any as T;
    // }
    // async aggregate(...args) {
    //   return prisma[this.modelName].aggregate(...args);
    // }
    // async count() {
    //   return prisma[this.modelName].count();
    // }
    // async create() {
    //   return prisma[this.modelName].create();
    // }
    // static async findFirst(
    //   ...args: Parameters<typeof this.delegate.findFirst>
    // ) {
    //   return this.delegate.findFirst();
    // }
    // async findMany() {
    //   return prisma[this.modelName].findMany();
    // }
    // async findUnique() {
    //   return prisma[this.modelName].findUnique();
    // }
    // async delete() {
    //   return prisma[this.modelName].delete();
    // }
    // async deleteMany() {
    //   return prisma[this.modelName].deleteMany();
    // }
    // async groupBy() {
    //   return prisma[this.modelName].groupBy();
    // }
    // async update() {
    //   return prisma[this.modelName].update();
    // }
    // async updateMany() {
    //   return prisma[this.modelName].updateMany();
    // }
    // async upsert() {
    //   return prisma[this.modelName].upsert();
    // }
  }

  return OOPrismaBase
}
