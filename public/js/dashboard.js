const API_URL = '/api';

// Check auth
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user) {
  window.location.href = '/';
}

document.addEventListener('DOMContentLoaded', () => {
  // Set User Info
  document.getElementById('user-greeting').textContent = `Hello, ${user.name}`;
  document.getElementById('user-role').textContent = user.role;

  // Setup Role-based UI
  if (user.role === 'Admin') {
    document.getElementById('nav-projects-container').style.display = 'block';
    document.getElementById('nav-all-tasks-container').style.display = 'block';
    document.getElementById('btn-new-task').style.display = 'inline-block';
  }

  // Logout
  document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  });

  // Navigation
  const navTasks = document.getElementById('nav-tasks');
  const navProjects = document.getElementById('nav-projects');
  const navAllTasks = document.getElementById('nav-all-tasks');
  
  const viewTasks = document.getElementById('view-tasks');
  const viewProjects = document.getElementById('view-projects');

  navTasks.addEventListener('click', (e) => {
    e.preventDefault();
    switchView('tasks', navTasks);
    fetchTasks(false);
  });

  if (navProjects) {
    navProjects.addEventListener('click', (e) => {
      e.preventDefault();
      switchView('projects', navProjects);
      fetchProjects();
    });
  }

  if (navAllTasks) {
    navAllTasks.addEventListener('click', (e) => {
      e.preventDefault();
      switchView('tasks', navAllTasks);
      fetchTasks(true); // Fetch all tasks
    });
  }

  function switchView(viewName, activeNav) {
    viewTasks.classList.add('hidden');
    viewProjects.classList.add('hidden');
    
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    activeNav.parentElement.classList.add('active');

    if (viewName === 'tasks') viewTasks.classList.remove('hidden');
    if (viewName === 'projects') viewProjects.classList.remove('hidden');
  }

  // API calls
  async function fetchWithAuth(url, options = {}) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };
    const res = await fetch(API_URL + url, options);
    if (res.status === 401) {
      localStorage.clear();
      window.location.href = '/';
    }
    return res;
  }

  // PROJECTS LOGIC
  async function fetchProjects() {
    const res = await fetchWithAuth('/projects');
    const projects = await res.json();
    const grid = document.getElementById('projects-grid');
    grid.innerHTML = '';
    
    projects.forEach(p => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-title">${p.name}</div>
        <div class="card-desc">${p.description || 'No description'}</div>
        <div class="card-meta">
          <span>Created by: ${p.createdBy.name}</span>
          <span>${new Date(p.createdAt).toLocaleDateString()}</span>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  // TASKS LOGIC
  async function fetchTasks(all = false) {
    const res = await fetchWithAuth('/tasks');
    let tasks = await res.json();
    
    if (user.role === 'Member') {
       // Filter handled by backend
    }

    renderTasks(tasks);
  }

  function renderTasks(tasks) {
    const pending = document.getElementById('tasks-pending');
    const progress = document.getElementById('tasks-in-progress');
    const completed = document.getElementById('tasks-completed');

    pending.innerHTML = '';
    progress.innerHTML = '';
    completed.innerHTML = '';

    tasks.forEach(task => {
      const card = document.createElement('div');
      card.className = 'card';
      
      let statusClass = task.status === 'Pending' ? 'status-pending' : 
                        task.status === 'In Progress' ? 'status-progress' : 'status-completed';

      let statusSelectHTML = '';
      // Allow member to change status, or admin
      if (user.role === 'Admin' || (task.assignedTo && task.assignedTo._id === user.id)) {
        statusSelectHTML = `
          <select class="status-select" data-id="${task._id}" onclick="event.stopPropagation()">
            <option value="Pending" ${task.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
          </select>
        `;
      }

      card.innerHTML = `
        <div class="card-title">${task.title}</div>
        <div class="card-desc">${task.description || ''}</div>
        <div class="card-meta" style="margin-bottom: 5px;">
          <span class="status-badge ${statusClass}">${task.status}</span>
          <span>Due: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</span>
        </div>
        <div class="card-meta">
          <span>Proj: ${task.project ? task.project.name : 'Unknown'}</span>
          <span>User: ${task.assignedTo ? task.assignedTo.name : 'Unassigned'}</span>
        </div>
        ${statusSelectHTML}
      `;

      if (task.status === 'Pending') pending.appendChild(card);
      else if (task.status === 'In Progress') progress.appendChild(card);
      else completed.appendChild(card);
    });

    // Add event listeners to selects
    document.querySelectorAll('.status-select').forEach(select => {
      select.addEventListener('change', async (e) => {
        const taskId = e.target.getAttribute('data-id');
        const newStatus = e.target.value;
        await updateTaskStatus(taskId, newStatus);
      });
    });
  }

  async function updateTaskStatus(id, status) {
    try {
      await fetchWithAuth(`/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchTasks(); // Refresh
    } catch (err) {
      console.error(err);
      alert('Failed to update task');
    }
  }

  // Modals Logic
  const taskModal = document.getElementById('task-modal');
  const projectModal = document.getElementById('project-modal');
  
  document.getElementById('btn-new-task').addEventListener('click', async () => {
    // Populate projects and users
    const [projRes, usersRes] = await Promise.all([
      fetchWithAuth('/projects'),
      fetchWithAuth('/auth/users')
    ]);
    const projects = await projRes.json();
    const users = await usersRes.json();

    const projSelect = document.getElementById('task-project');
    const userSelect = document.getElementById('task-assignee');
    
    projSelect.innerHTML = projects.map(p => `<option value="${p._id}">${p.name}</option>`).join('');
    userSelect.innerHTML = '<option value="">Unassigned</option>' + users.map(u => `<option value="${u._id}">${u.name} (${u.role})</option>`).join('');

    taskModal.classList.remove('hidden');
  });

  if (document.getElementById('btn-new-project')) {
    document.getElementById('btn-new-project').addEventListener('click', () => {
      projectModal.classList.remove('hidden');
    });
  }

  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      taskModal.classList.add('hidden');
      projectModal.classList.add('hidden');
    });
  });

  // Form Submissions
  document.getElementById('project-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('proj-name').value;
    const description = document.getElementById('proj-desc').value;

    const res = await fetchWithAuth('/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description })
    });

    if (res.ok) {
      projectModal.classList.add('hidden');
      document.getElementById('project-form').reset();
      fetchProjects();
    } else {
      alert('Failed to create project');
    }
  });

  document.getElementById('task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-desc').value;
    const project = document.getElementById('task-project').value;
    const assignedTo = document.getElementById('task-assignee').value;
    const dueDate = document.getElementById('task-due').value;

    const payload = { title, description, project };
    if (assignedTo) payload.assignedTo = assignedTo;
    if (dueDate) payload.dueDate = dueDate;

    const res = await fetchWithAuth('/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      taskModal.classList.add('hidden');
      document.getElementById('task-form').reset();
      fetchTasks(true);
    } else {
      alert('Failed to create task');
    }
  });

  // Initial load
  fetchTasks();
});
