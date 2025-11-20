/**
 * Product Trust Analyzer - Main JavaScript
 * Client-side version for Netlify deployment
 */

// Global state
let analysisHistory = JSON.parse(localStorage.getItem('analysisHistory') || '[]');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

// DOM elements
const urlForm = document.getElementById('urlForm');
const urlInput = document.getElementById('urlInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const loading = document.getElementById('loading');
const results = document.getElementById('results');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkAuthStatus();
    loadTheme();
});

/**
 * Initialize the application
 */
function initializeApp() {
    // Enable analyze button when URL is valid
    urlInput.addEventListener('input', function() {
        const isValid = validateURL(this.value);
        analyzeBtn.disabled = !isValid;
        
        if (isValid) {
            analyzeBtn.textContent = 'Analyze Reviews';
            analyzeBtn.classList.remove('disabled');
        } else {
            analyzeBtn.textContent = 'Enter Valid URL';
            analyzeBtn.classList.add('disabled');
        }
    });
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    if (urlForm) {
        urlForm.addEventListener('submit', handleAnalysis);
    }
    
    // Theme switcher
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const theme = this.classList.contains('purple-theme') ? 'purple' :
                         this.classList.contains('blue-theme') ? 'blue' :
                         this.classList.contains('green-theme') ? 'green' : 'dark';
            switchTheme(theme);
        });
    });
}

/**
 * Handle form submission for analysis
 */
async function handleAnalysis(event) {
    event.preventDefault();
    
    const url = urlInput.value.trim();
    if (!validateURL(url)) {
        showError('Please enter a valid Amazon or Flipkart product URL');
        return;
    }
    
    showLoading(true);
    
    try {
        // Parse URL to extract product information
        const productInfo = parseProductURL(url);
        if (!productInfo) {
            throw new Error('Unable to parse product URL');
        }
        
        // Generate demo reviews and analysis
        const reviews = generateDemoReviews(productInfo.productId);
        const analysis = analyzeFakeReviews(reviews);
        const trustScore = calculateTrustScore(reviews, analysis.fakePercentage);
        
        // Create result object
        const result = {
            product: {
                productId: productInfo.productId,
                platform: productInfo.platform,
                title: generateProductTitle(productInfo.productId, productInfo.platform),
                imageUrl: generateProductImage(productInfo.productId),
                url: url
            },
            trustScore: trustScore,
            fakePercentage: analysis.fakePercentage,
            totalReviews: reviews.length,
            starDistribution: getStarDistribution(reviews),
            genuineAverage: calculateGenuineAverage(reviews),
            recommendation: generateRecommendation(trustScore, analysis.fakePercentage),
            patternsDetected: analysis.patternsDetected,
            cached: false
        };
        
        // Save to history
        saveToHistory(result);
        
        // Display results
        displayResults(result);
        
    } catch (error) {
        console.error('Analysis error:', error);
        showError('An error occurred during analysis. Please try again.');
    } finally {
        showLoading(false);
    }
}

/**
 * Validate URL format
 */
function validateURL(url) {
    if (!url) return false;
    
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.toLowerCase();
        
        // Check for Amazon domains
        const amazonDomains = [
            'amazon.com', 'amazon.in', 'amazon.co.uk', 'amazon.de',
            'amazon.fr', 'amazon.it', 'amazon.es', 'amazon.ca',
            'amazon.com.au', 'amazon.co.jp'
        ];
        
        // Check for Flipkart
        const flipkartDomains = ['flipkart.com'];
        
        const isAmazon = amazonDomains.some(domain => hostname.includes(domain));
        const isFlipkart = flipkartDomains.some(domain => hostname.includes(domain));
        
        return isAmazon || isFlipkart;
    } catch {
        return false;
    }
}

/**
 * Parse product URL to extract information
 */
