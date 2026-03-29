import { simpleGit } from 'simple-git';
import { mkdirSync, existsSync } from 'fs';

export function slugifyTitle(title) {
  return 'feature/' + title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

export async function cloneRepo(gitUrl, localPath) {
  mkdirSync(localPath, { recursive: true });
  const git = simpleGit();
  await git.clone(gitUrl, localPath);
  return localPath;
}

export async function openRepo(localPath) {
  if (!existsSync(localPath)) throw new Error(`Path does not exist: ${localPath}`);
  return simpleGit(localPath);
}

export async function createFeatureBranch(localPath, branchName, baseBranch = 'main') {
  const git = simpleGit(localPath);
  // Checkout base branch first
  try { await git.checkout(baseBranch); } catch (_) {}
  // Pull latest
  try { await git.pull('origin', baseBranch); } catch (_) {}
  // Create feature branch
  await git.checkoutLocalBranch(branchName);
  return branchName;
}

export async function pushBranch(localPath, branchName) {
  const git = simpleGit(localPath);
  await git.push(['--set-upstream', 'origin', branchName]);
}

export async function getBranchDiff(localPath, branchName, baseBranch = 'main') {
  const git = simpleGit(localPath);
  try {
    return await git.diff([`${baseBranch}...${branchName}`]);
  } catch (_) {
    return '';
  }
}

export async function getCurrentBranch(localPath) {
  const git = simpleGit(localPath);
  const status = await git.status();
  return status.current;
}

export async function getStatus(localPath) {
  const git = simpleGit(localPath);
  return git.status();
}
