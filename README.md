# 🔍 Product Trust Analyzer

[![Netlify Status](https://api.netlify.com/api/v1/badges/your-badge-id/deploy-status)](https://app.netlify.com/sites/your-site-name/deploys)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)

> **Live Demo**: [https://product-trust-analyzer.netlify.app](https://product-trust-analyzer.netlify.app)

A modern web application that analyzes product reviews from Amazon and Flipkart to detect fake reviews and provide trust ratings. Built with vanilla JavaScript for optimal performance and deployed on Netlify for global accessibility.

## ✨ Features

### 🎯 Core Functionality
- **Fake Review Detection**: Advanced pattern recognition algorithms
- **Trust Rating System**: Intelligent scoring from 1-10 based on review authenticity
- **Multi-Platform Support**: Amazon (.com, .in, .co.uk, etc.) and Flipkart
- **Real-time Analysis**: Instant URL validation and processing
- **Visual Analytics**: Interactive charts and rating distributions

### 🎨 User Experience
- **Responsive Design**: Works perfectly on all devices
- **Theme Switching**: Purple, Blue, Green, and Dark themes
- **Glassmorphism UI**: Modern design with backdrop blur effects
- **Progressive Enhancement**: Works without JavaScript (basic functionality)
- **Accessibility**: WCAG 2.1 compliant with keyboard navigation

### 🔧 Technical Features
- **Client-Side Processing**: No server dependencies
- **Local Storage**: Persistent history and preferences
- **Performance Optimized**: Lazy loading and efficient algorithms
- **SEO Friendly**: Semantic HTML and meta tags
- **PWA Ready**: Service worker and offline capabilities

## 🚀 Quick Start

### Option 1: View Live Demo
Visit [https://product-trust-analyzer.netlify.app](https://product-trust-analyzer.netlify.app)

### Option 2: Run Locally
```bash
# Clone the repository
git clone https://github.com/yourusername/product-trust-analyzer.git

# Navigate to static version
cd product-trust-analyzer/static-version

# Open with a local server (choose one):

# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP (if available)
php -S localhost:8000

# Then open: http://localhost:8000
```

### Option 3: Deploy to Netlify
1. Fork this repository
2. Connect your GitHub account to Netlify
3. Deploy the `static-version` folder
4. Your site will be live in minutes!

## 📖 How to Use

1. **Enter Product URL**: Paste an Amazon or Flipkart product URL
2. **Click Analyze**: The system will process the URL and generate demo data
3. **View Results**: See trust score, fake review percentage, and recommendations
4. **Check History**: View your previous analyses in the history section

### Supported URL Formats
```
Amazon:
- https://amazon.com/dp/PRODUCT_ID
- https://amazon.in/gp/product/PRODUCT_ID
- https://amazon.co.uk/dp/PRODUCT_ID

Flipkart:
- https://flipkart.com/product-name/p/PRODUCT_ID
```

## 🏗️ Project Structure

```
static-version/
├── index.html              # Main application page
├── history.html            # Analysis history page
├── about.html             # About page
├── css/
│   └── style.css          # Main stylesheet with themes
├── js/
│   ├── main.js            # Core application logic
│   └── history.js         # History management
├── data/
│   └── demo-products.json # Sample product data
├── manifest.json          # PWA manifest
├── sw.js                  # Service worker
├── netlify.toml           # Netlify configuration
├── _redirects            # Netlify redirects
├── package.json          # Project metadata
├── LICENSE               # MIT license
└── README.md             # This file
```

## 🔬 Algorithm Overview

### Fake Review Detection
The system uses multiple detection methods:

1. **Text Pattern Analysis**
   - Duplicate content detection
   - Generic phrase identification
   - Excessive superlatives

2. **Rating Distribution Analysis**
   - Unusual 5-star spikes
   - Missing middle ratings
   - Statistical anomalies

3. **Temporal Pattern Analysis**
   - Review clustering detection
   - Suspicious timing patterns

4. **Sentiment Analysis**
   - Rating-sentiment mismatch
   - Language pattern inconsistencies

### Trust Score Calculation
```javascript
Trust Score = Base Score - (Fake Percentage × Weight Factor)
Base Score = Average of genuine reviews (converted to 1-10 scale)
Weight Factor = 0.1 (reduces score by 1 point per 10% fake reviews)
Minimum Score = 1.0
```

## 🎨 Themes

The application includes four beautiful themes:

- **Purple Theme** (Default): Modern gradient with purple accents
- **Blue Theme**: Professional blue color scheme
- **Green Theme**: Nature-inspired green palette
- **Dark Theme**: High contrast dark mode

Themes are automatically saved to localStorage and persist across sessions.

## 📱 Progressive Web App

This application is PWA-ready with:
- **Offline Support**: Works without internet connection
- **Install Prompt**: Add to home screen on mobile devices
- **Fast Loading**: Service worker caching for optimal performance
- **Responsive**: Adapts to any screen size

## 🚀 Deployment

### Deploy to Netlify (Recommended)

1. **Fork this repository**
2. **Connect to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Choose GitHub and select your fork
   - Set publish directory to `static-version`
   - Deploy settings are automatically configured

3. **Custom Domain** (Optional):
   - Go to Site settings > Domain management
   - Add your custom domain

### Deploy to GitHub Pages

1. **Enable GitHub Pages**:
   - Go to repository Settings
   - Scroll to Pages section
   - Select source: Deploy from a branch
   - Choose main branch / static-version folder

2. **Access your site**:
   - `https://yourusername.github.io/product-trust-analyzer`

## 🧪 Testing

### Manual Testing
1. **Test all features** in different browsers
2. **Check responsive design** on various screen sizes
3. **Verify accessibility** with screen readers
4. **Test offline functionality**
5. **Validate with different URLs**

### Browser Support
- **Chrome** 80+
- **Firefox** 75+
- **Safari** 13+
- **Edge** 80+

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Contribution Steps
1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes in the `static-version` folder
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Design Inspiration**: Modern glassmorphism and gradient trends
- **Icons**: Custom SVG icons for optimal performance
- **Algorithms**: Based on academic research in fake review detection
- **Community**: Thanks to all contributors and users

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/product-trust-analyzer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/product-trust-analyzer/discussions)
- **Email**: support@yourproject.com

## 🔮 Roadmap

- [ ] Machine learning integration for better detection
- [ ] Browser extension for one-click analysis
- [ ] API for third-party integrations
- [ ] Mobile app development
- [ ] Multi-language support

---

**⚠️ Educational Notice**: This is a demonstration application that uses simulated data for educational purposes. Results should not be used for actual purchase decisions.

**Made with ❤️ by [Your Name](https://github.com/yourusername)**