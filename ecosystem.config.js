module.exports = {
  apps: [
    {
      name: "raizel-debrid",
      script: "./app.ts",
      exec_mode: "fork",
      cwd: "./",
      interpreter: "node",
      interpreter_args:
        "--require ts-node/register --require tsconfig-paths/register",
    },
  ],
};
