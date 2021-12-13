# ooprisma

Opinionated prisma generator.

ES6 class generator inspired by objection.js.
It generates classes for your models, which can be extended with your custom classes.

## Generates

For each of your models, this generates:

- Prisma base class - has static methods to call prisma queries and get results mapped to their respective types back
- Typegraphql Scalars class
- Typegraphql class with relations included

For examples, see `fixtures` folder.

## TODO

- handle instance methods properly for models without a primary key

## TSconfig

make sure you have these to use this without TS compilation errors:

```json
{
  "compilerOptions": {
    "strict": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strictPropertyInitialization": false
  }
}
```

# How to develop

easiest is to run jest in watch mode `yarn w` and simultaneously run TSC watch `yarn tsw` in another window.
