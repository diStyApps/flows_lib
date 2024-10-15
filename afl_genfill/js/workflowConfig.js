// const address = "http://127.0.0.1:8188/object_info/";
const address = `${window.location.origin}/object_info/`;


export const workflowConfig = {
    workflowPaths: [
        { id: 'bgPrompt', workflowPath: '32.inputs.text' },
        { id: 'extractSubjectPrompt', workflowPath: '94.inputs.string'},
      ],
    seeders: [
        { id: 'seed1', label: 'Seed', container: 'seed1', workflowPath: '45.inputs.seed' },
    ],
    steppers: [
        { id: 'cfg', label: 'CFG', minValue: 0.1, maxValue: 100.0, step: 0.1, defValue: 6.5, precision: 1, scaleFactor: 10, container: 'component1', workflowPath: '45.inputs.cfg' },
        { id: 'Steps', label: 'Steps', minValue: 1, maxValue: 100, step: 1, defValue: 25, precision: 0, scaleFactor: 1, container: 'component2', workflowPath: '45.inputs.steps' },
        { id: 'denoise', label: 'Denoise', minValue: 0, maxValue: 1.0, step: 0.01, defValue: 0.65, precision: 2, scaleFactor: 100, container: 'component3', workflowPath: '45.inputs.denoise' },
        // { id: 'batch_size', label: 'Count', minValue: 1, maxValue: 100, step: 1, defValue: 1, precision: 0, scaleFactor: 1, container: 'component4', workflowPath: '90.inputs.batch_size' },
    ],
    dropdowns: [
        { id: 'CheckpointLoaderSimple', url: `${address}CheckpointLoaderSimple`, key: 'ckpt_name', label: 'Checkpoint', workflowPath: '1.inputs.ckpt_name' },
        { id: 'VAELoader', url: `${address}VAELoader`, key: 'vae_name', label: 'VAE', workflowPath: '8.inputs.vae_name' },
        { id: 'LoraLoader', url: `${address}LoraLoader`, key: 'lora_name', label: 'LoRA', workflowPath: '29.inputs.lora' },
        { id: 'ControlNetLoader', url: `${address}ControlNetLoader`, key: 'control_net_name', label: 'ControlNet', workflowPath: '29.inputs.controlNet' },
        { id: 'sampler_name', url: `${address}KSamplerSelect`, key: 'sampler_name', label: 'Sampler', workflowPath: '45.inputs.sampler_name' },
        { id: 'scheduler', url: `${address}BasicScheduler`, key: 'scheduler', label: 'Scheduler', workflowPath: '45.inputs.scheduler' },
    ],
    loaders: [
        { key: 'seed', path: '45.inputs.seed', class_type: 'EmptyLatentImage' },
        { key: 'text', path: '32.inputs.text', class_type: 'KSampler' },
        { key: 'ckpt_name', path: '1.inputs.ckpt_name', class_type: 'CheckpointLoaderSimple' },
        { key: 'vae_name', path: '8.inputs.vae_name', class_type: 'VAELoader' },
        { key: 'lora_name', path: '29.inputs.lora', class_type: 'LoraLoader' },
      ]
  };