function parseProductURL(url) {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.toLowerCase();
        const pathname = urlObj.pathname;
        
        let platform, productId;
        
        if (hostname.includes('amazon')) {
            platform = 'amazon';
            // Extract ASIN from various Amazon URL formats
            const asinMatch = pathname.match(/\/dp\/([A-Z0-9]{10})|\/gp\/product\/([A-Z0-9]{10})|\/([A-Z0-9]{10})/);
            productId = asinMatch ? (asinMatch[1] || asinMatch[2] || asinMatch[3]) : 'B08N5WRWNW';
        } else if (hostname.includes('flipkart')) {
            platform = 'flipkart';
            // Extract product ID from Flipkart URL
            const pidMatch = pathname.match(/\/p\/([A-Z0-9]+)/i) || url.match(/pid=([A-Z0-9]+)/i);
            productId = pidMatch ? pidMatch[1] : 'MOBFKD123456';
        }
        
        return productId ? { platform, productId, url } : null;
    } catch {
        return null;
    }
}

/**
 * Generate demo reviews for a product
 */
function generateDemoReviews(productId) {
    // Use product ID as seed for consistent results
    const seed = hashCode(productId);
    const random = seededRandom(seed);
    
    const reviewCount = Math.floor(random() * 80) + 20; // 20-100 reviews
    const reviews = [];
    
    const positiveTemplates = [
        "Great product! Highly recommend it.",
        "Excellent quality and fast delivery.",
        "Perfect for my needs. Very satisfied.",
        "Good value for money. Works as expected.",
        "Amazing product! Exceeded my expectations."
    ];
    
    const negativeTemplates = [
        "Poor quality. Not worth the money.",
        "Disappointed with this purchase.",
        "Product broke after a few days.",
        "Not as described. Returning it.",
        "Terrible experience. Avoid this product."
    ];
    
    const fakeTemplates = [
        "Amazing! Best product ever! 5 stars!",
        "Incredible quality! Must buy!",
        "Perfect! Amazing! Wonderful!",
        "Best purchase ever made!",
        "Outstanding product! Highly recommended!"
    ];
    
    for (let i = 0; i < reviewCount; i++) {
        const isFake = random() < 0.25; // 25% fake reviews
        let rating, text, confidence;
        
        if (isFake) {
            rating = Math.floor(random() * 2) + 4; // 4-5 stars for fake
            text = fakeTemplates[Math.floor(random() * fakeTemplates.length)];
            confidence = 0.7 + random() * 0.3; // High confidence for fake
        } else {
            rating = generateRealisticRating(random);
            if (rating >= 4) {
                text = positiveTemplates[Math.floor(random() * positiveTemplates.length)];
            } else {
                text = negativeTemplates[Math.floor(random() * negativeTemplates.length)];
            }
            confidence = random() * 0.3; // Low confidence for genuine
        }
        
        reviews.push({
            id: `review_${i}`,
            rating: rating,
            text: text,
            author: generateReviewerName(random),
            date: generateReviewDate(random),
            isFake: isFake,
            confidence: confidence
        });
    }
    
    return reviews;
}

/**
 * Generate realistic rating distribution
 */
function generateRealisticRating(random) {
    const rand = random();
    if (rand < 0.05) return 1;
    if (rand < 0.13) return 2;
    if (rand < 0.28) return 3;
    if (rand < 0.63) return 4;
    return 5;
}

/**
 * Generate reviewer name
 */
function generateReviewerName(random) {
    const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa', 'Chris', 'Emma'];
    const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Miller', 'Taylor', 'Anderson'];
    
    const firstName = firstNames[Math.floor(random() * firstNames.length)];
    const lastName = lastNames[Math.floor(random() * lastNames.length)];
    
    return `${firstName} ${lastName.charAt(0)}.`;
}

/**
 * Generate review date
 */
function generateReviewDate(random) {
    const daysAgo = Math.floor(random() * 365);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
}

/**
 * Analyze fake reviews
 */
