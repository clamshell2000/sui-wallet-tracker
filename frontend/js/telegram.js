/**
 * Telegram MiniApp integration
 * Handles all interactions with the Telegram WebApp API
 */

// Initialize Telegram WebApp (with fallback for browser testing)
const tg = window.Telegram ? window.Telegram.WebApp : null;

// Initialize Telegram MiniApp
const TelegramApp = {
    // Store the WebApp instance
    webapp: tg,
    
    // Flag to check if running in Telegram
    isInTelegram: !!tg,
    
    // Flag for debug mode (browser testing)
    debugMode: !tg,
    
    // Initialize the Telegram MiniApp
    init() {
        console.log('Telegram MiniApp initializing...');
        console.log('Running in Telegram:', this.isInTelegram);
        console.log('Debug mode:', this.debugMode);
        
        if (this.isInTelegram) {
            // Expand to full height
            this.webapp.expand();
            
            // Set the theme based on Telegram's theme
            this.applyThemeColors();
            
            // Set up back button handling if needed
            this.setupBackButton();
            
            console.log('Telegram MiniApp initialized in Telegram');
        } else {
            // Apply default theme for browser testing
            this.applyDefaultTheme();
            console.log('Telegram MiniApp initialized in browser (debug mode)');
        }
    },
    
    // Apply Telegram theme colors to CSS variables
    applyThemeColors() {
        if (!this.isInTelegram) return;
        
        document.documentElement.style.setProperty('--tg-theme-bg-color', this.webapp.themeParams.bg_color);
        document.documentElement.style.setProperty('--tg-theme-text-color', this.webapp.themeParams.text_color);
        document.documentElement.style.setProperty('--tg-theme-hint-color', this.webapp.themeParams.hint_color);
        document.documentElement.style.setProperty('--tg-theme-link-color', this.webapp.themeParams.link_color);
        document.documentElement.style.setProperty('--tg-theme-button-color', this.webapp.themeParams.button_color);
        document.documentElement.style.setProperty('--tg-theme-button-text-color', this.webapp.themeParams.button_text_color);
    },
    
    // Apply default theme for browser testing
    applyDefaultTheme() {
        document.documentElement.style.setProperty('--tg-theme-bg-color', '#ffffff');
        document.documentElement.style.setProperty('--tg-theme-text-color', '#000000');
        document.documentElement.style.setProperty('--tg-theme-hint-color', '#999999');
        document.documentElement.style.setProperty('--tg-theme-link-color', '#2481cc');
        document.documentElement.style.setProperty('--tg-theme-button-color', '#2481cc');
        document.documentElement.style.setProperty('--tg-theme-button-text-color', '#ffffff');
    },
    
    // Show the main button with custom text and callback
    showMainButton(text, callback) {
        if (!this.isInTelegram) return;
        this.webapp.MainButton.setText(text);
        this.webapp.MainButton.onClick(callback);
        this.webapp.MainButton.show();
    },
    
    // Hide the main button
    hideMainButton() {
        if (!this.isInTelegram) return;
        this.webapp.MainButton.hide();
    },
    
    // Set up back button handling
    setupBackButton() {
        if (!this.isInTelegram) return;
        
        this.webapp.BackButton.onClick(() => {
            // Handle back button click
            // For example, close modals or navigate back
            const modals = document.querySelectorAll('.modal');
            for (const modal of modals) {
                if (modal.style.display === 'block') {
                    modal.style.display = 'none';
                    this.webapp.BackButton.hide();
                    return;
                }
            }
        });
    },
    
    // Show back button
    showBackButton() {
        if (!this.isInTelegram) return;
        this.webapp.BackButton.show();
    },
    
    // Hide back button
    hideBackButton() {
        if (!this.isInTelegram) return;
        this.webapp.BackButton.hide();
    },
    
    // Show a popup (Telegram native or browser fallback)
    showPopup(title, message, buttons = []) {
        if (this.isInTelegram) {
            try {
                this.webapp.showPopup({
                    title,
                    message,
                    buttons
                });
            } catch (error) {
                console.error('Error showing popup:', error);
                this.showBrowserAlert(`${title}\n\n${message}`);
            }
        } else {
            // Browser fallback
            this.showBrowserPopup(title, message, buttons);
        }
    },
    
    // Show a native Telegram alert or browser fallback
    showAlert(message) {
        if (this.isInTelegram) {
            try {
                this.webapp.showAlert(message);
            } catch (error) {
                console.error('Error showing alert:', error);
                this.showBrowserAlert(message);
            }
        } else {
            this.showBrowserAlert(message);
        }
    },
    
    // Show a native Telegram confirmation dialog or browser fallback
    showConfirm(message, callback) {
        if (this.isInTelegram) {
            try {
                this.webapp.showConfirm(message, callback);
            } catch (error) {
                console.error('Error showing confirm dialog:', error);
                const confirmed = this.showBrowserConfirm(message);
                if (callback) callback(confirmed);
            }
        } else {
            const confirmed = this.showBrowserConfirm(message);
            if (callback) callback(confirmed);
        }
    },
    
    // Browser fallback for alerts
    showBrowserAlert(message) {
        alert(message);
    },
    
    // Browser fallback for confirms
    showBrowserConfirm(message) {
        return confirm(message);
    },
    
    // Browser fallback for popups
    showBrowserPopup(title, message, buttons = []) {
        // Simple fallback - just show an alert with title and message
        alert(`${title}\n\n${message}`);
        
        // If there's a URL button, open it
        const urlButton = buttons.find(btn => btn.url);
        if (urlButton && urlButton.url) {
            window.open(urlButton.url, '_blank');
        }
    },
    
    // Show QR scanner
    scanQR(callback) {
        if (this.isInTelegram && this.webapp.showScanQrPopup) {
            try {
                this.webapp.showScanQrPopup({
                    text: 'Scan a Sui wallet address QR code'
                }, callback);
            } catch (error) {
                console.error('Error showing QR scanner:', error);
                this.showBrowserQRFallback(callback);
            }
        } else {
            this.showBrowserQRFallback(callback);
        }
    },
    
    // Close QR scanner
    closeQRScanner() {
        if (this.isInTelegram && this.webapp.closeScanQrPopup) {
            try {
                this.webapp.closeScanQrPopup();
            } catch (error) {
                console.error('Error closing QR scanner:', error);
            }
        }
    },
    
    // Browser fallback for QR scanning
    showBrowserQRFallback(callback) {
        const address = prompt('Enter a Sui wallet address (QR scanning not available in browser):\n\nExample: 0x123...abc');
        if (address && callback) {
            callback(address);
        }
    },
    
    // Handle haptic feedback
    hapticFeedback(type) {
        if (!this.isInTelegram || !this.webapp.HapticFeedback) return;
        
        try {
            switch (type) {
                case 'success':
                    this.webapp.HapticFeedback.notificationOccurred('success');
                    break;
                case 'warning':
                    this.webapp.HapticFeedback.notificationOccurred('warning');
                    break;
                case 'error':
                    this.webapp.HapticFeedback.notificationOccurred('error');
                    break;
                case 'selection':
                    this.webapp.HapticFeedback.selectionChanged();
                    break;
                default:
                    this.webapp.HapticFeedback.impactOccurred('medium');
            }
        } catch (error) {
            console.error('Error with haptic feedback:', error);
        }
    }
};

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    TelegramApp.init();
});
