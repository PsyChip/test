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
            imageItem.className = 'generated-image-item';
            imageItem.innerHTML = `
                <div class="generated-image-wrapper">
                    <img src="${image.url}" alt="Generated image ${index + 1}" class="generated-image" loading="lazy">
                    <div class="image-overlay">
                        <button class="image-action-btn download-image-btn" data-image-id="${image.id}">
                            📥 Download
                        </button>
                        <button class="image-action-btn use-as-reference-btn" data-image-id="${image.id}">
                            🔄 Use as Reference
                        </button>
                    </div>
                </div>
                <div class="generated-image-info">
                    <div class="image-size">${image.size}</div>
                    <div class="image-timestamp">${this.formatTimestamp(image.timestamp)}</div>
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
            progressSection.style.display = show ? 'block' : 'none';
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
                <div class="generation-placeholder">
                    <div class="placeholder-icon">🎨</div>
                    <p>Generated images will appear here</p>
                    <p class="placeholder-subtitle">Enter a prompt and click "Generate Image" to start</p>
                </div>
            `;
        }
    }
}