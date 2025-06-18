class TodoApp {
  constructor() {
    this.todos = JSON.parse(localStorage.getItem("todos")) || [];
    this.currentFilter = "all";
    this.editingId = null;

    this.initializeElements();
    this.bindEvents();
    this.render();
  }

  initializeElements() {
    this.todoInput = document.getElementById("todoInput");
    this.addBtn = document.getElementById("addBtn");
    this.todoList = document.getElementById("todoList");
    this.emptyState = document.getElementById("emptyState");
    this.filterBtns = document.querySelectorAll(".filter-btn");
    this.totalTasks = document.getElementById("totalTasks");
    this.completedTasks = document.getElementById("completedTasks");
  }

  bindEvents() {
    // 追加ボタンのクリック
    this.addBtn.addEventListener("click", () => this.addTodo());

    // Enterキーでタスク追加
    this.todoInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.addTodo();
      }
    });

    // フィルターボタンのクリック
    this.filterBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.setFilter(e.target.dataset.filter);
      });
    });
  }

  addTodo() {
    const text = this.todoInput.value.trim();
    if (!text) return;

    const todo = {
      id: Date.now(),
      text: text,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    this.todos.unshift(todo);
    this.todoInput.value = "";
    this.saveTodos();
    this.render();
  }

  toggleTodo(id) {
    const todo = this.todos.find((t) => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.saveTodos();
      this.render();
    }
  }

  deleteTodo(id) {
    this.todos = this.todos.filter((t) => t.id !== id);
    this.saveTodos();
    this.render();
  }

  startEdit(id) {
    this.editingId = id;
    this.render();

    // 編集入力フィールドにフォーカス
    const editInput = document.querySelector(
      `[data-id="${id}"] .todo-edit-input`
    );
    if (editInput) {
      editInput.focus();
      editInput.select();
    }
  }

  saveEdit(id, newText) {
    const todo = this.todos.find((t) => t.id === id);
    if (todo && newText.trim()) {
      todo.text = newText.trim();
      this.saveTodos();
    }
    this.editingId = null;
    this.render();
  }

  cancelEdit() {
    this.editingId = null;
    this.render();
  }

  setFilter(filter) {
    this.currentFilter = filter;

    // アクティブなフィルターボタンを更新
    this.filterBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filter === filter);
    });

    this.render();
  }

  getFilteredTodos() {
    switch (this.currentFilter) {
      case "active":
        return this.todos.filter((todo) => !todo.completed);
      case "completed":
        return this.todos.filter((todo) => todo.completed);
      default:
        return this.todos;
    }
  }

  createTodoElement(todo) {
    const li = document.createElement("li");
    li.className = `todo-item ${todo.completed ? "completed" : ""}`;
    li.dataset.id = todo.id;

    const isEditing = this.editingId === todo.id;

    li.innerHTML = `
            <div class="todo-checkbox ${todo.completed ? "checked" : ""}" 
                 onclick="todoApp.toggleTodo(${todo.id})"></div>
            <span class="todo-text ${
              isEditing ? "editing" : ""
            }">${this.escapeHtml(todo.text)}</span>
            <input type="text" class="todo-edit-input ${
              isEditing ? "active" : ""
            }" 
                   value="${this.escapeHtml(todo.text)}"
                   onkeypress="todoApp.handleEditKeypress(event, ${todo.id})"
                   onblur="todoApp.cancelEdit()">
            <div class="todo-actions">
                ${
                  isEditing
                    ? `
                    <button class="save-btn" onclick="todoApp.saveEditFromButton(${todo.id})">保存</button>
                    <button class="cancel-btn" onclick="todoApp.cancelEdit()">キャンセル</button>
                `
                    : `
                    <button class="edit-btn" onclick="todoApp.startEdit(${todo.id})">編集</button>
                    <button class="delete-btn" onclick="todoApp.deleteTodo(${todo.id})">削除</button>
                `
                }
            </div>
        `;

    return li;
  }

  handleEditKeypress(event, id) {
    if (event.key === "Enter") {
      this.saveEditFromButton(id);
    } else if (event.key === "Escape") {
      this.cancelEdit();
    }
  }

  saveEditFromButton(id) {
    const editInput = document.querySelector(
      `[data-id="${id}"] .todo-edit-input`
    );
    if (editInput) {
      this.saveEdit(id, editInput.value);
    }
  }

  updateStats() {
    const total = this.todos.length;
    const completed = this.todos.filter((todo) => todo.completed).length;

    this.totalTasks.textContent = total;
    this.completedTasks.textContent = completed;
  }

  render() {
    const filteredTodos = this.getFilteredTodos();

    // リストをクリア
    this.todoList.innerHTML = "";

    if (filteredTodos.length === 0) {
      this.emptyState.style.display = "block";
      this.todoList.style.display = "none";
    } else {
      this.emptyState.style.display = "none";
      this.todoList.style.display = "block";

      filteredTodos.forEach((todo) => {
        const todoElement = this.createTodoElement(todo);
        this.todoList.appendChild(todoElement);
      });
    }

    this.updateStats();
  }

  saveTodos() {
    localStorage.setItem("todos", JSON.stringify(this.todos));
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

// アプリケーションを初期化
const todoApp = new TodoApp();

// デバッグ用の関数（開発時のみ）
window.todoApp = todoApp;
