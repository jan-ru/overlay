// main.ts

// Original snippet
const foo = 1;
let bar = foo;

bar = 9;

console.log("Console output from Deno script:", foo, bar);

// Export variables if you want to use them elsewhere (e.g., browser)
export { foo, bar };
