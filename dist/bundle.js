// main.ts
var foo = 1;
var bar = foo;
bar = 9;
console.log("Console output from Deno script:", foo, bar);
export {
  bar,
  foo
};
