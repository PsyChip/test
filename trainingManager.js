export class TrainingManager {
    constructor() {
        this.isTraining = false;
        this.currentStep = 0;
        this.totalSteps = 500;
        this.startTime = null;
        this.trainingInterval = null;
        this.imageRefreshInterval = null;
        this.stepDuration = 2000; // 2 seconds per step (for demo)
        this.imageRefreshRate = 5000; // 5 seconds
    }

    startTraining(totalSteps = 500) {
        this.isTraining = true;
        this.currentStep = 0;
        this.totalSteps = totalSteps;
        this.startTime = Date.now();
        
        // Start training progress simulation
        this.trainingInterval = setInterval(() => {
            this.updateTrainingProgress();
        }, this.stepDuration);

        // Start image refresh
        this.startImageRefresh();
        
        return Promise.resolve();
    }

    updateTrainingProgress() {
        if (!this.isTraining || this.currentStep >= this.totalSteps) {
            this.completeTraining();
            return;
        }

        this.currentStep++;
        const progress = (this.currentStep / this.totalSteps) * 100;
        
        // Update progress elements
        const progressFill = document.getElementById('trainingProgressFill');
        const progressText = document.getElementById('trainingProgressText');
        const currentStepEl = document.getElementById('currentStep');
        const totalStepsEl = document.getElementById('totalSteps');
        const elapsedTimeEl = document.getElementById('elapsedTime');
        const remainingTimeEl = document.getElementById('remainingTime');
        const trainingSpeedEl = document.getElementById('trainingSpeed');
        const statusTextEl = document.getElementById('trainingStatusText');

        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressText) progressText.textContent = `${Math.round(progress)}%`;
        if (currentStepEl) currentStepEl.textContent = this.currentStep;
        if (totalStepsEl) totalStepsEl.textContent = this.totalSteps;

        // Calculate time statistics
        const elapsedMs = Date.now() - this.startTime;
        const elapsedTime = this.formatTime(elapsedMs);
        const stepsPerMinute = (this.currentStep / (elapsedMs / 60000)).toFixed(1);
        const remainingSteps = this.totalSteps - this.currentStep;
        const estimatedRemainingMs = (remainingSteps / this.currentStep) * elapsedMs;
        const remainingTime = this.formatTime(estimatedRemainingMs);

        if (elapsedTimeEl) elapsedTimeEl.textContent = elapsedTime;
        if (remainingTimeEl) remainingTimeEl.textContent = remainingTime;
        if (trainingSpeedEl) trainingSpeedEl.textContent = `${stepsPerMinute} steps/min`;

        // Update status text
        const statusMessages = [
            'Processing training data...',
            'Optimizing neural network weights...',
            'Learning style patterns...',
            'Refining model parameters...',
            'Validating training progress...',
            'Adjusting learning rate...',
            'Generating intermediate samples...',
            'Fine-tuning model architecture...'
        ];
        
        if (statusTextEl) {
            const messageIndex = Math.floor(Math.random() * statusMessages.length);
            statusTextEl.textContent = statusMessages[messageIndex];
        }
    }

    startImageRefresh() {
        this.imageRefreshInterval = setInterval(() => {
            this.refreshTrainingImage();
        }, this.imageRefreshRate);
    }

    refreshTrainingImage() {
        const dynamicImage = document.getElementById('dynamicTrainingImage');
        if (dynamicImage) {
            // Add loading effect
            dynamicImage.style.opacity = '0.5';
            
            setTimeout(() => {
                // Generate new random image URL
                const randomId = Math.floor(Math.random() * 1000) + 1;
                dynamicImage.src = `https://picsum.photos/400/400?random=${randomId}`;
                dynamicImage.style.opacity = '1';
            }, 500);
        }
    }

    completeTraining() {
        this.isTraining = false;
        
        if (this.trainingInterval) {
            clearInterval(this.trainingInterval);
            this.trainingInterval = null;
        }
        
        if (this.imageRefreshInterval) {
            clearInterval(this.imageRefreshInterval);
            this.imageRefreshInterval = null;
        }

        // Update final progress
        const progressFill = document.getElementById('trainingProgressFill');
        const progressText = document.getElementById('trainingProgressText');
        const statusTextEl = document.getElementById('trainingStatusText');

        if (progressFill) progressFill.style.width = '100%';
        if (progressText) progressText.textContent = '100%';
        if (statusTextEl) statusTextEl.textContent = 'Training completed successfully!';

        // Trigger completion callback after a short delay
        setTimeout(() => {
            this.onTrainingComplete();
        }, 2000);
    }

    onTrainingComplete() {
        // This will be set by the main app
        if (this.completionCallback) {
            this.completionCallback();
        }
    }

    setCompletionCallback(callback) {
        this.completionCallback = callback;
    }

    formatTime(milliseconds) {
        if (isNaN(milliseconds) || milliseconds < 0) {
            return '00:00:00';
        }

        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    stopTraining() {
        this.isTraining = false;
        
        if (this.trainingInterval) {
            clearInterval(this.trainingInterval);
            this.trainingInterval = null;
        }
        
        if (this.imageRefreshInterval) {
            clearInterval(this.imageRefreshInterval);
            this.imageRefreshInterval = null;
        }
    }
}