// Core Print Architecture Objects
export interface PaperType {
  name: string; // e.g., "US Letter"
  widthMm: number;
  heightMm: number;
  printableBounds: { top: number; left: number; right: number; bottom: number };
}

export interface FormatCollection {
  paperType: PaperType;
  orientation: 'PORTRAIT' | 'LANDSCAPE';
  scaling: number; // e.g., 1.0 for 100%
  halftone: boolean;
}

export interface JobCollection {
  jobName: string;
  copies: number;
  pageRange: [number, number];
  collate: boolean;
  printToDisk: boolean;
}

export interface PrintJob {
  id: number;
  ownerUid: number;
  tty: number;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  jobInfo: JobCollection;
  formatInfo: FormatCollection;
  printerName: string;
  content: string; // Vector commands, plain text, or canvas payload
  createdAt: string;
}

// Background Print Spool Daemon
export class PrintDaemon {
  private queue: PrintJob[] = [];
  private activeJobId = 100;
  private listeners: Set<() => void> = new Set();

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  /**
   * Submits a print job to the spooler queue
   */
  public submitJob(
    uid: number,
    tty: number,
    printerName: string,
    jobInfo: JobCollection,
    formatInfo: FormatCollection,
    content: string
  ): PrintJob {
    const newJob: PrintJob = {
      id: ++this.activeJobId,
      ownerUid: uid,
      tty,
      status: 'QUEUED',
      jobInfo,
      formatInfo,
      printerName,
      content,
      createdAt: new Date().toLocaleTimeString(),
    };

    this.queue.push(newJob);
    this.notify();
    this.processQueue();
    return newJob;
  }

  /**
   * Processes spooled print jobs asynchronously
   */
  private async processQueue() {
    const pendingJob = this.queue.find((j) => j.status === 'QUEUED');
    if (!pendingJob) return;

    pendingJob.status = 'PROCESSING';
    this.notify();
    console.log(`[PrintDaemon]: Processing Job #${pendingJob.id} ("${pendingJob.jobInfo.jobName}") on ${pendingJob.printerName}...`);

    // Simulate page rasterization / driver processing delay
    setTimeout(() => {
      pendingJob.status = 'COMPLETED';
      console.log(`[PrintDaemon]: Job #${pendingJob.id} printed successfully.`);
      this.notify();
      this.processQueue(); // Process next job in queue
    }, 2500);
  }

  public getQueue(): PrintJob[] {
    return [...this.queue];
  }

  public cancelJob(jobId: number): boolean {
    const index = this.queue.findIndex((j) => j.id === jobId);
    if (index !== -1 && this.queue[index].status !== 'COMPLETED') {
      this.queue.splice(index, 1);
      this.notify();
      return true;
    }
    return false;
  }
}

// Instantiate global kernel daemon instance
export const systemPrintDaemon = new PrintDaemon();
