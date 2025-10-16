/**
 * History Page JavaScript
 * Handles display and management of analysis history
 */

document.addEventListener('DOMContentLoaded', function() {
    loadAnalysisHistory();
    setupHistoryEventListeners();
});

/**
 * Load and display analysis history
 */
function loadAnalysisHistory() {
    const analysisHistory = JSON.parse(localStorage.getItem('analysisHistory') || '[]');
    const historyContainer = document.getElementById('historyContainer');
    
    if (!historyContainer) return;
    
    if (analysisHistory.length === 0) {
        historyContainer.innerHTML = `
            <div class="card text-center">
                <h3>No Analysis History</h3>
                <p>You haven't analyzed any products yet.</p>
                <a href="index.html" class="analyze-btn">Start Analyzing</a>
            </div>
        `;
        return;
    }
    
    // Create history table
    const tableHTML = `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h2>Analysis History</h2>
                <button onclick="clearHistory()" class="btn btn-danger" style="background: #ef4444; color: white; padding: 8px 16px; border: none; border-radius: 8px; cursor: pointer;">
                    Clear History
                </button>
            </div>
            <div style="overflow-x: auto;">
                <table class="history-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Trust Score</th>
                            <th>Fake Reviews</th>
                            <th>Total Reviews</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${analysisHistory.map(item => createHistoryRow(item)).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    historyContainer.innerHTML = tableHTML;
}

/**
 * Create a history table row
 */
function createHistoryRow(item) {
    const trustScoreClass = item.trustScore >= 7 ? 'score-high' : 
                           item.trustScore >= 4 ? 'score-medium' : 'score-low';
    
    const fakePercentageClass = item.fakePercentage < 15 ? 'safe' :
                               item.fakePercentage < 30 ? 'warning' : 'danger';
    
    return `
        <tr data-id="${item.id}">
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${item.image}" alt="Product" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
                    <div>
                        <div style="font-weight: bold; margin-bottom: 4px;">${truncateText(item.title, 50)}</div>
                        <a href="${item.url}" target="_blank" style="color: #666; font-size: 0.9em; text-decoration: none;">
                            View Product →
                        </a>
                    </div>
                </div>
            </td>
            <td>
                <span class="status-badge ${trustScoreClass}" style="padding: 4px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: bold;">
                    ${item.trustScore.toFixed(1)}/10
                </span>
            </td>
            <td>
                <span class="status-badge ${fakePercentageClass}" style="padding: 4px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: bold;">
                    ${item.fakePercentage.toFixed(1)}%
                </span>
            </td>
            <td>${item.totalReviews}</td>
            <td>${item.formattedDate}</td>
            <td>
                <div style="display: flex; gap: 8px;">
                    <button onclick="reanalyzeProduct('${item.url}')" class="btn btn-sm" style="background: #10b981; color: white; padding: 4px 8px; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">
                        Re-analyze
                    </button>
                    <button onclick="deleteHistoryItem('${item.id}')" class="btn btn-sm" style="background: #ef4444; color: white; padding: 4px 8px; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">
                        Delete
                    </button>
                </div>
            </td>
        </tr>
    `;
}

/**
 * Setup event listeners for history page
 */
function setupHistoryEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('historySearch');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterHistory(this.value);
        });
    }
    
    // Sort functionality
    const sortSelect = document.getElementById('historySort');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            sortHistory(this.value);
        });
    }
}

/**
 * Filter history based on search term
 */
function filterHistory(searchTerm) {
    const rows = document.querySelectorAll('.history-table tbody tr');
    const term = searchTerm.toLowerCase();
    
    rows.forEach(row => {
        const title = row.querySelector('td:first-child').textContent.toLowerCase();
        const isVisible = title.includes(term);
        row.style.display = isVisible ? '' : 'none';
    });
}

/**
 * Sort history by different criteria
 */
function sortHistory(sortBy) {
    let analysisHistory = JSON.parse(localStorage.getItem('analysisHistory') || '[]');
    
    switch (sortBy) {
        case 'date-desc':
            analysisHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'date-asc':
            analysisHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'trust-high':
            analysisHistory.sort((a, b) => b.trustScore - a.trustScore);
            break;
        case 'trust-low':
            analysisHistory.sort((a, b) => a.trustScore - b.trustScore);
            break;
        case 'fake-high':
            analysisHistory.sort((a, b) => b.fakePercentage - a.fakePercentage);
            break;
        case 'fake-low':
            analysisHistory.sort((a, b) => a.fakePercentage - b.fakePercentage);
            break;
    }
    
    localStorage.setItem('analysisHistory', JSON.stringify(analysisHistory));
    loadAnalysisHistory();
}

/**
 * Re-analyze a product
 */
function reanalyzeProduct(url) {
    // Redirect to main page with URL pre-filled
    const encodedUrl = encodeURIComponent(url);
    window.location.href = `index.html?url=${encodedUrl}`;
}

/**
 * Delete a specific history item
 */
function deleteHistoryItem(itemId) {
    if (!confirm('Are you sure you want to delete this analysis?')) {
        return;
    }
    
    let analysisHistory = JSON.parse(localStorage.getItem('analysisHistory') || '[]');
    analysisHistory = analysisHistory.filter(item => item.id !== itemId);
    
    localStorage.setItem('analysisHistory', JSON.stringify(analysisHistory));
    loadAnalysisHistory();
    
    showNotification('Analysis deleted successfully', 'success');
}

/**
 * Clear all history
 */
function clearHistory() {
    if (!confirm('Are you sure you want to clear all analysis history? This action cannot be undone.')) {
        return;
    }
    
    localStorage.removeItem('analysisHistory');
    loadAnalysisHistory();
    
    showNotification('History cleared successfully', 'success');
}

/**
 * Export history to JSON
 */
function exportHistory() {
    const analysisHistory = JSON.parse(localStorage.getItem('analysisHistory') || '[]');
    
    if (analysisHistory.length === 0) {
        alert('No history to export');
        return;
    }
    
    const dataStr = JSON.stringify(analysisHistory, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `analysis-history-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showNotification('History exported successfully', 'success');
}

