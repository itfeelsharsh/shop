/**
 * fixMotion.js
 * 
 * This script fixes Framer Motion usage within LazyMotion components.
 * It replaces `import { motion } from 'framer-motion'` with `import { m } from 'framer-motion'`
 * and changes all motion component references (motion.div, motion.button, etc.) to m.* format.
 * 
 * Run with: node fixMotion.js
 */

const fs = require('fs');
const path = require('path');

// Files to process - exclude shopAdmin directory
const filesToProcess = [
  'src/components/Footer.jsx',
  'src/components/Input.jsx',
  'src/components/Toast.jsx',
  'src/components/Button.jsx',
  'src/components/Loading.jsx',
  'src/components/OrderConfirmation.jsx',
  'src/components/LoadingBar.jsx',
  'src/components/ProductCard.jsx',
  'src/components/LoadingScreen.jsx',
  'src/pages/Profile.jsx',
  'src/pages/ContactUs.jsx',
  'src/pages/SignUp.jsx',
  'src/pages/SignIn.jsx',
  'src/pages/Products.jsx',
  'src/pages/Checkout/UnifiedCheckout.jsx',
  'src/pages/AboutUs.jsx',
  'src/pages/PrivacyPolicy.jsx',
  'src/pages/Wishlist.jsx',
  'src/pages/PasswordReset.jsx',
  'src/pages/TermsOfService.jsx',
];

/**
 * Process a single file to replace motion with m
 * @param {string} filePath - Path to the file to process
 */
function processFile(filePath) {
  try {
    // Read file
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Replace import statement
    let newContent = content.replace(
      /import\s+{\s*motion(\s*,\s*[^}]*)?\s*}\s*from\s+['"]framer-motion['"];?/g,
      (match) => {
        // If it already includes AnimatePresence or other imports, keep them
        if (match.includes(',')) {
          return match.replace('motion', 'm');
        }
        return 'import { m } from "framer-motion";';
      }
    );

    // Replace all motion.element references with m.element
    newContent = newContent.replace(/<motion\./g, '<m.');
    newContent = newContent.replace(/<\/motion\./g, '</m.');
    
    // Write back to file
    fs.writeFileSync(filePath, newContent, 'utf8');
    
    console.log(`✅ Fixed: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
  }
}

// Process all files
console.log('🔄 Starting to fix motion components...');
filesToProcess.forEach(processFile);
console.log('✅ Completed fixing motion components!'); 