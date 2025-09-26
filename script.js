document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    const appState = {
        currentView: 'grid',
        currentCardIndex: 0,
        cardAnimation: '',
        attendance: {},
    };
    students.forEach(student => { appState.attendance[student.roll] = 'absent'; });

    // --- DOM ELEMENTS ---
    const elements = {
        sessionControls: document.getElementById('session-controls'), // Control for disabling the form
        sessionDisplay: document.getElementById('session-display'),
        sessionDate: document.getElementById('session-date'),
        sessionClass: document.getElementById('session-class'),
        sessionSubject: document.getElementById('session-subject'),
        sessionHours: document.querySelectorAll('input[name="session-hour"]'),
        viewButtons: {
            table: document.getElementById('table-view-btn'),
            card: document.getElementById('card-view-btn'),
            grid: document.getElementById('grid-view-btn'),
        },
        containers: {
            table: document.getElementById('table-container'),
            card: document.getElementById('card-container'),
            grid: document.getElementById('grid-container'),
        },
        bodies: {
            table: document.getElementById('table-body'),
            card: document.getElementById('card-container'),
            grid: document.getElementById('grid-container'),
        },
        markAllBtn: document.getElementById('mark-all-btn'),
        showPopupBtn: document.getElementById('show-popup-btn'),
        summaryDiv: document.getElementById('summary'),
        modal: document.getElementById('attendance-modal'),
        modalTitle: document.getElementById('modal-title'),
        modalCloseBtn: document.querySelector('.modal-close-btn'),
        presentListTextArea: document.getElementById('present-list'),
        absentListTextArea: document.getElementById('absent-list'),
        copyButtons: document.querySelectorAll('.copy-btn'),
    };

    // --- NEW: TIME-BASED LOGIC ---
    /**
     * Enables or disables the session controls fieldset.
     * @param {boolean} enable - True to enable, false to disable.
     * @param {string} message - The message to display in the subject placeholder.
     */
    const toggleSessionControls = (enable, message = 'Select Subject') => {
        elements.sessionControls.disabled = !enable;
        const placeholder = elements.sessionSubject.querySelector('option[disabled]');
        if (placeholder) {
            placeholder.textContent = message;
        }
    };

    /**
     * Reads the timetable and automatically selects the current class if one is in session.
     */
    const autoSelectCurrentClass = () => {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        const todayPeriods = timetable[dayOfWeek];
        if (!todayPeriods) return;

        // Reset form before selecting
        elements.sessionSubject.value = "";
        elements.sessionHours.forEach(cb => cb.checked = false);

        for (const period of todayPeriods) {
            if (currentTime >= period.start && currentTime < period.end) {
                elements.sessionSubject.value = period.subject;
                if (period.hour) {
                    const cb = document.querySelector(`input[name="session-hour"][value="${period.hour}"]`);
                    if (cb) cb.checked = true;
                } else if (period.hours) {
                    period.hours.forEach(h => {
                        const cb = document.querySelector(`input[name="session-hour"][value="${h}"]`);
                        if (cb) cb.checked = true;
                    });
                }
                break;
            }
        }
    };

    // --- RENDER FUNCTIONS ---
    const render = () => {
        Object.values(elements.viewButtons).forEach(b => b.classList.remove('active'));
        elements.viewButtons[appState.currentView].classList.add('active');
        Object.values(elements.containers).forEach(c => c.classList.add('hidden'));
        const activeContainer = elements.containers[appState.currentView];
        activeContainer.classList.remove('hidden');
        if (appState.currentView === 'card') {
            renderCardView();
        } else {
            renderListBasedView(appState.currentView);
        }
        updateMarkAllButtonState();
        updateSummary();
    };
    
    const renderCardView = () => {
        const container = elements.containers.card;
        container.innerHTML = '';
        const student = students[appState.currentCardIndex];
        if (!student) return;
        const currentStatus = appState.attendance[student.roll];
        const card = document.createElement('div');
        card.className = 'interactive-student-card';
        if (appState.cardAnimation) card.classList.add(appState.cardAnimation);
        if (currentStatus === 'present') card.classList.add('present');
        const buttonText = currentStatus === 'present' ? 'Present' : 'Absent';
        const buttonClass = currentStatus === 'present' ? 'present-btn' : 'absent-btn';
        const newStatusOnClick = currentStatus === 'present' ? 'absent' : 'present';
        card.innerHTML = `<div class="info"><div class="name">${student.name}</div><div class="roll">${student.roll}</div></div><div class="actions"><button class="card-action-btn ${buttonClass}" data-status="${newStatusOnClick}">${buttonText}</button></div>`;
        const nav = document.createElement('div');
        nav.className = 'card-nav';
        nav.innerHTML = `<button id="prev-student-btn">&larr; Previous</button><span id="card-progress">${appState.currentCardIndex + 1} / ${students.length}</span><button id="next-student-btn">Next &rarr;</button>`;
        container.appendChild(card);
        container.appendChild(nav);
        container.querySelector('#prev-student-btn').addEventListener('click', goToPrevCard);
        container.querySelector('#next-student-btn').addEventListener('click', goToNextCard);
        container.querySelector('.actions').addEventListener('click', handleCardAction);
        appState.cardAnimation = '';
    };
    
    const renderListBasedView = (view) => {
        const body = elements.bodies[view];
        body.innerHTML = '';
        const builder = view === 'table' ? createTableRow : createGridItem;
        students.forEach(student => {
            const element = builder(student);
            if (appState.attendance[student.roll] === 'present') element.classList.add('present');
            body.appendChild(element);
        });
    };

    // --- ELEMENT BUILDERS ---
    const createTableRow = (student) => {
        const row = document.createElement('tr');
        row.dataset.roll = student.roll;
        row.innerHTML = `<td data-label="S.No.">${student.sno}</td><td data-label="Name">${student.name}</td><td data-label="Roll Number">${student.roll}</td><td data-label="Mark Present"><input type="checkbox" class="attendance-checkbox"></td>`;
        row.querySelector('.attendance-checkbox').checked = appState.attendance[student.roll] === 'present';
        return row;
    };
    
    const createGridItem = (student) => {
        const item = document.createElement('div');
        item.className = 'grid-item';
        item.dataset.roll = student.roll;
        if (student.roll.startsWith('24215A12')) {
            item.textContent = `LE ${student.roll.slice(-2)}`;
        } else {
            item.textContent = student.roll.slice(-2);
        }
        return item;
    };

    // --- SESSION, MODAL, AND SUMMARY LOGIC ---
    const updateSummary = () => {
        const presentCount = Object.values(appState.attendance).filter(s => s === 'present').length;
        elements.summaryDiv.innerHTML = `<strong>Present:</strong> ${presentCount} | <strong>Absent:</strong> ${students.length - presentCount}`;
    };
    
    const updateSessionDisplay = () => {
        const dateVal = elements.sessionDate.value;
        const [year, month, day] = dateVal.split('-');
        const formattedDate = (day && month && year) ? `${day}-${month}-${year}` : "";
        const selectedHours = Array.from(elements.sessionHours).filter(cb => cb.checked).map(cb => cb.value).join(',');
        const classVal = elements.sessionClass.value;
        const subjectVal = elements.sessionSubject.value;
        let displayString = `${formattedDate} ${classVal} ${subjectVal || ''}`;
        if (selectedHours) displayString += ` Hrs: ${selectedHours}`;
        elements.sessionDisplay.textContent = displayString;
    };

    const formatRollNumbersForDisplay = (studentList) => {
        const regularStudents = studentList.filter(s => s.roll.startsWith('23211A12')).map(s => s.roll.slice(-2));
        const lateralEntryStudents = studentList.filter(s => s.roll.startsWith('24215A12')).map(s => s.roll.slice(-2));
        let outputParts = [];
        if (regularStudents.length > 0) outputParts.push(regularStudents.join(', '));
        if (lateralEntryStudents.length > 0) outputParts.push(`\nLE- ${lateralEntryStudents.join(', ')}`);
        return outputParts.join('');
    };

    const handleShowPopup = () => {
        const sessionInfo = elements.sessionDisplay.textContent;
        elements.modalTitle.textContent = `Attendance Summary`;
        const presentStudents = students.filter(s => appState.attendance[s.roll] === 'present');
        const absentStudents = students.filter(s => appState.attendance[s.roll] === 'absent');
        const presentRolls = formatRollNumbersForDisplay(presentStudents);
        const absentRolls = formatRollNumbersForDisplay(absentStudents);
        elements.presentListTextArea.value = `${sessionInfo}\nPresent:\n${presentRolls || 'None'}`;
        elements.absentListTextArea.value = `${sessionInfo}\nAbsent:\n${absentRolls || 'None'}`;
        elements.modal.classList.remove('hidden');
    };
    
    const closeModal = () => { elements.modal.classList.add('hidden'); };

    const handleCopy = (e) => {
        const targetId = e.target.dataset.target;
        const textToCopy = document.getElementById(targetId).value;
        if (textToCopy) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalText = e.target.innerHTML;
                e.target.innerHTML = '✅';
                setTimeout(() => { e.target.innerHTML = originalText; }, 2000);
            }).catch(err => { console.error('Failed to copy: ', err); alert('Failed to copy to clipboard.'); });
        }
    };

    // --- EVENT LISTENERS ---
    elements.showPopupBtn.addEventListener('click', handleShowPopup);
    elements.modalCloseBtn.addEventListener('click', closeModal);
    elements.modal.addEventListener('click', (e) => { if (e.target === elements.modal) closeModal(); });
    elements.copyButtons.forEach(btn => btn.addEventListener('click', handleCopy));
    
    // Listen for changes on the entire fieldset
    elements.sessionControls.addEventListener('change', (e) => {
        if (e.target.matches('input[name="session-hour"]')) {
             const checkedCount = Array.from(elements.sessionHours).filter(cb => cb.checked).length;
             if (checkedCount > 3) {
                alert('You can select a maximum of 3 hours.');
                e.target.checked = false;
             }
        }
        updateSessionDisplay();
    });
    
    const goToNextCard = () => {
        appState.currentCardIndex = (appState.currentCardIndex + 1) % students.length;
        appState.cardAnimation = 'slide-in-from-right';
        render();
    };
    const goToPrevCard = () => {
        appState.currentCardIndex = (appState.currentCardIndex - 1 + students.length) % students.length;
        appState.cardAnimation = 'slide-in-from-left';
        render();
    };
    const handleCardAction = (e) => {
        if (e.target.matches('[data-status]')) {
            const newStatus = e.target.dataset.status;
            const currentRoll = students[appState.currentCardIndex].roll;
            appState.attendance[currentRoll] = newStatus;
            goToNextCard();
        }
    };
    let touchStartX = 0;
    elements.containers.card.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    elements.containers.card.addEventListener('touchend', e => {
        const touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 50) goToNextCard();
        else if (touchEndX - touchStartX > 50) goToPrevCard();
    });
    const updateMarkAllButtonState = () => { const isEveryonePresent = !Object.values(appState.attendance).some(status => status === 'absent'); elements.markAllBtn.textContent = isEveryonePresent ? 'Unmark All' : 'Mark All Present'; };
    const handleMarkAllToggle = () => { const isEveryonePresent = !Object.values(appState.attendance).some(status => status === 'absent'); const newStatus = isEveryonePresent ? 'absent' : 'present'; Object.keys(appState.attendance).forEach(roll => appState.attendance[roll] = newStatus); render(); };
    document.querySelector('.container').addEventListener('click', (e) => {
        if (appState.currentView === 'table') {
            const row = e.target.closest('tr[data-roll]');
            if (row) {
                const checkbox = row.querySelector('.attendance-checkbox');
                if (e.target !== checkbox) checkbox.checked = !checkbox.checked;
                appState.attendance[row.dataset.roll] = checkbox.checked ? 'present' : 'absent';
                render();
            }
        }
        if (appState.currentView === 'grid' && e.target.matches('.grid-item')) {
            const roll = e.target.dataset.roll;
            appState.attendance[roll] = appState.attendance[roll] === 'present' ? 'absent' : 'present';
            render();
        }
    });
    Object.keys(elements.viewButtons).forEach(view => {
        elements.viewButtons[view].addEventListener('click', () => {
            appState.currentView = view;
            render();
        });
    });
    elements.markAllBtn.addEventListener('click', handleMarkAllToggle);
    
    // --- UPDATED INITIALIZATION ---
    const init = () => {
        // Set date
        const today = new Date();
        elements.sessionDate.value = today.toISOString().split('T')[0];

        // Check if within college hours
        const now = new Date();
        const dayOfWeek = now.getDay();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        // College hours are Monday (1) to Saturday (6), from 09:20 to 15:50 (3:50 PM)
        const isCollegeHours = (dayOfWeek >= 1 && dayOfWeek <= 6) && (currentTime >= "09:20" && currentTime <= "15:50");

        if (isCollegeHours) {
            toggleSessionControls(true, 'Select Subject');
            autoSelectCurrentClass();
        } else {
            toggleSessionControls(false, 'College is closed');
        }

        updateSessionDisplay();
        render();
    };

    init();
});