document.addEventListener('DOMContentLoaded', function () {
    var addParticipantButton = document.getElementById('addParticipantButton');
    var secretSantaButton = document.getElementById('secretSantaButton');
    const participantsBody = document.getElementById('participantsBody');

    addParticipantButton.addEventListener('click', () => addParticipant(participantsBody));
    secretSantaButton.addEventListener('click', assignSecretSantas);

    // Add an initial row if the table is empty
    if (participantsBody.children.length === 0) {
        addParticipant(participantsBody);
    }

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            addParticipant(participantsBody); 
            event.preventDefault(); // Prevent default form submission or other actions 
        }
    });
});

function addParticipant(participantsBody) {
    const row = document.createElement('tr');
    const santaCell = document.createElement('td');
    const recipientCell = document.createElement('td');
    const input = document.createElement('input');

    input.type = 'text';
    input.placeholder = 'Enter name';
    input.classList.add('participant-input');

    santaCell.appendChild(input);
    recipientCell.setAttribute('draggable', 'true');
    recipientCell.innerText = ''; // Placeholder for recipients
    recipientCell.classList.add('receipient-cell')
    addDragAndDropHandlers(recipientCell);

    row.appendChild(santaCell);
    row.appendChild(recipientCell);
    participantsBody.appendChild(row);
    input.focus();
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
    const icon = Image
    for (let i = 0; i < names.length; i++) {
        rows[i].cells[1].innerText = shuffledNames[i];
        const img = document.createElement('img');
        img.src = "images/upDown.png";
        img.classList.add('cell-image');
        rows[i].cells[1].appendChild(img);
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
