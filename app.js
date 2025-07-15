// app.js
document.addEventListener('DOMContentLoaded', () => {
    // Get the functions from the global dinnerApp object
    const { getRecipes, getSides } = window.dinnerApp;

    const mainsContainer = document.getElementById('mains-container');
    const sidesContainer = document.getElementById('sides-container');
    const form = document.getElementById('dinner-form');
    const shuffleButton = document.getElementById('shuffle-button');
    const otherMainText = document.getElementById('other-main-text');
    const otherMainRadio = document.getElementById('other-main');
    const otherSideCheckbox = document.getElementById('other-side');
    const otherSideText = document.getElementById('other-side-text');

    function renderMenu() {
        renderMains();
        renderSides();
    }

    function renderMains() {
        const recipes = getRecipes();
        
        recipes.slice(0, 3).forEach((recipe, index) => {
            const mainId = `main-${recipe.id}`;
            const isChecked = index === 0 ? 'checked' : '';
            
            const mainOptionDiv = document.createElement('div');
            mainOptionDiv.classList.add('main-option');

            if (isChecked) {
                mainOptionDiv.classList.add('expanded');
            }
            
            let optionsHTML = '';
            if (recipe.options && recipe.options.length > 0) {
                mainOptionDiv.classList.add('has-options');

                const optionsList = recipe.options.map(option => {
                    const optionId = `option-${recipe.id}-${option.id}`;
                    let inputHTML = '';

                    switch (option.type) {
                        case 'number':
                            const defaultValue = option.default !== undefined ? option.default : 1;
                            inputHTML = `
                                <div class="number-input-container">
                                    <label for="${optionId}">${option.label}</label>
                                    <div class="number-input-wrapper">
                                        <button type="button" class="decrement-btn">-</button>
                                        <input type="number" id="${optionId}" name="${mainId}-option-${option.id}" value="${defaultValue}" min="1" class="number-input">
                                        <button type="button" class="increment-btn">+</button>
                                    </div>
                                </div>
                            `;
                            break;
                        case 'checkbox':
                        default: // Default to checkbox
                            const isChecked = option.default === true ? 'checked' : '';
                            inputHTML = `
                                <div>
                                    <input type="checkbox" id="${optionId}" name="${mainId}-option-${option.id}" value="true" ${isChecked}>
                                    <label for="${optionId}">${option.label}</label>
                                </div>
                            `;
                            break;
                    }
                    return `<div>${inputHTML}</div>`;
                }).join('');
                
                const isVisible = isChecked ? 'visible' : '';
                optionsHTML = `<div class="options-list ${isVisible}">${optionsList}</div>`;
            }

            mainOptionDiv.innerHTML = `
                <div>
                    <input type="radio" id="${mainId}" name="main-choice" value="${recipe.id}" ${isChecked}>
                    <label for="${mainId}">${recipe.name}</label>
                </div>
                ${optionsHTML}
            `;
            mainsContainer.appendChild(mainOptionDiv);
        });
    }

    function renderSides() {
        const sides = getSides();
        sides.forEach(side => {
            const sideId = `side-${side.id}`;
            const sideOptionDiv = document.createElement('div');
            sideOptionDiv.classList.add('side-option');
            sideOptionDiv.innerHTML = `
                <input type="checkbox" id="${sideId}" name="side-choices" value="${side.id}">
                <label for="${sideId}">${side.name}</label>
            `;
            sidesContainer.appendChild(sideOptionDiv);
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const selectedMainId = formData.get('main-choice');
        let finalChoice = {};

        if (selectedMainId === 'other') {
            finalChoice.main = formData.get('other-main-text') || 'Not specified';
            finalChoice.options = [];
        } else if (selectedMainId) {
            const recipe = getRecipes().find(r => r.id === selectedMainId);
            finalChoice.main = recipe.name;

            const selectedOptions = [];
            if (recipe.options) {
                recipe.options.forEach(option => {
                    const optionName = `main-${recipe.id}-option-${option.id}`;
                    const val = formData.get(optionName);

                    if (option.type === 'checkbox') {
                        selectedOptions.push(`${option.label}: ${!!val}`);
                    } else if (val) {
                        selectedOptions.push(`${option.label}: ${val}`);
                    }
                });
            }
            finalChoice.options = selectedOptions;
        } else {
            alert('Please select a main');
            return;
        }
        
        const regularSides = formData.getAll('side-choices')
            .map(sideId => getSides().find(s => s.id === sideId).name);
        
        const otherSideSelected = formData.get('other-side-checkbox');
        const otherSideValue = formData.get('other-side-text');

        let allSides = [...regularSides];
        if (otherSideSelected && otherSideValue) {
            allSides.push(otherSideValue);
        }

        finalChoice.sides = allSides;
        finalChoice.specialRequests = formData.get('special-requests') || '';

        const mainWithOptions = finalChoice.options.length > 0 
            ? `${finalChoice.main} (${finalChoice.options.join(', ')})`
            : finalChoice.main;

        const emailContent = `New dinner request!\n\nMain: ${mainWithOptions}\nSides: ${finalChoice.sides.join(', ') || 'None'}\nSpecial Requests: ${finalChoice.specialRequests || 'None'}`;

        fetch('https://www.unobstruct.io/api/misc/email-thomas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email_content: emailContent }),
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { 
                    throw new Error(`Request failed: ${response.status} ${response.statusText}. Body: ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            alert('Submitted!');
            location.reload();
        })
        .catch((error) => {
            console.error('Error:', error);
            alert(`An error occurred while submitting: ${error.message}`);
        });
    });

    /**
     * Manages the accordion-style display of main options.
     * @param {HTMLElement | null} elementToExpand The element to expand. If null, all are collapsed.
     */
    function setExpandedOption(elementToExpand) {
        document.querySelectorAll('.main-option.has-options').forEach(option => {
            const optionsList = option.querySelector('.options-list');
            if (optionsList) {
                if (option === elementToExpand) {
                    // Expand the selected option
                    option.classList.add('expanded'); // Keep for state tracking
                    optionsList.classList.add('visible');
                } else {
                    // Collapse all other options
                    option.classList.remove('expanded');
                    optionsList.classList.remove('visible');
                }
            }
        });
    }

    form.addEventListener('change', (e) => {
        if (e.target.name === 'main-choice') {
            const isOtherSelected = otherMainRadio.checked;
            otherMainText.disabled = !isOtherSelected;

            if (isOtherSelected) {
                otherMainText.focus();
                setExpandedOption(null);
            } else {
                const selectedMainElement = e.target.closest('.main-option');
                setExpandedOption(selectedMainElement);
            }
        }
        if (e.target.id === 'other-side') {
            otherSideText.disabled = !e.target.checked;
            if (e.target.checked) {
                otherSideText.focus();
            }
        }
    });

    mainsContainer.addEventListener('click', (e) => {
        const target = e.target;

        if (target.classList.contains('increment-btn')) {
            const input = target.previousElementSibling;
            input.stepUp();
            return;
        }
        if (target.classList.contains('decrement-btn')) {
            const input = target.nextElementSibling;
            input.stepDown();
            return;
        }

        const mainOption = target.closest('.main-option.has-options');
        
        if (!mainOption || mainOption.classList.contains('expanded')) {
            return;
        }

        const radio = mainOption.querySelector('input[type="radio"]');
        if (radio) {
            radio.checked = true;
            radio.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });

    renderMenu();
}); 