import * as os from "os";

export function getOperatingSystem(): "mac" | "linux" | "unknown" {
  const platform = os.platform();

  if (platform === "darwin") {
    return "mac";
  } else if (platform === "linux") {
    return "linux";
  } else {
    return "unknown";
  }
}
