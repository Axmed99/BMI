document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('bmi-form');
    const unitToggle = document.getElementsByName('unit');
    const weightInput = document.getElementById('weight');
    const heightInput = document.getElementById('height');
    const weightUnit = weightInput.nextElementSibling;
    const heightUnit = heightInput.nextElementSibling;

    // Add input validation listeners
    [weightInput, heightInput].forEach(input => {
        input.addEventListener('input', function() {
            const unit = document.querySelector('input[name="unit"]:checked').value;
            validateInput(this, unit);
        });
    });

    // Listen for unit toggle changes
    unitToggle.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'imperial') {
                weightUnit.textContent = 'lbs';
                heightUnit.textContent = 'in';
                weightInput.placeholder = '150';
                heightInput.placeholder = '70';
            } else {
                weightUnit.textContent = 'kg';
                heightUnit.textContent = 'm';
                weightInput.placeholder = '70';
                heightInput.placeholder = '1.75';
            }
            // Clear inputs when switching units
            weightInput.value = '';
            heightInput.value = '';
            hideResult();
        });
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const weight = parseFloat(weightInput.value);
        const height = parseFloat(heightInput.value);
        const unit = document.querySelector('input[name="unit"]:checked').value;
        
        if (!validateInput(weightInput, unit) || !validateInput(heightInput, unit)) {
            return;
        }
        
        const bmi = calculateBMI(weight, height, unit);
        const category = getBMICategory(bmi);
        const description = getBMIDescription(category, bmi);
        
        displayResult(bmi, category, description);
    });

    // Add click handlers for the category buttons
    const categoryButtons = document.querySelectorAll('.category-button');
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const range = this.dataset.range;
            // Scroll the range into view in the description
            const description = document.querySelector('.bmi-description');
            if (description) {
                description.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    });

    // Add ARIA roles and labels to buttons
    categoryButtons.forEach(button => {
        // Add ARIA attributes
        button.setAttribute('role', 'button');
        button.setAttribute('aria-pressed', 'false');
        
        button.addEventListener('click', function() {
            // Update ARIA states
            categoryButtons.forEach(btn => btn.setAttribute('aria-pressed', 'false'));
            this.setAttribute('aria-pressed', 'true');
            
            // Handle button click
            const range = this.dataset.range;
            const category = this.querySelector('.category-title').textContent;
            
            // Update UI
            updateCategoryButtons(category);
        });
        
        // Add keyboard support
        button.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
});

function hideResult() {
    const resultDiv = document.getElementById('result');
    resultDiv.classList.add('hidden');
}

function calculateBMI(weight, height, unit) {
    let bmi;
    if (unit === 'metric') {
        bmi = weight / (height * height);
    } else {
        bmi = (weight * 703) / (height * height);
    }
    return parseFloat(bmi.toFixed(1));
}

function getBMICategory(bmi) {
    if (isNaN(bmi)) return 'Invalid';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
}

function getBMIDescription(category, bmi) {
    const descriptions = {
        'Invalid': 'Please enter valid weight and height values.',
        'Underweight': `Your BMI is ${bmi}, which falls in the underweight range. To achieve a healthier weight:
            • Schedule a consultation with a healthcare provider or registered dietitian
            • Focus on nutrient-rich foods to support healthy weight gain
            • Consider strength training to build muscle mass
            • Track your progress with regular check-ups`,
        
        'Normal weight': `Great job! Your BMI of ${bmi} is in the healthy range. To maintain your healthy weight:
            • Continue your balanced eating habits
            • Stay active with regular exercise (aim for 150+ minutes weekly)
            • Get regular health screenings
            • Keep up the good work!`,
        
        'Overweight': `Your BMI is ${bmi}, indicating an overweight status. Here are some healthy steps to consider:
            • Make gradual changes to your diet, focusing on whole foods
            • Start with 30 minutes of moderate activity most days
            • Set realistic, achievable weight goals
            • Consider working with a healthcare provider for guidance`,
        
        'Obese': `Your BMI of ${bmi} indicates obesity. Here's what you can do:
            • Consult with your healthcare provider for a thorough evaluation
            • Develop a personalized weight management plan
            • Start with small, sustainable lifestyle changes
            • Seek support from health professionals and loved ones`
    };
    return descriptions[category];
}

function displayResult(bmi, category, description) {
    const resultDiv = document.getElementById('result');
    const bmiValueDiv = resultDiv.querySelector('.bmi-value');
    const bmiCategoryDiv = resultDiv.querySelector('.bmi-category');
    const bmiDescriptionDiv = resultDiv.querySelector('.bmi-description');
    
    // Update result values with more detailed formatting
    bmiValueDiv.innerHTML = `<span>${bmi}</span><small>kg/m²</small>`;
    bmiCategoryDiv.textContent = category;
    
    // Convert bullet points to HTML list
    const formattedDescription = description.replace(/•/g, '').split('\n')
        .map(line => line.trim())
        .filter(line => line)
        .map(line => `<li>${line}</li>`)
        .join('');
    
    bmiDescriptionDiv.innerHTML = `
        <p>${description.split('\n')[0]}</p>
        <ul class="advice-list">
            ${formattedDescription}
        </ul>
    `;
    
    // Show result section with animation
    resultDiv.classList.remove('hidden');
    resultDiv.style.opacity = '0';
    requestAnimationFrame(() => {
        resultDiv.style.opacity = '1';
        resultDiv.style.transform = 'translateY(0)';
    });
    
    // Highlight corresponding scale marker
    updateScaleMarkers(category);
    
    // Smooth scroll to results
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Update category buttons
    updateCategoryButtons(category);
}

function updateScaleMarkers(activeCategory) {
    const scaleMarkers = document.querySelectorAll('.scale-marker');
    scaleMarkers.forEach(marker => {
        const isActive = marker.classList.contains(activeCategory.toLowerCase().replace(' ', ''));
        marker.style.opacity = isActive ? '1' : '0.5';
        marker.style.transform = isActive ? 'scale(1.05)' : 'scale(1)';
        marker.style.boxShadow = isActive ? '0 2px 8px rgba(0,0,0,0.15)' : 'none';
    });
}

function updateCategoryButtons(category) {
    const buttons = document.querySelectorAll('.category-button');
    buttons.forEach(button => {
        const buttonCategory = button.classList[1]; // Gets 'underweight', 'normal', etc.
        
        // Remove previous active states
        button.classList.remove('active');
        button.style.transform = '';
        
        if (buttonCategory === category.toLowerCase().replace(' ', '')) {
            // Add active state with animation
            button.classList.add('active');
            
            // Smooth scroll to the active button
            button.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest',
                inline: 'nearest'
            });
        }
    });
}

// Add input validation
function validateInput(input, unit) {
    const value = parseFloat(input.value);
    let isValid = true;
    let message = '';

    if (unit === 'metric') {
        if (input.id === 'weight' && (value < 20 || value > 300)) {
            isValid = false;
            message = 'Please enter a weight between 20 and 300 kg';
        }
        if (input.id === 'height' && (value < 0.5 || value > 2.5)) {
            isValid = false;
            message = 'Please enter a height between 0.5 and 2.5 meters';
        }
    } else {
        if (input.id === 'weight' && (value < 44 || value > 660)) {
            isValid = false;
            message = 'Please enter a weight between 44 and 660 lbs';
        }
        if (input.id === 'height' && (value < 20 || value > 98)) {
            isValid = false;
            message = 'Please enter a height between 20 and 98 inches';
        }
    }

    input.setCustomValidity(message);
    return isValid;
} 