function analyzeFakeReviews(reviews) {
    let fakeCount = 0;
    const patternsDetected = [];
    
    // Count fake reviews
    reviews.forEach(review => {
        if (review.isFake || review.confidence > 0.5) {
            fakeCount++;
        }
    });
    
    const fakePercentage = (fakeCount / reviews.length) * 100;
    
    // Detect patterns
    if (fakeCount > 0) {
        patternsDetected.push(`${fakeCount} potentially fake reviews detected`);
    }
    
    const fiveStarCount = reviews.filter(r => r.rating === 5).length;
    const fiveStarPercentage = (fiveStarCount / reviews.length) * 100;
    
    if (fiveStarPercentage > 70) {
        patternsDetected.push('Unusually high percentage of 5-star ratings');
    }
    
    return {
        fakeCount,
        fakePercentage: Math.round(fakePercentage * 100) / 100,
        patternsDetected
    };
}

/**
 * Calculate trust score
 */
function calculateTrustScore(reviews, fakePercentage) {
    const genuineReviews = reviews.filter(r => !r.isFake && r.confidence < 0.5);
    
    if (genuineReviews.length === 0) return 1.0;
    
    const avgRating = genuineReviews.reduce((sum, r) => sum + r.rating, 0) / genuineReviews.length;
    const baseScore = (avgRating / 5) * 10;
    const fakeReduction = (fakePercentage / 100) * 3;
    
    return Math.max(1.0, Math.min(10.0, baseScore - fakeReduction));
}

/**
 * Get star distribution
 */
function getStarDistribution(reviews) {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    reviews.forEach(review => {
        distribution[review.rating]++;
    });
    
    return distribution;
}

/**
 * Calculate genuine average rating
 */
function calculateGenuineAverage(reviews) {
    const genuineReviews = reviews.filter(r => !r.isFake && r.confidence < 0.5);
    
    if (genuineReviews.length === 0) return 0;
    
    const sum = genuineReviews.reduce((total, review) => total + review.rating, 0);
    return Math.round((sum / genuineReviews.length) * 10) / 10;
}

/**
 * Generate recommendation
 */
function generateRecommendation(trustScore, fakePercentage) {
    if (trustScore >= 7 && fakePercentage < 15) {
        return {
            text: 'Recommended to buy',
            level: 'safe',
            reason: 'High trust score with low fake review percentage'
        };
    } else if (trustScore >= 5 && fakePercentage < 30) {
        return {
            text: 'Proceed with caution',
            level: 'warning',
            reason: 'Moderate trust score or some fake reviews detected'
        };
    } else {
        return {
            text: 'Not recommended',
            level: 'danger',
            reason: 'Low trust score or high percentage of fake reviews'
        };
    }
}

/**
 * Generate product title based on ID
 */
function generateProductTitle(productId, platform) {
    const products = {
        'B08N5WRWNW': 'Echo Dot (4th Gen) - Smart Speaker with Alexa',
        'B07FZ8S74R': 'Fire TV Stick 4K - Streaming Media Player',
        'B09DZH4C71': 'Cosmic Byte Odyssey Condensor Microphone',
        'B0FKTDXKXV': 'Maxoshine Car Dashboard Polish - Non-Greasy Formula',
        'B0DZX4PYLV': 'Phone Ring Holder and Kickstand - Universal Compatibility',
        'B0DM5RD6M6': 'ConnectPlus Power Bank 20000mAh Portable Charger',
        'B085NNH52P': 'ConnectPlus Portable Bluetooth Speaker - Waterproof',
        'B08HEADSET': 'Premium Wireless Headphones with Active Noise Cancellation'
    };
    
    return products[productId] || `${platform === 'amazon' ? 'Amazon' : 'Flipkart'} Product - ${productId}`;
}

/**
 * Generate product image URL
 */
function generateProductImage(productId) {
    const categories = {
        'B08N5WRWNW': 'Smart+Speaker',
        'B07FZ8S74R': 'Streaming+Device',
        'B09DZH4C71': 'Microphone',
        'B0FKTDXKXV': 'Car+Care',
        'B0DZX4PYLV': 'Mobile+Accessories',
        'B0DM5RD6M6': 'Power+Bank',
        'B085NNH52P': 'Bluetooth+Speaker',
        'B08HEADSET': 'Headphones'
    };
    
    const category = categories[productId] || 'Product';
    return `https://via.placeholder.com/400x400/2196F3/FFFFFF?text=${category}`;
}

