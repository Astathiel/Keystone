document.addEventListener('DOMContentLoaded', () => {

    // --- STATE MANAGEMENT ---
    const state = {
        currentView: 'calendar',
        isSidebarOpen: true,
        calendar: {
            currentDate: new Date(),
            selectedDate: null, 
            events: [] 
        },
        todos: [],
        priorities: [],
        rememberItems: [],
        brainDumps: [],
        mood: {
            selected: null,
            saved: null
        }
    };

    const navigationItems = [
        { id: 'calendar', label: 'Calendar', icon: '🗓️' },
        { id: 'todos', label: 'To-Do List', icon: '✅' },
        { id: 'priorities', label: 'Top Priorities', icon: '🚩' },
        { id: 'remember', label: 'Remember List', icon: '⭐' },
        { id: 'braindump', label: 'Brain Dump', icon: '🧠' },
        { id: 'mood', label: 'Daily Mood', icon: '😊' },
    ];

    // --- DOM ELEMENT REFERENCES ---
    const sidebar = document.getElementById('sidebar');
    const sidebarToggleBtn = document.getElementById('sidebar-toggle');
    const mainTitle = document.getElementById('main-title');
    const contentArea = document.getElementById('content-area');
    const navList = document.getElementById('nav-list');
    const dateDisplay = document.getElementById('current-date');

    // --- RENDER FUNCTIONS ---
    const render = {
        sidebar: () => {
            navList.innerHTML = '';
            navigationItems.forEach(item => {
                const li = document.createElement('li');
                const button = document.createElement('button');
                button.className = 'nav-button';
                button.dataset.viewId = item.id;
                button.innerHTML = `<span>${item.icon}</span><span class="nav-label">${item.label}</span>`;
                button.addEventListener('click', () => selectView(item.id));
                li.appendChild(button);
                navList.appendChild(li);
            });
            updateSidebarState();
        },
        view: () => {
            const viewId = state.currentView;
            const currentNavItem = navigationItems.find(item => item.id === viewId);
            mainTitle.textContent = currentNavItem.label;

            contentArea.innerHTML = '';
            const template = document.getElementById(`template-${viewId}`);
            if (template) {
                const clone = template.content.cloneNode(true);
                contentArea.appendChild(clone);
                render[viewId] && render[viewId]();
                attachViewEventListeners(viewId);
            }
        },
        calendar: () => {
            const { currentDate, selectedDate, events } = state.calendar;
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            document.getElementById('month-year-label').textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
            
            const grid = document.getElementById('calendar-grid');
            grid.innerHTML = '';
            
            ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
                grid.innerHTML += `<div class="calendar-day-header">${day}</div>`;
            });
            
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            
            let dateIterator = new Date(year, month, 1);
            dateIterator.setDate(dateIterator.getDate() - dateIterator.getDay());

            for (let i = 0; i < 35; i++) { // Render 5 weeks for consistency
                const dayDiv = document.createElement('div');
                const dateString = toYYYYMMDD(dateIterator);
                dayDiv.className = 'calendar-day';
                dayDiv.textContent = dateIterator.getDate();
                dayDiv.dataset.date = dateString;

                if (dateIterator.getMonth() !== month) dayDiv.classList.add('not-current-month');
                if (dateIterator.toDateString() === new Date().toDateString()) dayDiv.classList.add('today');
                if (dateString === selectedDate) dayDiv.classList.add('selected');

                const dayHasEvents = events.some(e => e.date === dateString);
                if (dayHasEvents) {
                    dayDiv.innerHTML += '<div class="event-dot"></div>';
                }

                grid.appendChild(dayDiv);
                dateIterator.setDate(dateIterator.getDate() + 1);
            }
            render.calendarDetails();
        },
        calendarDetails: () => {
            const { selectedDate, events } = state.calendar;
            const detailsSection = document.getElementById('calendar-details-section');
            if (!selectedDate) {
                detailsSection.classList.add('hidden');
                return;
            }

            detailsSection.classList.remove('hidden');
            const header = document.getElementById('details-date-header');
            const list = document.getElementById('day-events-list');
            const dateObj = new Date(selectedDate.replace(/-/g, '/'));
            header.textContent = `Events for ${dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;

            const eventsForDay = events.filter(e => e.date === selectedDate);
            list.innerHTML = '';
            if (eventsForDay.length === 0) {
                list.innerHTML = '<p class="empty-state">No events for this day.</p>';
            } else {
                const eventTypeIcons = { birthday: '🎂', event: '🎉', note: '📌' };
                eventsForDay.forEach(event => {
                    const item = document.createElement('div');
                    item.className = 'day-event-item';
                    item.innerHTML = `
                        <div class="day-event-item-info">
                            <span class="event-type-icon">${eventTypeIcons[event.type]}</span>
                            <span>${event.title}</span>
                        </div>
                        <button class="delete-btn icon-button">🗑️</button>
                    `;
                    item.querySelector('.delete-btn').addEventListener('click', () => deleteCalendarEvent(event.id));
                    list.appendChild(item);
                });
            }
        },
        todos: () => {
            const list = document.getElementById('todo-list');
            list.innerHTML = state.todos.length === 0 ? '<p class="empty-state">No tasks yet. Add one above!</p>' : '';
            [...state.todos].sort((a,b) => b.id - a.id).forEach(todo => {
                const item = document.createElement('div');
                item.className = 'list-item';
                item.classList.toggle('completed', todo.completed);
                item.innerHTML = `
                    <input type="checkbox" class="item-checkbox" ${todo.completed ? 'checked' : ''}>
                    <span class="item-text">${todo.text}</span>
                    <button class="delete-btn icon-button">🗑️</button>
                `;
                item.querySelector('.item-checkbox').addEventListener('change', () => toggleTodo(todo.id));
                item.querySelector('.delete-btn').addEventListener('click', () => deleteTodo(todo.id));
                list.appendChild(item);
            });
            updateTodoCounter();
        },
        priorities: () => {
            const list = document.getElementById('priority-list');
            list.innerHTML = state.priorities.length === 0 ? '<div class="empty-state"><span class="icon">🚩</span><p>No priorities set. Add your most important tasks!</p></div>' : '';
            state.priorities.forEach((p, index) => {
                 const item = document.createElement('div');
                item.className = 'list-item';
                item.classList.toggle('completed', p.completed);
                item.innerHTML = `
                    <div class="priority-number">${index + 1}</div>
                    <input type="checkbox" class="item-checkbox" ${p.completed ? 'checked' : ''}>
                    <span class="item-text">${p.text}</span>
                    <button class="delete-btn icon-button">🗑️</button>
                `;
                item.querySelector('.item-checkbox').addEventListener('change', () => togglePriority(p.id));
                item.querySelector('.delete-btn').addEventListener('click', () => deletePriority(p.id));
                list.appendChild(item);
            });
            updatePriorityCounter();
        },
        remember: () => {
             const list = document.getElementById('remember-list');
            list.innerHTML = state.rememberItems.length === 0 ? '<p class="empty-state">No items to remember yet.</p>' : '';
            [...state.rememberItems].sort((a,b) => b.important - a.important || b.id - a.id).forEach(item => {
                const elem = document.createElement('div');
                elem.className = 'remember-item';
                elem.classList.toggle('important', item.important);
                elem.innerHTML = `
                    <div class="remember-item-header">
                        <span class="remember-item-title">${item.title}</span>
                        <div class="remember-item-actions">
                            <button class="icon-button important-btn">${item.important ? '⭐' : '☆'}</button>
                            <button class="icon-button delete-btn">🗑️</button>
                        </div>
                    </div>
                    ${item.content ? `<p class="remember-item-content">${item.content}</p>` : ''}
                `;
                elem.querySelector('.delete-btn').addEventListener('click', () => deleteRememberItem(item.id));
                elem.querySelector('.important-btn').addEventListener('click', () => toggleRememberImportant(item.id));
                list.appendChild(elem);
            });
        },
        braindump: () => {
            const list = document.getElementById('braindump-list');
            list.innerHTML = state.brainDumps.length === 0 ? '<div class="empty-state"><span class="icon">🧠</span><p>No thoughts captured yet.</p></div>' : '';
            [...state.brainDumps].sort((a,b) => b.id - a.id).forEach(dump => {
                const item = document.createElement('div');
                item.className = 'braindump-item';
                item.innerHTML = `
                    <p class="braindump-content">${dump.content}</p>
                    <div class="flex justify-between items-center">
                        <span class="braindump-timestamp">${new Date(dump.timestamp).toLocaleString()}</span>
                        <button class="delete-btn icon-button">🗑️</button>
                    </div>
                `;
                item.querySelector('.delete-btn').addEventListener('click', () => deleteBrainDump(dump.id));
                list.appendChild(item);
            });
        },
        mood: () => {
            const selector = document.getElementById('mood-selector');
            const feedback = document.getElementById('mood-feedback');
            const dateLabel = document.getElementById('mood-date-label');
            
            dateLabel.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
            
            if (state.mood.saved !== null) {
                const labels = ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];
                const emojis = ['😢', '😔', '😐', '😊', '😄'];
                selector.innerHTML = '';
                feedback.innerHTML = `<p>Today's mood: ${emojis[state.mood.saved]} ${labels[state.mood.saved]}</p>`;
                return;
            }

            selector.innerHTML = '';
            ['😢', '😔', '😐', '😊', '😄'].forEach((emoji, index) => {
                const button = document.createElement('button');
                button.className = 'mood-button';
                button.innerHTML = `<span>${emoji}</span>`;
                button.dataset.moodIndex = index;
                button.classList.toggle('selected', state.mood.selected === index);
                button.addEventListener('click', () => selectMood(index));
                selector.appendChild(button);
            });
            
            if (state.mood.selected !== null) {
                const labels = ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];
                feedback.innerHTML = `
                    <p class="text-muted">Selected: ${labels[state.mood.selected]}</p>
                    <button id="save-mood-btn" class="button button-primary">Save Mood</button>
                `;
                feedback.querySelector('#save-mood-btn').addEventListener('click', saveMood);
            } else {
                feedback.innerHTML = '';
            }
        }
    };

    // --- LOGIC AND EVENT HANDLERS ---
    const toYYYYMMDD = (date) => date.toISOString().split('T')[0];

    const updateSidebarState = () => {
        sidebar.classList.toggle('closed', !state.isSidebarOpen);
        document.querySelectorAll('.nav-button').forEach(btn => {
             btn.classList.toggle('active', btn.dataset.viewId === state.currentView);
        });
    };
    
    const selectView = (viewId) => {
        state.currentView = viewId;
        render.view();
        updateSidebarState();
    };
    
    const changeMonth = (offset) => {
        state.calendar.currentDate.setMonth(state.calendar.currentDate.getMonth() + offset);
        render.calendar();
    };

    const handleDayClick = (event) => {
        const dayDiv = event.target.closest('.calendar-day');
        if (dayDiv && dayDiv.dataset.date) {
            state.calendar.selectedDate = dayDiv.dataset.date;
            render.calendar(); // Re-render to show selection and details
        }
    };
    
    const addCalendarEvent = () => {
        const titleInput = document.getElementById('event-title-input');
        const typeSelect = document.getElementById('event-type-select');
        if (titleInput.value.trim() && state.calendar.selectedDate) {
            state.calendar.events.push({
                id: Date.now(),
                date: state.calendar.selectedDate,
                title: titleInput.value.trim(),
                type: typeSelect.value
            });
            titleInput.value = '';
            render.calendar();
        }
    };
    
    const deleteCalendarEvent = (id) => {
        state.calendar.events = state.calendar.events.filter(e => e.id !== id);
        render.calendar();
    };

    const addTodo = () => {
        const input = document.getElementById('todo-input');
        if (input.value.trim()) {
            state.todos.push({ id: Date.now(), text: input.value.trim(), completed: false });
            input.value = '';
            render.todos();
        }
    };
    const toggleTodo = (id) => {
        const todo = state.todos.find(t => t.id === id);
        if (todo) todo.completed = !todo.completed;
        render.todos();
    };
    const deleteTodo = (id) => {
        state.todos = state.todos.filter(t => t.id !== id);
        render.todos();
    };
    const updateTodoCounter = () => {
        const completed = state.todos.filter(t => t.completed).length;
        document.getElementById('todo-counter').textContent = `${completed}/${state.todos.length} completed`;
    };

    const addPriority = () => {
        const input = document.getElementById('priority-input');
        if (input.value.trim() && state.priorities.length < 5) {
            state.priorities.push({ id: Date.now(), text: input.value.trim(), completed: false });
            input.value = '';
            render.priorities();
        }
    };
    const togglePriority = (id) => {
        const p = state.priorities.find(p => p.id === id);
        if (p) p.completed = !p.completed;
        render.priorities();
    };
     const deletePriority = (id) => {
        state.priorities = state.priorities.filter(p => p.id !== id);
        render.priorities();
    };
    const updatePriorityCounter = () => {
         const completed = state.priorities.filter(p => p.completed).length;
        document.getElementById('priority-counter').textContent = `${completed}/${state.priorities.length}`;
        const inputContainer = document.getElementById('priority-input-container');
        if (inputContainer) {
            inputContainer.style.display = state.priorities.length >= 5 ? 'none' : 'flex';
        }
    };
    
    const addRememberItem = () => {
        const titleInput = document.getElementById('remember-title-input');
        const contentInput = document.getElementById('remember-content-input');
        if (titleInput.value.trim()) {
            state.rememberItems.push({
                id: Date.now(),
                title: titleInput.value.trim(),
                content: contentInput.value.trim(),
                important: false
            });
            titleInput.value = '';
            contentInput.value = '';
            document.getElementById('remember-form').classList.add('hidden');
            render.remember();
        }
    };
    const deleteRememberItem = (id) => {
        state.rememberItems = state.rememberItems.filter(i => i.id !== id);
        render.remember();
    };
    const toggleRememberImportant = (id) => {
        const item = state.rememberItems.find(i => i.id === id);
        if (item) item.important = !item.important;
        render.remember();
    };

    const addBrainDump = () => {
        const input = document.getElementById('braindump-input');
        if (input.value.trim()) {
            state.brainDumps.push({ id: Date.now(), content: input.value.trim(), timestamp: new Date() });
            input.value = '';
            render.braindump();
        }
    };
    const deleteBrainDump = (id) => {
        state.brainDumps = state.brainDumps.filter(d => d.id !== id);
        render.braindump();
    };

    const selectMood = (index) => {
        state.mood.selected = index;
        render.mood();
    };
    const saveMood = () => {
        state.mood.saved = state.mood.selected;
        render.mood();
    };

    // --- EVENT LISTENER ATTACHMENT ---
    const attachViewEventListeners = (viewId) => {
        if (viewId === 'calendar') {
            document.getElementById('prev-month-btn').addEventListener('click', () => changeMonth(-1));
            document.getElementById('next-month-btn').addEventListener('click', () => changeMonth(1));
            document.getElementById('calendar-grid').addEventListener('click', handleDayClick);
            document.getElementById('add-event-btn').addEventListener('click', addCalendarEvent);
        } else if (viewId === 'todos') {
            document.getElementById('add-todo-btn').addEventListener('click', addTodo);
            document.getElementById('todo-input').addEventListener('keypress', e => e.key === 'Enter' && addTodo());
        } else if (viewId === 'priorities') {
            document.getElementById('add-priority-btn').addEventListener('click', addPriority);
            document.getElementById('priority-input').addEventListener('keypress', e => e.key === 'Enter' && addPriority());
        } else if (viewId === 'remember') {
            document.getElementById('show-remember-form-btn').addEventListener('click', () => {
                document.getElementById('remember-form').classList.toggle('hidden');
            });
            document.getElementById('add-remember-btn').addEventListener('click', addRememberItem);
            document.getElementById('cancel-remember-btn').addEventListener('click', () => {
                document.getElementById('remember-form').classList.add('hidden');
            });
        } else if (viewId === 'braindump') {
            const input = document.getElementById('braindump-input');
            document.getElementById('add-braindump-btn').addEventListener('click', addBrainDump);
            input.addEventListener('keypress', e => {
                if (e.key === 'Enter' && e.ctrlKey) addBrainDump();
            });
        }
    };

    // --- INITIALIZATION ---
    const init = () => {
        dateDisplay.textContent = new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        sidebarToggleBtn.addEventListener('click', () => {
            state.isSidebarOpen = !state.isSidebarOpen;
            updateSidebarState();
        });
        render.sidebar();
        selectView(state.currentView);
    };

    init();
});

