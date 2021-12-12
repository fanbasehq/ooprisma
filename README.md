# ooprisma

ES6 class generator inspired heavily by objection.js

## TODO

- handle models id field properly for models without id

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
