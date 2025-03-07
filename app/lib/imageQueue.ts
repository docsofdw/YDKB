import { generatePlayerImage, getGenerationResult } from "./imageGeneration";
import { storePlayerImage } from "./db";

interface QueueItem {
  playerId: string;
  playerName: string;
  collegeName: string;
  difficulty: string;
  challengeDate: Date;
}

class ImageQueue {
  private queue: QueueItem[] = [];
  private processing: boolean = false;

  /**
   * Add a player to the image generation queue
   */
  async addToQueue(item: QueueItem): Promise<boolean> {
    this.queue.push(item);
    if (!this.processing) {
      this.processQueue();
    }
    return true;
  }

  /**
   * Process the next item in the queue
   */
  private async processQueue(): Promise<void> {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    this.processing = true;
    const item = this.queue.shift();
    
    if (!item) {
      this.processing = false;
      return;
    }

    try {
      const prediction = await generatePlayerImage(
        item.playerName, 
        item.collegeName,
        item.difficulty
      );
      
      // Poll for completion
      let result;
      let attempts = 0;
      do {
        // Wait 2 seconds between checks
        await new Promise(resolve => setTimeout(resolve, 2000));
        result = await getGenerationResult(prediction.id);
        attempts++;
        
        // Break after 30 attempts (60 seconds) to avoid infinite loops
        if (attempts > 30) break;
      } while (result.status !== "succeeded" && result.status !== "failed");
      
      if (result.status === "succeeded" && result.output?.[0]) {
        // Store the image URL in the database
        await storePlayerImage(
          item.playerId, 
          result.output[0],
          item.difficulty,
          item.challengeDate
        );
      }
    } catch (error) {
      console.error("Error processing image:", error);
    }
    
    // Process next item regardless of success/failure
    this.processQueue();
  }
}

// Export a singleton instance
export const imageQueue = new ImageQueue(); 