/**
 * Import history from JSON file
 */
function importHistory() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedHistory = JSON.parse(e.target.result);
                
                if (!Array.isArray(importedHistory)) {
                    throw new Error('Invalid file format');
                }
                
                // Merge with existing history
                const existingHistory = JSON.parse(localStorage.getItem('analysisHistory') || '[]');
                const mergedHistory = [...importedHistory, ...existingHistory];
                
                // Remove duplicates based on URL and date
                const uniqueHistory = mergedHistory.filter((item, index, self) => 
                    index === self.findIndex(h => h.url === item.url && h.date === item.date)
                );
                
                localStorage.setItem('analysisHistory', JSON.stringify(uniqueHistory));
                loadAnalysisHistory();
                
                showNotification(`Imported ${importedHistory.length} analyses successfully`, 'success');
            } catch (error) {
                alert('Error importing file: ' + error.message);
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

/**
 * Show notification message
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

/**
 * Truncate text to specified length
 */
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Get history statistics
 */
function getHistoryStats() {
    const analysisHistory = JSON.parse(localStorage.getItem('analysisHistory') || '[]');
    
    if (analysisHistory.length === 0) {
        return {
            total: 0,
            trusted: 0,
            suspicious: 0,
            dangerous: 0,
            avgTrustScore: 0,
            avgFakePercentage: 0
        };
    }
    
    const trusted = analysisHistory.filter(item => item.trustScore >= 7).length;
    const suspicious = analysisHistory.filter(item => item.trustScore >= 4 && item.trustScore < 7).length;
    const dangerous = analysisHistory.filter(item => item.trustScore < 4).length;
    
    const avgTrustScore = analysisHistory.reduce((sum, item) => sum + item.trustScore, 0) / analysisHistory.length;
    const avgFakePercentage = analysisHistory.reduce((sum, item) => sum + item.fakePercentage, 0) / analysisHistory.length;
    
    return {
        total: analysisHistory.length,
        trusted,
        suspicious,
        dangerous,
        avgTrustScore: Math.round(avgTrustScore * 10) / 10,
        avgFakePercentage: Math.round(avgFakePercentage * 10) / 10
    };
}

/**
 * Display history statistics
 */
function displayHistoryStats() {
    const stats = getHistoryStats();
    const statsContainer = document.getElementById('historyStats');
    
    if (!statsContainer) return;
    
    statsContainer.innerHTML = `
        <div class="card">
            <h3 style="color: #1f2937; font-weight: 700; margin-bottom: 1.5rem;">Analysis Statistics</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;">
                <div class="stat-item" style="text-align: center; padding: 1.5rem; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 12px; border: 1px solid #93c5fd; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);">
                    <div style="font-size: 2.5rem; font-weight: 900; color: #1e40af; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">${stats.total}</div>
                    <div style="color: #1f2937; font-weight: 600; font-size: 0.95rem;">Total Analyses</div>
                </div>
                <div class="stat-item" style="text-align: center; padding: 1.5rem; background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border-radius: 12px; border: 1px solid #86efac; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.1);">
                    <div style="font-size: 2.5rem; font-weight: 900; color: #047857; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">${stats.trusted}</div>
                    <div style="color: #1f2937; font-weight: 600; font-size: 0.95rem;">Trusted Products</div>
                </div>
                <div class="stat-item" style="text-align: center; padding: 1.5rem; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; border: 1px solid #fcd34d; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.1);">
                    <div style="font-size: 2.5rem; font-weight: 900; color: #b45309; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">${stats.suspicious}</div>
                    <div style="color: #1f2937; font-weight: 600; font-size: 0.95rem;">Suspicious Products</div>
                </div>
                <div class="stat-item" style="text-align: center; padding: 1.5rem; background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%); border-radius: 12px; border: 1px solid #f87171; box-shadow: 0 2px 8px rgba(239, 68, 68, 0.1);">
                    <div style="font-size: 2.5rem; font-weight: 900; color: #b91c1c; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">${stats.dangerous}</div>
                    <div style="color: #1f2937; font-weight: 600; font-size: 0.95rem;">Dangerous Products</div>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
                <div style="text-align: center; padding: 1.5rem; background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%); border-radius: 12px; border: 1px solid #a5b4fc; box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);">
                    <div style="font-size: 2rem; font-weight: 900; color: #4338ca; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">${stats.avgTrustScore}/10</div>
                    <div style="color: #1f2937; font-weight: 600; font-size: 0.95rem;">Average Trust Score</div>
                </div>
                <div style="text-align: center; padding: 1.5rem; background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%); border-radius: 12px; border: 1px solid #f87171; box-shadow: 0 2px 8px rgba(239, 68, 68, 0.1);">
                    <div style="font-size: 2rem; font-weight: 900; color: #b91c1c; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">${stats.avgFakePercentage}%</div>
                    <div style="color: #1f2937; font-weight: 600; font-size: 0.95rem;">Average Fake Reviews</div>
                </div>
            </div>
        </div>
    `;
}

// Initialize stats display if container exists
document.addEventListener('DOMContentLoaded', function() {
    displayHistoryStats();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .status-badge.score-high { background: #10b981; color: white; }
    .status-badge.score-medium { background: #f59e0b; color: white; }
    .status-badge.score-low { background: #ef4444; color: white; }
    .status-badge.safe { background: #10b981; color: white; }
    .status-badge.warning { background: #f59e0b; color: white; }
    .status-badge.danger { background: #ef4444; color: white; }
`;
document.head.appendChild(style);