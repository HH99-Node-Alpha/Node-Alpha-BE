module.exports = {
  apps: [{
    name: "my-app",
    script: "./src/app.ts",
    interpreter: "./node_modules/.bin/ts-node",
    interpreter_args: "-P tsconfig.json"
  }]
};