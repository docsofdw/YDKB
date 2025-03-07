/**
 * Utility functions for generating and retrieving images via Replicate API
 */

interface GenerationInput {
  prompt: string;
  negative_prompt: string;
  width: number;
  height: number;
  num_outputs: number;
  guidance_scale?: number;
  num_inference_steps?: number;
  seed?: number;
}

interface GenerationResponse {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed';
  output?: string[];
  error?: string;
}

// College-specific details for enhanced prompts
const collegeDetails: Record<string, { mascot: string; stadium: string }> = {
  "Penn State": { mascot: "Nittany Lions", stadium: "Beaver Stadium" },
  "University of Michigan": { mascot: "Wolverines", stadium: "Michigan Stadium" },
  "Ohio State": { mascot: "Buckeyes", stadium: "Ohio Stadium" },
  "Alabama": { mascot: "Crimson Tide", stadium: "Bryant-Denny Stadium" },
  "Notre Dame": { mascot: "Fighting Irish", stadium: "Notre Dame Stadium" },
  // Add more colleges as needed
};

/**
 * Generates a prompt based on difficulty level
 */
function generatePrompt(collegeName: string, difficulty: string = 'easy'): string {
  const collegeInfo = collegeDetails[collegeName] || { mascot: "", stadium: "stadium" };
  const mascot = collegeInfo.mascot ? `the ${collegeName} ${collegeInfo.mascot}` : collegeName;
  const stadium = collegeInfo.stadium;

  const basePrompt = `Highly detailed sports trading card of a football player representing ${mascot}, 
wearing authentic ${collegeName} football uniform, dynamic action pose, ${stadium} background, 
sharp focus, professional sports photography, dramatic lighting, high definition, 
photorealistic, detailed jersey textures, college football atmosphere, official collegiate style, 
athletic build, 8k uhd, dslr, no text overlay, no watermarks, no face details`;

  switch (difficulty.toLowerCase()) {
    case 'hall-of-fame':
    case 'hof':
      return `Vintage-style legendary sports card of a Hall of Fame football player representing ${mascot}, 
wearing authentic throwback ${collegeName} football uniform, iconic pose, historic ${stadium} background, 
professional sports photography, dramatic heroic lighting, film grain texture, retro color grading, 
classic football atmosphere, traditional athletic equipment, celebrated collegiate star, 
legendary player stance, detailed vintage jersey with period-accurate design, 8k uhd, cinematic, 
no text overlay, no watermarks, no face details`;
    
    case 'hard':
      return `Detailed sports trading card of a football player representing ${mascot}, 
wearing authentic ${collegeName} football uniform, action pose on football field, 
${stadium} setting, sharp focus, professional sports photography, standard lighting, 
detailed jersey textures, college football atmosphere, athletic build with football gear, 
8k uhd, dslr, no text overlay, no watermarks, no face details`;
    
    case 'easy':
    default:
      return `Highly detailed modern sports trading card of a current football player representing ${mascot}, 
wearing authentic ${collegeName} football uniform, dynamic action pose catching or throwing a football, 
modern ${stadium} background, sharp focus, professional sports photography with dramatic lighting, 
contemporary athletic build with modern football equipment, high definition, photorealistic, 
detailed modern jersey with accurate numbers and patches, current NCAA atmosphere, official collegiate style, 
8k uhd, no text overlay, no watermarks, no face details`;
  }
}

/**
 * Initiates an image generation request
 * @param playerName - Name of the NFL player
 * @param collegeName - Name of the college
 * @param difficulty - Difficulty level for the challenge
 * @returns Prediction object with ID for status checking
 */
export async function generatePlayerImage(
  playerName: string, 
  collegeName: string,
  difficulty: string = 'easy'
): Promise<GenerationResponse> {
  try {
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
      },
      body: JSON.stringify({
        version: "stability-ai/sdxl:2bde53c1", // Using SDXL for best quality
        input: {
          prompt: generatePrompt(collegeName, difficulty),
          negative_prompt: `deformed, distorted, disfigured, poorly drawn, bad anatomy, wrong anatomy, 
extra limb, missing limb, floating limbs, disconnected limbs, mutation, mutated, 
ugly, disgusting, blurry, amateur, text, watermark, signature, cut off, 
oversaturated, censored, amateur drawing, anime, cartoonish, semirealistic, 
duplicate, cropped head, low-res, deepfake, AI-generated text, recognizable face, 
realistic face, specific person, celebrity`,
          width: 832,         // Slightly wider for better composition
          height: 1024,       // Portrait ratio works well for player cards
          num_outputs: 1,
          guidance_scale: 8,  // Higher guidance scale for more prompt adherence
          num_inference_steps: 40, // More steps for higher quality
          seed: Math.floor(Math.random() * 1000000) // Random seed for variety
        } as GenerationInput,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Replicate API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`API error: ${response.status} - ${errorData.detail || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

/**
 * Checks the status of an image generation request
 * @param id - Prediction ID from generatePlayerImage
 * @returns Prediction status and output URL if complete
 */
export async function getGenerationResult(id: string): Promise<GenerationResponse> {
  try {
    const response = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error checking generation status:", error);
    throw error;
  }
} 