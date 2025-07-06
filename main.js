import { ImageProcessor } from './imageProcessor.js';
import { FileManager } from './fileManager.js';
import { UploadManager } from './uploadManager.js';
import { ZipProcessor } from './zipProcessor.js';
import { TrainingManager } from './trainingManager.js';
import { ImageGenerator } from './imageGenerator.js';

class FileManagerApp {
    constructor() {
        this.imageProcessor = new ImageProcessor();
        this.fileManager = new FileManager();
        this.uploadManager = new UploadManager();
        this.zipProcessor = new ZipProcessor();
        this.trainingManager = new TrainingManager();
        this.imageGenerator = new ImageGenerator();
        this.files = new Map();
        this.currentStep = 1;
        
        // Training options
        this.trainingOptions = {
            type: 'style',
            keyword: '',
            steps: 500
        };
        
        this.initializeElements();
        this.setupEventListeners();
        this.initializeTrainingOptions();
        this.setupTrainingManager();
    }

    initializeElements() {
        // Step 1 elements
        this.dropZone = document.getElementById('dropZone');
        this.fileInput = document.getElementById('fileInput');
        this.selectFilesBtn = document.getElementById('selectFilesBtn');
        this.fileGrid = document.getElementById('fileGrid');
        this.fileCount = document.getElementById('fileCount');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.proceedBtn = document.getElementById('proceedBtn');
        
        // Step 2 elements (Options)
        this.optionsBackBtn = document.getElementById('optionsBackBtn');
        this.optionsProceedBtn = document.getElementById('optionsProceedBtn');
        this.trainingTypeCards = document.querySelectorAll('.training-type-card');
        this.keywordInput = document.getElementById('keywordInput');
        this.stepsSlider = document.getElementById('stepsSlider');
        this.stepsValue = document.getElementById('stepsValue');
        this.stepsDescription = document.getElementById('stepsDescription');
        
        // Step 3 elements (Upload)
        this.backBtn = document.getElementById('backBtn');
        this.uploadAllBtn = document.getElementById('uploadAllBtn');
        this.uploadFileList = document.getElementById('uploadFileList');
        this.totalFiles = document.getElementById('totalFiles');
        this.totalSize = document.getElementById('totalSize');
        this.summaryTrainingType = document.getElementById('summaryTrainingType');
        this.summaryKeyword = document.getElementById('summaryKeyword');
        this.summarySteps = document.getElementById('summarySteps');
        this.uploadStatusText = document.getElementById('uploadStatusText');
        
        // Step 4 elements (Training)
        this.trainingBackBtn = document.getElementById('trainingBackBtn');
        this.skipTrainingBtn = document.getElementById('skipTrainingBtn');
        
        // Step 5 elements (Result)
        this.downloadModelBtn = document.getElementById('downloadModelBtn');
        this.useInAriaBtn = document.getElementById('useInAriaBtn');
        this.promptInput = document.getElementById('promptInput');
        this.generateBtn = document.getElementById('generateBtn');
        this.imageCount = document.getElementById('imageCount');
        this.imageSize = document.getElementById('imageSize');
        this.resultTrainingType = document.getElementById('resultTrainingType');
        this.resultKeyword = document.getElementById('resultKeyword');
        this.resultSteps = document.getElementById('resultSteps');
        this.resultTrainingTime = document.getElementById('resultTrainingTime');
        
        // Progress elements
        this.uploadProgressSection = document.getElementById('uploadProgressSection');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.uploadStatus = document.getElementById('uploadStatus');
        
        // Step sections
        this.selectFilesSection = document.getElementById('selectFilesSection');
        this.optionsSection = document.getElementById('optionsSection');
        this.uploadSection = document.getElementById('uploadSection');
        this.trainingSection = document.getElementById('trainingSection');
        this.resultSection = document.getElementById('resultSection');
    }

