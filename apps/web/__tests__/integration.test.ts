import { describe, it, expect } from "vitest";
import path from "path";
import fs from "fs";

describe("Source Files Exist", () => {
  const appDir = path.join(process.cwd(), "src/app/(dashboard)");

  it("should have projects page", () => {
    const exists = fs.existsSync(path.join(appDir, "projects/page.tsx"));
    expect(exists).toBe(true);
  });

  it("should have projects folder structure", () => {
    const projectsDir = path.join(appDir, "projects");
    expect(fs.existsSync(projectsDir)).toBe(true);
    
    // Check subdirectories
    expect(fs.existsSync(path.join(projectsDir, "new"))).toBe(true);
    expect(fs.existsSync(path.join(projectsDir, "[id]"))).toBe(true);
  });

  it("should have time tracking page", () => {
    const timePage = path.join(appDir, "projects/[id]/time/page.tsx");
    expect(fs.existsSync(timePage)).toBe(true);
  });
});
