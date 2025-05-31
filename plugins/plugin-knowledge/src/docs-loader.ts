import { logger, UUID, createUniqueUuid } from "@elizaos/core";
import * as fs from "fs";
import * as path from "path";
import { KnowledgeService } from "./service.ts";
import { AddKnowledgeOptions } from "./types.ts";
import { isBinaryContentType } from './utils.ts';
import { parseRepoConfigs, manageRepository } from './repo-manager.ts';

/**
 * Get the knowledge path from environment or default to ./docs
 */
export function getKnowledgePath(): string {
  const envPath = process.env.KNOWLEDGE_PATH;

  if (envPath) {
    // Resolve relative paths from current working directory
    const resolvedPath = path.resolve(envPath);

    if (!fs.existsSync(resolvedPath)) {
      logger.warn(`Knowledge path from environment variable does not exist: ${resolvedPath}`);
      logger.warn('Please create the directory or update KNOWLEDGE_PATH environment variable');
    }

    return resolvedPath;
  }

  // Default to docs folder in current working directory
  const defaultPath = path.join(process.cwd(), 'docs');

  if (!fs.existsSync(defaultPath)) {
    logger.info(`Default docs folder does not exist at: ${defaultPath}`);
    logger.info('To use the knowledge plugin, either:');
    logger.info('1. Create a "docs" folder in your project root');
    logger.info('2. Set KNOWLEDGE_PATH environment variable to your documents folder');
  }

  return defaultPath;
}

/**
 * Load documents from repositories and the knowledge path
 */
export async function loadDocsFromPath(
  service: KnowledgeService,
  agentId: UUID,
  worldId?: UUID,
  config?: Record<string, string>
): Promise<{ total: number; successful: number; failed: number }> {
  let totalFiles = 0;
  let successfulFiles = 0;
  let failedFiles = 0;

  // Process repositories if configuration is provided
  if (config) {
    const repoConfigs = parseRepoConfigs(config);
    
    if (repoConfigs.length > 0) {
      logger.info(`Found ${repoConfigs.length} repository configurations to process`);
      
      for (const repoConfig of repoConfigs) {
        logger.info(`Processing repository: ${repoConfig.url}`);
        
        // Manage repository (clone/pull)
        const docsPath = await manageRepository(repoConfig);
        
        if (docsPath) {
          // Process documents from repository
          logger.info(`Loading documents from repository path: ${docsPath}`);
          const result = await processDocumentsFromPath(service, agentId, docsPath, worldId);
          
          totalFiles += result.total;
          successfulFiles += result.successful;
          failedFiles += result.failed;
        }
      }
    }
  }

  // Process documents from the default knowledge path
  const docsPath = getKnowledgePath();
  
  if (fs.existsSync(docsPath)) {
    logger.info(`Loading documents from default knowledge path: ${docsPath}`);
    const result = await processDocumentsFromPath(service, agentId, docsPath, worldId);
    
    totalFiles += result.total;
    successfulFiles += result.successful;
    failedFiles += result.failed;
  } else {
    logger.warn(`Default knowledge path does not exist: ${docsPath}`);
  }

  logger.info(
    `Document loading complete: ${successfulFiles} successful, ${failedFiles} failed out of ${totalFiles} total`
  );

  return {
    total: totalFiles,
    successful: successfulFiles,
    failed: failedFiles,
  };
}

/**
 * Process documents from a specific path
 */
async function processDocumentsFromPath(
  service: KnowledgeService,
  agentId: UUID,
  docsPath: string,
  worldId?: UUID
): Promise<{ total: number; successful: number; failed: number }> {
  if (!fs.existsSync(docsPath)) {
    logger.warn(`Path does not exist: ${docsPath}`);
    return { total: 0, successful: 0, failed: 0 };
  }

  // Get all files recursively
  const files = getAllFiles(docsPath);

  if (files.length === 0) {
    logger.info(`No files found in path: ${docsPath}`);
    return { total: 0, successful: 0, failed: 0 };
  }

  logger.info(`Found ${files.length} files to process in ${docsPath}`);

  let successful = 0;
  let failed = 0;

  for (const filePath of files) {
    try {
      const fileName = path.basename(filePath);
      const fileExt = path.extname(filePath).toLowerCase();

      // Skip hidden files and directories
      if (fileName.startsWith('.')) {
        continue;
      }

      // Determine content type
      const contentType = getContentType(fileExt);

      // Skip unsupported file types
      if (!contentType) {
        logger.debug(`Skipping unsupported file type: ${filePath}`);
        continue;
      }

      // Read file
      const fileBuffer = fs.readFileSync(filePath);

      // Check if file is binary using the same logic as the service
      const isBinary = isBinaryContentType(contentType, fileName);

      // For text files, read as UTF-8 string directly
      // For binary files, convert to base64
      const content = isBinary ? fileBuffer.toString('base64') : fileBuffer.toString('utf-8');

      // Create knowledge options
      const knowledgeOptions: AddKnowledgeOptions = {
        clientDocumentId: createUniqueUuid(agentId, `docs-${fileName}-${Date.now()}`) as UUID,
        contentType,
        originalFilename: fileName,
        worldId: worldId || agentId,
        content,
        roomId: agentId,
        entityId: agentId,
      };

      // Process the document
      logger.debug(`Processing document: ${fileName}`);
      const result = await service.addKnowledge(knowledgeOptions);

      logger.info(`Successfully processed ${fileName}: ${result.fragmentCount} fragments created`);
      successful++;
    } catch (error) {
      logger.error(`Failed to process file ${filePath}:`, error);
      failed++;
    }
  }

  return {
    total: files.length,
    successful,
    failed,
  };
}

