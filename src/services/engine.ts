import { Command } from '@tauri-apps/plugin-shell';

export class LocalEngineService {
  private static instance: LocalEngineService;
  private engineProcess: any = null;
  private isRunning: boolean = false;

  private constructor() {}

  public static getInstance(): LocalEngineService {
    if (!LocalEngineService.instance) {
      LocalEngineService.instance = new LocalEngineService();
    }
    return LocalEngineService.instance;
  }

  public async startEngine() {
    if (this.isRunning) return;

    try {
      console.log('Starting local DocMind AI Engine...');
      // The sidecar command name matches the binary name without extension
      const command = Command.sidecar('bin/docmind-engine');
      
      command.on('close', data => {
        console.log(`Engine closed with code ${data.code} and signal ${data.signal}`);
        this.isRunning = false;
      });
      
      command.on('error', error => {
        console.error(`Engine error: "${error}"`);
        this.isRunning = false;
      });
      
      // We can also listen to stdout/stderr
      command.stdout.on('data', line => console.log(`Engine: ${line}`));
      command.stderr.on('data', line => console.error(`Engine Error: ${line}`));

      this.engineProcess = await command.spawn();
      this.isRunning = true;
      console.log('Engine started successfully with PID:', this.engineProcess.pid);
      
    } catch (error) {
      console.error('Failed to start local engine:', error);
    }
  }

  public async stopEngine() {
    if (this.engineProcess && this.isRunning) {
      await this.engineProcess.kill();
      this.isRunning = false;
      console.log('Engine stopped.');
    }
  }
}

export const engineService = LocalEngineService.getInstance();
