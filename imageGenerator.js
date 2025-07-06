export class ImageGenerator {
    constructor() {
        this.isGenerating = false;
        this.generatedImages = [];
    }

    async generateImages(prompt, options = {}) {
        const {
            count = 4,
            size = '512x512',
            keyword = ''
        } = options;

        this.isGenerating = true;
        this.showGenerationProgress(true);

        try {
            const images = [];
            
            for (let i = 0; i < count; i++) {
                // Update progress
                const progress = ((i + 1) / count) * 100;
                this.updateGenerationProgress(progress, `Generating image ${i + 1} of ${count}...`);
                
                // Simulate generation time
                await this.delay(1500 + Math.random() * 1000);
                
                // Generate random image (in real app, this would be API call)
                const randomId = Math.floor(Math.random() * 1000) + 1;
                const imageUrl = `https://picsum.photos/${size.replace('x', '/')}?random=${randomId}`;
                
                images.push({
                    id: `generated_${Date.now()}_${i}`,
                    url: imageUrl,
                    prompt: prompt,
                    size: size,
                    timestamp: new Date().toISOString()
                });
            }

            this.generatedImages = images;
            this.displayGeneratedImages(images);
            this.updateGenerationProgress(100, 'Generation complete!');
            
            setTimeout(() => {
                this.showGenerationProgress(false);
            }, 2000);

            return images;
        } catch (error) {
            this.updateGenerationProgress(0, 'Generation failed. Please try again.');
            setTimeout(() => {
                this.showGenerationProgress(false);
            }, 3000);
            throw error;
        } finally {
            this.isGenerating = false;
        }
    }

    displayGeneratedImages(images) {
        const grid = document.getElementById('generatedImagesGrid');
        if (!grid) return;

        grid.innerHTML = '';

        images.forEach((image, index) => {
            const imageItem = document.createElement('div');
            imageItem.className = 'bg-gray-800 border border-gray-700 rounded-md p-3 transition-all duration-300 hover:border-gray-600 hover:shadow-lg group';
            imageItem.innerHTML = `
                <div class="relative mb-3">
                    <img src="${image.url}" alt="Generated image ${index + 1}" class="w-full h-32 object-cover rounded-md" loading="lazy">
                    <div class="absolute inset-0 bg-black/70 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
                        <button class="image-action-btn bg-white text-gray-900 px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors download-image-btn" data-image-id="${image.id}">
                            📥 Download
                        </button>
                        <button class="image-action-btn bg-white text-gray-900 px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors use-as-reference-btn" data-image-id="${image.id}">
                            🔄 Use
                        </button>
                    </div>
                </div>
                <div class="flex justify-between items-center text-xs text-gray-400">
                    <span class="font-medium">${image.size}</span>
                    <span>${this.formatTimestamp(image.timestamp)}</span>
                </div>
            `;

            grid.appendChild(imageItem);
        });

        // Add event listeners for image actions
        this.attachImageActionListeners();
    }

    attachImageActionListeners() {
        const downloadBtns = document.querySelectorAll('.download-image-btn');
        const referenceBtns = document.querySelectorAll('.use-as-reference-btn');

        downloadBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const imageId = e.target.dataset.imageId;
                this.downloadImage(imageId);
            });
        });

        referenceBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const imageId = e.target.dataset.imageId;
                this.useAsReference(imageId);
            });
        });
    }

    downloadImage(imageId) {
        const image = this.generatedImages.find(img => img.id === imageId);
        if (!image) return;

        // Create download link
        const link = document.createElement('a');
        link.href = image.url;
        link.download = `generated_image_${imageId}.jpg`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    useAsReference(imageId) {
        const image = this.generatedImages.find(img => img.id === imageId);
        if (!image) return;

        // In a real app, this would add the image as a reference for the next generation
        alert(`Using image ${imageId} as reference for next generation`);
    }

    showGenerationProgress(show) {
        const progressSection = document.getElementById('generationProgress');
        if (progressSection) {
            if (show) {
                progressSection.classList.remove('hidden');
            } else {
                progressSection.classList.add('hidden');
            }
        }
    }

    updateGenerationProgress(progress, status) {
        const progressFill = document.getElementById('generationProgressFill');
        const statusEl = document.getElementById('generationStatus');

        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }

        if (statusEl) {
            statusEl.textContent = status;
        }
    }

    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    clearGeneratedImages() {
        this.generatedImages = [];
        const grid = document.getElementById('generatedImagesGrid');
        if (grid) {
            grid.innerHTML = `
                <div class="generation-placeholder col-span-2 text-center py-16 text-gray-500 bg-gray-800 border-2 border-dashed border-gray-700 rounded-md">
                    <div class="text-4xl mb-4 opacity-30">🎨</div>
                    <p class="text-lg mb-2">Generated images will appear here</p>
                    <p class="text-sm opacity-70">Enter a prompt and click "Generate Image" to start</p>
                </div>
            `;
        }
    }
}