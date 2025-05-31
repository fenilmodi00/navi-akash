# Merge Instructions

This document provides step-by-step instructions for merging your current branch changes into the main branch.

## Prerequisites

- Make sure you have the necessary permissions to push to the main branch
- Ensure all your changes are committed and pushed to your current branch

## Merging Steps

1. **Save any uncommitted changes**

   ```bash
   git add .
   git commit -m "Prepare for merge to main"
   git push origin $(git branch --show-current)
   ```

2. **Switch to main branch**

   ```bash
   git checkout main
   ```

3. **Update main with the latest changes**

   ```bash
   git pull origin main
   ```

4. **Merge your branch into main**

   ```bash
   git merge your-branch-name
   ```

   Replace `your-branch-name` with the name of your branch (e.g., `web-int`).

5. **Resolve any conflicts**

   If you encounter merge conflicts, you'll need to resolve them manually:

   a. Open the conflicted files in your code editor
   b. Look for conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
   c. Edit the files to resolve the conflicts
   d. Save the files
   e. Mark them as resolved:
      ```bash
      git add file-with-conflict
      ```
   f. Once all conflicts are resolved:
      ```bash
      git commit -m "Resolved merge conflicts"
      ```

6. **Push changes to main**

   ```bash
   git push origin main
   ```

7. **Switch back to your original branch**

   ```bash
   git checkout your-branch-name
   ```

## Specific Instructions for the README.md Changes

Since the README.md has been updated, there might be conflicts if the main branch also has changes to this file. When resolving conflicts, make sure to:

1. Keep the updated sections about the build, start, and deploy scripts
2. Ensure the "Maintenance Scripts" section includes all the scripts
3. Preserve any important information from the main branch's version

## Troubleshooting

If you encounter any issues during the merge process:

- **Error pushing to main**: Make sure you have the right permissions and that the main branch is not protected
- **Merge conflicts**: Follow step 5 carefully to resolve them
- **Git connectivity issues**: Check your network connection and repository access

## After Successful Merge

Once the merge is complete, verify that:

1. The README.md correctly displays all the maintenance script information
2. All necessary scripts are included in the repository
3. The application still builds and runs correctly 