    setupEventListeners() {
        // File selection - prevent event bubbling
        this.selectFilesBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.fileInput.click();
        });

        this.fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });

        // Drag and drop
        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropZone.classList.add('dragover');
        });

        this.dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('dragover');
        });

        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropZone.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
        });

        // Click to select files - only trigger when clicking the drop zone itself, not the button
        this.dropZone.addEventListener('click', (e) => {
            // Don't trigger if the click came from the select files button
            if (e.target === this.selectFilesBtn || this.selectFilesBtn.contains(e.target)) {
                return;
            }
            this.fileInput.click();
        });

        // Step 1 button actions
        this.proceedBtn.addEventListener('click', () => {
            this.goToStep(2);
        });

        this.clearAllBtn.addEventListener('click', () => {
            this.clearAllFiles();
        });

        // Step 2 button actions (Options)
        this.optionsBackBtn.addEventListener('click', () => {
            this.goToStep(1);
        });

        this.optionsProceedBtn.addEventListener('click', () => {
            this.goToStep(3);
        });

        // Step 3 button actions (Upload)
        this.backBtn.addEventListener('click', () => {
            this.goToStep(2);
        });

        this.uploadAllBtn.addEventListener('click', () => {
            this.uploadAllFiles();
        });

        // Step 4 button actions (Training)
        this.trainingBackBtn.addEventListener('click', () => {
            this.goToStep(3);
        });

        this.skipTrainingBtn.addEventListener('click', () => {
            this.skipTraining();
        });

        // Step 5 button actions (Result)
        this.downloadModelBtn.addEventListener('click', () => {
            this.downloadModel();
        });

        this.useInAriaBtn.addEventListener('click', () => {
            this.useInAria();
        });

        this.generateBtn.addEventListener('click', () => {
            this.generateImages();
        });

        // Training options event listeners
        this.setupTrainingOptionsListeners();
    }

    setupTrainingOptionsListeners() {
        // Training type selection
        this.trainingTypeCards.forEach(card => {
            card.addEventListener('click', () => {
                this.trainingTypeCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                this.trainingOptions.type = card.dataset.type;
            });
        });

        // Keyword input
        this.keywordInput.addEventListener('input', (e) => {
            this.trainingOptions.keyword = e.target.value.trim();
        });

        // Training steps slider
        this.stepsSlider.addEventListener('input', (e) => {
            this.updateTrainingSteps(parseInt(e.target.value));
        });
    }

    setupTrainingManager() {
        this.trainingManager.setCompletionCallback(() => {
            this.goToStep(5);
        });
    }

    initializeTrainingOptions() {
        // Set default training steps
        this.updateTrainingSteps(2); // Default to 500 steps (index 2)
    }

    updateTrainingSteps(sliderValue) {
        const stepsValues = [100, 300, 500, 1000, 1250, 1500, 1750, 2000];
        const descriptions = [
            'Quick training - basic quality, fastest completion',
            'Light training - decent quality with quick results',
            'Balanced training - good quality with reasonable training time',
            'Standard training - high quality, moderate training time',
            'Enhanced training - very high quality, longer training time',
            'Professional training - excellent quality, extended training time',
            'Premium training - superior quality, significant training time',
            'Maximum training - highest quality, longest training time'
        ];

        const steps = stepsValues[sliderValue];
        const description = descriptions[sliderValue];

        this.trainingOptions.steps = steps;
        this.stepsValue.textContent = steps;
        this.stepsDescription.textContent = description;
    }

    goToStep(step) {
        this.currentStep = step;
        
        // Update step indicators
        document.querySelectorAll('.step').forEach((stepEl, index) => {
            stepEl.classList.remove('active', 'completed');
            if (index + 1 < step) {
                stepEl.classList.add('completed');
            } else if (index + 1 === step) {
                stepEl.classList.add('active');
            }
        });

        // Show/hide sections
        document.querySelectorAll('.step-section').forEach(section => {
            section.classList.remove('active');
        });

        if (step === 1) {
            this.selectFilesSection.classList.add('active');
        } else if (step === 2) {
            this.optionsSection.classList.add('active');
        } else if (step === 3) {
            this.uploadSection.classList.add('active');
            this.populateUploadSection();
        } else if (step === 4) {
            this.trainingSection.classList.add('active');
            this.startTraining();
        } else if (step === 5) {
            this.resultSection.classList.add('active');
            this.populateResultSection();
        }
    }

    startTraining() {
        // Start the training process
        this.trainingManager.startTraining(this.trainingOptions.steps);
    }

    skipTraining() {
        // Stop current training if running
        this.trainingManager.stopTraining();
        
        // Immediately complete training and go to result
        this.trainingManager.completeTraining();
    }

    populateUploadSection() {
        // Update summary stats
        const filesToUpload = this.getFilesToUpload();
        const totalSize = this.calculateTotalSize(filesToUpload);
        
        this.totalFiles.textContent = filesToUpload.length;
        this.totalSize.textContent = this.formatFileSize(totalSize);
        this.summaryTrainingType.textContent = this.trainingOptions.type.charAt(0).toUpperCase() + this.trainingOptions.type.slice(1);
        this.summaryKeyword.textContent = this.trainingOptions.keyword || '-';
        this.summarySteps.textContent = this.trainingOptions.steps;
        this.uploadStatusText.textContent = 'Ready';

        // Populate upload file list
        this.uploadFileList.innerHTML = '';
        
        for (const fileData of this.files.values()) {
            if (fileData.isZip && fileData.extractedImages) {
                // Show ZIP file with extracted images count
                const zipItem = this.createUploadFileItem(
                    fileData.original.name,
                    `ZIP Archive • ${fileData.extractedImages.length} images • ${this.formatFileSize(fileData.original.size)}`,
                    '📦',
                    'ready'
                );
                this.uploadFileList.appendChild(zipItem);
            } else {
                // Show regular image file
                const details = fileData.display.dimensions 
                    ? `${fileData.display.dimensions.width}×${fileData.display.dimensions.height} • ${this.formatFileSize(fileData.original.size)}`
                    : this.formatFileSize(fileData.original.size);
                
                const imageItem = this.createUploadFileItem(
                    fileData.original.name,
                    details,
                    '🖼️',
                    'ready'
                );
                this.uploadFileList.appendChild(imageItem);
            }
        }
    }

    populateResultSection() {
        // Update result summary
        this.resultTrainingType.textContent = this.trainingOptions.type.charAt(0).toUpperCase() + this.trainingOptions.type.slice(1);
        this.resultKeyword.textContent = this.trainingOptions.keyword || 'myartist';
        this.resultSteps.textContent = this.trainingOptions.steps;
        
        // Calculate training time (simulated)
        const estimatedMinutes = Math.floor(this.trainingOptions.steps / 30); // Rough estimate
        const hours = Math.floor(estimatedMinutes / 60);
        const minutes = estimatedMinutes % 60;
        this.resultTrainingTime.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

        // Set placeholder text with keyword
        const keyword = this.trainingOptions.keyword || 'myartist';
        this.promptInput.placeholder = `Enter your prompt here... (e.g., 'a beautiful landscape in ${keyword} style')`;
    }

    createUploadFileItem(name, details, icon, status) {
        const item = document.createElement('div');
        item.className = 'upload-file-item';
        
        item.innerHTML = `
            <div class="upload-file-icon">${icon}</div>
            <div class="upload-file-info">
                <div class="upload-file-name">${this.truncateFileName(name, 40)}</div>
                <div class="upload-file-details">${details}</div>
            </div>
            <div class="upload-file-status ${status}">
                ${status === 'ready' ? 'Ready' : status === 'uploading' ? 'Uploading...' : status === 'uploaded' ? 'Uploaded' : 'Error'}
            </div>
        `;
        
        return item;
    }

    getFilesToUpload() {
        const filesToUpload = [];
        
        for (const fileData of this.files.values()) {
            if (fileData.isZip && fileData.extractedImages) {
                filesToUpload.push(...fileData.extractedImages);
            } else {
                filesToUpload.push(fileData.original);
            }
        }
        
        return filesToUpload;
    }

    calculateTotalSize(files) {
        return files.reduce((total, file) => total + file.size, 0);
    }

    async handleFiles(fileList) {
        const files = Array.from(fileList);
        let processedCount = 0;

        for (const file of files) {
            try {
                // Check if it's a ZIP file
                if (this.zipProcessor.isZipFile(file)) {
                    await this.handleZipFile(file);
                    processedCount++;
                } else if (file.type.startsWith('image/')) {
                    await this.handleImageFile(file);
                    processedCount++;
                }
            } catch (error) {
                console.error('Error processing file:', error);
                this.showStatus(`Error processing ${file.name}: ${error.message}`, 'error');
            }
        }

        if (processedCount === 0) {
            this.showStatus('Please select valid image files or ZIP archives containing images.', 'error');
        }

        this.updateUI();
    }

    async handleZipFile(zipFile) {
        this.showStatus(`Processing ZIP file: ${zipFile.name}...`, 'success');
        
        try {
            const imageFiles = await this.zipProcessor.processZipFile(zipFile);
            
            if (imageFiles.length === 0) {
                this.showStatus(`No images found in ${zipFile.name}`, 'error');
                return;
            }

            // Create a single ZIP file entry with image count and all extracted files
            const fileId = Date.now() + Math.random();
            
            // Create a ZIP file object with metadata
            const zipFileWithMetadata = Object.assign(zipFile, {
                isZipFile: true,
                imageCount: imageFiles.length,
                extractedImages: imageFiles
            });
            
            this.files.set(fileId, {
                id: fileId,
                original: zipFileWithMetadata,
                display: zipFileWithMetadata,
                uploaded: false,
                isZip: true,
                extractedImages: imageFiles
            });
            
            this.fileManager.addFileToGrid(fileId, zipFileWithMetadata, this.fileGrid);
            this.attachFileEvents(fileId);

            this.showStatus(`Found ${imageFiles.length} image(s) in ${zipFile.name}`, 'success');
        } catch (error) {
            this.showStatus(`Failed to process ZIP file: ${error.message}`, 'error');
        }
    }

    async handleImageFile(file) {
        const fileId = Date.now() + Math.random();
        
        try {
            // Get image dimensions for display
            const dimensions = await this.getImageDimensions(file);
            
            // Create a file object with dimensions but keep original file for upload
            const fileWithDimensions = Object.assign(file, {
                dimensions: dimensions
            });
            
            this.files.set(fileId, {
                id: fileId,
                original: file,
                display: fileWithDimensions, // For display purposes
                uploaded: false
            });
            
            this.fileManager.addFileToGrid(fileId, fileWithDimensions, this.fileGrid);
            this.attachFileEvents(fileId);
        } catch (error) {
            console.error('Error processing image file:', error);
            this.showStatus(`Error processing ${file.name}`, 'error');
        }
    }

    // Helper method to get image dimensions
    getImageDimensions(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                resolve({ width: img.width, height: img.height });
                URL.revokeObjectURL(img.src);
            };
            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };
            img.src = URL.createObjectURL(file);
        });
    }

    attachFileEvents(fileId) {
        const fileItem = document.querySelector(`[data-file-id="${fileId}"]`);
        if (!fileItem) return;

        const removeBtn = fileItem.querySelector('.remove-btn');

        removeBtn.addEventListener('click', () => {
            this.removeFile(fileId);
        });
    }

    removeFile(fileId) {
        this.files.delete(fileId);
        const fileItem = document.querySelector(`[data-file-id="${fileId}"]`);
        if (fileItem) {
            fileItem.remove();
        }
        this.updateUI();
    }

    async uploadAllFiles() {
        const filesToUpload = this.getFilesToUpload();
        
        if (filesToUpload.length === 0) {
            this.showStatus('No files to upload.', 'error');
            return;
        }

        // Validate training options
        if (!this.trainingOptions.keyword.trim()) {
            this.showStatus('Please enter a keyword for training.', 'error');
            return;
        }

        this.showUploadProgress(true);
        this.uploadAllBtn.disabled = true;
        this.uploadAllBtn.textContent = 'Uploading...';
        this.uploadStatusText.textContent = 'Uploading...';

        // Update upload file list items to show uploading status
        const uploadItems = this.uploadFileList.querySelectorAll('.upload-file-item');
        uploadItems.forEach(item => {
            const statusEl = item.querySelector('.upload-file-status');
            statusEl.className = 'upload-file-status uploading';
            statusEl.textContent = 'Uploading...';
        });

        let uploaded = 0;
        let failed = 0;

        for (let i = 0; i < filesToUpload.length; i++) {
            const file = filesToUpload[i];
            const progress = Math.round(((i + 1) / filesToUpload.length) * 100);
            
            this.updateProgress(progress, `Uploading ${file.name}...`);

            try {
                // Add training options to the file upload
                const fileWithOptions = Object.assign(file, {
                    trainingType: this.trainingOptions.type,
                    keyword: this.trainingOptions.keyword,
                    trainingSteps: this.trainingOptions.steps
                });
                
                await this.uploadManager.uploadFile(fileWithOptions);
                uploaded++;
            } catch (error) {
                console.error('Upload failed:', error);
                failed++;
            }
        }

        // Mark all files as uploaded and update UI
        for (const fileData of this.files.values()) {
            if (!fileData.uploaded) {
                fileData.uploaded = true;
                this.fileManager.updateFileStatus(fileData.id, 'uploaded');
            }
        }

        // Update upload file list items to show final status
        uploadItems.forEach(item => {
            const statusEl = item.querySelector('.upload-file-status');
            if (failed === 0) {
                statusEl.className = 'upload-file-status uploaded';
                statusEl.textContent = 'Uploaded';
            } else {
                statusEl.className = 'upload-file-status error';
                statusEl.textContent = 'Error';
            }
        });

        this.updateProgress(100, 'Upload complete!');
        
        if (failed === 0) {
            this.showStatus(`All ${uploaded} files uploaded successfully with training configuration!`, 'success');
            this.uploadStatusText.textContent = 'Completed';
            
            // Auto-proceed to training after successful upload
            setTimeout(() => {
                this.goToStep(4);
            }, 2000);
        } else {
            this.showStatus(`${uploaded} files uploaded, ${failed} failed.`, 'error');
            this.uploadStatusText.textContent = 'Completed with errors';
        }

        this.uploadAllBtn.disabled = false;
        this.uploadAllBtn.textContent = 'Start Upload';
        
        setTimeout(() => {
            this.showUploadProgress(false);
        }, 3000);
    }

    async generateImages() {
        const prompt = this.promptInput.value.trim();
        if (!prompt) {
            alert('Please enter a prompt to generate images.');
            return;
        }

        const count = parseInt(this.imageCount.value);
        const size = this.imageSize.value;
        const keyword = this.trainingOptions.keyword;

        this.generateBtn.disabled = true;
        this.generateBtn.textContent = 'Generating...';

        try {
            await this.imageGenerator.generateImages(prompt, {
                count,
                size,
                keyword
            });
        } catch (error) {
            console.error('Generation failed:', error);
            alert('Image generation failed. Please try again.');
        } finally {
            this.generateBtn.disabled = false;
            this.generateBtn.textContent = 'Generate Image';
        }
    }

    downloadModel() {
        // Simulate model download
        const modelData = {
            type: this.trainingOptions.type,
            keyword: this.trainingOptions.keyword,
            steps: this.trainingOptions.steps,
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(modelData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.trainingOptions.keyword || 'model'}_trained_model.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    useInAria() {
        // Simulate integration with Aria
        alert(`Model "${this.trainingOptions.keyword}" has been integrated with Aria! You can now use it in your projects.`);
    }

    clearAllFiles() {
        this.files.clear();
        this.fileGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📁</div>
                <p>No files selected yet</p>
                <p class="empty-subtitle">Upload some images to get started</p>
            </div>
        `;
        this.updateUI();
    }

    updateUI() {
        const fileCount = this.files.size;
        this.fileCount.textContent = `${fileCount} file${fileCount !== 1 ? 's' : ''}`;
        
        this.proceedBtn.disabled = fileCount === 0;
        this.clearAllBtn.disabled = fileCount === 0;

        // Show/hide empty state
        const emptyState = this.fileGrid.querySelector('.empty-state');
        if (fileCount === 0 && !emptyState) {
            this.fileGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📁</div>
                    <p>No files selected yet</p>
                    <p class="empty-subtitle">Upload some images to get started</p>
                </div>
            `;
        } else if (fileCount > 0 && emptyState) {
            emptyState.remove();
        }
    }

    showUploadProgress(show) {
        this.uploadProgressSection.style.display = show ? 'block' : 'none';
        if (!show) {
            this.updateProgress(0, '');
        }
    }

    updateProgress(percent, message) {
        this.progressFill.style.width = `${percent}%`;
        this.progressText.textContent = `${percent}%`;
        
        if (message) {
            this.uploadStatus.textContent = message;
            this.uploadStatus.className = 'upload-status';
        }
    }

    showStatus(message, type) {
        this.uploadStatus.textContent = message;
        this.uploadStatus.className = `upload-status ${type}`;
        this.uploadProgressSection.style.display = 'block';
        
        setTimeout(() => {
            if (this.currentStep === 1) {
                this.uploadProgressSection.style.display = 'none';
            }
        }, 5000);
    }

    truncateFileName(fileName, maxLength = 20) {
        if (fileName.length <= maxLength) return fileName;
        
        const extension = fileName.split('.').pop();
        const nameWithoutExt = fileName.slice(0, fileName.lastIndexOf('.'));
        const truncatedName = nameWithoutExt.slice(0, maxLength - extension.length - 3);
        
        return `${truncatedName}...${extension}`;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new FileManagerApp();
});