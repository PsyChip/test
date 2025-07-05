export class UploadManager {
    constructor() {
        this.uploadEndpoint = 'https://httpbin.org/post'; // Demo endpoint
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1 second
    }

    async uploadFile(file, onProgress = null) {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('filename', file.name);
            formData.append('filesize', file.size);
            
            if (file.dimensions) {
                formData.append('width', file.dimensions.width);
                formData.append('height', file.dimensions.height);
            }

            const xhr = new XMLHttpRequest();

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable && onProgress) {
                    const percentComplete = (event.loaded / event.total) * 100;
                    onProgress(percentComplete);
                }
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } catch (error) {
                        resolve({ success: true, status: xhr.status });
                    }
                } else {
                    reject(new Error(`Upload failed with status: ${xhr.status}`));
                }
            };

            xhr.onerror = () => {
                reject(new Error('Network error during upload'));
            };

            xhr.ontimeout = () => {
                reject(new Error('Upload timeout'));
            };

            // Set timeout to 30 seconds
            xhr.timeout = 30000;

            xhr.open('POST', this.uploadEndpoint, true);
            
            // Add custom headers if needed
            xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            
            xhr.send(formData);
        });
    }

    async uploadFileWithRetry(file, retryCount = 0) {
        try {
            return await this.uploadFile(file);
        } catch (error) {
            if (retryCount < this.maxRetries) {
                console.log(`Upload failed, retrying... (${retryCount + 1}/${this.maxRetries})`);
                await this.delay(this.retryDelay * Math.pow(2, retryCount)); // Exponential backoff
                return this.uploadFileWithRetry(file, retryCount + 1);
            } else {
                throw error;
            }
        }
    }

    async uploadMultipleFiles(files, onProgress = null) {
        const results = [];
        let completed = 0;

        for (const file of files) {
            try {
                const result = await this.uploadFileWithRetry(file);
                results.push({ file, result, success: true });
            } catch (error) {
                results.push({ file, error, success: false });
            }
            
            completed++;
            if (onProgress) {
                onProgress(completed, files.length);
            }
        }

        return results;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Utility method to validate file before upload
    validateFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

        if (file.size > maxSize) {
            throw new Error('File size exceeds 10MB limit');
        }

        if (!allowedTypes.includes(file.type)) {
            throw new Error('File type not supported');
        }

        return true;
    }

    // Method to calculate upload statistics
    calculateUploadStats(files) {
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        const totalFiles = files.length;
        
        return {
            totalSize,
            totalFiles,
            averageSize: totalSize / totalFiles,
            formattedTotalSize: this.formatFileSize(totalSize)
        };
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}