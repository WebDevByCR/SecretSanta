document.addEventListener('DOMContentLoaded', function () {
    const participantsBody = document.getElementById('participantsBody');

    document.getElementById('addParticipantButton').addEventListener('click', () => addParticipant(participantsBody));
    document.getElementById('secretSantaButton').addEventListener('click', assignSecretSantas);

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            addParticipant(participantsBody);
            event.preventDefault(); // Prevent form submission
        }
    });

    // Load participants from localStorage
    if(localStorage.length > 0){
        loadParticipants();
    }else{
        addParticipant(participantsBody);
    }
});

function addParticipant(participantsBody, name = '') {
    const row = document.createElement('tr');

    // Santa cell with input and remove icon
    const santaCell = document.createElement('td');
    const inputContainer = document.createElement('div');
    inputContainer.classList.add('input-container');

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter name';
    input.classList.add('participant-input');
    input.value = name;

    const removeIcon = document.createElement('span');
    removeIcon.innerHTML = '❌';
    removeIcon.classList.add('remove-icon');
    removeIcon.addEventListener('click', () => removeParticipant(row));

    inputContainer.appendChild(removeIcon);
    inputContainer.appendChild(input);
    santaCell.appendChild(inputContainer);

    // Recipient cell with drag-and-drop functionality
    const recipientCell = document.createElement('td');
    recipientCell.classList.add('receipient-cell');
    recipientCell.setAttribute('draggable', 'true');
    addDragAndDropHandlers(recipientCell);

    row.appendChild(santaCell);
    row.appendChild(recipientCell);
    participantsBody.appendChild(row);
    input.focus();
}

function removeParticipant(row) {
    document.getElementById('participantsBody').removeChild(row);
    saveParticipants();
}

function assignSecretSantas() {
    const inputs = document.querySelectorAll('.participant-input');
    const names = Array.from(inputs).map(input => input.value.trim());

    if (names.some(name => name === '')) {
        alert('All fields must be filled.');
        return;
    }

    if (new Set(names).size !== names.length) {
        alert('Names must be unique.');
        return;
    }

    const shuffledNames = shuffleArray([...names]);

    // Ensure no one gets themselves
    for (let i = 0; i < names.length; i++) {
        if (names[i] === shuffledNames[i]) {
            shuffledNames.push(shuffledNames.splice(i, 1)[0]);
            i = -1; // Reset the loop
        }
    }

    const rows = document.querySelectorAll('#participantsTable tbody tr');
    rows.forEach((row, index) => {
        const recipientCell = row.cells[1];
        recipientCell.innerHTML = ''; // Clear existing content
        recipientCell.innerText = shuffledNames[index];

        const img = document.createElement('img');
        img.src = "images/upDown.png";
        img.classList.add('cell-image');
        recipientCell.appendChild(img);
    });

    saveParticipants(names, shuffledNames);
}

function saveParticipants(names = [], recipients = []) {
    if (!names.length) {
        const inputs = document.querySelectorAll('.participant-input');
        names = Array.from(inputs).map(input => input.value.trim());
    }

    if (!recipients.length) {
        recipients = Array(names.length).fill('');
    }

    const participants = names.map((name, index) => ({ name, recipient: recipients[index] }));
    localStorage.setItem('participants', JSON.stringify(participants));
}

function loadParticipants() {
    const participantsBody = document.getElementById('participantsBody');
    const savedParticipants = JSON.parse(localStorage.getItem('participants') || '[]');

    savedParticipants.forEach(participant => {
        addParticipant(participantsBody, participant.name);
    });

    assignSecretSantas(); // Reassign saved data
}

function resetParticipants() {
    localStorage.removeItem('participants');
    const participantsBody = document.getElementById('participantsBody');
    participantsBody.innerHTML = ''; // Clear all rows
    addParticipant(participantsBody); // Add an empty row
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Drag-and-Drop Handlers
function addDragAndDropHandlers(cell) {
    cell.addEventListener('dragstart', (event) => {
        event.dataTransfer.setData('text/html', cell.outerHTML);
        cell.classList.add('dragging');
    });

    cell.addEventListener('dragover', (event) => {
        event.preventDefault();
        cell.classList.add('dragover');
    });

    cell.addEventListener('dragleave', () => {
        cell.classList.remove('dragover');
    });

    cell.addEventListener('drop', (event) => {
        event.preventDefault();

        const dropTarget = event.target.closest('.receipient-cell');
        const draggingCell = document.querySelector('.dragging');

        if (dropTarget && draggingCell && dropTarget !== draggingCell) {
            const draggedHTML = draggingCell.outerHTML;
            const targetHTML = dropTarget.outerHTML;

            draggingCell.outerHTML = targetHTML;
            dropTarget.outerHTML = draggedHTML;

            reattachEventListeners();
        }
    });

    cell.addEventListener('dragend', () => {
        cell.classList.remove('dragging');
    });

    // Touch Support
    cell.addEventListener('touchstart', (event) => {
        cell.classList.add('dragging');
    });

    cell.addEventListener('touchend', (event) => {
        const draggingCell = document.querySelector('.dragging');
        const touch = event.changedTouches[0];
        const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.receipient-cell');

        if (dropTarget && draggingCell && dropTarget !== draggingCell) {
            const draggedHTML = draggingCell.outerHTML;
            const targetHTML = dropTarget.outerHTML;

            draggingCell.outerHTML = targetHTML;
            dropTarget.outerHTML = draggedHTML;

            reattachEventListeners();
        }

        cell.classList.remove('dragging');
    });
}

function reattachEventListeners() {
    document.querySelectorAll('.receipient-cell').forEach(addDragAndDropHandlers);
}