/**
 * Recursively get all files in a directory
 */
function getAllFiles(dirPath: string, files: string[] = []): string[] {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules and other common directories
        if (!['node_modules', '.git', '.vscode', 'dist', 'build'].includes(entry.name)) {
          getAllFiles(fullPath, files);
        }
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    logger.error(`Error reading directory ${dirPath}:`, error);
  }

  return files;
}

/**
 * Get content type based on file extension
 */
function getContentType(extension: string): string | null {
  const contentTypes: Record<string, string> = {
    // Text documents
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.markdown': 'text/markdown',
    '.tson': 'text/plain',
    '.xml': 'application/xml',
    '.csv': 'text/csv',
    '.tsv': 'text/tab-separated-values',
    '.log': 'text/plain',

    // Web files
    '.html': 'text/html',
    '.htm': 'text/html',
    '.css': 'text/css',
    '.scss': 'text/x-scss',
    '.sass': 'text/x-sass',
    '.less': 'text/x-less',

    // JavaScript/TypeScript
    '.js': 'text/javascript',
    '.jsx': 'text/javascript',
    '.ts': 'text/typescript',
    '.tsx': 'text/typescript',
    '.mjs': 'text/javascript',
    '.cjs': 'text/javascript',
    '.vue': 'text/x-vue',
    '.svelte': 'text/x-svelte',
    '.astro': 'text/x-astro',

    // Python
    '.py': 'text/x-python',
    '.pyw': 'text/x-python',
    '.pyi': 'text/x-python',

    // Java/Kotlin/Scala
    '.java': 'text/x-java',
    '.kt': 'text/x-kotlin',
    '.kts': 'text/x-kotlin',
    '.scala': 'text/x-scala',

    // C/C++/C#
    '.c': 'text/x-c',
    '.cpp': 'text/x-c++',
    '.cc': 'text/x-c++',
    '.cxx': 'text/x-c++',
    '.h': 'text/x-c',
    '.hpp': 'text/x-c++',
    '.cs': 'text/x-csharp',

    // Other languages
    '.php': 'text/x-php',
    '.rb': 'text/x-ruby',
    '.go': 'text/x-go',
    '.rs': 'text/x-rust',
    '.swift': 'text/x-swift',
    '.r': 'text/x-r',
    '.R': 'text/x-r',
    '.m': 'text/x-objectivec',
    '.mm': 'text/x-objectivec',
    '.clj': 'text/x-clojure',
    '.cljs': 'text/x-clojure',
    '.ex': 'text/x-elixir',
    '.exs': 'text/x-elixir',
    '.lua': 'text/x-lua',
    '.pl': 'text/x-perl',
    '.pm': 'text/x-perl',
    '.dart': 'text/x-dart',
    '.hs': 'text/x-haskell',
    '.elm': 'text/x-elm',
    '.ml': 'text/x-ocaml',
    '.fs': 'text/x-fsharp',
    '.fsx': 'text/x-fsharp',
    '.vb': 'text/x-vb',
    '.pas': 'text/x-pascal',
    '.d': 'text/x-d',
    '.nim': 'text/x-nim',
    '.zig': 'text/x-zig',
    '.jl': 'text/x-julia',
    '.tcl': 'text/x-tcl',
    '.awk': 'text/x-awk',
    '.sed': 'text/x-sed',

    // Shell scripts
    '.sh': 'text/x-sh',
    '.bash': 'text/x-sh',
    '.zsh': 'text/x-sh',
    '.fish': 'text/x-fish',
    '.ps1': 'text/x-powershell',
    '.bat': 'text/x-batch',
    '.cmd': 'text/x-batch',

    // Config files
    '.json': 'application/json',
    '.yaml': 'text/x-yaml',
    '.yml': 'text/x-yaml',
    '.toml': 'text/x-toml',
    '.ini': 'text/x-ini',
    '.cfg': 'text/x-ini',
    '.conf': 'text/x-ini',
    '.env': 'text/plain',
    '.gitignore': 'text/plain',
    '.dockerignore': 'text/plain',
    '.editorconfig': 'text/plain',
    '.properties': 'text/x-properties',

    // Database
    '.sql': 'text/x-sql',

    // Binary documents
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };

  return contentTypes[extension] || null;
}
