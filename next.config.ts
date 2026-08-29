import type { NextConfig } from "next";

// When building for GitHub Pages the site is served from a project subpath
// (https://<user>.github.io/baham/) rather than the domain root, so the
// build needs to know that prefix. Set via the GitHub Actions workflow.
const isGithubPages = process.env.GITHUB_PAGES === "true";
const repoName = "baham";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: isGithubPages ? `/${repoName}` : "",
  assetPrefix: isGithubPages ? `/${repoName}/` : "",
};

export default nextConfig;
