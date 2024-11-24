document.addEventListener('DOMContentLoaded', function () {
    var addParticipantButton = document.getElementById('addParticipantButton');
    var secretSantaButton = document.getElementById('secretSantaButton');
    const participantsBody = document.getElementById('participantsBody');

    addParticipantButton.addEventListener('click', () => addParticipant(participantsBody));
    secretSantaButton.addEventListener('click', assignSecretSantas);

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            addParticipant(participantsBody); 
            event.preventDefault(); // Prevent default form submission or other actions 
        }
    });

    // Load participants from localStorage
    if(localStorage.length !== 0){
        loadParticipants();
    }else{
        addParticipant(participantsBody);
    }
});

function addParticipant(participantsBody, name = '') {
    const row = document.createElement('tr');
    const santaCell = document.createElement('td');
    const recipientCell = document.createElement('td');
    const removeCell = document.createElement('td');
    const input = document.createElement('input');

    input.type = 'text';
    input.placeholder = 'Enter name';
    input.classList.add('participant-input');
    input.value = name; // Set the input value if provided

    const removeIcon = document.createElement('span');
    removeIcon.innerHTML = '❌'; // Unicode for a remove icon
    removeIcon.classList.add('remove-icon');
    removeIcon.addEventListener('click', () => removeParticipant(row));

    santaCell.appendChild(input);
    santaCell.appendChild(removeIcon);
    recipientCell.setAttribute('draggable', 'true');
    recipientCell.innerText = ''; // Placeholder for recipients
    recipientCell.classList.add('receipient-cell');
    addDragAndDropHandlers(recipientCell);

    row.appendChild(santaCell);
    row.appendChild(recipientCell);
    row.appendChild(removeCell);
    participantsBody.appendChild(row);
    input.focus();
}

function removeParticipant(row) {
    const participantsBody = document.getElementById('participantsBody');
    participantsBody.removeChild(row);
    saveParticipants(); // Save the updated list to localStorage
}

function assignSecretSantas() {
    const inputs = document.querySelectorAll('.participant-input');
    const names = Array.from(inputs).map(input => input.value.trim());
    
    if (names.some(name => name === '')) {
        alert('All fields must be filled.');
        return;
    }

    const uniqueNames = new Set(names);
    if (uniqueNames.size !== names.length) {
        alert('Names must be unique.');
        return;
    }

    const shuffledNames = shuffleArray([...names]);

    for (let i = 0; i < names.length; i++) {
        if (names[i] === shuffledNames[i]) {
            shuffledNames.push(shuffledNames.splice(i, 1)[0]);
            i = -1; // Reset the loop to check the entire array again
        }
    }

    const rows = document.querySelectorAll('#participantsTable tbody tr');
    for (let i = 0; i < names.length; i++) {
        rows[i].cells[1].innerText = shuffledNames[i];
        const img = document.createElement('img');
        img.src = "images/upDown.png";
        img.classList.add('cell-image');
        rows[i].cells[1].appendChild(img);
    }

    // Save the participants and recipients to localStorage
    saveParticipants(names, shuffledNames);
}

function saveParticipants(names = [], recipients = []) {
    if (names.length === 0) {
        const inputs = document.querySelectorAll('.participant-input');
        names = Array.from(inputs).map(input => input.value.trim());
    }
    if (recipients.length === 0) {
        recipients = Array(names.length).fill('');
    }
    const participants = names.map((name, index) => ({ name, recipient: recipients[index] }));
    localStorage.setItem('participants', JSON.stringify(participants));
}

function loadParticipants() {
    const participantsBody = document.getElementById('participantsBody');
    const savedParticipants = localStorage.getItem('participants');
    if (savedParticipants) {
        const participants = JSON.parse(savedParticipants);
        participants.forEach(participant => {
            addParticipant(participantsBody, participant.name);
        });
        assignSecretSantas(); // Assign recipients based on saved data
    }
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
        event.dataTransfer.setData('text/plain', event.target.innerText);
        event.target.classList.add('dragging');
    });

    cell.addEventListener('dragover', (event) => {
        event.preventDefault();
        event.target.classList.add('dragover');
    });

    cell.addEventListener('dragleave', (event) => {
        event.target.classList.remove('dragover');
    });

    cell.addEventListener('drop', (event) => {
        event.preventDefault();
        const draggedText = event.dataTransfer.getData('text/plain');
        const targetText = event.target.innerText;

        // Swap the text values of the dragged and target cells
        event.target.innerText = draggedText;

        const draggingCell = document.querySelector('.dragging');
        if (draggingCell) draggingCell.innerText = targetText;

        event.target.classList.remove('dragover');
    });

    cell.addEventListener('dragend', (event) => {
        event.target.classList.remove('dragging');
    });
}

function resetParticipants() {
    localStorage.removeItem('participants');
    const participantsBody = document.getElementById('participantsBody');
    participantsBody.innerHTML = ''; // Clear the table
    addParticipant(participantsBody);
}