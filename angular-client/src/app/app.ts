import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MastraClient, createTool } from '@mastra/client-js';
import { z } from 'zod';

const MASTRA_BASE_URL = 'http://localhost:4111';
const AGENT_ID = 'demo-agent';

// A simple client-side tool — executed in the browser, not by the server.
// When the LLM calls this tool the client SDK ends the first stream, executes
// the function here, then opens a second stream with the result.  That second
// stream is what triggers the HTTP 400 described in issue #14364.
const getUserInfo = createTool({
  id: 'getUserInfo',
  description: 'Retrieve information about a user by their ID.',
  inputSchema: z.object({
    userId: z.string().describe('The ID of the user to look up'),
  }),
  execute: async (input) => {
    console.log('[client tool] getUserInfo called with:', input);
    // Simulated local data – no network request needed.
    return {
      // @ts-ignore
      id: input.userId,
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      role: 'admin',
    };
  },
});

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly userMessage = signal('Tell me about user 42');
  protected readonly streamOutput = signal('');
  protected readonly errorMessage = signal('');
  protected readonly isStreaming = signal(false);
  protected readonly hasError = computed(() => this.errorMessage() !== '');

  private readonly mastraClient = new MastraClient({ baseUrl: MASTRA_BASE_URL });

  protected async sendMessage(): Promise<void> {
    const message = this.userMessage().trim();
    if (!message || this.isStreaming()) return;

    this.streamOutput.set('');
    this.errorMessage.set('');
    this.isStreaming.set(true);

    const agent = this.mastraClient.getAgent(AGENT_ID);

    try {
      const response = await agent.stream(
        [{ role: 'user', content: message }],
        {
          clientTools: { getUserInfo },
          memory: {
            thread: 'demo-thread-1',
            resource: 'demo-user-1',
          },
        }
      );

      await response.processDataStream({
        onChunk: async (chunk) => {
          console.log('[stream chunk]', chunk);
          if (chunk.type === 'text-delta') {
            this.streamOutput.update((prev) => prev + chunk.payload.text);
          } else if (chunk.type === 'tool-call') {
            this.streamOutput.update(
              (prev) =>
                prev +
                `\n[calling client tool: ${chunk.payload.toolName} with args: ${JSON.stringify(chunk.payload.args)}]\n`
            );
          } else if (chunk.type === 'tool-result') {
            this.streamOutput.update(
              (prev) =>
                prev +
                `\n[tool result: ${JSON.stringify(chunk.payload.result)}]\n`
            );
          }
        },
      });
    } catch (err) {
      console.error('[request error]', err);
      this.errorMessage.set(
        err instanceof Error ? err.message : 'Unknown error'
      );
    } finally {
      this.isStreaming.set(false);
    }
  }
}
