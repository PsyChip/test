import { ImageProcessor } from './imageProcessor.js';

export class FileManager {
    constructor() {
        this.imageProcessor = new ImageProcessor();
    }

    addFileToGrid(fileId, file, container) {
        const fileItem = this.createFileItem(fileId, file);
        
        // Remove empty state if it exists
        const emptyState = container.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }
        
        container.appendChild(fileItem);
    }

    createFileItem(fileId, file) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.setAttribute('data-file-id', fileId);

        // Handle ZIP files - show ZIP summary with image count
        if (file.isZipFile) {
            fileItem.innerHTML = `
                <div class="zip-file-indicator">
                    <div class="zip-icon">📦</div>
                    <div class="zip-label">ZIP Archive</div>
                </div>
                <div class="file-info-container">
                    <div class="file-name" title="${file.name}">${this.truncateFileName(file.name)}</div>
                    <div class="file-size">
                        ${this.imageProcessor.formatFileSize(file.size)}
                    </div>
                    <div class="zip-image-count">
                        ${file.imageCount} ${file.imageCount === 1 ? 'image' : 'images'}
                    </div>
                    <div class="file-actions">
                        <button class="remove-btn">Remove</button>
                    </div>
                </div>
            `;
        } else {
            // Regular image files with thumbnail
            const imageUrl = URL.createObjectURL(file);

            fileItem.innerHTML = `
                <img src="${imageUrl}" alt="${file.name}" class="file-thumbnail" loading="lazy">
                <div class="file-info-container">
                    <div class="file-name" title="${file.name}">${this.truncateFileName(file.name)}</div>
                    <div class="file-size">
                        ${this.imageProcessor.formatFileSize(file.size)}
                    </div>
                    ${file.dimensions ? `
                        <div class="file-dimensions">
                            ${file.dimensions.width}×${file.dimensions.height}
                        </div>
                    ` : ''}
                    <div class="file-actions">
                        <button class="remove-btn">Remove</button>
                    </div>
                </div>
            `;

            // Clean up blob URL when element is removed
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.removedNodes.forEach((node) => {
                        if (node === fileItem) {
                            URL.revokeObjectURL(imageUrl);
                            observer.disconnect();
                        }
                    });
                });
            });

            observer.observe(fileItem.parentNode || document.body, {
                childList: true,
                subtree: true
            });
        }

        return fileItem;
    }

    truncateFileName(fileName, maxLength = 20) {
        if (fileName.length <= maxLength) return fileName;
        
        const extension = fileName.split('.').pop();
        const nameWithoutExt = fileName.slice(0, fileName.lastIndexOf('.'));
        const truncatedName = nameWithoutExt.slice(0, maxLength - extension.length - 3);
        
        return `${truncatedName}...${extension}`;
    }

    updateFileStatus(fileId, status) {
        const fileItem = document.querySelector(`[data-file-id="${fileId}"]`);
        if (!fileItem) return;

        switch (status) {
            case 'uploading':
                fileItem.classList.add('loading');
                break;
            case 'uploaded':
                fileItem.classList.remove('loading');
                fileItem.classList.add('uploaded');
                break;
            case 'error':
                fileItem.classList.remove('loading');
                break;
        }
    }

    removeFile(fileId) {
        const fileItem = document.querySelector(`[data-file-id="${fileId}"]`);
        if (fileItem) {
            fileItem.remove();
        }
    }

    clearAll(container) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📁</div>
                <p>No files selected yet</p>
                <p class="empty-subtitle">Upload some images to get started</p>
            </div>
        `;
    }
}