/**
 * Display analysis results
 */
function displayResults(result) {
    if (!results) return;
    
    // Update product info in header
    updateProductInfo(result.product, result.totalReviews, result.genuineAverage);
    
    // Update trust score with GaugeRing animation
    updateTrustScore(result.trustScore);
    
    // Update key metrics pills
    updateKeyMetrics(result);
    
    // Update star distribution as BarRows
    updateStarDistribution(result.starDistribution, result.totalReviews);
    
    // Update recommendation
    updateRecommendation(result.recommendation);
    
    // Update patterns detected
    updatePatternsDetected(result.patternsDetected);
    
    // Update sticky context bar
    updateContextBar(result.product, result.trustScore);
    
    // Show results with animation
    results.style.display = 'block';
    results.classList.add('visible');
    
    // Trigger animations
    if (window.AnimationUtils) {
        // Animate gauge ring
        const gaugeRing = document.getElementById('trustScoreGauge');
        if (gaugeRing) {
            setTimeout(() => {
                window.AnimationUtils.animateGaugeRing(gaugeRing, result.trustScore * 10);
            }, 200);
        }
        
        // Animate bar rows with stagger
        const barRows = document.querySelectorAll('.bar-row');
        if (barRows.length > 0) {
            window.AnimationUtils.animateList(barRows);
        }
        
        // Setup context bar observer
        window.AnimationUtils.setupContextBarObserver('.results-header');
    }
    
    // Scroll to results
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Update product information display
 */
function updateProductInfo(product, totalReviews, genuineAverage) {
    const productImage = document.getElementById('productImage');
    const productTitle = document.getElementById('productTitle');
    const productPlatform = document.getElementById('productPlatform');
    const totalReviewsEl = document.getElementById('totalReviews');
    const genuineAverageEl = document.getElementById('genuineAverage');
    
    if (productImage) {
        productImage.src = product.imageUrl;
        productImage.alt = product.title;
    }
    if (productTitle) productTitle.textContent = product.title;
    if (productPlatform) productPlatform.textContent = product.platform === 'amazon' ? 'Amazon' : 'Flipkart';
    if (totalReviewsEl) totalReviewsEl.textContent = `${totalReviews} reviews`;
    if (genuineAverageEl) genuineAverageEl.textContent = genuineAverage.toFixed(1);
}

/**
 * Update trust score with GaugeRing
 */
function updateTrustScore(trustScore) {
    const scoreText = document.getElementById('scoreText');
    const gaugeRingFill = document.getElementById('gaugeRingFill');
    
    if (scoreText) {
        scoreText.textContent = Math.round(trustScore * 10);
    }
    
    if (gaugeRingFill) {
        // Determine color based on score
        gaugeRingFill.classList.remove('gauge-ring__fill--good', 'gauge-ring__fill--warn', 'gauge-ring__fill--bad');
        if (trustScore >= 7) {
            gaugeRingFill.classList.add('gauge-ring__fill--good');
        } else if (trustScore >= 4) {
            gaugeRingFill.classList.add('gauge-ring__fill--warn');
        } else {
            gaugeRingFill.classList.add('gauge-ring__fill--bad');
        }
    }
}

/**
 * Update key metrics pills
 */
function updateKeyMetrics(result) {
    // Authenticity (inverse of fake percentage)
    const authenticityPill = document.getElementById('authenticityPill');
    if (authenticityPill) {
        const authenticity = 100 - result.fakePercentage;
        authenticityPill.querySelector('.score-pill__value').textContent = `${Math.round(authenticity)}%`;
        authenticityPill.className = 'score-pill';
        if (authenticity >= 85) {
            authenticityPill.classList.add('score-pill--good');
        } else if (authenticity >= 70) {
            authenticityPill.classList.add('score-pill--warn');
        } else {
            authenticityPill.classList.add('score-pill--bad');
        }
    }
    
    // Fraud Risk
    const fraudRiskPill = document.getElementById('fraudRiskPill');
    if (fraudRiskPill) {
        fraudRiskPill.querySelector('.score-pill__value').textContent = `${Math.round(result.fakePercentage)}%`;
        fraudRiskPill.className = 'score-pill';
        if (result.fakePercentage < 15) {
            fraudRiskPill.classList.add('score-pill--good');
        } else if (result.fakePercentage < 30) {
            fraudRiskPill.classList.add('score-pill--warn');
        } else {
            fraudRiskPill.classList.add('score-pill--bad');
        }
    }
    
    // Sentiment
    const sentimentPill = document.getElementById('sentimentPill');
    if (sentimentPill) {
        const sentiment = result.genuineAverage >= 3.5 ? 'Positive' : result.genuineAverage >= 2.5 ? 'Mixed' : 'Negative';
        sentimentPill.querySelector('.score-pill__value').textContent = sentiment;
        sentimentPill.className = 'score-pill';
        if (sentiment === 'Positive') {
            sentimentPill.classList.add('score-pill--good');
        } else if (sentiment === 'Mixed') {
            sentimentPill.classList.add('score-pill--warn');
        } else {
            sentimentPill.classList.add('score-pill--bad');
        }
    }
    
    // Review Volume
    const volumePill = document.getElementById('volumePill');
    if (volumePill) {
        volumePill.querySelector('.score-pill__value').textContent = result.totalReviews;
        volumePill.className = 'score-pill score-pill--good';
    }
}

/**
 * Update star distribution chart as BarRows
 */
function updateStarDistribution(distribution, total) {
    for (let star = 1; star <= 5; star++) {
        const count = distribution[star] || 0;
        const percentage = total > 0 ? (count / total) * 100 : 0;
        
        const fillElement = document.getElementById(`star${star}Fill`);
        const countElement = document.getElementById(`star${star}Count`);
        
        if (fillElement) {
            // Animate bar fill with delay
            if (window.AnimationUtils) {
                const barRow = fillElement.closest('.bar-row');
                window.AnimationUtils.animateBarRow(barRow, percentage, star * 50);
            } else {
                fillElement.style.width = `${percentage}%`;
            }
        }
        
        if (countElement) {
            countElement.textContent = `${Math.round(percentage)}%`;
        }
    }
}

/**
 * Update recommendation display
 */
function updateRecommendation(recommendation) {
    const recommendationElement = document.getElementById('recommendation');
    
    if (recommendationElement) {
        recommendationElement.querySelector('.score-pill__value').textContent = recommendation.text;
        recommendationElement.className = 'score-pill';
        if (recommendation.level === 'safe') {
            recommendationElement.classList.add('score-pill--good');
        } else if (recommendation.level === 'warning') {
            recommendationElement.classList.add('score-pill--warn');
        } else {
            recommendationElement.classList.add('score-pill--bad');
        }
    }
}

/**
 * Update patterns detected as keyword chips
 */
function updatePatternsDetected(patterns) {
    const patternsElement = document.getElementById('patternsDetected');
    
    if (patternsElement) {
        if (patterns.length === 0) {
            patternsElement.innerHTML = '<div class="keyword-chip" data-sentiment="positive"><span class="keyword-chip__text">No suspicious patterns detected</span><span class="keyword-chip__sentiment">✅</span></div>';
        } else {
            const chips = patterns.map(pattern => 
                `<div class="keyword-chip" data-sentiment="negative">
                    <span class="keyword-chip__text">${pattern}</span>
                    <span class="keyword-chip__sentiment">⚠️</span>
                </div>`
            ).join('');
            patternsElement.innerHTML = chips;
        }
    }
}

/**
 * Update sticky context bar
 */
function updateContextBar(product, trustScore) {
    const contextImage = document.getElementById('contextImage');
    const contextTitle = document.getElementById('contextTitle');
    const contextScoreChip = document.getElementById('contextScoreChip');
    
    if (contextImage) {
        contextImage.src = product.imageUrl;
        contextImage.alt = product.title;
    }
    
    if (contextTitle) {
        contextTitle.textContent = product.title;
    }
    
    if (contextScoreChip) {
        const score = Math.round(trustScore * 10);
        contextScoreChip.textContent = `Trust Score: ${score}`;
        contextScoreChip.className = 'score-chip';
        if (trustScore >= 7) {
            contextScoreChip.classList.add('score-chip--good');
        } else if (trustScore >= 4) {
            contextScoreChip.classList.add('score-chip--warn');
        } else {
            contextScoreChip.classList.add('score-chip--bad');
        }
    }
}

/**
 * Re-analyze current product
 */
function reanalyze() {
    if (urlInput && urlInput.value) {
        urlForm.dispatchEvent(new Event('submit'));
    }
}

/**
 * Save analysis to history
 */
function saveToHistory(result) {
    const historyItem = {
        id: Date.now().toString(),
        url: result.product.url,
        title: result.product.title,
        image: result.product.imageUrl,
        trustScore: result.trustScore,
        fakePercentage: result.fakePercentage,
        totalReviews: result.totalReviews,
        date: new Date().toISOString(),
        formattedDate: new Date().toLocaleDateString()
    };
    
    analysisHistory.unshift(historyItem);
    
    // Keep only last 50 items
    if (analysisHistory.length > 50) {
        analysisHistory = analysisHistory.slice(0, 50);
    }
    
    localStorage.setItem('analysisHistory', JSON.stringify(analysisHistory));
}

/**
 * Show/hide loading indicator
 */
function showLoading(show) {
    if (loading) {
        loading.style.display = show ? 'block' : 'none';
    }
    if (results) {
        results.style.display = show ? 'none' : results.style.display;
        if (!show) {
            results.classList.remove('visible');
        }
    }
    
    // Update progress strip
    if (window.AnimationUtils) {
        if (show) {
            window.AnimationUtils.updateProgressStrip(30);
        } else {
            window.AnimationUtils.updateProgressStrip(100);
        }
    }
}

/**
 * Show error message
 */
function showError(message) {
    const urlInputField = document.getElementById('urlInputField');
    const urlError = document.getElementById('urlError');
    
    if (urlInputField && urlError) {
        urlInputField.setAttribute('data-error', 'true');
        urlError.textContent = message;
        
        // Clear error after 5 seconds
        setTimeout(() => {
            urlInputField.setAttribute('data-error', 'false');
            urlError.textContent = '';
        }, 5000);
    } else {
        alert(message);
    }
}

/**
 * Theme switching functionality
 */
function switchTheme(theme) {
    document.body.className = `${theme}-theme`;
    localStorage.setItem('selectedTheme', theme);
}

/**
 * Load saved theme
 */
function loadTheme() {
    const savedTheme = localStorage.getItem('selectedTheme') || 'purple';
    switchTheme(savedTheme);
}

/**
 * Check authentication status (mock)
 */
function checkAuthStatus() {
    // Mock authentication for demo
    const loggedOutLinks = document.getElementById('loggedOutLinks');
    const loggedInLinks = document.getElementById('loggedInLinks');
    const welcomeMessage = document.getElementById('welcomeMessage');
    
    if (currentUser) {
        if (loggedOutLinks) loggedOutLinks.style.display = 'none';
        if (loggedInLinks) loggedInLinks.style.display = 'flex';
        if (welcomeMessage) welcomeMessage.style.display = 'block';
    } else {
        if (loggedOutLinks) loggedOutLinks.style.display = 'flex';
        if (loggedInLinks) loggedInLinks.style.display = 'none';
        if (welcomeMessage) welcomeMessage.style.display = 'none';
    }
}

/**
 * Logout function (mock)
 */
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        currentUser = null;
        localStorage.removeItem('currentUser');
        checkAuthStatus();
        alert('Logged out successfully!');
    }
}

// Utility functions
function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
}

function seededRandom(seed) {
    let x = Math.sin(seed) * 10000;
    return function() {
        x = Math.sin(x) * 10000;
        return x - Math.floor(x);
    };
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateURL,
        parseProductURL,
        analyzeFakeReviews,
        calculateTrustScore
    };
}