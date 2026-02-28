import { spawn } from "bun";

export const startAppium = () => {
  return spawn(['appium'], {
    stdio: ["inherit", "inherit", "inherit"],
  });
}

