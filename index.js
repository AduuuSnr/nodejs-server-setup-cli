#!/usr/bin/env node

import { program } from "commander";
import chalk from "chalk";
import { input } from "@inquirer/prompts";
import figlet from "figlet";
import simpleGit from "simple-git";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import ora from "ora";

const git = simpleGit();

console.log(
  chalk.yellow(
    figlet.textSync("NodeJS Server Setup CLI", { horizontalLayout: "full" })
  )
);

const answer = await input({ message: "Enter your project name" });
const repoUrl = "https://github.com/AduuuSnr/nodeServerBase.git";

const projectDir = path.join(process.cwd(), "..", answer);

// GitHub reposunu klonla
await git.clone(repoUrl, projectDir);

const packageJsonPath = path.join(projectDir, "package.json");

// package.json dosyasını oku ve name alanını değiştir
fs.readFile(packageJsonPath, "utf8", (err, data) => {
  if (err) {
    console.error(chalk.red("Error reading package.json file"), err);
    return;
  }

  const packageJson = JSON.parse(data);
  packageJson.name = answer;

  fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), (err) => {
    if (err) {
      console.error(chalk.red("Error writing package.json file"), err);
      return;
    }

    console.log(chalk.green(`Project setup complete: ${projectDir}`));

    const envFilePath = path.join(projectDir, ".env");
    const envContent = `
      # Database connection
      MONGODB_URI=
      PORT=3001
      TOKEN_SECRET=
      AWS_REGION= 
      AWS_ACCESS_KEY_ID=
      AWS_SECRET_ACCESS_KEY= 
    `.trim();

    fs.writeFile(envFilePath, envContent, (err) => {
      if (err) {
        console.error(chalk.red("Error writing .env file"), err);
        return;
      }
      console.log(chalk.green(".env file created successfully."));

      const spinner = ora("Installing npm packages...").start();

      exec("yarn install", { cwd: projectDir }, (err, stdout, stderr) => {
        spinner.stop();

        if (err) {
          console.error(chalk.red("Error running yarn install"), err);
          return;
        }
        console.log(chalk.green(stdout));
        console.error(chalk.red(stderr));
        console.log(chalk.green("Dependencies installed successfully."));
        console.log(
          chalk.red.bgGreen.bold(
            "Please don't forget to fill in the .env file !!"
          )
        );
      });
    });
  });
});

program.parse(process.argv);
