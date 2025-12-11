import { pipeline, env } from "@huggingface/transformers";

// Skip local model check
env.allowLocalModels = false;

// Use the Singleton pattern to enable lazy construction of the pipeline.
class PipelineSingleton {
  static task = "translation";
  static model = "Xenova/nllb-200-distilled-600M";
  static instance = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, { progress_callback });
    }
    return this.instance;
  }
}

// Listen for messages from the main thread
self.addEventListener("message", async (event) => {
  self.postMessage({ status: "initialize" });
  let translater = await PipelineSingleton.getInstance((x) => {
    // We also add a progress callback to the pipeline so that we can
    // track model loading.
  });
  self.postMessage({ status: "model-upload" });

  // Actually perform the classification
  let output = await translater(event.data.text, {
    src_lang: "eng_Latn",
    tgt_lang: "hin_Deva",
  });

  // Send the output back to the main thread
  self.postMessage({
    status: "complete",
    output: output,
  });
});
