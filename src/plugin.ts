import type { Plugin } from '@elizaos/core';
import { logger } from '@elizaos/core';

// Minimal plugin for project-specific customizations
// Most functionality is provided by the imported plugins in index.ts

const plugin: Plugin = {
  name: 'akash-navi-core',
  description: 'Core plugin for Akash Navi assistant',
  priority: 100,
  
  async init() {
    logger.info('*** Initializing Akash Navi core plugin ***');
  },
};

export default plugin;
