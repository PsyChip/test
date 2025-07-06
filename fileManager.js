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
        fileItem.className = 'bg-gray-800 border border-gray-700 rounded-md p-4 transition-all duration-300 hover:border-gray-600 hover:shadow-lg';
        fileItem.setAttribute('data-file-id', fileId);

        // Handle ZIP files - show ZIP summary with image count
        if (file.isZipFile) {
            fileItem.innerHTML = `
                <div class="w-full h-32 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-md flex flex-col items-center justify-center mb-3 border-2 border-dashed border-orange-500">
                    <div class="text-3xl mb-2">📦</div>
                    <div class="text-sm font-semibold text-white">ZIP Archive</div>
                </div>
                <div class="space-y-2">
                    <div class="font-semibold text-white truncate" title="${file.name}">${this.truncateFileName(file.name)}</div>
                    <div class="text-sm text-gray-400">
                        ${this.imageProcessor.formatFileSize(file.size)}
                    </div>
                    <div class="text-xs text-orange-400 bg-orange-900/20 px-2 py-1 rounded-md inline-block">
                        ${file.imageCount} ${file.imageCount === 1 ? 'image' : 'images'}
                    </div>
                    <button class="remove-btn w-full bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-md text-sm font-medium transition-all duration-300">
                        Remove
                    </button>
                </div>
            `;
        } else {
            // Regular image files with thumbnail
            const imageUrl = URL.createObjectURL(file);

            fileItem.innerHTML = `
                <img src="${imageUrl}" alt="${file.name}" class="w-full h-32 object-cover rounded-md mb-3" loading="lazy">
                <div class="space-y-2">
                    <div class="font-semibold text-white truncate" title="${file.name}">${this.truncateFileName(file.name)}</div>
                    <div class="text-sm text-gray-400">
                        ${this.imageProcessor.formatFileSize(file.size)}
                    </div>
                    ${file.dimensions ? `
                        <div class="text-xs text-blue-400 bg-blue-900/20 px-2 py-1 rounded-md inline-block">
                            ${file.dimensions.width}×${file.dimensions.height}
                        </div>
                    ` : ''}
                    <button class="remove-btn w-full bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-md text-sm font-medium transition-all duration-300">
                        Remove
                    </button>
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
                fileItem.classList.add('loading-overlay');
                break;
            case 'uploaded':
                fileItem.classList.remove('loading-overlay');
                fileItem.classList.add('border-green-500', 'bg-green-900/10');
                
                // Add checkmark
                const checkmark = document.createElement('div');
                checkmark.className = 'absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold';
                checkmark.textContent = '✓';
                fileItem.style.position = 'relative';
                fileItem.appendChild(checkmark);
                break;
            case 'error':
                fileItem.classList.remove('loading-overlay');
                fileItem.classList.add('border-red-500', 'bg-red-900/10');
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
            <div class="empty-state col-span-full text-center py-16 text-gray-500">
                <div class="text-6xl mb-4 opacity-30">📁</div>
                <p class="text-lg mb-2">No files selected yet</p>
                <p class="text-sm opacity-70">Upload some images to get started</p>
            </div>
        `;
    }
}