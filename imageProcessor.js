export class ImageProcessor {
    constructor() {
        this.targetWidth = 150;
        this.quality = 0.8;
    }

    async processImage(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            img.onload = () => {
                try {
                    // Calculate new dimensions
                    const { width, height } = this.calculateDimensions(img.width, img.height);
                    
                    // Set canvas size
                    canvas.width = width;
                    canvas.height = height;

                    // Draw and resize image
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert to blob
                    canvas.toBlob((blob) => {
                        if (blob) {
                            const processedFile = new File([blob], file.name, {
                                type: file.type,
                                lastModified: Date.now()
                            });
                            
                            // Add additional properties
                            processedFile.originalSize = file.size;
                            processedFile.processedSize = blob.size;
                            processedFile.dimensions = { width, height };
                            processedFile.originalDimensions = { width: img.width, height: img.height };
                            
                            resolve(processedFile);
                        } else {
                            reject(new Error('Failed to process image'));
                        }
                    }, file.type, this.quality);
                } catch (error) {
                    reject(error);
                }
            };

            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };

            // Load the image
            img.src = URL.createObjectURL(file);
        });
    }

    calculateDimensions(originalWidth, originalHeight) {
        const aspectRatio = originalHeight / originalWidth;
        
        if (originalWidth <= this.targetWidth) {
            // If image is already smaller than target, keep original size
            return { width: originalWidth, height: originalHeight };
        }
        
        // Resize to target width while maintaining aspect ratio
        const width = this.targetWidth;
        const height = Math.round(width * aspectRatio);
        
        return { width, height };
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}