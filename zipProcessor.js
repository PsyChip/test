export class ZipProcessor {
    constructor() {
        this.supportedImageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    }

    async processZipFile(zipFile) {
        try {
            // Dynamically import JSZip
            const JSZip = (await import('jszip')).default;
            const zip = new JSZip();
            
            const zipData = await zip.loadAsync(zipFile);
            const imageFiles = [];

            // Iterate through all files in the ZIP
            for (const [filename, file] of Object.entries(zipData.files)) {
                // Skip directories
                if (file.dir) continue;

                // Check if file is an image
                const extension = this.getFileExtension(filename).toLowerCase();
                if (this.supportedImageTypes.includes(extension)) {
                    try {
                        // Get the file as a blob
                        const blob = await file.async('blob');
                        
                        // Create a File object with proper MIME type
                        const mimeType = this.getMimeType(extension);
                        const imageFile = new File([blob], filename, {
                            type: mimeType,
                            lastModified: Date.now()
                        });

                        // Add metadata about the ZIP source
                        imageFile.zipSource = zipFile.name;
                        imageFile.isFromZip = true;

                        imageFiles.push(imageFile);
                    } catch (error) {
                        console.error(`Error extracting ${filename} from ZIP:`, error);
                    }
                }
            }

            return imageFiles;
        } catch (error) {
            console.error('Error processing ZIP file:', error);
            throw new Error(`Failed to process ZIP file: ${error.message}`);
        }
    }

    getFileExtension(filename) {
        return filename.split('.').pop() || '';
    }

    getMimeType(extension) {
        const mimeTypes = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp'
        };
        return mimeTypes[extension] || 'image/jpeg';
    }

    isZipFile(file) {
        return file.type === 'application/zip' || 
               file.type === 'application/x-zip-compressed' ||
               file.name.toLowerCase().endsWith('.zip');
    }
}