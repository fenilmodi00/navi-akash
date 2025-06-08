import { describe, expect, it } from 'vitest';
import { character } from '../src/index';

describe('Character Configuration', () => {
  it('should have all required fields', () => {
    expect(character).toHaveProperty('name');
    expect(character).toHaveProperty('bio');
    expect(character).toHaveProperty('plugins');
    expect(character).toHaveProperty('system');
    expect(character).toHaveProperty('messageExamples');
  });

  it('should have the correct name', () => {
    expect(character.name).toBe('Navi');
  });

  it('should have plugins defined as an array', () => {
    expect(Array.isArray(character.plugins)).toBe(true);
  });

  it('should have conditionally included plugins based on environment variables', () => {
    // This test is a simple placeholder since we can't easily test dynamic imports in vitest
    // The actual functionality is tested at runtime by the starter test suite

    // Save the original env values
    const originalAkashKey = process.env.AKASH_CHAT_API_KEY;
    const originalDiscordToken = process.env.DISCORD_API_TOKEN;

    try {
      // Verify if plugins array includes the core plugin
      expect(character.plugins).toContain('@elizaos/plugin-sql');

      // Plugins array should have akash-specific plugins
      expect(character.plugins).toContain('@elizaos/plugin-akash-chat');
      expect(character.plugins).toContain('@elizaos/plugin-discord');
      expect(character.plugins).toContain('@elizaos/plugin-knowledge');
      expect(character.plugins).toContain('@elizaos/plugin-web-search');
    } finally {
      // Restore original env values
      process.env.AKASH_CHAT_API_KEY = originalAkashKey;
      process.env.DISCORD_API_TOKEN = originalDiscordToken;
    }
  });

  it('should have a non-empty system prompt', () => {
    expect(character.system).toBeTruthy();
    if (character.system) {
      expect(typeof character.system).toBe('string');
      expect(character.system.length).toBeGreaterThan(0);
    }
  });

  it('should have personality traits in bio array', () => {
    expect(Array.isArray(character.bio)).toBe(true);
    if (character.bio && Array.isArray(character.bio)) {
      expect(character.bio.length).toBeGreaterThan(0);
      // Check if bio entries are non-empty strings
      character.bio.forEach((trait) => {
        expect(typeof trait).toBe('string');
        expect(trait.length).toBeGreaterThan(0);
      });
    }
  });

  it('should have message examples for training', () => {
    expect(Array.isArray(character.messageExamples)).toBe(true);
    if (character.messageExamples && Array.isArray(character.messageExamples)) {
      expect(character.messageExamples.length).toBeGreaterThan(0);

      // Check structure of first example
      const firstExample = character.messageExamples[0];
      expect(Array.isArray(firstExample)).toBe(true);
      expect(firstExample.length).toBeGreaterThan(1); // At least a user message and a response

      // Check that messages have name and content
      firstExample.forEach((message) => {
        expect(message).toHaveProperty('name');
        expect(message).toHaveProperty('content');
        expect(message.content).toHaveProperty('text');
      });
    }
  });
});
