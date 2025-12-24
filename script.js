
    // Global variables with enhanced features
        let notes = JSON.parse(localStorage.getItem('studentBuddyNotes')) || [];
        let tasks = JSON.parse(localStorage.getItem('studentBuddyTasks')) || [];
        let grades = JSON.parse(localStorage.getItem('studentBuddyGrades')) || [];
        let timerInterval = null;
        let timerMinutes = 25;
        let timerSeconds = 0;
        let originalTimerMinutes = 25;
        let isTimerRunning = false;
        let studySessions = parseInt(localStorage.getItem('studySessions')) || 0;
        let totalStudyTime = parseInt(localStorage.getItem('totalStudyTime')) || 0;
        let streakDays = parseInt(localStorage.getItem('streakDays')) || 0;

        // Initialize app with loading animation
        document.addEventListener('DOMContentLoaded', function() {
            createParticles();
            setTimeout(() => {
                document.getElementById('loadingScreen').classList.add('hidden');
                initializeApp();
            }, 1500);
        });

        function createParticles() {
            const particlesContainer = document.getElementById('particles');
            const particleCount = window.innerWidth < 768 ? 15 : 30;
            
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.width = Math.random() * 10 + 5 + 'px';
                particle.style.height = particle.style.width;
                particle.style.left = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 15 + 's';
                particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
                particlesContainer.appendChild(particle);
            }
        }

        function initializeApp() {
            renderNotes();
            renderTasks();
            updateTaskStats();
            renderGrades();
            calculateGPA();
            updateStudyStats();
            updateTimerDisplay();
            checkDailyStreak();
        }

        // Enhanced tab navigation with smooth animations
        function showTab(tabName) {
            const tabs = document.querySelectorAll('.tab-content');
            const buttons = document.querySelectorAll('.nav-tab');
            
            tabs.forEach(tab => {
                tab.classList.remove('active');
            });
            
            buttons.forEach(btn => {
                btn.classList.remove('active');
            });

            setTimeout(() => {
                document.getElementById(tabName).classList.add('active');
                event.target.classList.add('active');
            }, 100);
        }

        // Enhanced notification system
        function showNotification(message, type = 'success') {
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.style.background = type === 'success' 
                ? 'linear-gradient(135deg, var(--success), #26d0ce)' 
                : 'linear-gradient(135deg, var(--danger), #ff6b7a)';
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'notificationSlide 0.5s ease reverse';
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 500);
            }, 3000);
        }

        // Enhanced Notes functionality with search
        function addNote() {
            const title = document.getElementById('noteTitle').value.trim();
            const content = document.getElementById('noteContent').value.trim();

            if (!title || !content) {
                showNotification('Please fill in both title and content!', 'error');
                return;
            }

            const note = {
                id: Date.now(),
                title: title,
                content: content,
                date: new Date().toLocaleDateString(),
                timestamp: Date.now(),
                wordCount: content.split(' ').length
            };

            notes.unshift(note);
            localStorage.setItem('studentBuddyNotes', JSON.stringify(notes));
            
            document.getElementById('noteTitle').value = '';
            document.getElementById('noteContent').value = '';
            
            renderNotes();
            showNotification('📝 Note created successfully!');
        }

        function renderNotes() {
            const container = document.getElementById('notesContainer');
            container.innerHTML = '';

            if (notes.length === 0) {
                container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);"><h3>📝 No notes yet!</h3><p>Create your first note to get started.</p></div>';
                return;
            }

            notes.forEach((note, index) => {
                const noteCard = document.createElement('div');
                noteCard.className = 'note-card';
                noteCard.style.animationDelay = `${index * 0.1}s`;
                noteCard.innerHTML = `
                    <div class="note-title">${note.title}</div>
                    <div class="note-content">${note.content}</div>
                    <div class="note-meta">
                        <div class="note-date">📅 ${note.date} • ${note.wordCount} words</div>
                        <button class="delete-btn" onclick="deleteNote(${note.id})">🗑️ Delete</button>
                    </div>
                `;
                container.appendChild(noteCard);
            });
        }

        function deleteNote(id) {
            if (confirm('🗑️ Are you sure you want to delete this note?')) {
                notes = notes.filter(note => note.id !== id);
                localStorage.setItem('studentBuddyNotes', JSON.stringify(notes));
                renderNotes();
                showNotification('🗑️ Note deleted successfully!');
            }
        }

        // Enhanced Tasks functionality with productivity tracking
        function addTask() {
            const taskText = document.getElementById('taskInput').value.trim();
            const priority = document.getElementById('taskPriority').value;

            if (!taskText) {
                showNotification('Please enter a task description!', 'error');
                return;
            }

            const task = {
                id: Date.now(),
                text: taskText,
                priority: priority,
                completed: false,
                createdDate: new Date().toLocaleDateString(),
                completedDate: null,
                estimatedTime: null
            };

            tasks.push(task);
            localStorage.setItem('studentBuddyTasks', JSON.stringify(tasks));
            
            document.getElementById('taskInput').value = '';
            
            renderTasks();
            updateTaskStats();
            showNotification('✅ Task added successfully!');
        }

        function renderTasks() {
            const container = document.getElementById('tasksContainer');
            container.innerHTML = '';

            if (tasks.length === 0) {
                container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);"><h3>✅ No tasks yet!</h3><p>Add your first task to boost productivity.</p></div>';
                return;
            }

            const sortedTasks = tasks.sort((a, b) => {
                if (a.completed !== b.completed) return a.completed - b.completed;
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            });

            sortedTasks.forEach((task, index) => {
                const taskItem = document.createElement('div');
                taskItem.className = `task-item priority-${task.priority} ${task.completed ? 'completed' : ''}`;
                taskItem.style.animationDelay = `${index * 0.1}s`;
                taskItem.innerHTML = `
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
                    <div class="task-text">${task.text}</div>
                    <span class="priority-badge ${task.priority}">${task.priority}</span>
                    <button class="delete-btn" onclick="deleteTask(${task.id})">🗑️</button>
                `;
                container.appendChild(taskItem);
            });
        }

        function toggleTask(id) {
            const task = tasks.find(t => t.id === id);
            if (task) {
                task.completed = !task.completed;
                task.completedDate = task.completed ? new Date().toLocaleDateString() : null;
                localStorage.setItem('studentBuddyTasks', JSON.stringify(tasks));
                renderTasks();
                updateTaskStats();
                
                if (task.completed) {
                    showNotification('🎉 Task completed! Great job!');
                }
            }
        }

        function deleteTask(id) {
            if (confirm('🗑️ Are you sure you want to delete this task?')) {
                tasks = tasks.filter(task => task.id !== id);
                localStorage.setItem('studentBuddyTasks', JSON.stringify(tasks));
                renderTasks();
                updateTaskStats();
                showNotification('🗑️ Task deleted successfully!');
            }
        }

        function updateTaskStats() {
            const total = tasks.length;
            const completed = tasks.filter(t => t.completed).length;
            const pending = total - completed;
            const productivity = total > 0 ? Math.round((completed / total) * 100) : 0;

            document.getElementById('totalTasks').textContent = total;
            document.getElementById('completedTasks').textContent = completed;
            document.getElementById('pendingTasks').textContent = pending;
            document.getElementById('productivityRate').textContent = `${productivity}%`;
        }

        // Enhanced Timer functionality with better tracking
        function setTimer(minutes) {
            if (isTimerRunning) {
                if (confirm('⏰ Timer is running! Do you want to reset it?')) {
                    resetTimer();
                } else {
                    return;
                }
            }
            timerMinutes = minutes;
            originalTimerMinutes = minutes;
            timerSeconds = 0;
            updateTimerDisplay();
            showNotification(`⏰ Timer set to ${minutes} minutes!`);
        }

        function updateTimerDisplay() {
            const mins = String(timerMinutes).padStart(2, '0');
            const secs = String(timerSeconds).padStart(2, '0');
            document.getElementById('timerDisplay').textContent = `${mins}:${secs}`;
            
            // Update page title with timer
            if (isTimerRunning) {
                document.title = `[${mins}:${secs}] Student Buddy Assistant`;
            } else {
                document.title = 'Student Buddy Assistant';
            }
        }

        function startTimer() {
            if (!isTimerRunning) {
                isTimerRunning = true;
                showNotification('▶️ Focus time started! You got this!');
                
                timerInterval = setInterval(() => {
                    if (timerSeconds > 0) {
                        timerSeconds--;
                    } else if (timerMinutes > 0) {
                        timerMinutes--;
                        timerSeconds = 59;
                    } else {
                        // Timer finished
                        clearInterval(timerInterval);
                        isTimerRunning = false;
                        studySessions++;
                        totalStudyTime += originalTimerMinutes;
                        localStorage.setItem('studySessions', studySessions);
                        localStorage.setItem('totalStudyTime', totalStudyTime);
                        updateStudyStats();
                        updateStreak();
                        
                        // Play notification sound (if supported)
                        try {
                            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzGU3vLGdSYEKX/M8tuHNwcXRrXv6q1sFQw4ldryt2MdBzGS2vLLeSsFJX3J8N2PQAgUYLTp66pWEww+ltLxunI…');
                            audio.play();
                        } catch (e) {}
                        
                        showNotification('🎉 Focus session complete! Time for a well-deserved break!');
                        resetTimer();
                    }
                    updateTimerDisplay();
                }, 1000);
            }
        }

        function pauseTimer() {
            if (isTimerRunning) {
                clearInterval(timerInterval);
                isTimerRunning = false;
                showNotification('⏸️ Timer paused. Take a breath!');
                document.title = 'Student Buddy Assistant';
            }
        }

        function resetTimer() {
            clearInterval(timerInterval);
            isTimerRunning = false;
            timerMinutes = originalTimerMinutes;
            timerSeconds = 0;
            updateTimerDisplay();
            document.title = 'Student Buddy Assistant';
        }

        function updateStudyStats() {
            document.getElementById('sessionsToday').textContent = studySessions;
            document.getElementById('totalStudyTime').textContent = totalStudyTime;
            document.getElementById('streakDays').textContent = streakDays;
        }

        function updateStreak() {
            const lastStudyDate = localStorage.getItem('lastStudyDate');
            const today = new Date().toDateString();
            
            if (lastStudyDate !== today) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                
                if (lastStudyDate === yesterday.toDateString()) {
                    streakDays++;
                } else if (!lastStudyDate) {
                    streakDays = 1;
                } else {
                    streakDays = 1;
                }
                
                localStorage.setItem('streakDays', streakDays);
                localStorage.setItem('lastStudyDate', today);
                updateStudyStats();
            }
        }

        function checkDailyStreak() {
            const lastStudyDate = localStorage.getItem('lastStudyDate');
            const today = new Date().toDateString();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastStudyDate && lastStudyDate !== today && lastStudyDate !== yesterday.toDateString()) {
                streakDays = 0;
                localStorage.setItem('streakDays', streakDays);
                updateStudyStats();
            }
        }

        // Enhanced Grades functionality with weighted GPA
        function addGrade() {
            const subject = document.getElementById('subjectInput').value.trim();
            const assignment = document.getElementById('assignmentInput').value.trim();
            const gradeValue = parseFloat(document.getElementById('gradeInput').value);
            const creditHours = parseInt(document.getElementById('creditHours').value) || 3;

            if (!subject || !assignment) {
                showNotification('Please fill in subject and assignment!', 'error');
                return;
            }

            if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > 100) {
                showNotification('Please enter a valid grade between 0-100!', 'error');
                return;
            }

            const grade = {
                id: Date.now(),
                subject: subject,
                assignment: assignment,
                grade: gradeValue,
                creditHours: creditHours,
                letterGrade: getLetterGrade(gradeValue),
                gradePoints: getGradePoints(getLetterGrade(gradeValue)),
                date: new Date().toLocaleDateString()
            };

            grades.push(grade);
            localStorage.setItem('studentBuddyGrades', JSON.stringify(grades));
            
            document.getElementById('subjectInput').value = '';
            document.getElementById('assignmentInput').value = '';
            document.getElementById('gradeInput').value = '';
            document.getElementById('creditHours').value = '3';
            
            renderGrades();
            calculateGPA();
            showNotification('📊 Grade added successfully!');
        }

        function getLetterGrade(grade) {
            if (grade >= 97) return 'A+';
            if (grade >= 93) return 'A';
            if (grade >= 90) return 'A-';
            if (grade >= 87) return 'B+';
            if (grade >= 83) return 'B';
            if (grade >= 80) return 'B-';
            if (grade >= 77) return 'C+';
            if (grade >= 73) return 'C';
            if (grade >= 70) return 'C-';
            if (grade >= 67) return 'D+';
            if (grade >= 65) return 'D';
            return 'F';
        }

        function getGradePoints(letterGrade) {
            const points = { 
                'A+': 4.0, 'A': 4.0, 'A-': 3.7, 
                'B+': 3.3, 'B': 3.0, 'B-': 2.7,
                'C+': 2.3, 'C': 2.0, 'C-': 1.7,
                'D+': 1.3, 'D': 1.0, 'F': 0.0 
            };
            return points[letterGrade] || 0;
        }

        function renderGrades() {
            const tbody = document.getElementById('gradesBody');
            tbody.innerHTML = '';

            if (grades.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: var(--text-secondary);">📊 No grades recorded yet! Add your first grade to track your progress.</td></tr>';
                return;
            }

            grades.forEach(grade => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><strong>${grade.subject}</strong></td>
                    <td>${grade.assignment}</td>
                    <td><strong>${grade.grade}%</strong></td>
                    <td><span class="grade-badge grade-${grade.letterGrade.charAt(0).toLowerCase()}">${grade.letterGrade}</span></td>
                    <td>${grade.creditHours}</td>
                    <td><button class="delete-btn" onclick="deleteGrade(${grade.id})">🗑️ Delete</button></td>
                `;
                tbody.appendChild(row);
            });
        }

        function deleteGrade(id) {
            if (confirm('🗑️ Are you sure you want to delete this grade?')) {
                grades = grades.filter(grade => grade.id !== id);
                localStorage.setItem('studentBuddyGrades', JSON.stringify(grades));
                renderGrades();
                calculateGPA();
                showNotification('🗑️ Grade deleted successfully!');
            }
        }

        function calculateGPA() {
            if (grades.length === 0) {
                document.getElementById('gpaDisplay').textContent = '0.00';
                document.getElementById('averageGrade').textContent = '0';
                document.getElementById('totalCredits').textContent = '0';
                document.getElementById('highestGrade').textContent = '0';
                return;
            }

            // Calculate weighted GPA
            const totalQualityPoints = grades.reduce((sum, grade) => {
                return sum + (grade.gradePoints * grade.creditHours);
            }, 0);

            const totalCredits = grades.reduce((sum, grade) => sum + grade.creditHours, 0);
            const weightedGPA = totalCredits > 0 ? (totalQualityPoints / totalCredits) : 0;

            // Calculate other stats
            const averageGrade = grades.reduce((sum, grade) => sum + grade.grade, 0) / grades.length;
            const highestGrade = Math.max(...grades.map(g => g.grade));

            document.getElementById('gpaDisplay').textContent = weightedGPA.toFixed(2);
            document.getElementById('averageGrade').textContent = averageGrade.toFixed(1) + '%';
            document.getElementById('totalCredits').textContent = totalCredits;
            document.getElementById('highestGrade').textContent = highestGrade + '%';
        }

        // Enhanced keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // Tab shortcuts
            if (e.altKey) {
                switch(e.key) {
                    case '1':
                        e.preventDefault();
                        document.querySelector('[onclick="showTab(\'notes\')"]').click();
                        break;
                    case '2':
                        e.preventDefault();
                        document.querySelector('[onclick="showTab(\'tasks\')"]').click();
                        break;
                    case '3':
                        e.preventDefault();
                        document.querySelector('[onclick="showTab(\'timer\')"]').click();
                        break;
                    case '4':
                        e.preventDefault();
                        document.querySelector('[onclick="showTab(\'grades\')"]').click();
                        break;
                }
            }
            
            // Form shortcuts
            if (e.key === 'Enter' && e.ctrlKey) {
                const activeElement = document.activeElement;
                if (activeElement.id === 'noteContent') addNote();
                else if (activeElement.id === 'taskInput') addTask();
                else if (activeElement.id === 'gradeInput') addGrade();
            }

            // Timer shortcuts
            if (e.key === ' ' && e.ctrlKey) {
                e.preventDefault();
                if (isTimerRunning) {
                    pauseTimer();
                } else {
                    startTimer();
                }
            }
        });

        // Auto-save functionality
        setInterval(() => {
            localStorage.setItem('studentBuddyNotes', JSON.stringify(notes));
            localStorage.setItem('studentBuddyTasks', JSON.stringify(tasks));
            localStorage.setItem('studentBuddyGrades', JSON.stringify(grades));
        }, 30000); // Auto-save every 30 seconds

        // Data export functionality
        function exportData() {
            const data = {
                notes: notes,
                tasks: tasks,
                grades: grades,
                studySessions: studySessions,
                totalStudyTime: totalStudyTime,
                streakDays: streakDays,
                exportDate: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `student-buddy-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showNotification('📥 Data exported successfully!');
        }

        // Data import functionality
        function importData(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    if (confirm('⚠️ This will replace all your current data. Are you sure?')) {
                        notes = data.notes || [];
                        tasks = data.tasks || [];
                        grades = data.grades || [];
                        studySessions = data.studySessions || 0;
                        totalStudyTime = data.totalStudyTime || 0;
                        streakDays = data.streakDays || 0;
                        
                        // Save to localStorage
                        localStorage.setItem('studentBuddyNotes', JSON.stringify(notes));
                        localStorage.setItem('studentBuddyTasks', JSON.stringify(tasks));
                        localStorage.setItem('studentBuddyGrades', JSON.stringify(grades));
                        localStorage.setItem('studySessions', studySessions);
                        localStorage.setItem('totalStudyTime', totalStudyTime);
                        localStorage.setItem('streakDays', streakDays);
                        
                        // Refresh all displays
                        initializeApp();
                        showNotification('📤 Data imported successfully!');
                    }
                } catch (error) {
                    showNotification('❌ Invalid file format!', 'error');
                }
            };
            reader.readAsText(file);
        }

        // Theme toggle functionality
        let isDarkMode = localStorage.getItem('darkMode') === 'true';
        
        function toggleTheme() {
            isDarkMode = !isDarkMode;
            localStorage.setItem('darkMode', isDarkMode);
            applyTheme();
        }
        
        function applyTheme() {
            if (isDarkMode) {
                document.body.style.setProperty('--gradient-1', 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)');
                document.body.style.setProperty('--text-primary', '#ecf0f1');
                document.body.style.setProperty('--text-secondary', '#bdc3c7');
                document.body.style.setProperty('--glass', 'rgba(0, 0, 0, 0.25)');
                document.body.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.1)');
            } else {
                document.body.style.setProperty('--gradient-1', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
                document.body.style.setProperty('--text-primary', '#2c3e50');
                document.body.style.setProperty('--text-secondary', '#7f8c8d');
                document.body.style.setProperty('--glass', 'rgba(255, 255, 255, 0.25)');
                document.body.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.18)');
            }
        }

        // Voice recognition for notes (if supported)
        function startVoiceRecognition() {
            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                const recognition = new SpeechRecognition();
                
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = 'en-US';
                
                recognition.onstart = function() {
                    showNotification('🎤 Listening... Speak now!');
                };
                
                recognition.onresult = function(event) {
                    let finalTranscript = '';
                    let interimTranscript = '';
                    
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript;
                        if (event.results[i].isFinal) {
                            finalTranscript += transcript;
                        } else {
                            interimTranscript += transcript;
                        }
                    }
                    
                    const noteContent = document.getElementById('noteContent');
                    noteContent.value = finalTranscript + interimTranscript;
                };
                
                recognition.onerror = function(event) {
                    showNotification('❌ Voice recognition error: ' + event.error, 'error');
                };
                
                recognition.onend = function() {
                    showNotification('🎤 Voice recognition stopped.');
                };
                
                recognition.start();
            } else {
                showNotification('❌ Voice recognition not supported in this browser!', 'error');
            }
        }

        // Study analytics
        function getStudyAnalytics() {
            const analytics = {
                totalSessions: studySessions,
                totalMinutes: totalStudyTime,
                averageSessionLength: studySessions > 0 ? Math.round(totalStudyTime / studySessions) : 0,
                streakDays: streakDays,
                tasksCompleted: tasks.filter(t => t.completed).length,
                averageGrade: grades.length > 0 ? (grades.reduce((sum, g) => sum + g.grade, 0) / grades.length).toFixed(1) : 0,
                productivityScore: calculateProductivityScore()
            };
            
            return analytics;
        }
        
        function calculateProductivityScore() {
            let score = 0;
            
            // Study time contribution (40%)
            if (totalStudyTime > 0) {
                score += Math.min(40, (totalStudyTime / 100) * 40);
            }
            
            // Task completion contribution (30%)
            if (tasks.length > 0) {
                const completionRate = tasks.filter(t => t.completed).length / tasks.length;
                score += completionRate * 30;
            }
            
            // Grade performance contribution (20%)
            if (grades.length > 0) {
                const averageGrade = grades.reduce((sum, g) => sum + g.grade, 0) / grades.length;
                score += (averageGrade / 100) * 20;
            }
            
            // Streak contribution (10%)
            score += Math.min(10, streakDays * 2);
            
            return Math.round(score);
        }

        // Pomodoro break reminders
        function showBreakReminder() {
            const breakActivities = [
                '💧 Drink some water',
                '👀 Look away from the screen for 20 seconds',
                '🧘 Take 5 deep breaths',
                '🚶 Take a short walk',
                '💪 Do some light stretching',
                '🌿 Step outside for fresh air'
            ];
            
            const randomActivity = breakActivities[Math.floor(Math.random() * breakActivities.length)];
            showNotification(`☕ Break time! Try: ${randomActivity}`);
        }

        // Smart study suggestions
        function getStudySuggestions() {
            const suggestions = [];
            const analytics = getStudyAnalytics();
            
            if (analytics.streakDays === 0) {
                suggestions.push('🔥 Start a study streak! Even 15 minutes counts.');
            }
            
            if (tasks.filter(t => !t.completed && t.priority === 'high').length > 0) {
                suggestions.push('🚨 You have high-priority tasks pending!');
            }
            
            if (analytics.averageGrade < 80 && grades.length > 0) {
                suggestions.push('📚 Consider spending more time on challenging subjects.');
            }
            
            if (analytics.totalMinutes < 50) {
                suggestions.push('⏰ Try to study at least 50 minutes today for better retention.');
            }
            
            return suggestions;
        }

        // Initialize theme on load
        document.addEventListener('DOMContentLoaded', function() {
            applyTheme();
        });

        // Accessibility improvements
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                // Close any open modals or reset focus
                document.activeElement.blur();
            }
            
            if (e.key === 'Tab') {
                // Ensure proper tab navigation
                const focusableElements = document.querySelectorAll('button, input, textarea, select, [tabindex="0"]');
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                
                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        });

        // Performance monitoring
        function logPerformance() {
            if ('performance' in window) {
                const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                console.log(`App loaded in ${loadTime}ms`);
            }
        }

        // Initialize performance monitoring
        window.addEventListener('load', logPerformance);

        // Service Worker for offline capability (if needed)
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                        console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }

        // Add help tooltips
        function addTooltips() {
            const tooltipElements = document.querySelectorAll('[data-tooltip]');
            tooltipElements.forEach(element => {
                element.addEventListener('mouseenter', showTooltip);
                element.addEventListener('mouseleave', hideTooltip);
            });
        }

        function showTooltip(event) {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = event.target.getAttribute('data-tooltip');
            tooltip.style.cssText = `
                position: absolute;
                background: var(--dark);
                color: white;
                padding: 8px 12px;
                border-radius: 8px;
                font-size: 14px;
                z-index: 1000;
                pointer-events: none;
                white-space: nowrap;
            `;
            
            document.body.appendChild(tooltip);
            
            const rect = event.target.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.bottom + 10 + 'px';
            
            event.target.tooltipElement = tooltip;
        }

        function hideTooltip(event) {
            if (event.target.tooltipElement) {
                document.body.removeChild(event.target.tooltipElement);
                event.target.tooltipElement = null;
            }
        }

        // Initialize tooltips after DOM load
        document.addEventListener('DOMContentLoaded', addTooltips);
